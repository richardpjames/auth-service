import type { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import argon2 from 'argon2';
import crypto from 'node:crypto';

export async function login(req: Request, res: Response): Promise<void> {
  // This function is simpler than some of the others, so using a z schema is overkill
  // Pull the data from the body and we'll validate it as we go
  const { email, password, client_id, redirect_uri, state } = req.body;
  // See if we have the user in our database
  const user = await prisma.user.findUnique({ where: { email } });
  // If not then give a generic error message
  if (!user) {
    res.status(401).send({ message: 'Incorrect Username or Password.' });
    return;
  }
  // If we have a user then check the password
  const passwordOk = await argon2.verify(user.passwordHash, password);
  // If that's not okay then give the same error message
  if (!passwordOk) {
    res.status(401).send({ message: 'Incorrect Username or Password.' });
    return;
  }
  // If the username and password are okay then we can create a session
  const authSession = await prisma.authSession.create({
    data: {
      sessionKey: crypto.randomBytes(24).toString('hex'),
      userId: user.id,
      // Create a date 7 days in the future
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  // Now add that to a cookie
  res.cookie('auth_sessionId', authSession.sessionKey, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // Set this to secure if we are in the production environment
    secure: process.env.NODE_ENV === 'production',
  });
  // If we have come here from another application then we need to generate a code
  if (client_id && redirect_uri) {
    // Get the client from the database
    const client = await prisma.clientApp.findUnique({
      where: { clientId: client_id },
    });
    // Check the redirect uri (and whether we have a client)
    if (!client || client.redirectUri !== redirect_uri) {
      res.status(400).send('Invalid Client.');
      return;
    }
    // If that is all correct then generate a code
    const code = await prisma.authCode.create({
      data: {
        code: crypto.randomBytes(24).toString('hex'),
        userId: user.id,
        clientAppId: client.id,
        // Create a date 5 minutes in the future
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    // Redirect the user back to the requesting application
    const url = new URL(redirect_uri);
    // Set the newly generated code
    url.searchParams.set('code', code.code);
    // Add the state if there is one
    state && url.searchParams.set('state', state);
    // Then redirect
    res.redirect(url.toString());
    return;
  }

  // Return a success message
  res.status(200).send({ message: 'Logged In.' });
}

export async function authorize(req: Request, res: Response) {
  // Get all of the parameters we need from the query string as strings
  const { client_id, redirect_uri, state, response_type, scope } =
    req.query as {
      client_id?: string;
      redirect_uri?: string;
      state?: string;
      response_type?: string;
      scope?: string;
    };

  // We only support the code response type in this application
  if (response_type !== 'code') {
    return res.status(400).send('Only response_type=code is supported');
  }
  // Check that a scope has been provided which includes openid
  if (!scope || !String(scope).split(' ').includes('openid')) {
    return res.status(400).send('Missing openid scope');
  }

  // Get the client from the database
  const client = await prisma.clientApp.findUnique({
    where: { clientId: client_id },
  });

  // And check that it exists with a matching return uri
  if (!client || client.redirectUri !== redirect_uri) {
    return res.status(400).send('Invalid client');
  }

  var session = null;
  // Get the session key from the users cookie and look it up from the database
  const sessionKey = req.cookies.auth_sid;
  // No lookup if the key is not present
  if (sessionKey) {
    session = await prisma.authSession.findUnique({
      where: { sessionKey },
      include: { user: true },
    });
  }

  // If there is no session, or that session has expired then redirect to the login page
  if (!session || session.expiresAt.getTime() < Date.now()) {
    const loginUrl = new URL(`${process.env.REACT_URL}/login`);
    loginUrl.searchParams.set('client_id', client_id);
    loginUrl.searchParams.set('redirect_uri', redirect_uri);
    loginUrl.searchParams.set('response_type', 'code');
    loginUrl.searchParams.set('scope', scope);
    if (state) loginUrl.searchParams.set('state', state);
    return res.redirect(loginUrl.toString());
  }

  // Otherwise we create an auth code...
  const code = await prisma.authCode.create({
    data: {
      code: crypto.randomBytes(24).toString('hex'),
      userId: session.userId,
      clientAppId: client.id,
      // Create a date/time 5 minutes from now
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // and redirect to the application
  const redirect = new URL(redirect_uri);
  // with the code and stat if it exists
  redirect.searchParams.set('code', code.code);
  state && redirect.searchParams.set('state', state);

  // Perform the redirect
  res.redirect(redirect.toString());
}
