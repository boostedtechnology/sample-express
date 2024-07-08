import { Handler, NextFunction, Request, Response } from 'express';

import { AppError } from '..';

export const validateZodSchema: Handler = async (req: Request, res: Response, next: NextFunction) => {
  const schema = req.routeConfig.schema;

  if (!schema) await next();

  if (schema?.body) {
    const result = schema.body.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, JSON.stringify(result.error.flatten().fieldErrors));
    }
    req.body = result.data;
  }

  if (schema?.params) {
    const result = schema.params.safeParse(req.params);
    if (!result.success) {
      throw new AppError(400, JSON.stringify(result.error.flatten().fieldErrors));
    }
    req.params = result.data;
  }

  if (schema?.query) {
    const result = schema.query.safeParse(req.query);
    if (!result.success) {
      throw new AppError(400, JSON.stringify(result.error.flatten().fieldErrors));
    }
    req.query = result.data;
  }

  await next();
};
