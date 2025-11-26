import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FlashcardService } from '../../services/flashcardService';
import FlashcardCard from './FlashCard';
import { 
  Play, Layers, Clock, CheckCircle2, RotateCcw, Trophy, ArrowLeft, Eye, Smile, Frown
} from 'lucide-react';

const FlashcardReview = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [view, setView] = useState('dashboard'); // 'dashboard', 'review', 'summary'
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ due: 0, total: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  
  // Session State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    if(currentUser) loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const due = await FlashcardService.getDueCards(currentUser.uid);
      const all = await FlashcardService.getAllCards(currentUser.uid);
      
      setStats({
        due: due.length,
        total: all.length,
        mastered: all.filter(c => c.mastered).length 
      });
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
         // Shuffle for practice
         sessionCards = sessionCards.sort(() => Math.random() - 0.5);
      } else {
         sessionCards = await FlashcardService.getDueCards(currentUser.uid);
      }
      
      if (sessionCards.length === 0) {
        // Quick visual feedback handled by UI state, but safety check here
        setLoading(false);
        return;
      }

      setCards(sessionCards);
      setCurrentIndex(0);
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
    
    // Optimistic update
    FlashcardService.submitReview(currentCard.id, quality, currentCard).catch(console.error);

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false); // Reset flip BEFORE changing card content
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150); // Small delay for animation smoothness
    } else {
      setView('summary');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // --- DASHBOARD ---
  if (view === 'dashboard') {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {onBack && (
              <button onClick={()=>window.history.back()} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}>
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Spaced repetition system</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatBox label="Due Today" value={stats.due} color="text-indigo-500" isDark={isDark} />
            <StatBox label="Total Cards" value={stats.total} color={isDark ? "text-white" : "text-zinc-900"} isDark={isDark} />
            <StatBox label="Mastered" value={stats.mastered} color="text-emerald-500" isDark={isDark} />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
              onClick={() => startSession('due')}
              disabled={stats.due === 0}
              icon={Layers}
              title="Daily Review"
              desc={stats.due > 0 ? `${stats.due} cards waiting for review.` : "You're all caught up!"}
              btnText={stats.due > 0 ? 'Start Review' : 'No Reviews Due'}
              accentColor="indigo"
              isDark={isDark}
            />
            
            <ActionCard 
              onClick={() => startSession('all')}
              disabled={stats.total === 0}
              icon={RotateCcw}
              title="Practice Mode"
              desc="Review all cards without affecting scheduling."
              btnText="Practice All"
              accentColor="emerald"
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- SUMMARY ---
  if (view === 'summary') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl text-center shadow-2xl ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Session Complete!</h2>
          <p className={`opacity-70 mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            You've reviewed {cards.length} cards today. Keep up the great work!
          </p>
          <button 
            onClick={() => { setView('dashboard'); loadDashboardData(); }}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- REVIEW ---
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`}>
          <XIcon isDark={isDark} /> {/* Defined below or verify import */}
          <span className="sr-only">Exit</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
            {currentIndex + 1} <span className="opacity-40">/</span> {cards.length}
          </div>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto">
        {cards[currentIndex] && (
           <FlashcardCard 
             key={cards[currentIndex].id} // Key ensures component resets on change
             card={cards[currentIndex]} 
             isFlipped={isFlipped} 
             onFlip={() => setIsFlipped(!isFlipped)} 
           />
        )}

        {/* Controls Area - Fixed Height to prevent jumping */}
        <div className="h-24 w-full mt-8">
          {!isFlipped ? (
            <div className="flex justify-center">
              <button 
                onClick={() => setIsFlipped(true)}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:scale-105 active:scale-95 ${
                  isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Eye className="w-4 h-4" /> Show Answer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <GradeButton 
                color="rose" 
                icon={RotateCcw} 
                label="Again" 
                sub="< 1m" 
                onClick={() => handleGrade(0)} 
                isDark={isDark} 
              />
              <GradeButton 
                color="amber" 
                icon={Clock} 
                label="Hard" 
                sub="2d" 
                onClick={() => handleGrade(3)} 
                isDark={isDark} 
              />
              <GradeButton 
                color="emerald" 
                icon={CheckCircle2} 
                label="Easy" 
                sub="4d" 
                onClick={() => handleGrade(5)} 
                isDark={isDark} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helpers ---

const StatBox = ({ label, value, color, isDark }) => (
  <div className={`p-5 rounded-2xl border text-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
    <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
    <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</div>
  </div>
);

const ActionCard = ({ onClick, disabled, icon: Icon, title, desc, btnText, accentColor, isDark }) => {
  const colors = {
    indigo: isDark ? 'text-indigo-400' : 'text-indigo-600',
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${
        disabled 
          ? 'opacity-50 cursor-not-allowed grayscale' 
          : isDark 
            ? 'hover:border-zinc-700 hover:bg-zinc-900' 
            : 'hover:border-zinc-300 hover:shadow-md'
      } ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} ${colors[accentColor]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h3>
      <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{desc}</p>
      <span className={`text-sm font-bold flex items-center gap-2 ${colors[accentColor]}`}>
        {btnText} <Play className="w-3 h-3 fill-current" />
      </span>
    </button>
  );
};

const GradeButton = ({ color, icon: Icon, label, sub, onClick, isDark }) => {
  const styles = {
    rose: isDark ? 'bg-rose-900/20 text-rose-400 hover:bg-rose-900/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    amber: isDark ? 'bg-amber-900/20 text-amber-400 hover:bg-amber-900/30' : 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    emerald: isDark ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all transform active:scale-95 ${styles[color]}`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-xs font-bold uppercase">{label}</span>
      <span className="text-[10px] opacity-70">{sub}</span>
    </button>
  );
};

// Fallback icon if X not imported
const XIcon = () => null;

export default FlashcardReview;