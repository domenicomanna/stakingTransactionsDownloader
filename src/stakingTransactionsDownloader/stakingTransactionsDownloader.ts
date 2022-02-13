import { DateTime } from 'luxon';
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
     * @returns all staking rewards that occurred on or after the given date. If a date is not given, then all rewards
     * going back as far as possible will be retrieved.
     */
    public async getStakingTransactions(onOrAfter: DateTime | null = null): Promise<StakingTransaction[]> {
        const stakingTransactions = (
            await Promise.all([
                this.krakenStakingTransactionsDownloader.getStakingTransactions(onOrAfter),
                this.solanaStakingTransactionDownloader.getStakingTransactions(onOrAfter),
            ])
        ).flat();

        this.logger.log('All staking rewards retrieved');
        return stakingTransactions;
    }
}
