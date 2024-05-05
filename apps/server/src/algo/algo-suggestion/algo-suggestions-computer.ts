import { AlgoSuggestion, IAlgoParams, IAlgoSuggestion, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';
import { AlgoComputer } from '../algo-computer';
import { NonStrictObjectId } from '../../utils/objectid';
import { Document, Model, Types} from 'mongoose';
import { AlgoSimilar } from '../../models/algo/algo-similar';
import { AlgoConfidence } from '../../models/algo/algo-confidence';
import { getAlgoFieldEntry } from '../../utils/algo-field';
import { getRatedItemsForUser, getRatingUsersFromItemWithWeights } from '../../utils/ratings';
import { logger } from '../../utils/logger';
import { IAlgoField, IAlgoFieldOther } from '../../models/algo/algo-field';
import _ from 'underscore';
import { IRatings } from 'src/models/ratings/ratings';
import { IPost, Post } from '../../models/post';
import { PostService } from '../../services/post-service/post-service';
import { IMetrics } from '../../models/metrics';
import { UserService } from '../../services/user-service';

export const ALGO_SUGGESTION_TYPES = ['default', 'reconf1', 'reconf2', 'reco-divers', 'reco-fact-check'] as const;

export type AlgoSuggestionType = (typeof ALGO_SUGGESTION_TYPES)[number];
export type AlgoSuggestionsDict = { [key in AlgoSuggestionType]: AlgoSuggestionComputer };
export type ItemForComputation = Exclude<(Document<any, any, any> & IPost), 'metrics'> & {'metrics': IMetrics}

export interface AlgoSuggestionConfig {
    kTopUsers: number;
    selectUserType: 'similar' | 'confidence';
    positiveRatingsModel: Model<IRatings>;
    negativeRatingsModel: Model<IRatings>;
    rateFactChecked: number;
    rateDiversification: number;
}

export abstract class AlgoSuggestionComputer<
    Config extends AlgoSuggestionConfig = AlgoSuggestionConfig,
> extends AlgoComputer<IAlgoSuggestion> {
    constructor(
        protected readonly config: Config,
        protected readonly postService: PostService,
        protected readonly userService: UserService) {
        super();
    }

    /**
     * Compute suggestions for a user and add them to the database
     * @param user ID of the user
     *
     * @returns The computed suggestions
     */
    async computeForUser(user: NonStrictObjectId): Promise<IAlgoSuggestion & Document> {

        let userDiversificationRate = (await this.userService.getUser(user)).parameters.rateDiversification;
        this.config.rateDiversification = userDiversificationRate;

        const [similarEntry, confidenceEntry] = await getAlgoFieldEntry(user, [AlgoSimilar, AlgoConfidence]);

        if (!similarEntry || !confidenceEntry) {
            return AlgoSuggestion.create({ user, others: [] });
        }

        const topUsers = await this.getTopUsers(this.config.selectUserType === 'similar' ? similarEntry : confidenceEntry);

        const [positiveRatings, negativeRatings, allItems] = await Promise.all([
            getRatedItemsForUser(user, this.config.positiveRatingsModel),
            getRatedItemsForUser(user, this.config.negativeRatingsModel),
            getRatedItemsForUser(
                topUsers.map((u) => u.user),
                [this.config.positiveRatingsModel, this.config.negativeRatingsModel],
            ),
        ]);

        // Get items that are liked by top k similar users but not seen by user
        const items = _.difference(
            _.unique(allItems.map(String)),
            positiveRatings.map(String),
            negativeRatings.map(String),
        ).map((i) => new Types.ObjectId(i));

        logger.debug(this.constructor.name, 'computeForUser', `Found ${items.length} items from top users`);

        // Compute weights for each item
        const findCompleteItems = await Promise.all(
            items
            .map(async (item) => ({
                itemObject: await this.postService.getPost(item)
            }))
        );
        const suggestions: IAlgoSuggestionOther[] = await Promise.all(
            findCompleteItems
            .map(async (itemObject) => ({
                item: itemObject.itemObject._id,
                weight: await this.computeWeight(itemObject.itemObject, similarEntry, confidenceEntry),
            })),
        );

        logger.debug(this.constructor.name, 'computeForUser', 'Completed computing weights');

        return this.createOrUpdate(user, suggestions);
    }

    protected async computeWeight(
        item: ItemForComputation,
        similarEntry: IAlgoField,
        confidenceEntry: IAlgoField,
    ): Promise<number> {
        const raters = await getRatingUsersFromItemWithWeights(
            item._id,
            [this.config.positiveRatingsModel, this.config.negativeRatingsModel],
            [1, -1],
        );

        let numerator = 0;
        let count = 0;

        const similarOthersDict = _.indexBy(similarEntry.others, (o) => o.user.toString());
        const confidenceOthersDict = _.indexBy(confidenceEntry.others, (o) => o.user.toString());

        for (const [other, direction] of raters) {
            const weight = this.computeWeightForItem(
                item,
                similarOthersDict[other.toString()],
                confidenceOthersDict[other.toString()],
            );

            if (weight !== null) {
                numerator += weight * direction;
                count++;
            }
        }

        logger.debug(this.constructor.name, 'computeWeight', 'Computed weight for', item._id, 'as', numerator / count);

        return count ? numerator / count : 0;
    }

    protected abstract computeWeightForItem(
        item: ItemForComputation,
        similarOther: IAlgoFieldOther | undefined,
        confidenceOther: IAlgoFieldOther | undefined,
    ): number | null;

    protected async getTopUsers(userEntry: IAlgoField): Promise<IAlgoFieldOther[]>{
        return userEntry.others.sort((a, b) => b.score - a.score).slice(0, this.config.kTopUsers);
    }

    protected async createOrUpdate(
        user: NonStrictObjectId,
        others: IAlgoSuggestionOther[],
    ): Promise<IAlgoSuggestion & Document> {
        const foundEntry = await AlgoSuggestion.findOneAndUpdate({ user }, { others }, { new: true });

        if (foundEntry) {
            return foundEntry;
        }

        return AlgoSuggestion.create({ user, others });
    }
    
}
