/**
 * Initialize the OpenTelemetry tracer and exporter.
 *
 * Note: Must be directly imported and called in the main application file as the first line.
 * If you attempt to put the logic in functions or run within the NestJS `bootstrap` process,
 * only some of the auto-instrumentations will work.
 */

import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AlwaysOnSampler, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import process from 'process';
import { isLocalEnv } from 'src/common/utils';

function onShutdown(sdk: NodeSDK): void {
  sdk
    .shutdown()
    // eslint-disable-next-line no-console
    .then(() => console.log('SDK shut down successfully'))
    .catch(
      /* istanbul ignore next */
      // eslint-disable-next-line no-console
      err => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
}

const projectId = process.env.GCP_PROJECT_ID;
// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.
const provider = new NodeTracerProvider({
  sampler: new AlwaysOnSampler(),
});

if (!isLocalEnv() && !projectId) {
  // This should already be checked by the ConfigService validation, but we'll check again here
  throw new Error('GCP_PROJECT_ID must be set when running in Google Cloud');
}

// Initialize the exporter
// When your application is running on Google Cloud, you don't need to provide auth credentials or a project id.
// Google will automatically injest traces if no value is provided, but you cannot link them to logs.
// When a project ID is provided, the trace ID is formatted as `projects/${projectId}/traces/${traceId}`,
// which is required for associating logs.
const exporter = new TraceExporter({
  projectId,
});

// Configure the span processor to batch and send spans to the exporter
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

const sdk = new NodeSDK({
  // Optional - if omitted, the tracing SDK will be initialized from environment variables
  traceExporter: exporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
process.on('SIGTERM', () => onShutdown(sdk));
