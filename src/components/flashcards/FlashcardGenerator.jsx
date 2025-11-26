import React, { useState } from 'react';
import { Layers, Check, Loader2, AlertCircle, X, Brain } from 'lucide-react';
import { FlashcardService } from '../../services/flashcardService';
import { useTheme } from '../../contexts/ThemeContext';

const FlashcardGenerator = ({ userId, mistakes, testTitle, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  const handleGenerate = async () => {
    if (!userId) {
      setError("Authentication required.");
      return;
    }

    if (!mistakes || mistakes.length === 0) {
      setError("No mistakes to process.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure valid data structure before sending
      const incorrectQuestions = mistakes.map(m => ({
        question: m.question || "Unknown Question",
        options: m.options || [],
        correctAnswer: m.correctAnswer || 0,
        explanation: m.explanation || "",
        id: m.id || `gen-${Date.now()}-${Math.random()}`
      }));

      await FlashcardService.createFromMistakes(
        userId, 
        incorrectQuestions, 
        `Review: ${testTitle || 'General Practice'}`
      );
      
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("Failed to generate cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden relative transition-colors ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        
        {/* Close Button */}
        {!loading && !success && (
          <button 
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <X size={20} />
          </button>
        )}

        <div className="p-8 text-center">
          {/* Dynamic Icon State */}
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-500 ${
            success 
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
              : error
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                : loading 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            {success ? (
              <Check className="w-10 h-10 animate-in zoom-in duration-300" />
            ) : error ? (
              <AlertCircle className="w-10 h-10" />
            ) : loading ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <Brain className="w-10 h-10" />
            )}
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {success ? 'Cards Created!' : error ? 'Error' : 'Review with Flashcards'}
          </h3>
          
          <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {success 
              ? 'Your active learning deck is ready.' 
              : error
                ? error
                : `Turn ${mistakes.length} mistakes into smart flashcards? AI will summarize key concepts for better retention.`}
          </p>

          {!success && !loading && (
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors border ${
                  isDark 
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" /> Generate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardGenerator;