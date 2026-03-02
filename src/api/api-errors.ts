export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
  }
}
