import { IAlgoFieldOther } from '../../models/algo/algo-field';
import { AlgoSuggestionDefaultComputer } from './algo-suggestions-default-computer';
import { AlgoSuggestionConfig, ItemForComputation } from './algo-suggestions-computer';
import { Types, Document } from 'mongoose';
import { IPost } from '../../models/post';
import { AlgoSuggestionConfidenceComputer, AlgoSuggestionConfidenceConfig } from './algo-suggestion-conf-computer';

export class AlgoSuggestionReconfComputer<
    Config extends AlgoSuggestionConfidenceConfig = AlgoSuggestionConfidenceConfig,
> extends AlgoSuggestionConfidenceComputer<Config> {
    protected computeWeightForItem(
        item: ItemForComputation,
        similarOther: IAlgoFieldOther | undefined,
        confidenceOther: IAlgoFieldOther | undefined,
    ): number | null {
        let primaryOther: IAlgoFieldOther | undefined;
        let secondaryOther: IAlgoFieldOther | undefined;
        let primaryCoefficient: number;
        let secondaryCoefficient: number;

        if (this.config.selectUserType === 'confidence') {
            primaryOther = confidenceOther;
            secondaryOther = similarOther;
            primaryCoefficient = this.config.confidenceCoefficient;
            secondaryCoefficient = this.config.similarityCoefficient;
        } else {
            primaryOther = similarOther;
            secondaryOther = confidenceOther;
            primaryCoefficient = this.config.similarityCoefficient;
            secondaryCoefficient = this.config.confidenceCoefficient;
        }

        if (primaryOther) {
            if (secondaryOther) {
                return (
                    (primaryOther.score / primaryCoefficient + secondaryOther.score / secondaryCoefficient) /
                    (primaryCoefficient + secondaryCoefficient)
                );
            } else {
                return primaryOther.score;
            }
        }

        return null;
    }
}
