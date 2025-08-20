import {
  improveQuestionText,
  improveOptionText,
  improveTextPhrasing,
  generateTextSuggestions,
} from "./TextPhrasing";

/**
 * Question-specific phrasing utilities for survey questions and options
 * Provides specialized functions for improving survey question content
 */

/**
 * Improve survey question text with question-specific optimizations
 * @param {string} questionText - Original question text
 * @param {string} [questionType] - Type of question (TEXT, RATING, MULTIPLE_CHOICE, etc.)
 * @param {Object} [options] - Additional options
 * @returns {Promise<string>} Improved question text
 */
export const improveQuestionPhrasing = async (
  questionText,
  questionType = "",
  options = {}
) => {
  if (!questionText || !questionText.trim()) {
    throw new Error("Question text is required");
  }

  // Add question type specific context
  let context =
    "This is a survey question that should be clear, neutral, and unbiased.";

  switch (questionType.toLowerCase()) {
    case "rating":
      context +=
        " This is a rating question that asks users to rate something on a scale.";
      break;
    case "multiple_choice":
      context += " This is a multiple choice question with predefined options.";
      break;
    case "text":
      context +=
        " This is a text input question that allows open-ended responses.";
      break;
    case "long_text":
      context += " This is a long text question for detailed responses.";
      break;
    default:
      context += " Make it engaging but neutral.";
  }

  return improveQuestionText(questionText, {
    context,
    ...options,
  });
};

/**
 * Improve multiple choice option text
 * @param {string} optionText - Original option text
 * @param {Object} [options] - Additional options
 * @returns {Promise<string>} Improved option text
 */
export const improveOptionPhrasing = async (optionText, options = {}) => {
  return improveOptionText(optionText, {
    context:
      "This is a multiple choice option that should be clear and distinct from other options.",
    ...options,
  });
};

/**
 * Generate option suggestions for multiple choice questions
 * @param {string} questionText - The question text these options are for
 * @param {number} [count=4] - Number of options to generate
 * @returns {Promise<string[]>} Array of option suggestions
 */
export const generateOptionSuggestions = async (questionText, count = 4) => {
  if (!questionText || !questionText.trim()) {
    throw new Error(
      "Question text is required for generating option suggestions"
    );
  }

  const prompt = `Generate ${count} appropriate multiple choice options for this question: "${questionText}"

Requirements:
- Options should be mutually exclusive and comprehensive
- Cover the most likely responses
- Be concise and clear
- Avoid overlapping meanings
- Return only the options, one per line, without numbering or formatting`;

  try {
    const suggestions = await improveTextPhrasing({
      text: prompt,
      type: "option",
      context: "Generate multiple choice options",
      maxLength: 500,
    });

    return suggestions
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, count);
  } catch (error) {
    console.error("Error generating option suggestions:", error);
    throw new Error("Failed to generate option suggestions. Please try again.");
  }
};
