import { DateTime } from 'luxon';

export type StakingTransaction = {
    asset: string; // the asset received
    amount: number; // the amount of the asset received
    fee: number; // the fee associated with the staking transaction
    dateReceived: DateTime; // the date the reward was received
    exchange: string; // the exchange, if any, that the staking reward came from
    type: 'Reward';
};
