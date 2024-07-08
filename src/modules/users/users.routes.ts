import { IRoute, IRouteMethod, SUPPORTED_SECURITIES } from '../../framework';
import { apiKeyMiddleware } from '../../middlewares/api-key.middleware';
import * as UserController from './users.controller';
import { createUserResultSchema, createUserSchema } from './users.schemas';

export const userRoutes: IRoute[] = [
  {
    controller: UserController.createUser,
    method: IRouteMethod.post,
    endpoint: '/users',
    schema: createUserSchema,
    middlewares: [apiKeyMiddleware],
    swagger: {
      responses: {
        201: {
          description: 'User created response',
          content: {
            'application/json': { schema: createUserResultSchema },
          },
        },
      },
      security: [SUPPORTED_SECURITIES['Api-Key']],
      summary: 'Create new user',
      tags: ['Users'],
    },
  },
];
