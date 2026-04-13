import type { Request, Response } from 'express';

export async function create(req: Request, res: Response): Promise<void> {
  res.status(201).json({
    message: 'User created successfully',
  });
}
