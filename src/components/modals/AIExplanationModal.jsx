import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainQuestion } from '../../services/geminiService';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Lightweight Markdown Renderer
 * Parses simple markdown syntax (bold, bullets) into React elements securely.
 */
const MarkdownLite = ({ content, isDark }) => {
  if (!content) return null;

  // Helper to parse inline bold formatting: **text**
  const parseInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // FIXED: Used specific accent colors to ensure visibility against background
        return (
          <strong 
            key={index} 
            className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3">
      {content.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Handle Bullet Points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const cleanLine = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={i} className="flex gap-3 pl-1">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-rose-500' : 'bg-rose-600'}`} />
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {parseInline(cleanLine)}
              </p>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={i} className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const AIExplanationModal = ({ isOpen, onClose, questionData }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  // Reset state and fetch when modal opens with new data
  useEffect(() => {
    if (isOpen && questionData) {
      fetchExplanation();
    } else {
      // Cleanup on close
      setExplanation(null);
      setError(null);
      setLoading(true);
    }
  }, [isOpen, questionData]);

  const fetchExplanation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Defensive check for required data
      if (!questionData?.question) {
        throw new Error("Invalid question data provided.");
      }

      const result = await explainQuestion({
        question: questionData.question,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        userAnswer: questionData.userAnswer
      });

      setExplanation(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate explanation.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get correct answer text safely
  const correctAnswerText = questionData?.options && questionData.correctAnswer !== undefined
    ? questionData.options[questionData.correctAnswer]
    : "Answer not available";

  // Helper for conditional classes
  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "relative w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden flex flex-col",
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-6 py-4 border-b",
            isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-100 bg-zinc-50/50"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"
              )}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className={cn("text-sm font-bold", isDark ? "text-zinc-100" : "text-zinc-900")}>
                  AI Explanation
                </h3>
                <p className={cn("text-xs font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  Analysis & Concept Review
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar">
            
            {/* Loading State: Skeleton */}
            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className={cn("h-4 rounded w-3/4", isDark ? "bg-zinc-800" : "bg-zinc-100")}></div>
                <div className={cn("h-4 rounded w-full", isDark ? "bg-zinc-800" : "bg-zinc-100")}></div>
                <div className={cn("h-4 rounded w-5/6", isDark ? "bg-zinc-800" : "bg-zinc-100")}></div>
                <div className={cn("h-32 rounded-lg mt-6 border", isDark ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}></div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className={cn("p-3 rounded-full mb-3", isDark ? "bg-red-900/20" : "bg-red-50")}>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className={cn("text-sm mb-4 max-w-xs", isDark ? "text-zinc-300" : "text-zinc-600")}>
                  {error}
                </p>
                <button 
                  onClick={fetchExplanation}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Generation
                </button>
              </div>
            )}

            {/* Success State */}
            {!loading && !error && explanation && (
              <div className="space-y-6">
                
                {/* Answer Context Box */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"
                )}>
                  <p className={cn(
                    "text-sm font-medium m-0 flex items-start gap-2",
                    isDark ? "text-emerald-400" : "text-emerald-800"
                  )}>
                    <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
                    Answer: {correctAnswerText}
                  </p>
                </div>
                  
                {/* Rich Text Content */}
                <MarkdownLite content={explanation} isDark={isDark} />

              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIExplanationModal;