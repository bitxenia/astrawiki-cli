export class BaseError<T extends string = string> extends Error {
  public readonly type: T;
  public readonly cause?: unknown;

  constructor(type: T, message: string, cause?: unknown) {
    super(message);
    this.name = type;
    this.type = type;
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseError);
    }
  }
}
