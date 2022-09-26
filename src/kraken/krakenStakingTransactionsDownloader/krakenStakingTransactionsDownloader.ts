import { DateTime } from 'luxon';
import { KrakenApiClient } from '../krakenApiClient/krakenApiClient';
import { Logger } from '../../logger/logger';
import { StakingTransaction } from '../../stakingTransactionsDownloader/types';
import { KrakenStakingTransaction } from '../krakenApiClient/types';

export class KrakenStakingTransactionsDownloader {
    private krakenApiClient = new KrakenApiClient();
    private logger: Logger;
    private krakenApiKey = process.env.KRAKEN_API_KEY ?? '';

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public async getStakingTransactions(onOrAfter: DateTime | null): Promise<StakingTransaction[]> {
        if (!this.krakenApiKey) {
            this.logger.log('Skipping kraken downloader because api key not provided');
            return [];
        }
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
        let cleanedName = assetName.split('.')[0]; // remove the period and anything beyond
        cleanedName = cleanedName.toLowerCase().includes('eth') ? 'eth' : cleanedName;
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
