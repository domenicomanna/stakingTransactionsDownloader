import { KrakenStakingTransactionsDownloader } from '../kraken/krakenStakingTransactionsDownloader';
import { SolanaStakingTransactionsDownloader } from '../solana/solanaStakingTransactionsDownloader/solanaStakingTransactionsDownloader';
import { StakingTransaction } from './types';

export class StakingTransactionsDownloader {
    private krakenStakingTransactionsDownloader = new KrakenStakingTransactionsDownloader();
    private solanaStakingTransactionDownloader = new SolanaStakingTransactionsDownloader();

    /**
     *
     * @param daysAgo The number of past days to include transactions from. If this is null, then all transactions
     * going back as far as possible will be retrieved.
     */
    public async getStakingTransactions(daysAgo: number | null = null): Promise<StakingTransaction[]> {
        const stakingTransactions = (
            await Promise.all([
                this.krakenStakingTransactionsDownloader.getStakingTransactions(daysAgo),
                this.solanaStakingTransactionDownloader.getStakingTransactions(daysAgo),
            ])
        ).flat();

        return stakingTransactions;
    }
}
