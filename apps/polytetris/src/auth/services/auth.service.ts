import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectUserService } from '@apps/babushka/users/decorators';
import { UserDto } from '@apps/babushka/users/dto/user.dto';
import { UserService } from '@apps/babushka/users/services';
import { RegistrationService } from '@apps/babushka/auth/services';
import { getTelegramInitDataFromSignInMessage } from '@apps/babushka/auth/utils';
import { InjectRegistrationService } from '@apps/babushka/auth/decorators';
import { OAuth2Client } from 'google-auth-library';
import { OtpService } from '@apps/babushka/auth/services/otp.service';
import { EmailService } from '@apps/babushka/auth/services/email.service';
import InjectEmailService from '@apps/babushka/auth/decorators/inject-email-service.decorator';
import InjectOtpService from '@apps/babushka/auth/decorators/inject-otp-service.decorator';

export interface InitDataUser {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
}

interface TelegramSignInParams {
  signInType: 'telegram';
  signInMessage: string;
  referralId?: string;
}

interface WebSignInParams {
  signInType: 'web';
  userId: string;
  referralId?: string;
}

interface GoogleSignInParams {
  signInType: 'google';
  code: string;
  referralId?: string;
}

export type SignInParams = TelegramSignInParams | WebSignInParams | GoogleSignInParams;

export interface AuthService {
  signIn(params: SignInParams): Promise<UserDto>;
  sendOtpToEmail(email: string): Promise<void>;
  verifyEmailOtp(email: string, code: string, referralId?: string): Promise<UserDto>;
}

@Injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @InjectUserService() private readonly userService: UserService,
    @InjectRegistrationService() private readonly registrationService: RegistrationService,
    private readonly configService: ConfigService,
    @InjectEmailService() private readonly emailService: EmailService,
    @InjectOtpService() private readonly otpService: OtpService,
  ) {}

  public async signIn(params: SignInParams) {
    const initData = await this.getInitDataFromSignInParams(params);

    if (!initData.user) {
      throw new ForbiddenException('Authorization failed.');
    }

    const user = await this.userService.getByExternalId(initData.user.id);

    if (!user) {
      return this.registrationService.register({
        externalId: initData.user.id,
        userName: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        avatarUrl: initData.user.photo_url,
        email: initData.user.email,
        referralId: params.referralId,
      });
    }

    if (
      (user.username !== initData.user.username && initData.user.username) ||
      (user.firstName !== initData.user.first_name && initData.user.first_name) ||
      (user.lastName !== initData.user.last_name && initData.user.last_name) ||
      (user.avatarUrl !== initData.user.photo_url && initData.user.photo_url) ||
      (user.email !== initData.user.email && initData.user.email)
    ) {
      return this.userService.update(user.id, {
        username: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        avatarUrl: initData.user.photo_url,
        email: initData.user.email,
      });
    }

    return user;
  }

  public async sendOtpToEmail(email: string): Promise<void> {
    const code = await this.otpService.generateOtp(email);

    await this.emailService.sendOtpEmail(email, code);
  }

  public async verifyEmailOtp(email: string, code: string, referralId?: string): Promise<UserDto> {
    const isValid = await this.otpService.verifyOtp(email, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    let user = await this.userService.getByEmail(email);

    if (!user) {
      user = await this.registrationService.register({
        email,
        referralId,
      });
    }

    return user;
  }

  private async getInitDataFromSignInParams(signInParams: SignInParams): Promise<{ user?: InitDataUser }> {
    if (signInParams.signInType === 'telegram') {
      return getTelegramInitDataFromSignInMessage(signInParams.signInMessage);
    }

    if (signInParams.signInType === 'google') {
      const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');

      const client = new OAuth2Client(
        googleClientId,
        this.configService.get('GOOGLE_CLIENT_SECRET'),
        this.configService.get('GOOGLE_REDIRECT_URI'),
      );

      let idToken: string | undefined;

      if ('code' in signInParams) {
        const { tokens } = await client.getToken(signInParams.code);
        idToken = tokens.id_token;
      }

      if (!idToken) {
        throw new ForbiddenException('No id_token found');
      }

      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.sub) {
        throw new ForbiddenException('Invalid Google token');
      }

      return {
        user: {
          id: payload.sub,
          first_name: payload.given_name || '',
          last_name: payload.family_name || '',
          photo_url: payload.picture || '',
          email: payload.email || '',
        },
      };
    }

    return {
      user: {
        id: '',
        first_name: '',
        last_name: '',
        photo_url: '',
        email: '',
      },
    };
  }
}
