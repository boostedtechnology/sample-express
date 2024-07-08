import * as appRequest from 'supertest';

import { server } from '../../server';

const request = appRequest.default(server);

const sampleBody = {
  first_name: 'hello',
  last_name: 'string',
  shipping_address: {
    street_address: 'string',
    city: 'string',
    state: 'CA',
  },
  billing_address: {
    street_address: 'string',
    city: 'string',
    state: 'CA',
  },
};

describe('Users Spec', () => {
  describe('POST /users', () => {
    it('should successfully call the endpoint', async () => {
      const response = await request.post(`/users`).set('x-api-key', 'test').send(sampleBody);
      expect(response.status).toEqual(200);
    });

    it('returns checks if schema middleware is working', async () => {
      const response = await request
        .post(`/users`)
        .set('x-api-key', 'test')
        .send({
          ...sampleBody,
          first_name: null,
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: '{"first_name":["Expected string, received null"]}',
        statusCode: 400,
      });
    });

    it('checks if middleware is working by not sending api key header', async () => {
      const response = await request.post(`/users`).send(sampleBody);

      expect(response.status).toEqual(401);
      expect(response.body).toEqual({
        error: 'Unauthorized access',
        statusCode: 401,
      });
    });

    it('checks if custom errors are working', async () => {
      const response = await request
        .post(`/users`)
        .set('x-api-key', 'test')
        .send({
          ...sampleBody,
          first_name: 'Adam',
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'Sending custom error',
        errorDetails: {
          errorCode: 'NAME_NOT_ALLOWED',
        },
        statusCode: 400,
      });
    });

    it('checks if generic error handling is working', async () => {
      const response = await request
        .post(`/users`)
        .set('x-api-key', 'test')
        .send({
          ...sampleBody,
          first_name: 'Joe',
        });

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        error: 'Internal Server Error',
        statusCode: 500,
      });
    });
  });
});
