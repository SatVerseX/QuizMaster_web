import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  FiZap, 
  FiX, 
  FiLoader,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const AIGenerator = ({ onQuestionsGenerated, onClose }) => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const mode = (light, dark) => (isDark ? dark : light);
  
  const [prompt, setPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add the cleanup function from AIQuizGenerator
  const cleanupJSONResponse = (text) => {
    // Remove common markdown code fence patterns
    let cleaned = text
      .replace(/``````json/g, '')
      .replace(/``````/g, '')   
      .replace(/````````````/g, '')
      .trim();
    
    // Find JSON array boundaries
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    
    return cleaned;
  };

  const generateQuestions = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for question generation');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      // Updated prompt similar to AIQuizGenerator
      const systemPrompt = `Generate exactly ${numQuestions} multiple choice questions based on the following prompt.
      
Requirements:
- Difficulty level: ${difficulty}
- Each question must have exactly 4 options
- Include explanations for correct answers
- For each question, suggest a relevant Cloudinary image URL that would help illustrate the question
- Image URLs should be from Cloudinary (res.cloudinary.com) and relevant to the question content
- If no relevant image is available, use null for the image field

Return ONLY a valid JSON array in this exact format (no markdown, no code fences, no additional text):

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation for the correct answer",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sample.jpg"
  }
]

Generate exactly ${numQuestions} questions total. Ensure all JSON is valid and properly formatted.

Topic/Prompt: ${prompt}`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response
      const cleanedText = cleanupJSONResponse(text);
      
      try {
        const questions = JSON.parse(cleanedText);
        
        // Validate the response
        if (Array.isArray(questions) && questions.length > 0) {
          // Validate each question has required fields
          const validQuestions = questions.filter(q => 
            q.question && 
            Array.isArray(q.options) && 
            q.options.length === 4 &&
            typeof q.correctAnswer === 'number' &&
            q.correctAnswer >= 0 && 
            q.correctAnswer <= 3
          );

          if (validQuestions.length > 0) {
            setSuccess(`Successfully generated ${validQuestions.length} questions!`);
            onQuestionsGenerated(validQuestions);
          } else {
            setError('Generated questions are not in the correct format. Please try again.');
          }
        } else {
          setError('Failed to generate valid questions. Please try again.');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw response:', text);
        console.log('Cleaned response:', cleanedText);
        setError('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
      <div className={`backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[45vh] flex flex-col my-8 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/95 border-gray-700/60')}`}>
        {/* Header */}
        <div className={`p-6 border-b ${mode('border-slate-200/60', 'border-gray-700/60')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${mode('text-slate-800', 'text-white')}`}>AI Question Generator</h2>
                <p className={`text-sm ${mode('text-slate-600', 'text-gray-300')}`}>Generate questions using AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
            >
              <FiX className={`w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 pb-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {/* Messages */}
          {error && (
            <div className={`p-4 rounded-lg ${mode('bg-red-50 border-red-200 text-red-700', 'bg-red-900/20 border-red-800/50 text-red-400')} border`}>
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className={`p-4 rounded-lg ${mode('bg-green-50 border-green-200 text-green-700', 'bg-green-900/20 border-green-800/50 text-green-400')} border`}>
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                {success}
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-gray-300')}`}>
              Topic/Prompt *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 min-h-[100px] resize-y ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-500')}`}
              placeholder="Enter the topic or prompt for question generation..."
              rows="3"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 appearance-none ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={generateQuestions}
              disabled={loading || !prompt.trim()}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                loading || !prompt.trim()
                  ? mode('bg-slate-300 text-slate-500 cursor-not-allowed', 'bg-gray-600 text-gray-400 cursor-not-allowed')
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiZap className="w-4 h-4" />
                  Generate Questions
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${mode('bg-slate-200 text-slate-700 hover:bg-slate-300', 'bg-gray-700 text-gray-300 hover:bg-gray-600')}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;
