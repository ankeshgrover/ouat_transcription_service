/**
 * Basic rate limiting implementation using in-memory storage
 * For production, consider using Redis or another distributed cache
 */

// In-memory store for rate limiting
const rateLimitStore = {};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimitStore) {
    const timestamps = rateLimitStore[ip].filter(timestamp => now - timestamp < 3600000); // 1 hour
    if (timestamps.length === 0) {
      delete rateLimitStore[ip];
    } else {
      rateLimitStore[ip] = timestamps;
    }
  }
}, 3600000); // 1 hour

/**
 * Checks if a client IP should be rate limited
 * @param {string} ip - The client IP address
 * @param {number} maxRequests - Maximum requests allowed per minute
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if the client should be rate limited
 */
function isRateLimited(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  
  // Initialize if this is the first request from this IP
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [now];
    return false;
  }
  
  // Filter requests within the time window
  const recentRequests = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);
  
  // Add current request timestamp
  rateLimitStore[ip] = [...recentRequests, now];
  
  // Check if rate limit is exceeded
  return rateLimitStore[ip].length > maxRequests;
}

/**
 * Resets rate limit for a specific IP
 * @param {string} ip - The client IP address to reset
 */
function resetRateLimit(ip) {
  if (rateLimitStore[ip]) {
    delete rateLimitStore[ip];
    return true;
  }
  return false;
}

/**
 * Gets current rate limit status for an IP
 * @param {string} ip - The client IP address
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - Rate limit status
 */
function getRateLimitStatus(ip, windowMs = 60000) {
  if (!rateLimitStore[ip]) {
    return {
      requestsInWindow: 0,
      remainingRequests: 10,
      isLimited: false
    };
  }
  
  const now = Date.now();
  const recentRequests = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);
  
  return {
    requestsInWindow: recentRequests.length,
    remainingRequests: Math.max(0, 10 - recentRequests.length),
    isLimited: recentRequests.length >= 10
  };
}

module.exports = {
  isRateLimited,
  resetRateLimit,
  getRateLimitStatus
};