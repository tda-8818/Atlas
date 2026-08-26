import crypto from 'crypto';

const KEY_PREFIX = 'atk_';

export function generateApiKey() {
  const secret = crypto.randomBytes(24).toString('base64url');
  const key = `${KEY_PREFIX}${secret}`;
  return {
    key,
    hashedKey: hashApiKey(key),
    prefix: key.slice(0, 11),
  };
}

export function hashApiKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export function isApiKeyFormat(token) {
  return typeof token === 'string' && token.startsWith(KEY_PREFIX) && token.length > 16;
}
