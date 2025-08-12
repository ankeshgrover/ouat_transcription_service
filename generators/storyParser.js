/**
 * Utility functions for parsing stories from Claude API responses
 */

/**
 * Parse stories from Claude API response
 * @param {string} response - The formatted response from Claude
 * @returns {Array} - Array of story objects with title and content
 */
function parseStoriesFromResponse(response) {
  // Use a robust regex to find blocks starting with # followed by a title
  // and non-empty content until the next # or end of string.
  const storyRegex = /#\s*([^\n]+)\s*\n([\s\S]*?)(?=\n#\s*[^\n]+|\s*$)/g;
  const stories = [];
  let match;

  while ((match = storyRegex.exec(response)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();

    if (title && content) { // Ensure both title and content are non-empty
      stories.push({ title, content });
    }
  }
  // If no stories were found or parsed successfully, return an empty array
  // This handles cases where Claude might not follow the format or provides empty content
  if (stories.length === 0) {
    console.warn('Model response did not contain any valid stories or follow the expected format.');
  }
  
  return stories;
}

module.exports = {
  parseStoriesFromResponse,
};
