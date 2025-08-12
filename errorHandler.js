/**
 * Custom error handling utilities for the autobiography API
 */

/**
 * Custom API error class
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code for client
   * @param {object} data - Additional error data
   */
  constructor(message, statusCode = 500, code = 'server_error', data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a formatted error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {object} data - Additional error data
 * @returns {Response} - Formatted error response
 */
function handleError(res, message, statusCode = 500, code = 'server_error', data = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Sanitize error message in production
  const clientMessage = isProd && statusCode >= 500 
    ? 'An unexpected error occurred. Please try again later.' 
    : message;
  
  return res.status(statusCode).json({
    success: false,
    error: {
      message: clientMessage,
      code: code,
      ...(data && Object.keys(data).length > 0 ? { details: data } : {})
    }
  });
}

/**
 * Create a Bad Request error (400)
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {object} data - Additional error data
 * @returns {ApiError} - Bad Request error
 */
function createBadRequestError(message, code = 'bad_request', data = {}) {
  return new ApiError(message, 400, code, data);
}

/**
 * Create an Unauthorized error (401)
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {object} data - Additional error data
 * @returns {ApiError} - Unauthorized error
 */
function createUnauthorizedError(message, code = 'unauthorized', data = {}) {
  return new ApiError(message, 401, code, data);
}

/**
 * Create a Not Found error (404)
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {object} data - Additional error data
 * @returns {ApiError} - Not Found error
 */
function createNotFoundError(message, code = 'not_found', data = {}) {
  return new ApiError(message, 404, code, data);
}

/**
 * Create a Rate Limit error (429)
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {object} data - Additional error data
 * @returns {ApiError} - Rate Limit error
 */
function createRateLimitError(message, code = 'rate_limit_exceeded', data = {}) {
  return new ApiError(message, 429, code, data);
}

/**
 * Create a Server error (500)
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {object} data - Additional error data
 * @returns {ApiError} - Server error
 */
function createServerError(message, code = 'server_error', data = {}) {
  return new ApiError(message, 500, code, data);
}

module.exports = {
  ApiError,
  handleError,
  createBadRequestError,
  createUnauthorizedError,
  createNotFoundError,
  createRateLimitError,
  createServerError
};