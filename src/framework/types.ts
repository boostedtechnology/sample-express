type JSON = { [key: string]: JSON } | string | number | boolean | bigint | null | undefined | Array<JSON>;

export type OBJECT = {
  [key: string]: JSON;
};

export interface ILogDetails {
  message: string;
  appName: string;
  serviceName: string;
  stackTrace?: string;
  additionalInfo?: OBJECT;
}

import { Handler, RequestHandler } from 'express';
import { AnyZodObject } from 'zod';

export interface IRouteValidationSchema {
  params?: AnyZodObject;
  body?: AnyZodObject;
  query?: AnyZodObject;
}

export enum SUPPORTED_SECURITIES {
  'Api-Key' = 'Api-Key',
  'Authorization' = 'Authorization',
}

export interface ISwaggerParam {
  name: string;
  pathOrQuery: 'path' | 'query';
  required: boolean;
}

export enum IRouteMethod {
  get = 'get',
  put = 'put',
  delete = 'delete',
  post = 'post',
  patch = 'patch',
}

export interface IRouteSwaggerResponse {
  description?: string;
  content: {
    'application/json': {
      schema: AnyZodObject;
    };
  };
}

export interface IRoute {
  method: IRouteMethod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  controller: RequestHandler<{}, any, any, any, Record<string, any>>;
  endpoint: string;
  schema?: IRouteValidationSchema;
  middlewares?: [Handler];
  swagger?: {
    summary?: string;
    parameters?: ISwaggerParam[];
    responses?: {
      200?: IRouteSwaggerResponse;
      201?: IRouteSwaggerResponse;
    };
    security?: SUPPORTED_SECURITIES[];
    tags?: string[];
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      routeConfig: IRoute;
    }
  }
}
