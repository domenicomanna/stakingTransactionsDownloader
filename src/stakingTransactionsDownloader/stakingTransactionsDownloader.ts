import { KrakenStakingTransactionsDownloader } from '../kraken/krakenStakingTransactionsDownloader';
import { Logger } from '../logger/logger';
import { SolanaStakingTransactionsDownloader } from '../solana/solanaStakingTransactionsDownloader/solanaStakingTransactionsDownloader';
import { StakingTransaction } from './types';

export class StakingTransactionsDownloader {
    private logger: Logger;
    private krakenStakingTransactionsDownloader;
    private solanaStakingTransactionDownloader;

    constructor(logger: Logger) {
        this.logger = logger;
        this.krakenStakingTransactionsDownloader = new KrakenStakingTransactionsDownloader(logger);
        this.solanaStakingTransactionDownloader = new SolanaStakingTransactionsDownloader(logger);
    }

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

        this.logger.log('All staking rewards retrieved');
        return stakingTransactions;
    }
}
