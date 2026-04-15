import crypto from 'node:crypto';
import { SignJWT } from 'jose';

const ACCESS_TOKEN_AUDIENCE = 'auth-service-api';
const ACCESS_TOKEN_EXPIRY = '15m';
const ID_TOKEN_EXPIRY = '15m';

// These two functions are used internally within this file
function getTokenIssuer(): string {
  if (!process.env.TOKEN_ISSUER) {
    throw new Error('Missing TOKEN_ISSUER');
  }
  return process.env.TOKEN_ISSUER;
}

function getTokenSecret(): Uint8Array {
  if (!process.env.TOKEN_SECRET) {
    throw new Error('Missing TOKEN_SECRET');
  }
  return new TextEncoder().encode(process.env.TOKEN_SECRET);
}

// This creates a random token used as a refresh token
export function createOpaqueToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString('hex');
}

// For signing our access tokens consistently
export async function signAccessToken(params: {
  userId: string;
  scope?: string;
}): Promise<string> {
  const secret = getTokenSecret();
  const issuer = getTokenIssuer();

  return new SignJWT({
    scope: params.scope ?? 'openid',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setAudience(ACCESS_TOKEN_AUDIENCE)
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
}

// For signing an id token (slightly different to above)
export async function signIdToken(params: {
  userId: string;
  clientId: string;
  email: string;
  displayName: string;
  admin: boolean;
}): Promise<string> {
  const secret = getTokenSecret();
  const issuer = getTokenIssuer();

  return new SignJWT({
    email: params.email,
    name: params.displayName,
    admin: params.admin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setAudience(params.clientId)
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(ID_TOKEN_EXPIRY)
    .sign(secret);
}

// This gets our access audience for other functions to use
export function getAccessTokenAudience(): string {
  return ACCESS_TOKEN_AUDIENCE;
}

// This is used for storing hashed tokens
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
