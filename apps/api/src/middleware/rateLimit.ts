import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

// This generates a key per provided email address (provided in body
function getEmailKey(req: Request): string {
  return typeof req.body?.email === 'string'
    ? req.body.email.toLowerCase()
    : 'unknown';
}

// This similarly generates a key per client id
function getClientIdKey(req: Request): string {
  return typeof req.body?.client_id === 'string'
    ? req.body.client_id
    : 'unknown';
}

// Genenerally limit to 300 requests every 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// For logins reduce that to 5 requests per 15 minutes on an ip/email basis
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const key = `${ipKeyGenerator(req.ip!)}:${getEmailKey(req)}`;
    console.log(key);
    return key;
  },
  message: { message: 'Too many login attempts, please try again later.' },
});

// For tokens we limit each client/ip combination to 30 per 15 minutes
export const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_TOKEN_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip!)}:${getClientIdKey(req)}`,
  message: { message: 'Too many token requests, please try again later.' },
});

// Forgotten passwords are limited similarly to login (but kept here in case changes needed)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_FORGOT_PASSWORD_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip!)}:${getEmailKey(req)}`,
  message: {
    message: 'Too many password reset attempts, please try again later.',
  },
});

// Restrict registrations to 10 attempts per hour
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip!)}:${getEmailKey(req)}`,
  message: { message: 'Too many sign-up attempts, please try again later.' },
});
