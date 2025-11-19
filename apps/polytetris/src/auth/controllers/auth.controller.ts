import { Controller, Post, Session, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthService } from '@apps/polytetris/auth/services';
import { InjectAuthService } from '@apps/polytetris/auth/decorators';
import { SignInDto } from '@apps/polytetris/auth/dto';

declare module '@fastify/secure-session' {
  interface SessionData {
    userId: string;
    externalId: string | number;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    email?: string;
  }
}

@Controller('auth')
export default class AuthController {
  constructor(@InjectAuthService() private readonly authService: AuthService) {}

  @Post('sign-in')
  public async signIn(@Session() session: secureSession.Session, @Body() body: SignInDto) {
    const user = await this.authService.signIn({
      userId: body.userId,
      signInMessage: body.signInMessage,
      signInType: body.signInType,
      referralId: body.referralId,
      code: body.code,
    });

    session.set('userId', user.id);
    session.set('externalId', user.externalId);
    session.set('username', user.username);
    session.set('firstName', user.firstName);
    session.set('lastName', user.lastName);
    session.set('avatarUrl', user.avatarUrl);
    session.set('email', user.email);

    return { success: true };
  }

  @Post('logout')
  public logout(@Session() session: secureSession.Session) {
    session.delete();

    return { success: true };
  }
}
