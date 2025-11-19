import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UseSessionData = createParamDecorator((data: undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return {
    userId: request.session.get('userId'),
  };
});

export default UseSessionData;
