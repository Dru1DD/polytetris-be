import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import { AuthService, TwitterOAuthService } from '@apps/polytetris/auth/services';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twitter: TwitterOAuthService,
  ) {}

  @Get('twitter')
  async startAuth(@Res() res: FastifyReply, @Req() req: FastifyRequest) {
    try {
      const { url, codeVerifier, state } = await this.twitter.generateAuthUrl();

      req.session.set('codeVerifier', codeVerifier);
      req.session.set('state', state);

      console.log('Redirecting to Twitter auth:', url);
      console.log('Session ID:', req.session.sessionId);

      return res.redirect(url, 302);
    } catch (error) {
      console.error('Twitter auth error:', error);
      return res.status(500).send('Authentication failed');
    }
  }

  @Get('twitter/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    console.log('Callback received:', { code: !!code, state, error });

    try {
      if (error) {
        console.error('Twitter OAuth error:', error, errorDescription);
        return res.type('text/html').send(`
          <h2>Authentication Failed</h2>
          <p>Error: ${error}</p>
          <p>${errorDescription || ''}</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        `);
      }

      const storedState = req.session.get('state');
      const verifier = req.session.get('codeVerifier');

      console.log('Session check:', {
        storedState,
        receivedState: state,
        hasVerifier: !!verifier,
      });

      if (!state || state !== storedState) {
        console.error('State mismatch:', { received: state, stored: storedState });
        return res.status(400).send('Invalid state - possible CSRF attack');
      }

      if (!verifier) {
        console.error('No code verifier in session');
        return res.status(400).send('No code verifier found - session may have expired');
      }

      if (!code) {
        return res.status(400).send('No authorization code received');
      }

      const tokens = await this.twitter.exchangeCodeForToken(code, verifier);
      await this.authService.storeTokens(tokens);

      req.session.delete('codeVerifier');
      req.session.delete('state');

      return res.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Successful</title></head>
          <body>
            <h2>Authentication successful!</h2>
            <p>You can close this window now.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ success: true }, "${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}");
              }
              setTimeout(() => window.close(), 1000);
            </script>
          </body>
        </html>
      `);
    } catch (err) {
      console.error('Callback error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.type('text/html').send(`
        <h2>Authentication Error</h2>
        <p>${message}</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      `);
    }
  }

  @Get('twitter/token')
  async getToken() {
    return this.authService.getValidAccessToken();
  }
}

export default AuthController;
