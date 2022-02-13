import { CryptoCompareApiClient } from '../cryptoCompareApi/cryptoCompareApiClient';
import { GetPricesRequest, GetPricesResponse, PriceInformation } from '../cryptoCompareApi/types';
import { Logger } from '../logger/logger';
import { StakingTransaction } from '../stakingTransactionsDownloader/types';
import { PricedStakingTransaction } from './types';

export class PricedStakingTransactionConverter {
    private currencyCode: string;
    private cryptoCompareApiClient = new CryptoCompareApiClient();
    private logger: Logger;

    /**
     *
     * @param currencyCode the code of the currency that will be used to retrieve the price of the crypto assets
     */
    constructor(currencyCode: string, logger: Logger) {
        this.currencyCode = currencyCode;
        this.logger = logger;
    }

    public async convert(transactions: StakingTransaction[]): Promise<PricedStakingTransaction[]> {
        this.logger.log('Adding prices to staking rewards...');

        const pricedStakingRewards = await Promise.all(
            transactions.map(async (x): Promise<PricedStakingTransaction> => {
                const price = await this.getPrice(x);
                const rewardAmountInCurrency = price * x.amount;
                return {
                    ...x,
                    price,
                    currencyCode: this.currencyCode,
                    rewardAmountInCurrency,
                };
            })
        );

        this.logger.log('Prices added');
        return pricedStakingRewards;
    }

    private async getPrice(transaction: StakingTransaction): Promise<number> {
        const request: GetPricesRequest = {
            targetCurrency: this.currencyCode,
            coinSymbol: transaction.asset,
            onOrBefore: transaction.dateReceived,
            limit: 1,
        };

        const response: GetPricesResponse = await this.cryptoCompareApiClient.getPrices(request);
        if (response.Response.toLowerCase() === 'error') {
            throw new Error(response.Message);
        }

        const prices: PriceInformation[] = response.Data.Data;

        if (prices.length === 0) {
            throw new Error(`No data on or before ${transaction.dateReceived.toISO()} found`);
        }

        const lastEntry: PriceInformation = prices[prices.length - 1];
        const averagePrice = (lastEntry.high + lastEntry.low) / 2;
        return averagePrice;
    }
}
