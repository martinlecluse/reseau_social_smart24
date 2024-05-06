import { IAlgoFieldOther } from '../../models/algo/algo-field';
import { AlgoSuggestionDefaultComputer } from './algo-suggestions-default-computer';
import { ItemForComputation } from './algo-suggestions-computer';
import { AlgoSuggestionConfidenceConfig } from './algo-suggestion-conf-computer';

export interface AlgoSuggestionFactChecksConfig extends AlgoSuggestionConfidenceConfig {
    factCheckCoefficient: number;
}

export class AlgoSuggestionFactChecksComputer<
    Config extends AlgoSuggestionFactChecksConfig = AlgoSuggestionFactChecksConfig,
> extends AlgoSuggestionDefaultComputer<Config> {
    protected computeWeightForItem(
        item: ItemForComputation,
        similarOther: IAlgoFieldOther | undefined,
        confidenceOther: IAlgoFieldOther | undefined,
    ): number | null {
        let primaryOther: IAlgoFieldOther | undefined;
        let secondaryOther: IAlgoFieldOther | undefined;
        let primaryCoefficient: number;
        let secondaryCoefficient: number;
        const factCheckCoefficient: number = this.config.factCheckCoefficient;

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

        const nbFactChecks = item.metrics.nbFactChecks;
        let factCheckScore: number = 0; //no fact-chceks => no impact

        if (nbFactChecks > 0) {
            factCheckScore = item.metrics.factCheckScore - 1.5; //below mean => degradation
        }

        if (primaryOther) {
            if (secondaryOther) {
                return (
                    (primaryOther.score / primaryCoefficient +
                        secondaryOther.score / secondaryCoefficient +
                        factCheckScore / factCheckCoefficient) /
                    (primaryCoefficient + secondaryCoefficient)
                );
            } else {
                return primaryOther.score;
            }
        }

        return null;
    }
}
