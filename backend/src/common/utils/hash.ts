import { createHash, timingSafeEqual } from 'node:crypto';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const compareHashedToken = (token: string, tokenHash: string) => {
  const tokenDigest = Buffer.from(hashToken(token), 'utf8');
  const storedDigest = Buffer.from(tokenHash, 'utf8');

  if (tokenDigest.length !== storedDigest.length) {
    return false;
  }

  return timingSafeEqual(tokenDigest, storedDigest);
};
