import axios from 'axios';
import { EpochInformation, InflationReward, StakingAccount } from './types';
import { constants } from '../../constants';

export class SolanaApiClient {
    private baseApiPath = 'https://api.mainnet-beta.solana.com';
    private walletAddress = process.env.SOLANA_WALLET_ADDRESS ?? '';

    public async getStakingAccounts(): Promise<StakingAccount[]> {
        const params = [
            constants.solana.stakingProgramAddress,
            {
                encoding: 'base64',
                filters: [
                    {
                        memcmp: {
                            offset: 12,
                            bytes: this.walletAddress,
                        },
                    },
                ],
            },
        ];
        const response = await this.executeRequest('getProgramAccounts', params);
        return response.data.result;
    }

    public async getCurrentEpochInformation(): Promise<EpochInformation> {
        const response = await this.executeRequest('getEpochInfo');
        return response.data.result;
    }

    public async getInflationRewards(
        stakingAccountAddresses: string[],
        epoch: number
    ): Promise<InflationReward[] | null[]> {
        const params = [
            stakingAccountAddresses,
            {
                epoch,
            },
        ];
        const response = await this.executeRequest('getInflationReward', params);
        return response.data.result ?? [];
    }

    /**
     *
     * @returns the estimated production time of the given block as a unix timestamp, or null if the timestamp
     * is not available for the block
     */
    public async getBlockTime(block: number): Promise<number | null> {
        const params = [block];
        const response = await this.executeRequest('getBlockTime', params);
        return response.data.result;
    }

    private executeRequest(method: string, params: any[] = []) {
        const postData = {
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
        };

        return axios.post(this.baseApiPath, postData);
    }
}
