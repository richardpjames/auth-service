import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

// Define the shape of our authenticated users so they can be added to the request
type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
  disabledAt: Date | null;
};

// Allow the addition of the user and session id to the request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Get the session key from our auth server cookie
  const sessionKey = req.cookies.auth_sessionId;

  // If there is no key then the user is not authenticated (easy)
  if (!sessionKey) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // Pull the session and appropriate user from prisma
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

  // If the session does not exist then clear the cookie
  if (!session) {
    res.clearCookie('auth_sessionId', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    // Send an error back to the user
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // If the session has expired
  if (session.expiresAt.getTime() < Date.now()) {
    // Delete the session from the database (no longer needed)
    await prisma.authSession.delete({
      where: { id: session.id },
    });

    // Clear the users cookie
    res.clearCookie('auth_sessionId', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    // Send an error back to the user
    res.status(401).json({ message: 'Session expired' });
    return;
  }

  // If the session has been disabled, then similarly send an error
  if (session.user.disabledAt) {
    res.status(403).json({ message: 'This account has been disabled' });
    return;
  }

  // Set the user and sessionId on the request
  req.user = session.user;
  req.sessionId = session.id;

  // Move onto the next stage
  next();
}

// This will be called after requireAuth so we should have the user already
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // If there is no user then we are not authenticated
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  // Similarly if we have a user but they are not an admin
  if (!req.user.admin) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  // Otherwise we have a user who is an admin, so we can continue
  next();
}
