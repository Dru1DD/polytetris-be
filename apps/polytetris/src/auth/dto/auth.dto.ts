import { IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

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
  referralId?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
