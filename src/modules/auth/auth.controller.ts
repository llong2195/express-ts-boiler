import { NextFunction, Request, Response } from 'express';

export const findAll = (req: Request, res: Response, next: NextFunction) => {
  return res.json({ status: 'ok' });
};
