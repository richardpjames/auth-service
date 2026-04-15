import type { Request, Response } from 'express';

export function openIdConfiguration(req: Request, res: Response): void {
  if (!process.env.TOKEN_ISSUER) {
    res.status(500).json({ message: 'Missing TOKEN_ISSUER' });
    return;
  }

  const issuer = process.env.TOKEN_ISSUER;

  res.status(200).json({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/userinfo`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['HS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    claims_supported: ['sub', 'email', 'name', 'admin'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
  });
}
