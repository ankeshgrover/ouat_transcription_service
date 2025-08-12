/**
 * Prompt generation utilities for the autobiography API
 */

/**
 * Generates a prompt for Claude to analyze user responses and create stories
 * @param {string} lifeStage - Life stage (childhood, adolescence, adulthood, etc.)
 * @param {string} subcategory - Subcategory within life stage
 * @param {Array} userResponses - Array of question/response objects
 * @returns {string} - Formatted prompt for Claude
 */
function generateStoryPrompt(lifeStage, subcategory, userResponses) {
  // Format user responses
  const formattedResponses = userResponses
    .map(item => `Question: "${item.question}"\nResponse: "${item.response}"`)
    .join("\n\n");

  return `
# Autobiography Story Generation with Detailed Analysis

## Context Information
Life Stage: ${lifeStage}
Subcategory: ${subcategory}

## User's Original Responses
${formattedResponses}

## Instructions

## Instructions

You are an expert autobiographical ghostwriter who specializes in creating stories from user responses.
Follow this process precisely:

### STEP 1: ANALYSIS
First, perform a thorough analysis of the user's responses (do NOT include this analysis in the final output):
1.  List the key people, places, events, emotions, and specific details explicitly mentioned.
2.  Note patterns in the user's writing style, tone, and vocabulary to capture their authentic voice.
3.  Identify potential themes or narrative threads from the responses.

### STEP 2: STORY PLANNING
Based on your analysis, outline a plan for 2-3 distinct stories (do NOT include this plan in the final output):
1.  What will be the central focus of each story?
2.  How will you structure the narrative for each story while remaining faithful to the user's experiences?
3.  How will you ensure a logical flow (chronological or thematic) is maintained across the stories?
4.  How will you ensure that details are not repeated across stories while each story remains meaningful?

### STEP 3: STORY GENERATION AND FINAL FORMATTING
Now, generate 2-3 distinct stories that are:
1.  Focused on different themes or aspects of the user's experiences.
2.  **Strictly Faithful to the facts provided in "User's Original Responses" (no fabrication).**
3.  Written in the user's authentic first-person perspective.
4.  **Approximately 200-400 words in length for each story.**
5.  Follow a natural content flow and meaningful section transitions.
6.  **IMPORTANT: Ensure EVERY detail in each story comes directly from the "User's Original Responses." If you're unsure about any detail, EXCLUDE IT rather than risk fabrication.**

**Each story MUST be formatted EXACTLY like this:**

\`\`\`
 # [Story Title]

[Story content...]
\`\`\`

**Example:**
\`\`\`
# My First Adventure
I remember vividly the day I first explored the old woods behind my house. It was a summer afternoon...
\`\`\`

**Ensure you output ONLY the stories in the specified format.** Do not include any analysis, planning details, or other conversational text before or after the stories. Only the story content formatted as described.
`;

}

module.exports = {
  generateStoryPrompt,
};