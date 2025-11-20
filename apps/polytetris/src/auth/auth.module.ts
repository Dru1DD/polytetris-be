import { Module } from '@nestjs/common';
import { AuthController } from './controllers';
import { AuthService, TwitterOAuthService } from './services';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, TwitterOAuthService],
})
export class AuthModule {}
