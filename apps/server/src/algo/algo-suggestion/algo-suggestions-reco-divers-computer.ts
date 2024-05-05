import { IAlgoField, IAlgoFieldOther } from '../../models/algo/algo-field';
import { AlgoSuggestionConfidenceConfig } from './algo-suggestion-conf-computer';
import { AlgoSuggestionReconfComputer } from './algo-suggestions-reconf-computer';

export class AlgoSuggestionsRecoDiversComputer<
    Config extends AlgoSuggestionConfidenceConfig = AlgoSuggestionConfidenceConfig,
> extends AlgoSuggestionReconfComputer<Config> {
    protected async getTopUsers(userEntry: IAlgoField): Promise<IAlgoFieldOther[]> {
        const nTopUsers = Math.round(this.config.rateDiversification * this.config.kTopUsers);
        const nAvgUsers = this.config.kTopUsers - nTopUsers;

        const sortedUsers = userEntry.others.sort((a, b) => b.score - a.score);
        const topUsers = sortedUsers.slice(0, nTopUsers);

        // Get the rest of the users and select the middle ones
        let restUsers = sortedUsers.slice(nTopUsers);
        restUsers = restUsers.slice(Math.floor(restUsers.length / 2), restUsers.length);
        restUsers = restUsers.slice(0, nAvgUsers);

        return topUsers.concat(restUsers);
    }
}
