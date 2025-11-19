import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from '@libs/transactions';
import { AuthController } from './controllers';
import { DefaultAuthService } from './services';
import AuthModuleTokens from './auth.module.tokens';

@Module({
  imports: [TransactionsModule, ConfigModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthModuleTokens.Services.AuthService,
      useClass: DefaultAuthService,
    },
  ],
})
export class AuthModule {}
