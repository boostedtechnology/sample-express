import 'zod-openapi/extend';

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { createDocument, ZodOpenApiObject, ZodOpenApiOperationObject, ZodOpenApiPathsObject } from 'zod-openapi';

import { IRoute, IRouteMethod } from './types';

const badRequestSchema = z.object({
  statusCode: z.number().describe('The http status of the error code in response').openapi({ example: 400 }),
  error: z.string().describe('A string with a description of the error').openapi({ example: 'Property is missing' }),
});

// OpenAPI document
const openAPIDoc: ZodOpenApiObject = {
  openapi: '3.1.0',
  info: {
    title: 'Sample Express App',
    description: 'An express app that includes all additional tools',
    version: '0.0.1',
    contact: {},
  },
  tags: [],
  servers: [
    {
      url: process.env.BASE_URL as string,
    },
  ],
  components: {
    securitySchemes: {
      'Api-Key': {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
      Authorization: {
        type: 'apiKey',
        in: 'header',
        name: 'authorization',
      },
    },
  },
};

type RouteMethodMap = {
  [method in IRouteMethod]?: IRoute;
};

interface IRouteGroupedByPath {
  [key: string]: RouteMethodMap;
}

export const writeSwaggerDoc = (routes: IRoute[]): void => {
  const routesGrouped: IRouteGroupedByPath = {};
  routes.forEach(route => {
    if (!routesGrouped[route.endpoint]) routesGrouped[route.endpoint] = {};
    routesGrouped[route.endpoint][route.method] = route;
  });

  const paths: ZodOpenApiPathsObject = {};

  Object.entries(routesGrouped).forEach(([path, methods]) => {
    paths[path] = {};

    Object.entries(methods).forEach(([methodName, routeInfo]) => {
      const methodInPath = methodName as IRouteMethod;
      const operation: ZodOpenApiOperationObject = {
        responses: {
          400: {
            description: 'Default bad request exception',
            content: {
              'application/json': { schema: badRequestSchema },
            },
          },
        },
      };

      if (routeInfo.schema?.body) {
        operation.requestBody = { content: { 'application/json': { schema: routeInfo.schema.body } } };
      }

      if (routeInfo.schema?.params || routeInfo.schema?.query) {
        operation.requestParams = {};
        if (routeInfo.schema?.params) operation.requestParams.path = routeInfo.schema?.params;
        if (routeInfo.schema?.query) operation.requestParams.query = routeInfo.schema?.query;
      }

      if (routeInfo.swagger?.responses) {
        operation.responses = {
          ...operation.responses,
          ...routeInfo.swagger.responses,
        };
      }

      if (routeInfo.swagger?.security) {
        operation.security = routeInfo.swagger.security.map(security => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const securityObj: any = {};
          securityObj[security] = [];
          return securityObj;
        });
      }

      if (routeInfo.swagger?.tags) {
        operation.tags = routeInfo.swagger.tags;
      }

      paths[path][methodInPath] = operation;
    });
  });

  openAPIDoc.paths = paths;
  const swaggerDoc = createDocument(openAPIDoc);
  fs.writeFileSync(path.join(__dirname, '..', 'swagger-output.json'), JSON.stringify(swaggerDoc), 'utf-8');
};
