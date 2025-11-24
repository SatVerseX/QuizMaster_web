import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  FiZap, 
  FiX, 
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiCpu,
  FiLayers,
  FiTrendingUp,
  FiChevronRight
} from 'react-icons/fi';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const AIGenerator = ({ onQuestionsGenerated, onClose }) => {
  const { isDark } = useTheme();
  // Theme Helper
  const mode = (light, dark) => (isDark ? dark : light);
  
  const [prompt, setPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cleanupJSONResponse = (text) => {
    let cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')   
      .trim();
    
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    
    return cleaned;
  };

  const generateQuestions = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic or concept to generate questions.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      const systemPrompt = `Generate exactly ${numQuestions} multiple choice questions.
      
Requirements:
- Topic: ${prompt}
- Difficulty: ${difficulty}
- 4 options per question
- Include explanation
- Suggest a valid Cloudinary image URL if relevant (or null)

Return ONLY a valid JSON array:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "...",
  }
]`;

      const result = await model.generateContent(systemPrompt);
      const text = cleanupJSONResponse(await result.response.text());
      
      try {
        const questions = JSON.parse(text);
        if (Array.isArray(questions) && questions.length > 0) {
           // Basic validation
           const valid = questions.every(q => q.question && q.options?.length === 4);
           if (valid) {
             setSuccess(`Generated ${questions.length} questions successfully!`);
             setTimeout(() => onQuestionsGenerated(questions), 800);
           } else {
             setError('AI response format was incorrect. Please try again.');
           }
        } else {
          setError('Failed to generate valid questions.');
        }
      } catch (parseError) {
        console.error('Parse Error:', parseError);
        setError('Failed to parse AI response.');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError('Connection failed. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] ${mode('bg-white', 'bg-slate-900 border border-slate-800')}`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${mode('border-slate-100', 'border-slate-800')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode('bg-indigo-50 text-indigo-600', 'bg-indigo-900/20 text-indigo-400')}`}>
              <FiCpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${mode('text-slate-900', 'text-white')}`}>AI Question Generator</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${mode('text-slate-400 hover:bg-slate-100 hover:text-slate-600', 'text-slate-500 hover:bg-slate-800 hover:text-slate-300')}`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Status Messages */}
          {error && (
            <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${mode('bg-red-50 text-red-700', 'bg-red-900/20 text-red-400')}`}>
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${mode('bg-green-50 text-green-700', 'bg-green-900/20 text-green-400')}`}>
              <FiCheck className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Main Form */}
          <div className="space-y-5">
            
            {/* Topic Input */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-slate-400')}`}>
                Topic or Concept
              </label>
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all resize-none h-32 ${mode(
                    'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10', 
                    'bg-slate-800/50 border-slate-700 text-white focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  )}`}
                  placeholder="e.g., 'JavaScript Promises and Async/Await', 'Laws of Thermodynamics', 'European History 1900-1950'..."
                />
                <div className={`absolute bottom-3 right-3 text-xs pointer-events-none transition-opacity ${!prompt ? 'opacity-0' : 'opacity-50'} ${mode('text-slate-400', 'text-slate-500')}`}>
                  {prompt.length} chars
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Count Select */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${mode('text-slate-500', 'text-slate-400')}`}>
                  <FiLayers className="w-3.5 h-3.5" /> Count
                </label>
                <div className="relative">
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className={`w-full appearance-none px-4 py-3 rounded-xl border-2 font-medium outline-none transition-all ${mode(
                      'bg-white border-slate-200 text-slate-700 focus:border-indigo-500', 
                      'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    )}`}
                  >
                    {[1, 3, 5, 10, 15, 20].map(n => (
                      <option key={n} value={n}>{n} Questions</option>
                    ))}
                  </select>
                  <FiChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none ${mode('text-slate-400', 'text-slate-500')}`} />
                </div>
              </div>

              {/* Difficulty Select */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${mode('text-slate-500', 'text-slate-400')}`}>
                  <FiTrendingUp className="w-3.5 h-3.5" /> Difficulty
                </label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={`w-full appearance-none px-4 py-3 rounded-xl border-2 font-medium outline-none transition-all ${mode(
                      'bg-white border-slate-200 text-slate-700 focus:border-indigo-500', 
                      'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    )}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                  <FiChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none ${mode('text-slate-400', 'text-slate-500')}`} />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t rounded-b-2xl bg-slate-50/50 dark:bg-slate-900/50 flex gap-3 ${mode('border-slate-100', 'border-slate-800')}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${mode('text-slate-600 hover:bg-slate-200/50', 'text-slate-400 hover:bg-slate-800')}`}
          >
            Cancel
          </button>
          
          <button
            onClick={generateQuestions}
            disabled={loading || !prompt.trim()}
            className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FiZap className="w-4 h-4" />
                <span>Generate Questions</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AIGenerator;