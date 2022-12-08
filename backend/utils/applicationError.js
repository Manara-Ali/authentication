// Create an error class for our application
class ApplicationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// EXPORT THE ERROR CLASS TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = ApplicationError;
