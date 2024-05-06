import { StatusCodes } from 'http-status-codes';
import { Document } from 'mongoose';
import { singleton } from 'tsyringe';
import { Comment, CommentDocument, ICreateComment } from '../../models/comment';
import { HttpException } from '../../models/http-exception';
import { Metrics } from '../../models/metrics';
import { ICreatePost, IPost, Post } from '../../models/post';
import { NonStrictObjectId } from '../../utils/objectid';
import { UserService } from '../user-service';
import { AlgoSuggestion, IAlgoParams, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';
import { ItemForComputation } from 'src/algo/algo-suggestion/algo-suggestions-computer';

@singleton()
export class PostService {
    constructor(private readonly userService: UserService) {}

    async publishPost(userId: NonStrictObjectId, newPost: ICreatePost): Promise<Document & IPost> {
        await this.userService.getUser(userId);

        const metrics = new Metrics({});
        await metrics.save();

        let post = new Post({
            text: newPost.text,
            image: newPost.image,
            createdBy: userId,
            metrics: metrics._id,
        });

        post = await post.save();

        await this.userService.addPostId(userId, post._id);

        return post;
    }

    async publishComment(userId: NonStrictObjectId, newComment: ICreateComment): Promise<Document & IPost> {
        await this.userService.getUser(userId);
        await this.getPost(newComment.parentPostId.toString());

        const metrics = new Metrics({});
        await metrics.save();

        const comment = new Comment({
            text: newComment.text,
            image: newComment.image,
            createdBy: userId,
            metrics: metrics._id,
            parentPostId: newComment.parentPostId,
        });

        await comment.save();

        return comment;
    }

    async getPost(postId: NonStrictObjectId): Promise<ItemForComputation> {
        const post = await Post.findOne<ItemForComputation>({ _id: postId })
            .populate('createdBy', 'username _id')
            .populate('metrics');

        if (!post) {
            throw new HttpException(StatusCodes.NOT_FOUND, `No post found with ID ${postId}`);
        }

        return post;
    }

    async getPostComments(postId: NonStrictObjectId): Promise<(Document & CommentDocument)[]> {
        const commentsQuery = Comment.find({ parentPostId: postId })
            .sort({ date: -1 })
            .limit(50)
            .populate('createdBy', 'username _id')
            .populate('metrics');

        const res = await commentsQuery.exec();
        for (let i = 0; i < res.length; i++) {
            const comment = res[i].toObject();
            comment.comments = await this.getPostComments(comment._id);
            res[i] = comment;
        }

        return res;
    }

    async getMetricsId(postId: NonStrictObjectId): Promise<NonStrictObjectId> {
        return (await this.getPost(postId)).metrics;
    }

    async getSuggestions(userId: NonStrictObjectId) {
        //find diversity and factChecking rate for the user
        const userParams: IAlgoParams = (await this.userService.getUser(userId)).parameters;

        let suggestions: ItemForComputation[] = [];
        const suggestionsIds: IAlgoSuggestionOther[] = (await AlgoSuggestion.findOne({ user: userId }))!.others;

        await Promise.all(
            suggestionsIds.map(async (so: IAlgoSuggestionOther) => {
                suggestions.push(await this.getPost(so.item));
            }),
        );

        //measure output relative to goal in terms of fact-checked posts
        const goalFactChecked: number = (userParams.rateFactChecked / 100) * 200;
        const outputFactChecked: number = suggestions
            .slice(0, 200)
            .filter((sug) => sug.metrics.nbFactChecks > 0).length; //feed : 200 suggestions so compare only on this part of the output
        const differenceOutputGoal: number = outputFactChecked - goalFactChecked;

        const filterFunction = (post: ItemForComputation) => {
            //too much fact-checks, we KEEP the un-fact-checked
            //unsufficient number or fact-checks, we KEEP the fact-checked
            return differenceOutputGoal > 0 ? post.metrics.nbFactChecks == 0 : post.metrics.nbFactChecks != 0;
        };

        const removeItems = (sugList: ItemForComputation[], diff: number) => {
            const sortedSugList: ItemForComputation[] = sugList
                .sort((post) => (filterFunction(post) ? 1 : 0))
                .filter((post) => filterFunction(post))
                .slice(Math.abs(diff));

            return sugList.filter((post) => !sortedSugList.includes(post));
        };

        if (differenceOutputGoal != 0) {
            //keep only correctly guessed remaining posts after position 200
            const possibleSuggestions = suggestions.slice(201).filter((post) => filterFunction(post));
            //filter the current feed
            const firstSuggestions = removeItems(suggestions.slice(0, 200).reverse(), differenceOutputGoal); //IMPORTANT : reverse because order is important

            //update sugestions
            suggestions = firstSuggestions.concat(possibleSuggestions.slice(0, differenceOutputGoal));
        }

        const nbSuggestions = suggestions.length;
        if (nbSuggestions < 200) {
            const nbFactChecked = suggestions.slice(0, 200).filter((sug) => sug.metrics.nbFactChecks > 0).length;
            const diffFactCheckedPostsToAdd: number = goalFactChecked - nbFactChecked; //nb of fact-checked posts to add to the feed (only >= 0 at this point)

            //fills missing posts with random posts
            const nbSuggToAdd = 200 - nbSuggestions;
            const factCheckPipeline = [
                {
                    $lookup: {
                        from: 'metrics',
                        localField: '_id',
                        foreignField: 'postId',
                        as: 'metrics',
                    },
                },
                {
                    $match: {
                        'metrics.nbFactChecks': { $gt: 0 }, //keep fact-checked posts
                    },
                },
                { $sample: { size: diffFactCheckedPostsToAdd } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                    },
                },
                {
                    $project: {
                        username: '$createdBy.username',
                        _id: '$createdBy._id',
                    },
                },
            ];
            const notFactChekedPipeline = [
                {
                    $lookup: {
                        from: 'metrics',
                        localField: '_id',
                        foreignField: 'postId',
                        as: 'metrics',
                    },
                },
                {
                    $match: {
                        'metrics.nbFactChecks': { $lt: 0 }, //keep un-fact-checked posts
                    },
                },
                { $sample: { size: nbSuggToAdd - diffFactCheckedPostsToAdd } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                    },
                },
                {
                    $project: {
                        username: '$createdBy.username',
                        _id: '$createdBy._id',
                    },
                },
            ];

            const factCheckedSuggestionsToAdd = await Post.aggregate(factCheckPipeline);
            const notFactCheckedSuggestionsToAdd = await Post.aggregate(notFactChekedPipeline);

            suggestions = suggestions.concat(factCheckedSuggestionsToAdd).concat(notFactCheckedSuggestionsToAdd);
        }

        return {
            suggestions: suggestions,
        };
    }
}
