import { KrakenStakingTransactionsDownloader } from '../kraken/krakenStakingTransactionsDownloader';
import { StakingTransaction } from './types';

export class StakingTransactionsDownloader {
    private krakenStakingTransactionsDownloader = new KrakenStakingTransactionsDownloader();

    /**
     *
     * @param daysAgo The number of past days to include transactions from. If this is null, then all transactions
     * going back as far as possible will be retrieved.
     */
    public async getStakingTransactions(daysAgo: number | null = null): Promise<StakingTransaction[]> {
        const krakenStakingTransactions = await this.krakenStakingTransactionsDownloader.getStakingTransactions(
            daysAgo
        );
        return krakenStakingTransactions;
    }
}
