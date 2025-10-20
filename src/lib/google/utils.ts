import crypto from 'crypto';

const STATE_BYTE_LENGTH = 16;

export function generateOAuthState(): string {
  return crypto.randomBytes(STATE_BYTE_LENGTH).toString('hex');
}

export function verifyOAuthState(
  storedState: string | null,
  receivedState: string | null
): boolean {
  if (!storedState || !receivedState) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(storedState, 'utf8'),
      Buffer.from(receivedState, 'utf8')
    );
  } catch (error) {
    console.warn('Failed to verify OAuth state', error);
    return false;
  }
}
