import { AlgoSuggestionComputer, AlgoSuggestionConfig, ItemForComputation } from './algo-suggestions-computer';
import { IAlgoField, IAlgoFieldOther } from '../../models/algo/algo-field';
import { trusted } from 'mongoose';

export interface AlgoSuggestionConfidenceConfig extends AlgoSuggestionConfig {
    similarityCoefficient: number;
    confidenceCoefficient: number;
    offsetTrustedUsers: number
}

export class AlgoSuggestionConfidenceComputer<
    Config extends AlgoSuggestionConfidenceConfig = AlgoSuggestionConfidenceConfig,
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

    protected async getTopUsers(userEntry: IAlgoField): Promise<IAlgoFieldOther[]> {
        
        let selectedUsers = userEntry.others.sort((a, b) => b.score - a.score).slice(0, this.config.kTopUsers);

        console.log("SELECTED USERS BEFORE TRUST/UNSTRUST : " + selectedUsers)

        const userObject = (await this.userService.getUser(userEntry.user));
        const trustedUsers = userObject.trustedUsers;
        const untrustedUsers = userObject.untrustedUsers;

        console.log("TRUSTED USERS : " + trustedUsers);
        console.log("UNTRUSTED USERS : " + untrustedUsers);

        selectedUsers.forEach( (other) => {
            other.score += ((trustedUsers.find(e => e = other.user) !== undefined) ? this.config.offsetTrustedUsers : 0 );
            other.score -= ((untrustedUsers.find(e => e = other.user) !== undefined) ? this.config.offsetTrustedUsers : 0 );
        })

        selectedUsers = selectedUsers.sort((a, b) => b.score - a.score);

        console.log("SELECTED USERS AFTER TRUST/UNSTRUST : " + selectedUsers)
        
        return selectedUsers;
    }
}
