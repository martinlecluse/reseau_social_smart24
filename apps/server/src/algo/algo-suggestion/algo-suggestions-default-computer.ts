import { AlgoSuggestionComputer, AlgoSuggestionConfig, ItemForComputation } from './algo-suggestions-computer';
import { IAlgoFieldOther } from '../../models/algo/algo-field';

export class AlgoSuggestionDefaultComputer<
    Config extends AlgoSuggestionConfig = AlgoSuggestionConfig,
> extends AlgoSuggestionComputer<Config> {
    protected computeWeightForItem(
        item: ItemForComputation,
        similarOther: IAlgoFieldOther | undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        confidence: IAlgoFieldOther | undefined,
    ): number | null {
        if (similarOther) {
            return similarOther.score;
        }

        return null;
    }
}
