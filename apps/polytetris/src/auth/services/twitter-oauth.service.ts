import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { generateCodeVerifier, generateCodeChallenge } from '@xdevplatform/xdk';
import * as crypto from 'crypto';

@Injectable()
export class TwitterOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  private authUrl = 'https://twitter.com/i/oauth2/authorize';
  private tokenUrl = 'https://api.twitter.com/2/oauth2/token';

  private scopes = ['tweet.read', 'users.read', 'tweet.write', 'offline.access'];

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.getOrThrow<string>('X_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow<string>('X_CLIENT_SECRET');

    this.redirectUri = 'http://localhost:3010/auth/twitter/callback';
  }

  async generateAuthUrl() {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomBytes(16).toString('hex');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const url = `${this.authUrl}?${params.toString()}`;

    console.log('Generated auth URL:', url);
    console.log('Code verifier length:', codeVerifier.length);
    console.log('State:', state);

    return { url, codeVerifier, state };
  }

  async exchangeCodeForToken(code: string, verifier: string) {
    const data = qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier,
      // For public clients, include client_id in body
      // For confidential clients, it's optional in body when using Basic Auth
      client_id: this.clientId,
    });

    try {
      const response = await axios.post(this.tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Basic Auth for confidential clients (Web App, Automated App)
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Token exchange error:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new Error(`Token exchange failed: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    const data = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });

    try {
      const response = await axios.post(this.tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Token refresh error:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new Error(`Token refresh failed: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
}
