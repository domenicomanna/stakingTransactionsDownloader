import { DateTime } from 'luxon';
import { constants } from '../../constants';
import { Logger } from '../../logger/logger';
import { StakingTransaction } from '../../stakingTransactionsDownloader/types';
import { SolanaApiClient } from '../solanaApiClient/solanaApiClient';
import { InflationReward, StakingAccount } from '../solanaApiClient/types';
import { SolanaStakingRewardInformation } from './types';

export class SolanaStakingTransactionsDownloader {
    private solanaApiClient = new SolanaApiClient();
    private logger: Logger;
    private solanaWalletAddress = process.env.SOLANA_WALLET_ADDRESS ?? '';

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public async getStakingTransactions(onOrAfter: DateTime | null): Promise<StakingTransaction[]> {
        if (!this.solanaWalletAddress) {
            this.logger.log('Skipping solana downloader because solana wallet address not provided');
            return [];
        }
        this.logger.log('Getting staking rewards from solana');
        const solanaStakingRewards = await this.handleGetStakingRewards(onOrAfter);
        const convertedTransactions = this.convertTransactions(solanaStakingRewards);
        this.logger.log('Solana staking rewards retrieved');
        return convertedTransactions;
    }

    private async handleGetStakingRewards(onOrAfter: DateTime | null): Promise<SolanaStakingRewardInformation[]> {
        const stakingAccounts: StakingAccount[] = await this.solanaApiClient.getStakingAccounts();
        const stakingAccountAddresses: string[] = stakingAccounts.map((x) => x.pubkey);
        const { epoch } = await this.solanaApiClient.getCurrentEpochInformation();

        const stakingRewards: SolanaStakingRewardInformation[] = [];

        for (const stakingAccountAddress of stakingAccountAddresses) {
            const stakingRewardsForAddress = await this.getStakingRewardsForAddress(
                onOrAfter,
                epoch,
                stakingAccountAddress
            );
            stakingRewards.push(...stakingRewardsForAddress);
        }

        return stakingRewards;
    }

    private async getStakingRewardsForAddress(
        onOrAfter: DateTime | null,
        currentEpoch: number,
        stakingAddress: string
    ): Promise<SolanaStakingRewardInformation[]> {
        const stakingRewards: SolanaStakingRewardInformation[] = [];

        let epochOfInterest: number = currentEpoch;
        let timeOfMostRecentReward: DateTime | null = null;

        // only consider 'onOrAfter' if it is not null, and we know the time of most recently retrieved reward
        while (
            epochOfInterest >= 0 &&
            (onOrAfter && timeOfMostRecentReward ? timeOfMostRecentReward > onOrAfter : true)
        ) {
            this.logger.log(`Getting sol staking reward for address ${stakingAddress} on epoch ${epochOfInterest}`);
            const stakingReward = await this.getStakingRewardInformation(stakingAddress, epochOfInterest);

            const { timeOfReward, rewardAmount } = stakingReward;
            timeOfMostRecentReward = timeOfReward;
            epochOfInterest -= 1;

            if (!rewardAmount || (timeOfReward && onOrAfter && timeOfReward < onOrAfter)) continue;

            stakingRewards.push(stakingReward);
        }

        return stakingRewards;
    }

    private async getStakingRewardInformation(
        stakingAddress: string,
        epoch: number
    ): Promise<SolanaStakingRewardInformation> {
        const InflationRewards: InflationReward[] | null[] = await this.solanaApiClient.getInflationRewards(
            [stakingAddress],
            epoch
        );

        if (InflationRewards.length === 0 || InflationRewards[0] === null) {
            return {
                timeOfReward: null,
                rewardAmount: null,
            };
        }

        // we are only passing one address, so we should only have one reward per epoch
        const inflationReward = InflationRewards[0];
        const timeOfReward = await this.solanaApiClient.getBlockTime(inflationReward.effectiveSlot);

        return {
            timeOfReward: timeOfReward ? DateTime.fromSeconds(timeOfReward) : null,
            rewardAmount: (inflationReward.amount ?? 0) / constants.solana.lamportsInOneSolana,
        };
    }

    private convertTransactions(rewards: SolanaStakingRewardInformation[]): StakingTransaction[] {
        return rewards.map(
            (x): StakingTransaction => ({
                asset: 'SOL',
                amount: x.rewardAmount ?? 0,
                fee: 0,
                dateReceived: x.timeOfReward ?? DateTime.now(),
                exchange: '',
                type: 'Reward',
            })
        );
    }
}
