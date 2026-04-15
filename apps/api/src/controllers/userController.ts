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

export async function createUser(
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
    where: { email: email.toLowerCase() },
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
      email: email.toLowerCase(),
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

export async function getAllUsers(req: Request, res: Response) {
  // This is sat behind middleware which restricts to admin users, so we can just return everything
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      admin: true,
      createdAt: true,
      updatedAt: true,
      disabledAt: true,
      passwordHash: false,
    },
  });
  // Now return the users
  res.status(200).json(users);
}

export async function me(req: Request, res: Response): Promise<void> {
  // As this route is protected by the requireAuth middleware we can just return the user
  res.status(200).json(req.user);
}
