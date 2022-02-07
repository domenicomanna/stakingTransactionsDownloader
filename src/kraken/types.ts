export type AuthenticatedRequest = {
    nonce: number;
    otp?: string; // the one time password if 2fa is enabled for the api key
};

export type KrakenApiResponse = {
    error: string[];
    result: any;
};

export type KrakenStakingTransaction = {
    method: string;
    aclass: string;
    asset: string;
    refid: string;
    amount: string;
    fee: string;
    time: number; // unix timestamp when the transaction was initiated
    status: 'Initial' | 'Pending' | 'Settled' | 'Success' | 'Failure';
    type: 'bonding' | 'reward' | 'unbonding';
    bond_start: number;
    bond_end: number;
};
