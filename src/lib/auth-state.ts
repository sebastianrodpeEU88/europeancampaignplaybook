export type AuthState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'check-email' };

export const idleAuthState: AuthState = { status: 'idle' };
