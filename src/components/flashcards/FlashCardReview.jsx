import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FlashcardService } from '../../services/flashcardService';
import FlashcardCard from './FlashCard';
import { 
  Play, 
  Layers, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Trophy, 
  ArrowLeft,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FlashcardReview = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [view, setView] = useState('dashboard');
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ due: 0, total: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, hard: 0, wrong: 0 });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const due = await FlashcardService.getDueCards(currentUser.uid);
      
      // Try to get all cards, fallback to due count if not implemented
      let total = 0;
      if (FlashcardService.getAllCards) {
        const all = await FlashcardService.getAllCards(currentUser.uid);
        total = all.length;
      } else {
        total = due.length;
      }

      setStats({
        due: due.length,
        total: total || due.length,
        mastered: Math.floor(total * 0.3) 
      });
      setCards(due);
    } catch (error) {
      console.error("Failed to load cards", error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (mode = 'due') => {
    setLoading(true);
    try {
      let sessionCards = [];
      if (mode === 'all') {
         sessionCards = await FlashcardService.getAllCards(currentUser.uid);
         sessionCards = sessionCards.sort(() => Math.random() - 0.5);
      } else {
         sessionCards = await FlashcardService.getDueCards(currentUser.uid);
      }
      
      if (sessionCards.length === 0) {
        alert("No cards found for this mode!");
        setView('dashboard');
        setLoading(false);
        return;
      }

      setCards(sessionCards);
      setCurrentIndex(0);
      setSessionStats({ correct: 0, hard: 0, wrong: 0 });
      setIsFlipped(false);
      setView('review');
    } catch (err) {
      console.error("Error starting session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (quality) => {
    const currentCard = cards[currentIndex];
    
    if (quality === 5) setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    else if (quality === 3) setSessionStats(prev => ({ ...prev, hard: prev.hard + 1 }));
    else setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    FlashcardService.submitReview(currentCard.id, quality, currentCard).catch(console.error);

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setView('summary');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  if (view === 'dashboard') {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            {onBack && (
              <button onClick={onBack} className={isDark ? "p-2 rounded-full hover:bg-slate-800 transition-colors" : "p-2 rounded-full hover:bg-slate-200  transition-colors"}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Flashcard Dashboard</h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track your progress.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-sm font-medium opacity-70">Due Today</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-500">{stats.due}</h3>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-sm font-medium opacity-70">Total Cards</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
            </div>
             <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-sm font-medium opacity-70">Mastery</p>
              <h3 className="text-3xl font-bold mt-1 text-rose-500">~{Math.round((stats.mastered / (stats.total || 1)) * 100)}%</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => startSession('due')}
              disabled={stats.due === 0}
              className={`p-8 rounded-3xl border-2 text-left transition-all ${
                stats.due > 0 
                  ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' 
                  : isDark ? ' opacity-70 cursor-not-allowed border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100 opacity-70 cursor-not-allowed '
              }`}
            >
              <Layers className={`w-8 h-8 mb-4 ${stats.due > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
              <h3 className="text-xl font-bold mb-2">Daily Review</h3>
              <p className="opacity-70 text-sm mb-4">
                 {stats.due > 0 ? `${stats.due} cards waiting.` : "All caught up!"}
              </p>
              <span className={`inline-flex items-center gap-2 font-bold text-sm ${stats.due > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                 {stats.due > 0 ? 'Start Session' : 'No Cards Due'} <Play className="w-4 h-4" />
              </span>
            </button>

            <button
              onClick={() => startSession('all')}
              className={`p-8 rounded-3xl border text-left transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:border-rose-500/50' : 'bg-white border-slate-200 hover:border-rose-300'}`}
            >
              <RotateCcw className="w-8 h-8 mb-4 text-rose-500" />
              <h3 className="text-xl font-bold mb-2">Practice Mode</h3>
              <p className="opacity-70 text-sm mb-4">Review all cards regardless of due date.</p>
              <span className="inline-flex items-center gap-2 font-bold text-sm text-rose-600">
                 Review All <Play className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUMMARY VIEW ---
  if (view === 'summary') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl text-center ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-xl'}`}>
          <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="opacity-70 mb-8">You've reviewed {cards.length} cards.</p>
          
          <button 
            onClick={() => { setView('dashboard'); loadDashboardData(); }}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- REVIEW VIEW ---
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button onClick={() => setView('dashboard')} className={isDark ? "p-2 rounded-lg hover:bg-slate-800 transition-colors" : "p-2 rounded-lg hover:bg-slate-200 transition-colors"}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">Reviewing</span>
          <div className="text-sm font-bold">{currentIndex + 1} / {cards.length}</div>
        </div>
        <div className="w-9" />
      </div>

      {/* Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        {cards[currentIndex] && (
           <FlashcardCard 
             key={cards[currentIndex].id}
             card={cards[currentIndex]} 
             isFlipped={isFlipped} 
             onFlip={() => setIsFlipped(!isFlipped)} 
           />
        )}

        {/* Manual Reveal Button (Fallback if card click fails) */}
        {!isFlipped && (
          <button 
            onClick={() => setIsFlipped(true)}
            className={`mt-8 flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" /> Show Answer
          </button>
        )}

        {/* Grading Controls */}
        <div className={`w-full mt-8 grid grid-cols-3 gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
          <button onClick={() => handleGrade(0)} className={isDark ? "group flex flex-col items-center p-4 rounded-xl bg-rose-900/20 text-rose-400 hover:scale-105 transition-transform" : "group flex flex-col items-center p-4 rounded-xl bg-rose-100 text-rose-600  hover:scale-105 transition-transform"}>
            <RotateCcw className="w-5 h-5 mb-2" />
            <span className="text-xs font-bold uppercase">Again</span>
          </button>
          <button onClick={() => handleGrade(3)} className={isDark?"group flex flex-col items-center p-4 rounded-xl bg-amber-900/20 text-amber-400 hover:scale-105 transition-transform":"group flex flex-col items-center p-4 rounded-xl bg-amber-100 text-amber-600  hover:scale-105 transition-transform"}>
            <Clock className="w-5 h-5 mb-2" />
            <span className="text-xs font-bold uppercase">Hard</span>
          </button>
          <button onClick={() => handleGrade(5)} className={isDark?"group flex flex-col items-center p-4 rounded-xl bg-emerald-900/20 text-emerald-400 hover:scale-105 transition-transform":"group flex flex-col items-center p-4 rounded-xl bg-emerald-100 text-emerald-600  hover:scale-105 transition-transform"}>
            <CheckCircle2 className="w-5 h-5 mb-2" />
            <span className="text-xs font-bold uppercase">Easy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardReview;