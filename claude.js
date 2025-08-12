const axios = require('axios');

// Claude API service
async function callClaudeAPI(prompt, maxTokens = 4000) {
  try {
    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-7-sonnet-20250219",
        max_tokens: maxTokens,
        temperature: 0.3, //  low temperature to reduce fabrication
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    if (error.response) {
      throw new Error(`Claude API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response received from Claude API');
    } else {
      throw new Error(`Error setting up Claude API request: ${error.message}`);
    }
  }
}

// Claude API with retry logic
async function callClaudeAPIWithRetry(prompt, maxTokens = 4000, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Exponential backoff for retries
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await callClaudeAPI(prompt, maxTokens);
    } catch (error) {
      console.error(`Claude API call attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Don't retry for client errors (4xx)
      if (error.message.includes('Claude API error: 4')) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Failed after multiple retry attempts');
}

module.exports = {
  callClaudeAPI,
  callClaudeAPIWithRetry
};