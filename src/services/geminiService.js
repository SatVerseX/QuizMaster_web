import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from "zod";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Helper to extract JSON from a potential Markdown response
 */
const cleanAndParseJSON = (text) => {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Find the first '{' and last '}' to isolate the JSON object
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1) {
      const cleaned = text.substring(firstOpen, lastClose + 1);
      try {
        return JSON.parse(cleaned);
      } catch (innerError) {
        // 3. Cleanup common invalid characters if extraction fails
        const strictClean = cleaned
          .replace(/\\n/g, "\\n")  
          .replace(/\\'/g, "\\'")
          .replace(/\\"/g, '\\"')
          .replace(/\\&/g, "\\&")
          .replace(/\\r/g, "\\r")
          .replace(/\\t/g, "\\t")
          .replace(/\\b/g, "\\b")
          .replace(/\\f/g, "\\f");
        // Remove non-printable characters
        const finalClean = strictClean.replace(/[\u0000-\u0019]+/g,"");
        return JSON.parse(finalClean);
      }
    }
    throw new Error("Failed to extract valid JSON from response");
  }
};

// JSON Schema for Quiz Questions
const quizSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          correctAnswer: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" }
        },
        required: ["question", "options", "correctAnswer"]
      }
    }
  },
  required: ["title", "questions"]
};

// Validation Schema for Explanation Input
const explanationInputSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  userAnswer: z.string().optional().nullable(),
});

/**
 * Generates an educational explanation for a specific question.
 * Used in the AI Explanation Modal.
 */
export const explainQuestion = async (params) => {
  try {
    // 1. Validate Input
    const validatedData = explanationInputSchema.parse(params);

    // 2. Use Flash model for faster response time in UI modals
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      Act as an expert tutor. Provide a clear, concise explanation for this quiz question.
      
      Question: "${validatedData.question}"
      Options: ${validatedData.options.join(", ")}
      Correct Answer: "${validatedData.correctAnswer}"
      User Selected: "${validatedData.userAnswer || "None"}"

      Structure the response as follows:
      1. **Answer Confirmation**: Briefly state the correct answer.
      2. **Concept Explanation**: Explain the underlying concept simply.
      3. **Analysis**: If the user selected a wrong answer, explain why that specific option is incorrect.
      
      Keep the tone encouraging. Do not use complex markdown headers like # or ##, use bolding **text** instead.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    throw new Error("Unable to generate explanation at this time.");
  }
};

export const generateQuizWithAI = async (topic, numberOfQuestions = 5, difficulty = 'medium') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });

    const prompt = `Create a comprehensive quiz about "${topic}" with exactly ${numberOfQuestions} questions. 
    Difficulty level: ${difficulty}.
    Requirements:
    - Each question should have exactly 4 multiple choice options
    - Include varied question types
    - Provide clear explanations
    - Return strictly valid JSON`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quizData = cleanAndParseJSON(response.text());
    
    return { success: true, data: quizData };
  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generates a remediation quiz based on specific user mistakes.
 * Focuses on the concepts underlying the incorrect answers.
 */
export const generateRemediationQuiz = async (mistakes, originalTitle) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });

    // Prepare context (limit to 10 to preserve context window tokens and focus)
    const context = mistakes.slice(0, 10).map(m => ({
      question: m.question,
      correctAnswer: m.options ? m.options[m.correctAnswer] : "N/A",
      explanation: m.explanation || "No explanation provided"
    }));

    const prompt = `
      The user took a test titled "${originalTitle}" and failed the following questions.
      
      Failed Questions Context:
      ${JSON.stringify(context)}

      Task:
      Generate a personalized "Smart Remediation Quiz" with 5-7 questions.
      1. Analyze the *underlying concepts* missed in the failed questions.
      2. Create NEW questions testing these specific concepts.
      3. Do NOT simply repeat the old questions. Create variations or conceptual checks.
      4. If the mistakes indicate a fundamental misunderstanding, include a simpler conceptual question first.
      5. Title the quiz "Remediation: [Main Concept Identified]".
      
      Output must be valid JSON matching the schema.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quizData = cleanAndParseJSON(response.text());

    return { success: true, data: quizData };

  } catch (error) {
    console.error("Remediation generation failed:", error);
    return { success: false, error: error.message };
  }
};

// JSON Schema for Test Series Recommendations
const recommendationSchema = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          reason: { type: "string" },
          difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
          estimatedTime: { type: "string" },
          questions: { type: "number" },
          category: { type: "string" },
          examType: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          confidence: { type: "number", minimum: 0, maximum: 100 }
        },
        required: ["id", "title", "reason", "difficulty", "estimatedTime", "questions", "category"]
      }
    }
  },
  required: ["recommendations"]
};

export const generateTestSeriesRecommendations = async (userProfile) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema
      }
    });

    const prompt = `Based on the user's learning profile, generate 3-5 personalized test series recommendations.
    User Profile: ${JSON.stringify(userProfile)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendationData = cleanAndParseJSON(response.text());
    
    return { success: true, data: recommendationData.recommendations };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    if (error.message.includes('429') || error.message.includes('quota')) {
      return { success: true, data: getFallbackRecommendations(userProfile) };
    }
    return { success: false, error: error.message, data: [] };
  }
};

