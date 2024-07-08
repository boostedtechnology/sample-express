export interface IErrorDetails {
  errorCode?: string;
}

// A built in Error class that will automatically be checked for in error handler middleware
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorDetails?: IErrorDetails;

  constructor(statusCode: number, message: string, errorDetails?: IErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
  }
}
