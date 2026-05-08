/**
 * Base custom error class for API-specific errors.
 * Allows attaching an HTTP status code.
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean; // Indicates if this is a known, expected error

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name; // Set error name to class name
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace for better debugging (Node.js specific)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for duplicate resource creation (e.g., cast member with same name).
 * Corresponds to HTTP 409 Conflict.
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'A resource with this name already exists.') {
    super(message, 409);
  }
}

/**
 * Error for forbidden actions due to limits or permissions.
 * Corresponds to HTTP 403 Forbidden.
 */
export class ForbiddenError extends ApiError {
  constructor(
    message: string = 'You are not authorized to perform this action or have exceeded your limits.'
  ) {
    super(message, 403);
  }
}

/**
 * Error for resource not found.
 * Corresponds to HTTP 404 Not Found.
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found.') {
    super(message, 404);
  }
}

/**
 * Error for bad client requests (e.g., missing fields, invalid data).
 * Corresponds to HTTP 400 Bad Request.
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request.') {
    super(message, 400);
  }
}

// Add other common API errors as needed (e.g., UnauthorizedError for 401)
