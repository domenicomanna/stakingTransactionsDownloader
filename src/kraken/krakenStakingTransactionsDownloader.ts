import { DateTime } from 'luxon';
import { KrakenApiClient } from '../kraken/krakenApiClient';
import { StakingTransaction } from '../stakingTransactionsDownloader/types';
import { KrakenStakingTransaction } from './types';

export class KrakenStakingTransactionsDownloader {
    private krakenApiClient = new KrakenApiClient();

    public async getStakingTransactions(daysAgo: number | null): Promise<StakingTransaction[]> {
        const krakenStakingTransactions = await this.krakenApiClient.getStakingTransactions();
        const filteredTransactions = this.filterTransactions(krakenStakingTransactions, daysAgo);
        const cleanedTransactions = this.cleanTransactions(filteredTransactions);
        return this.convertTransactions(cleanedTransactions);
    }

    private filterTransactions(transactions: KrakenStakingTransaction[], daysAgo: number | null) {
        const startOfToday = DateTime.now().startOf('day');
        const oldestAllowedDate = daysAgo ? startOfToday.minus({ days: daysAgo }) : null;
        return transactions.filter((x) => {
            return (
                x.type === 'reward' &&
                x.status === 'Success' &&
                (oldestAllowedDate ? x.time >= oldestAllowedDate.toSeconds() : true) // only apply the date filter if necessary
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