// Schema for Flashcards to ensure structural integrity
const flashcardSchema = {
  type: "object",
  properties: {
    front: { type: "string" },
    back: { type: "string" }
  },
  required: ["front", "back"]
};

export const generateFlashcardContent = async (questionData) => {
  try {
    // 1. Enforce JSON schema in configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: flashcardSchema
      }
    });

    const prompt = `
      Convert the following Multiple Choice Question into a concise Flashcard (Front/Back) format.
      Question: "${questionData.question}"
      Correct Answer: "${questionData.options[questionData.correctAnswer]}"
      Explanation: "${questionData.explanation}"
      
      Rules:
      1. Front: Short question/concept (< 20 words).
      2. Back: Core answer/explanation (< 40 words).
      3. NO Markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 2. Use robust parser
    return cleanAndParseJSON(response.text());

  } catch (error) {
    console.error("Flashcard generation error:", error);
    // Fallback if AI fails
    return {
      front: questionData.question.substring(0, 100) + (questionData.question.length > 100 ? "..." : ""),
      back: questionData.options[questionData.correctAnswer]
    };
  }
};

export const analyzeUserPerformance = async (userAttempts) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze the following user test attempt data.
    User Attempts Data: ${JSON.stringify(userAttempts, null, 2)}
    Return structured JSON with performanceTrends, strengths, weakAreas, timeManagement, and recommendations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = cleanAndParseJSON(response.text());
    
    return { success: true, data: analysis };
  } catch (error) {
    console.error('Error analyzing user performance:', error);
    return { success: false, error: error.message, data: null };
  }
};

export const validateQuizJSON = (jsonData) => {
  try {
    if (!jsonData.title || !jsonData.questions || !Array.isArray(jsonData.questions)) {
      return { valid: false, error: 'Invalid JSON structure. Must have title and questions array.' };
    }
    if (jsonData.questions.length === 0) {
      return { valid: false, error: 'Quiz must have at least one question.' };
    }

    for (let i = 0; i < jsonData.questions.length; i++) {
      const question = jsonData.questions[i];
      
      if (!question.question || typeof question.question !== 'string') {
        return { valid: false, error: `Question ${i + 1}: Missing or invalid question text.` };
      }
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        return { valid: false, error: `Question ${i + 1}: Must have exactly 4 options.` };
      }
      if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
        return { valid: false, error: `Question ${i + 1}: correctAnswer must be 0, 1, 2, or 3.` };
      }
      if (question.options.some(option => !option || typeof option !== 'string')) {
        return { valid: false, error: `Question ${i + 1}: All options must be non-empty strings.` };
      }
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format.' };
  }
};

const getFallbackRecommendations = (userProfile) => {
  const baseRecommendations = [
    {
      id: 'fallback-1',
      title: 'Complete Test Series Package',
      description: 'Comprehensive preparation with practice tests and mock exams',
      category: 'Test Series',
      difficulty: 'Intermediate',
      estimatedDuration: '30 days',
      price: 2999,
      questions: 50,
      discount: 20,
      reason: 'Based on your recent activity and performance trends',
      tags: ['Practice Tests', 'Mock Exams', 'Comprehensive']
    },
    {
      id: 'fallback-2',
      title: 'Advanced Problem Solving',
      description: 'Focus on complex problems and advanced concepts',
      category: 'Advanced',
      difficulty: 'Advanced',
      estimatedDuration: '45 days',
      price: 3999,
      questions: 40,
      discount: 15,
      reason: 'Recommended for improving your problem-solving skills',
      tags: ['Advanced', 'Problem Solving', 'Conceptual']
    }
  ];

  if (userProfile?.preferredCategories?.length > 0) {
    const category = userProfile.preferredCategories[0];
    baseRecommendations[0].category = category;
    baseRecommendations[0].title = `${category} Complete Package`;
  }

  return baseRecommendations;
};