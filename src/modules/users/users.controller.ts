import { Request, Response } from 'express';

import * as Logger from '../../framework';
import * as userService from './users.service';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  Logger.info({
    appName: 'cloudrun-service',
    message: `Received object ${JSON.stringify(req.body)}`,
    serviceName: 'UsersController',
  });

  const response = await userService.createUser(req.body);

  res.status(201).json(response);
};
