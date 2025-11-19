import { Inject } from '@nestjs/common';
import AuthModuleTokens from '@apps/polytetris/auth/auth.module.tokens';

const InjectAuthService = () => {
  return Inject(AuthModuleTokens.Services.AuthService);
};

export default InjectAuthService;
