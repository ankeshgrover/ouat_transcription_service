const {Logging} = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('autobiography-api-logs');

// Log request details
function logRequest(requestId, req) {
  console.log(`[${requestId}] Request received: ${req.method} ${req.originalUrl}`);
  
  try {
    const metadata = {
      severity: 'INFO',
      resource: {
        type: 'cloud_function',
        labels: {
          function_name: process.env.FUNCTION_NAME || 'generate-stories',
          region: process.env.FUNCTION_REGION || 'unknown'
        }
      }
    };
    
    const entry = log.entry(metadata, {
      requestId,
      timestamp: new Date().toISOString(),
      type: 'request',
      method: req.method,
      path: req.originalUrl,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestData: {
        lifeStage: req.body.lifeStage,
        subcategory: req.body.subcategory,
        responseCount: req.body.userResponses?.length || 0
      }
    });
    
    log.write(entry).catch(err => console.error('Error writing request log:', err));
  } catch (err) {
    console.error('Error logging request:', err);
  }
}

// Log errors
function logError(requestId, error) {
  console.error(`[${requestId}] Error:`, error);
  
  try {
    const metadata = {
      severity: 'ERROR',
      resource: {
        type: 'cloud_function',
        labels: {
          function_name: process.env.FUNCTION_NAME || 'generate-stories',
          region: process.env.FUNCTION_REGION || 'unknown'
        }
      }
    };
    
    const entry = log.entry(metadata, {
      requestId,
      timestamp: new Date().toISOString(),
      type: 'error',
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    
    log.write(entry).catch(err => console.error('Error writing error log:', err));
  } catch (err) {
    console.error('Error logging error:', err);
  }
}

// Log timing metrics
function logTiming(requestId, step, durationMs) {
  console.log(`[${requestId}] ${step}: ${durationMs}ms`);
  
  try {
    const metadata = {
      severity: 'INFO',
      resource: {
        type: 'cloud_function',
        labels: {
          function_name: process.env.FUNCTION_NAME || 'generate-stories',
          region: process.env.FUNCTION_REGION || 'unknown'
        }
      }
    };
    
    const entry = log.entry(metadata, {
      requestId,
      timestamp: new Date().toISOString(),
      type: 'timing',
      step,
      durationMs
    });
    
    log.write(entry).catch(err => console.error('Error writing timing log:', err));
  } catch (err) {
    console.error('Error logging timing:', err);
  }
}

module.exports = {
  logRequest,
  logError,
  logTiming
};
