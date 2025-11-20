/* eslint-disable @typescript-eslint/no-explicit-any */
import '@fastify/secure-session';

declare module '@fastify/secure-session' {
  interface SessionData {
    save: any;
    delete: (code: string) => any;
    codeVerifier?: string;
    state?: string;
    sessionId?: string;
  }
}
