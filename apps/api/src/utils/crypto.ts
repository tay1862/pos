import * as crypto from 'crypto';

const APP_SECRET = process.env.APP_SECRET;
if (!APP_SECRET) {
  throw new Error('APP_SECRET environment variable is required');
}

export function hashPin(storeId: string, pin: string): string {
  const payload = storeId + pin + APP_SECRET;
  return crypto.createHash('sha256').update(payload).digest('hex');
}
