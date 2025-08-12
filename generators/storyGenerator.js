const { callClaudeAPI, callClaudeAPIWithRetry } = require('../services/claude');
const { generateStoryPrompt } = require('./promptGenerator');
const { parseStoriesFromResponse } = require('./storyParser');
const { logTiming } = require('../utils/logging');


async function generateStories(lifeStage, subcategory, userResponses, requestId) {
  const metrics = { startTime: Date.now() };

  try {

    // Generate new stories
    // Step 1: Generate the initial prompt
    const initialPrompt = generateStoryPrompt(lifeStage, subcategory, userResponses);
    metrics.promptGenerated = Date.now();
    logTiming(requestId, 'prompt_generation', metrics.promptGenerated - metrics.startTime);
    
    // Step 2:  Claude API call for analysis and story generation
    console.log(`[${requestId}] Calling Claude API for analysis and stories...`);
    const storyResponse = await callClaudeAPIWithRetry(initialPrompt);
    metrics.firstApiCall = Date.now();
    logTiming(requestId, 'first_api_call', metrics.firstApiCall - metrics.promptGenerated);
    
    
    // Step 3: Parse stories from response
    const stories = parseStoriesFromResponse(storyResponse);
    metrics.parsing = Date.now();
    logTiming(requestId, 'parsing', metrics.parsing - metrics.firstApiCall);
    
    
    
    // Log total generation time
    logTiming(requestId, 'total_generation_time', Date.now() - metrics.startTime);
    
    return stories;
  } catch (error) {
    console.error(`[${requestId}] Story generation error:`, error);
    throw error;
  }
}

module.exports = { generateStories };
