import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { generateRemediationQuiz } from '../../services/geminiService';
import { 
  FiCpu, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowRight, 
  FiX 
} from 'react-icons/fi';
import { FaBrain, FaMagic } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const RemediationGenerator = ({ mistakes, originalTitle, userId, onClose }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [newQuizId, setNewQuizId] = useState(null);

  // Auto-start generation on mount if not already running
  useEffect(() => {
    if (!loading && !success && !error) {
      generateRemediation();
    }
  }, []);

  const generateRemediation = async () => {
    if (!userId || !mistakes || mistakes.length === 0) {
      setError("Insufficient data to generate remediation.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Call AI Service
      const result = await generateRemediationQuiz(mistakes, originalTitle);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to generate quiz content.");
      }

      const quizData = result.data;

      // 2. Format for Firestore
      const processedQuestions = (quizData.questions || []).map(q => ({
        id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "AI Generated Explanation",
        negativeMarking: { enabled: false, type: 'fractional', value: 0.25 } // Safe default
      }));

      const remediationDoc = {
        title: quizData.title || `Remediation: ${originalTitle}`,
        description: quizData.description || "Auto-generated remediation quiz based on your recent performance.",
        questions: processedQuestions,
        totalQuestions: processedQuestions.length,
        timeLimit: Math.ceil(processedQuestions.length * 1.5), // 1.5 min per q
        difficulty: 'adaptive',
        isAIGenerated: true,
        isRemediation: true,
        sourceTitle: originalTitle,
        createdBy: userId, // Private to user
        createdAt: serverTimestamp(),
        isPaid: false
      };

      // 3. Save to Firestore
      const docRef = await addDoc(collection(db, 'quizzes'), remediationDoc);
      
      setNewQuizId(docRef.id);
      setSuccess(true);

    } catch (err) {
      console.error("Remediation Error:", err);
      setError("Our AI brain hit a snag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (newQuizId) {
      navigate(`/quiz/${newQuizId}/take`);
      onClose(); // Close modal
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        
        {/* Close Button (only if not loading) */}
        {!loading && (
          <button 
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'text-zinc-500 hover:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-100'}`}
          >
            <FiX size={20} />
          </button>
        )}

        <div className="p-8 text-center">
          
          {/* Dynamic Icon Area */}
          <div className="relative h-24 flex items-center justify-center mb-6">
            {loading && (
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <FiCpu className={`w-16 h-16 animate-spin ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <FaBrain className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 ${isDark ? 'text-indigo-200' : 'text-white'}`} />
              </div>
            )}

            {success && (
              <div className="relative">
                 <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                 <FiCheckCircle className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-300" />
              </div>
            )}

            {error && (
              <div className="relative">
                 <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl" />
                 <FiAlertCircle className="w-16 h-16 text-rose-500" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {loading ? 'Analyzing Mistakes...' : success ? 'Remediation Ready!' : 'Analysis Failed'}
          </h3>
          
          <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {loading 
              ? `Our AI is identifying concepts you struggled with in "${originalTitle}" and crafting a personalized recovery quiz.`
              : success 
                ? 'We\'ve generated a custom quiz targeting your weak areas. Taking this now can boost your retention by 40%.'
                : error
            }
          </p>

          {/* Action Buttons */}
          {!loading && (
            <div className="space-y-3">
              {success ? (
                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                >
                  <FaMagic className="w-4 h-4" /> Start Smart Quiz
                </button>
              ) : (
                <button
                  onClick={generateRemediation}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/25 transition-transform active:scale-[0.98]"
                >
                  Try Again
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RemediationGenerator;