import { IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { IsIdentifier } from '@libs/validation/class-validators';

export class SignInDto {
  @IsNotEmpty()
  @IsIn(['web', 'telegram', 'google'])
  signInType: 'web' | 'telegram' | 'google';

  @IsOptional()
  @IsString()
  signInMessage: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsIdentifier()
  referralId?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
