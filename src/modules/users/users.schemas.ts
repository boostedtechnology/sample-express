import 'zod-openapi/extend';

import { z } from 'zod';

import { IRouteValidationSchema } from '../../framework';

const arr = ['CA', 'NY', '... etc ...'] as const;

const stateSchema = z.enum(arr).openapi({ enum: Object.values(arr), example: 'CA' });

const addressSchema = z.object({
  street_address: z.string().openapi({ description: 'test', example: 'test' }),
  city: z.string(),
  state: stateSchema,
});

const createUserBody = z.object({
  first_name: z.string(),
  last_name: z.string(),
  shipping_address: addressSchema,
  billing_address: addressSchema,
});

export type ICreateUser = z.infer<typeof createUserBody>;

export const createUserSchema: IRouteValidationSchema = {
  body: createUserBody,
};

export const createUserResultSchema = z.object({
  result: z.boolean().openapi({ example: true }),
});

export type ICreateUserResultSchema = z.infer<typeof createUserResultSchema>;
