import axios from 'axios';
import { AuthenticatedRequest, KrakenStakingTransaction } from './types';
import crypto from 'crypto';
import qs from 'qs';
import { URL } from 'url';

export class KrakenApiClient {
    private baseApiPath = 'https://api.kraken.com';
    private apiKey = process.env.KRAKEN_API_KEY ?? '';
    private apiPrivateKey = process.env.KRAKEN_API_PRIVATE_KEY ?? '';
    private apiKey2faPassword = process.env.KRAKEN_API_KEY_2FA_PASSWORD ?? '';

    public async getStakingTransactions(): Promise<KrakenStakingTransaction[]> {
        const relativeEndpointPath = '/0/private/Staking/Transactions';
        const fullEndpointPath = new URL(relativeEndpointPath, this.baseApiPath).toString();
        const request: AuthenticatedRequest = this.buildAuthenticatedRequest();
        const apiSignHeaderValue = this.getApiSignHeaderValue(relativeEndpointPath, request);

        const response = await axios.post(fullEndpointPath, qs.stringify(request), {
            headers: {
                'API-Key': this.apiKey,
                'API-Sign': apiSignHeaderValue,
            },
        });

        return response.data.result;
    }

    private buildAuthenticatedRequest(originalRequest: any = {}): AuthenticatedRequest {
        const authenticatedRequest: AuthenticatedRequest = {
            ...originalRequest,
            nonce: Date.now(),
        };

        if (this.apiKey2faPassword) {
            authenticatedRequest.otp = this.apiKey2faPassword;
        }

        return authenticatedRequest;
    }

    private getApiSignHeaderValue(relativeEndpointPath: string, request: AuthenticatedRequest): string {
        const urlEncodedRequest = qs.stringify(request);
        const buffer = Buffer.from(this.apiPrivateKey, 'base64');
        const hash = crypto.createHash('sha256');
        const hmac = crypto.createHmac('sha512', buffer);
        const hashDigest = hash
            .update(request.nonce + urlEncodedRequest)
            .digest()
            .toString('binary');
        const hmacDigest = hmac.update(relativeEndpointPath + hashDigest, 'binary').digest('base64');

        return hmacDigest;
    }
}
