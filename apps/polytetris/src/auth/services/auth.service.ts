import { Injectable, Logger } from '@nestjs/common';
import { TwitterOAuthService } from './twitter-oauth.service';

interface Token {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private tokenStorage: Token | null = null;

  constructor(private readonly twitter: TwitterOAuthService) {}

  async storeTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    this.tokenStorage = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    };

    this.logger.log(`Tokens stored.Expires at: ${expiresAt}`);
  }
  async getValidAccessToken(): Promise<string | null> {
    const token = this.tokenStorage;
    if (!token) {
      this.logger.warn('No token found in storage');
      return null;
    }
    if (Date.now() >= token.expires_at) {
      this.logger.log('Access token expired. Refreshing...');
      const refreshed = await this.twitter.refreshToken(token.refresh_token);
      await this.storeTokens(refreshed);
      return refreshed.access_token;
    }
    return token.access_token;
  }
}
