import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// JSON Schema for Quiz Questions
const quizSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Quiz title"
    },
    description: {
      type: "string",
      description: "Quiz description"
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The quiz question"
          },
          options: {
            type: "array",
            items: {
              type: "string"
            },
            minItems: 4,
            maxItems: 4,
            description: "Four multiple choice options"
          },
          correctAnswer: {
            type: "integer",
            minimum: 0,
            maximum: 3,
            description: "Index of correct answer (0-3)"
          },
          explanation: {
            type: "string",
            description: "Explanation for the correct answer"
          }
        },
        required: ["question", "options", "correctAnswer"]
      }
    }
  },
  required: ["title", "questions"]
};

export const generateQuizWithAI = async (topic, numberOfQuestions = 5, difficulty = 'medium') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });

    const prompt = `Create a comprehensive quiz about "${topic}" with exactly ${numberOfQuestions} questions. 
    Difficulty level: ${difficulty}.
    
    Requirements:
    - Each question should have exactly 4 multiple choice options
    - Include varied question types (factual, conceptual, analytical)
    - Provide clear explanations for correct answers
    - Make questions challenging but fair
    - Ensure options are plausible and well-distributed
    
    Topic: ${topic}
    Number of questions: ${numberOfQuestions}
    Difficulty: ${difficulty}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quizData = JSON.parse(response.text());
    
    return {
      success: true,
      data: quizData
    };
  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    return {
      success: false,
      error: error.message
    };
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

    const prompt = `You are an AI tutor specializing in competitive exam preparation. Based on the user's learning profile, generate personalized test series recommendations.

User Profile:
- Recent Attempts: ${JSON.stringify(userProfile.recentAttempts || [])}
- Subscribed Series: ${JSON.stringify(userProfile.subscribedSeries || [])}
- Performance History: ${JSON.stringify(userProfile.performanceHistory || [])}
- Weak Areas: ${JSON.stringify(userProfile.weakAreas || [])}
- Strong Areas: ${JSON.stringify(userProfile.strongAreas || [])}
- Exam Goals: ${JSON.stringify(userProfile.examGoals || [])}
- Study Time Available: ${userProfile.studyTimeAvailable || 'Not specified'}

Generate 3-5 personalized test series recommendations that:
1. Address the user's weak areas and build on their strengths
2. Match their exam goals and preparation timeline
3. Are appropriate for their current skill level
4. Provide clear reasoning for each recommendation
5. Include realistic time estimates and difficulty levels
6. Consider their recent activity patterns

Focus on:
- Competitive exams (UPSC, SSC, Banking, JEE, NEET, etc.)
- Skill-based improvements
- Progressive difficulty levels
- Time management and efficiency
- Comprehensive coverage of exam patterns

Return recommendations in the specified JSON format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendationData = JSON.parse(response.text());
    
    return {
      success: true,
      data: recommendationData.recommendations
    };
  } catch (error) {
    console.error('Error generating recommendations with AI:', error);
    
    // Check if it's a quota exceeded error
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.warn('Gemini API quota exceeded, using fallback recommendations');
      return {
        success: true,
        data: getFallbackRecommendations(userProfile)
      };
    }
    
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

export const analyzeUserPerformance = async (userAttempts) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `Analyze the following user test attempt data and provide insights about their performance patterns, strengths, and areas for improvement.

User Attempts Data:
${JSON.stringify(userAttempts, null, 2)}

Please analyze:
1. Performance trends over time
2. Strong subject areas (where they consistently score well)
3. Weak subject areas (where they struggle)
4. Time management patterns
5. Difficulty level preferences
6. Exam category performance
7. Improvement suggestions
8. Recommended focus areas

Return a structured analysis in JSON format with the following structure:
{
  "performanceTrends": {
    "overall": "improving/stable/declining",
    "recentScores": [array of recent scores],
    "averageScore": number,
    "consistency": "high/medium/low"
  },
  "strengths": [
    {
      "subject": "string",
      "averageScore": number,
      "confidence": "high/medium/low"
    }
  ],
  "weakAreas": [
    {
      "subject": "string",
      "averageScore": number,
      "priority": "high/medium/low",
      "suggestions": ["string"]
    }
  ],
  "timeManagement": {
    "averageTimePerQuestion": number,
    "completionRate": number,
    "efficiency": "high/medium/low"
  },
  "recommendations": {
    "focusAreas": ["string"],
    "difficultyLevel": "easy/medium/hard",
    "studyStrategy": "string"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());
    
    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error analyzing user performance:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

export const validateQuizJSON = (jsonData) => {
  try {
    // Basic validation
    if (!jsonData.title || !jsonData.questions || !Array.isArray(jsonData.questions)) {
      return { valid: false, error: 'Invalid JSON structure. Must have title and questions array.' };
    }

    if (jsonData.questions.length === 0) {
      return { valid: false, error: 'Quiz must have at least one question.' };
    }

    // Validate each question
    for (let i = 0; i < jsonData.questions.length; i++) {
      const question = jsonData.questions[i];
      
      if (!question.question || typeof question.question !== 'string') {
        return { valid: false, error: `Question ${i + 1}: Missing or invalid question text.` };
      }

      if (!Array.isArray(question.options) || question.options.length !== 4) {
        return { valid: false, error: `Question ${i + 1}: Must have exactly 4 options.` };
      }

      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer > 3) {
        return { valid: false, error: `Question ${i + 1}: correctAnswer must be 0, 1, 2, or 3.` };
      }

      // Check for empty options
      if (question.options.some(option => !option || typeof option !== 'string')) {
        return { valid: false, error: `Question ${i + 1}: All options must be non-empty strings.` };
      }

      // Validate image field (optional)
      if (question.image !== undefined && question.image !== null && typeof question.image !== 'string') {
        return { valid: false, error: `Question ${i + 1}: Image field must be a string URL or null.` };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format.' };
  }
};

// Fallback recommendations when Gemini API quota is exceeded
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
      discount: 15,
      reason: 'Recommended for improving your problem-solving skills',
      tags: ['Advanced', 'Problem Solving', 'Conceptual']
    },
    {
      id: 'fallback-3',
      title: 'Quick Revision Series',
      description: 'Fast-paced revision covering all important topics',
      category: 'Revision',
      difficulty: 'Easy',
      estimatedDuration: '15 days',
      price: 1999,
      discount: 25,
      reason: 'Perfect for last-minute preparation and quick review',
      tags: ['Revision', 'Quick', 'Summary']
    }
  ];

  // Customize based on user profile if available
  if (userProfile && userProfile.preferredCategories && userProfile.preferredCategories.length > 0) {
    const category = userProfile.preferredCategories[0];
    baseRecommendations[0].category = category;
    baseRecommendations[0].title = `${category} Complete Package`;
  }

  if (userProfile && userProfile.averageScore) {
    if (userProfile.averageScore > 80) {
      baseRecommendations[0].difficulty = 'Advanced';
      baseRecommendations[1].difficulty = 'Expert';
    } else if (userProfile.averageScore < 50) {
      baseRecommendations[0].difficulty = 'Beginner';
      baseRecommendations[1].difficulty = 'Intermediate';
    }
  }

  return baseRecommendations;
};
