import 'zone.js';

import { Handler, NextFunction, Request, Response } from 'express';

import { traceAgent } from '..';

/**
 * ZoneJS creates a "zone" for each request
 * The logger then gets the data from each "zone" & uses it for proper logging
 */
export const zoneJSMiddleware: Handler = async (req: Request, res: Response, next: NextFunction) => {
  // For GCP logging we can add any of the request methods as well document here
  // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#httprequest

  return new Promise(async resolve => {
    const traceHeaderValue = req.header('X-Cloud-Trace-Context');
    const traceHeaderValueNoOptions = traceHeaderValue?.split(';')[0];

    const traceId = traceHeaderValueNoOptions?.split('/')[0];
    const spanId = traceHeaderValueNoOptions?.split('/')[1];

    const projectId = await traceAgent?.getProjectId();
    const requestMethod = req.method;
    const requestUrl = req.url;

    Zone.current
      .fork({
        name: 'api',
        properties: {
          gcpProjectId: projectId,
          gcpTraceId: traceId,
          gcpSpanId: spanId,
          requestMethod,
          requestUrl,
        },
      })
      .run(async () => {
        await next();
        resolve();
      });
  });
};
