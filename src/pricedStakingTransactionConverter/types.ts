import { StakingTransaction } from '../stakingTransactionsDownloader/types';

export type PricedStakingTransaction = {
    price: number; // the price of the asset at the time the reward was received
    currencyCode: string; // the currency code of the price
    rewardAmountInCurrency: number; // the reward amount of the asset in the given currency
} & StakingTransaction;
