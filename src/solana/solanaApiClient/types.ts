export type StakingAccount = {
    account: {
        data: string;
        executable: boolean;
        lamports: number;
        owner: string;
        rentEpoch: number;
    };
    pubkey: string;
};

export type EpochInformation = {
    absoluteSlot: number;
    blockHeight: number;
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
    transactionCount: number;
};

export type InflationReward = {
    amount: number; // reward amount in lamports
    effectiveSlot: number;
    epoch: number;
    postBalance: number;
};
