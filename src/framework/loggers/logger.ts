import 'zone.js';

import { Logging as GCPCloudLogging } from '@google-cloud/logging';

import { isLocalEnv } from '../../common/utils';
import { ILogDetails } from '../types';

const getGCPProjectId = (): string => Zone.current.get('gcpProjectId');
const getGCPTraceId = (): string => Zone.current.get('gcpTraceId');
const getRequestMethod = (): string => Zone.current.get('requestMethod');
const getRequestUrl = (): string => Zone.current.get('requestUrl');

let gcpLogClass: GCPCloudLogging | undefined;

function logToCloud(type: 'log' | 'warn' | 'error' | 'info', logDetails: ILogDetails): void {
  if (!gcpLogClass) gcpLogClass = new GCPCloudLogging({ projectId: getGCPProjectId() });

  const gcpLogger = gcpLogClass.logSync(logDetails.appName);

  const metaData = {
    severity: type.toUpperCase(),
    httpRequest: {
      requestMethod: getRequestMethod(),
      requestUrl: getRequestUrl(),
    },
    stack_trace: logDetails?.stackTrace,
    trace: `projects/${getGCPProjectId()}/traces/${getGCPTraceId()}`,
  };

  if (!logDetails.additionalInfo) logDetails.additionalInfo = {};

  const entry = gcpLogger.entry(metaData, {
    message: logDetails.message,
    serviceName: logDetails.serviceName,
    ...logDetails.additionalInfo,
  });

  gcpLogger.write(entry);
}

function internalLog(type: 'log' | 'warn' | 'error' | 'info', logDetails: ILogDetails): void {
  if (isLocalEnv()) {
    console[type](logDetails.message);
  } else {
    logToCloud(type, logDetails);
  }
}

export function log(logDetails: ILogDetails): void {
  internalLog('log', logDetails);
}

export function warn(logDetails: ILogDetails): void {
  internalLog('warn', logDetails);
}

export function error(logDetails: ILogDetails): void {
  internalLog('error', logDetails);
}

export function info(logDetails: ILogDetails): void {
  internalLog('info', logDetails);
}
