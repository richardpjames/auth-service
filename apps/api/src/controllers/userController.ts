import argon2 from 'argon2';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

// Describe the valid format for a user on creation
const createUserSchema = z.object({
  email: z.email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Your password must be at least 8 characters long'),
  displayName: z
    .string()
    .trim()
    .min(1, 'Your display name is required')
    .max(100, 'Your display name must be 100 characters or fewer'),
});

// Create the type from the z schema above
type CreateUserBody = z.infer<typeof createUserSchema>;

export async function create(
  req: Request<{}, {}, CreateUserBody>,
  res: Response,
): Promise<void> {
  const parsedBody = createUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      message: 'Please check your inputs and try again',
      errors: z.flattenError(parsedBody.error).fieldErrors,
    });
    return;
  }

  // Pull the data we need from the parsed body
  const { email, password, displayName } = parsedBody.data;

  // Check whether there is an existing user in the database
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // If there is then return an error message to the user
  if (existingUser) {
    res.status(409).json({
      message: 'A user with that email already exists',
    });
    return;
  }

  // If not then we can insert the user, so we hash the password
  const passwordHash = await argon2.hash(password);

  // Creates the user in the databse and returns the users basic details
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
    },
    // Just return the id, email and confirmation of the created time
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  // Return a success message with a copy of the user object
  res.status(201).json({
    message: 'User created successfully',
    user,
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  // Get the session key from the users cookie
  const sessionKey = req.cookies.auth_sessionId;

  // If there is no key, then return and error to the user
  if (!sessionKey) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // Otherwise get the user from the session key
  const session = await prisma.authSession.findUnique({
    where: { sessionKey },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          admin: true,
          createdAt: true,
          updatedAt: true,
          disabledAt: true,
        },
      },
    },
  });

  // If there is no session found (key is in the cookie but not the DB) then return an error
  if (!session) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // If the session has expired then delete from the database and remove the users cookie
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.authSession.delete({
      where: { id: session.id },
    });

    //clear the cookie
    res.clearCookie('auth_sessionId', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    // Send the error message
    res.status(401).json({ message: 'Session expired' });
    return;
  }

  // Otherwise everything has worked, so we can return the user
  res.status(200).json({
    user: session.user,
  });
}
