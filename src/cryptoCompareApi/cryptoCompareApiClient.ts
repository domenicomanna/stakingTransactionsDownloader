import axios from 'axios';
import { DateTime } from 'luxon';
import { GetPricesRequest, GetPricesResponse } from './types';

export class CryptoCompareApiClient {
    baseApiPath = 'https://min-api.cryptocompare.com/data/v2';

    public async getPrices(request: GetPricesRequest): Promise<GetPricesResponse> {
        const { limit, coinSymbol, onOrBefore, targetCurrency } = request;
        const query = {
            fsym: coinSymbol,
            tsym: targetCurrency,
            limit: limit.toString(),
            toTs: onOrBefore.toSeconds().toString(),
            api_key: process.env.CRYPTO_COMPARE_API_KEY ?? '',
        };
        const endpoint = this.getPriceEndpoint(onOrBefore);
        const response = await axios.get(`${this.baseApiPath}/${endpoint}?${new URLSearchParams(query).toString()}`);
        return response.data as GetPricesResponse;
    }

    private getPriceEndpoint(date: DateTime): string {
        const sevenDaysAgo = DateTime.now().minus({ days: 7 });
        // the minute endpoint only stores the data for the last 7 seven days
        return date < sevenDaysAgo ? 'histohour' : 'histominute';
    }
}
