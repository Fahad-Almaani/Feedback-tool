import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Service to interact with the Gemini API for text generation using the official SDK.
 */

/**
 * Generate AI content with customizable options
 * @param {Object} options - Configuration options for AI generation
 * @param {string} options.prompt - The user prompt/input
 * @param {string} [options.systemPrompt] - System prompt to set context/behavior
 * @param {string} [options.model] - Model to use (default: gemini-2.5-flash-preview-05-20)
 * @param {number} [options.temperature] - Creativity level (0-1, default: 0.7)
 * @param {number} [options.maxTokens] - Maximum response length
 * @param {Object} [options.generationConfig] - Additional generation configuration
 * @returns {Promise<string>} Generated text response
 */
export const generateFromAI = async ({
  prompt,
  systemPrompt = null,
  model = "gemini-2.5-flash-preview-05-20",
  temperature = 0.7,
  maxTokens = null,
  generationConfig = {},
}) => {
  console.log("🤖 AI Service - Starting generation with:", {
    prompt: prompt?.substring(0, 100) + (prompt?.length > 100 ? "..." : ""),
    systemPrompt: systemPrompt?.substring(0, 100) + (systemPrompt?.length > 100 ? "..." : ""),
    model,
    temperature,
    maxTokens
  });

  // Get the API key from environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY is not set in environment variables");
    return "API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.";
  }

  console.log("✅ API key found, creating GoogleGenerativeAI instance...");

  // Create a new GoogleGenerativeAI instance.
  const genAI = new GoogleGenerativeAI(apiKey);

  // Prepare generation configuration
  const config = {
    temperature,
    ...generationConfig,
  };

  if (maxTokens) {
    config.maxOutputTokens = maxTokens;
  }

  console.log("🔧 Generation config:", config);

  // Get the generative model to use.
  const generativeModel = genAI.getGenerativeModel({
    model,
    generationConfig: config,
    systemInstruction: systemPrompt || undefined,
  });

  console.log("📡 Making API call to Gemini...");

  try {
    // Call the generateContent method to get a response.
    const result = await generativeModel.generateContent(prompt);

    console.log("📥 Raw API response received:", result);

    // Extract the text from the response.
    const response = await result.response;
    console.log("📝 Response object:", response);
    
    const text = response.text();
    console.log("✅ Final text extracted:", {
      text: text?.substring(0, 200) + (text?.length > 200 ? "..." : ""),
      length: text?.length
    });

    return text;
  } catch (error) {
    console.error("❌ Error calling the Gemini API:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Return an error message to the calling component.
    return "An error occurred while generating content.";
  }
};

/**
 * Convenience function for simple text generation (backward compatibility)
 * @param {string} prompt - The prompt to generate content for
 * @returns {Promise<string>} Generated text response
 */
export const generateSimpleAI = async (prompt) => {
  return generateFromAI({ prompt });
};

/**
 * Generate AI content for survey-related tasks
 * @param {string} prompt - The user prompt
 * @param {string} [context] - Additional context about the survey
 * @returns {Promise<string>} Generated text response
 */
export const generateSurveyContent = async (prompt, context = "") => {
  const systemPrompt = `You are an AI assistant specialized in creating and improving survey content. 
You help users create clear, unbiased, and effective survey questions and descriptions.
Focus on clarity, neutrality, and user engagement.
${context ? `Additional context: ${context}` : ""}`;

  return generateFromAI({
    prompt,
    systemPrompt,
    temperature: 0.6,
  });
};

/**
 * Generate AI content for feedback analysis
 * @param {string} prompt - The user prompt
 * @param {string} [feedbackType] - Type of feedback being analyzed
 * @returns {Promise<string>} Generated text response
 */
export const generateFeedbackAnalysis = async (prompt, feedbackType = "") => {
  const systemPrompt = `You are an AI assistant specialized in analyzing feedback and survey responses.
You help users understand patterns, sentiments, and insights from collected feedback.
Provide objective, data-driven analysis with actionable recommendations.
${feedbackType ? `Feedback type: ${feedbackType}` : ""}`;

  return generateFromAI({
    prompt,
    systemPrompt,
    temperature: 0.3,
  });
};
