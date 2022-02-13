import { DateTime } from 'luxon';

export type SolanaStakingRewardInformation = {
    timeOfReward: DateTime | null;
    rewardAmount: number | null; // reward amount in solana
};
