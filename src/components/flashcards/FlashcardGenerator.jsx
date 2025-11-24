import React, { useState } from 'react';
import { Layers, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { FlashcardService } from '../../services/flashcardService';

const FlashcardGenerator = ({ userId, mistakes, testTitle, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!userId) {
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format mistakes for service
      const incorrectQuestions = mistakes.map(m => ({
        question: m.question,
        options: m.options,
        correctAnswer: m.correctAnswer,
        explanation: m.explanation,
        id: m.id || Date.now().toString()
      }));

      await FlashcardService.createFromMistakes(userId, incorrectQuestions, `Mistakes: ${testTitle}`);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err) {
      console.error(err);
      // User-friendly error message
      if (err.code === 'permission-denied') {
        setError("Permission denied. Please check your login status.");
      } else if (err.message.includes("AdBlocker")) {
        setError("Please disable AdBlocker to save flashcards.");
      } else {
        setError("Failed to generate cards. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        {!loading && !success && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-8 text-center">
          {/* Status Icon */}
          <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-500 ${
            success 
              ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' 
              : error
                ? 'bg-rose-100 text-rose-600 ring-4 ring-rose-50'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {success ? (
              <Check className="w-8 h-8 animate-in zoom-in duration-300" />
            ) : error ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Layers className="w-8 h-8" />
            )}
          </div>
          
          {/* Text Content */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {success ? 'Flashcards Created!' : error ? 'Generation Failed' : 'Create Smart Flashcards'}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {success 
              ? 'Your mistakes have been converted into an active learning deck.' 
              : error
                ? error
                : `Convert your ${mistakes.length} mistakes into AI-powered flashcards for spaced repetition review.`}
          </p>

          {/* Actions */}
          {!success && (
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Create Deck'}
              </button>
            </div>
          )}
        </div>
        
        {/* Loading Progress Bar (Optional Visual) */}
        {loading && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-emerald-500 animate-pulse w-full origin-left"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;