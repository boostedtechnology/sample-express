/*
  Tracer is used to trace requests between multiple GCP services
  Tracer can also get the project Id automatically as reflected in the ZoneJS middleware
*/

import { Config, PluginTypes, start } from '@google-cloud/trace-agent';

import { isLocalEnv } from '../../common/utils';

let traceAgent: PluginTypes.Tracer | null = null;

const startTracing = (config?: Config): void => {
  if (!isLocalEnv()) traceAgent = start(config);
};

export { startTracing, traceAgent, Config as TraceAgentConfig };
