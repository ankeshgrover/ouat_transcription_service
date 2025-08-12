const functions = require('@google-cloud/functions-framework');
const { generateStories } = require('./src/generators/storyGenerator');
const { logRequest, logError } = require('./src/utils/logging');
const { handleError } = require('./src/utils/errorHandler');
const { isRateLimited } = require('./src/utils/rateLimit');


// Register HTTP function
functions.http('generateStories', async (req, res) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return handleError(res, 'Method not allowed', 405);
  }

  try {
    logRequest(requestId, req);
    
    // Check rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (await isRateLimited(clientIp)) {
      return handleError(res, 'Too many requests. Please try again later.', 429);
    }
    
    // Extract request data
    const { lifeStage, subcategory, userResponses } = req.body;
    
    // Validate request
    if (!lifeStage) {
      return handleError(res, 'Missing required parameter: lifeStage', 400);
    }
    
    if (!subcategory) {
      return handleError(res, 'Missing required parameter: subcategory', 400);
    }
    
    if (!userResponses || !Array.isArray(userResponses) || userResponses.length < 1) {
      return handleError(res, 'Please provide at least 1 question/response pairs', 400);
    }
    
    // Validate each response has question and response fields
    for (const item of userResponses) {
      if (!item.question || !item.response) {
        return handleError(res, 'Each item in userResponses must contain both question and response fields', 400);
      }
    }
    
    // Generate stories 
    const stories = await generateStories(lifeStage, subcategory, userResponses, requestId);

    
    // Return success response
    res.status(200).json({
      success: true,
      requestId,
      data: {
        lifeStage,
        subcategory,
        stories,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logError(requestId, error);
    handleError(res, error.message, error.status || 500);
  }
});
