import { DateTime } from 'luxon';

export type GetPricesRequest = {
    coinSymbol: string; // the symbol of the coin to get the price information for. For example, 'BTC'.
    targetCurrency: string; // the currency symbol to convert into. For example, 'USD'.
    onOrBefore: DateTime; // the maximum date for which data should be returned before (inclusively)
    limit: number; // the number of price entries to return
};

export type PriceInformation = {
    close: number;
    conversionSymbol: string;
    conversionType: string;
    high: number;
    low: number;
    open: number;
    time: number;
    volumefrom: number;
    volumeto: number;
};

export type PricesDataSet = {
    Aggregated: boolean;
    TimeFrom: number;
    TimeTo: number;
    Data: PriceInformation[];
};

export type GetPricesResponse = {
    Response: string;
    Message: string;
    HasWarning: boolean;
    Type: number;
    Data: PricesDataSet;
    Aggregated: boolean;
    TimeFrom: number;
    TimeTo: number;
    time: number;
    high: number;
    low: number;
    open: number;
    volumefrom: number;
    volumeto: number;
    close: number;
    conversionType: string;
    conversionSymbol: string;
};
