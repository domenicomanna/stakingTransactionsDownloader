import { DateTime } from 'luxon';
import { KrakenApiClient } from '../kraken/krakenApiClient';
import { Logger } from '../logger/logger';
import { StakingTransaction } from '../stakingTransactionsDownloader/types';
import { KrakenStakingTransaction } from './types';

export class KrakenStakingTransactionsDownloader {
    private krakenApiClient = new KrakenApiClient();
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public async getStakingTransactions(onOrAfter: DateTime | null): Promise<StakingTransaction[]> {
        this.logger.log('Getting staking rewards from kraken');
        const krakenStakingTransactions = await this.krakenApiClient.getStakingTransactions();
        const filteredTransactions = this.filterTransactions(krakenStakingTransactions, onOrAfter);
        const cleanedTransactions = this.cleanTransactions(filteredTransactions);
        const convertedTransactions = this.convertTransactions(cleanedTransactions);
        this.logger.log('Kraken staking rewards retrieved');
        return convertedTransactions;
    }

    private filterTransactions(transactions: KrakenStakingTransaction[], onOrAfter: DateTime | null) {
        return transactions.filter((x) => {
            return (
                x.type === 'reward' && x.status === 'Success' && (onOrAfter ? x.time >= onOrAfter.toSeconds() : true) // only apply the date filter if necessary
            );
        });
    }

    private cleanTransactions(transactions: KrakenStakingTransaction[]): KrakenStakingTransaction[] {
        return transactions.map((x) => ({
            ...x,
            asset: this.cleanAssetName(x.asset),
        }));
    }

    private cleanAssetName(assetName: string) {
        let cleanedName = assetName.slice(0, assetName.indexOf('.')); // remove the period and anything beyond
        cleanedName = cleanedName.toLowerCase() === 'eth2' ? 'eth' : cleanedName; // remove the 2 if the asset is eth2
        return cleanedName;
    }

    private convertTransactions(transactions: KrakenStakingTransaction[]): StakingTransaction[] {
        return transactions.map(
            (x): StakingTransaction => ({
                asset: x.asset,
                amount: parseFloat(x.amount),
                fee: parseFloat(x.fee),
                dateReceived: DateTime.fromSeconds(x.time),
                exchange: 'Kraken',
                type: 'Reward',
            })
        );
    }
}
