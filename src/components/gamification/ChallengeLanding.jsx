import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Swords, 
  Rocket, 
  AlertCircle, 
  Target, 
  User, 
  Clock, 
  Zap,
  Crown 
} from 'lucide-react';

const ChallengeLanding = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const redirectPath = `${location.pathname}${location.search || ''}`;

  useEffect(() => {
    if (currentUser) return;
    navigate('/login', {
      replace: true,
      state: { redirectTo: redirectPath }
    });
  }, [currentUser, navigate, redirectPath]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchChallenge = async () => {
      try {
        if (!challengeId) {
            throw new Error("Invalid Challenge Link");
        }

        if (challengeId === 'demo-id-123') {
            setChallenge({
                id: 'demo-id-123',
                challengerName: 'The QuizMaster',
                challengerPercentage: 90,
                challengerScore: 90,
                quizTitle: 'Chemistry Class 10',
                quizId: 'demo_quiz',
                timeLimit: 20,
            });
            return;
        }

        const docRef = doc(db, 'challenges', challengeId);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          setChallenge({ id: snap.id, ...snap.data() });
        } else {
          setError("Challenge not found or has expired.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load challenge details.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [challengeId, currentUser]);

  const handleAccept = () => {
    if (!challenge) return;
    navigate(`/test/${challenge.quizId}/take`, {
      state: { 
        challengeMode: true,
        targetScore: challenge.challengerScore,
        challengerName: challenge.challengerName
      }
    });
  };

  // Helper for theme-aware styles
  const mode = (light, dark) => (isDark ? dark : light);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${mode('bg-slate-50', 'bg-slate-950')}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Swords className="w-6 h-6 text-orange-500" />
            </div>
        </div>
        <p className={`font-medium ${mode('text-slate-600', 'text-slate-400')}`}>Loading Challenge...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${mode('bg-slate-50', 'bg-slate-950')}`}>
      <div className={`max-w-md w-full p-8 rounded-3xl border text-center ${mode('bg-white border-slate-200 shadow-xl', 'bg-slate-900 border-slate-800')}`}>
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${mode('text-slate-900', 'text-white')}`}>Oops!</h2>
        <p className={`mb-8 ${mode('text-slate-600', 'text-slate-400')}`}>{error}</p>
        <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
            Go Home
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 ${mode('bg-slate-50', 'bg-[#0B1120]')}`}>
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-20 animate-pulse ${mode('bg-orange-400', 'bg-orange-600')}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000 ${mode('bg-red-400', 'bg-red-600')}`} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative z-10 max-w-md w-full rounded-[2rem] overflow-hidden border shadow-2xl ${mode('bg-white/80 border-white/40', 'bg-slate-900/60 border-white/10')} backdrop-blur-xl`}
      >
        {/* Header Section */}
        <div className="relative pt-12 pb-10 px-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
            
            {/* Floating Elements */}
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 right-6 text-orange-400 opacity-50"
            >
                <Zap size={24} />
            </motion.div>
            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-10 left-6 text-red-400 opacity-50"
            >
                <Target size={24} />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-lg shadow-orange-500/30">
                    Challenge Invitation
                </span>
                <h1 className={`text-4xl font-black italic tracking-tighter mb-2 ${mode('text-slate-900', 'text-white')}`}>
                    HEAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">TO</span> HEAD
                </h1>
                <p className={`text-sm font-medium ${mode('text-slate-500', 'text-slate-400')}`}>
                    Prove your skills and beat the score!
                </p>
            </motion.div>
        </div>

        {/* VS Section */}
        <div className="px-8 pb-8">
            <div className="flex items-center justify-between mb-10 relative">
                {/* Challenger */}
                <div className="flex flex-col items-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-1 shadow-xl shadow-orange-500/20 mb-3 transform -rotate-3">
                        <div className={`w-full h-full rounded-xl flex items-center justify-center ${mode('bg-white', 'bg-slate-800')}`}>
                            <span className={`text-3xl font-black ${mode('text-slate-800', 'text-white')}`}>
                                {challenge.challengerName?.charAt(0).toUpperCase() || 'C'}
                            </span>
                        </div>
                        <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 p-1.5 rounded-lg shadow-md">
                            <Crown size={14} fill="currentColor" />
                        </div>
                    </div>
                    <span className={`font-bold text-sm ${mode('text-slate-700', 'text-slate-200')}`}>
                        {challenge.challengerName}
                    </span>
                    <span className="text-xs font-mono text-orange-500 font-bold mt-1">
                        {challenge.challengerPercentage}% SCORE
                    </span>
                </div>

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center">
                    <div className={`text-6xl font-black opacity-10 italic ${mode('text-slate-900', 'text-white')}`}>
                        VS
                    </div>
                    <Swords className="absolute text-slate-300 dark:text-slate-600 w-8 h-8" />
                </div>

                {/* User (You) */}
                <div className="flex flex-col items-center relative z-10">
                    <div className={`w-20 h-20 rounded-2xl p-1 border-2 border-dashed mb-3 transform rotate-3 flex items-center justify-center ${mode('border-slate-300 bg-slate-50', 'border-slate-700 bg-slate-800/50')}`}>
                        <User className={`w-8 h-8 ${mode('text-slate-400', 'text-slate-500')}`} />
                    </div>
                    <span className={`font-bold text-sm ${mode('text-slate-700', 'text-slate-200')}`}>
                        You
                    </span>
                    <span className={`text-xs ${mode('text-slate-400', 'text-slate-500')}`}>
                        Ready?
                    </span>
                </div>
            </div>

            {/* Quiz Details Card */}
            <div className={`p-5 rounded-2xl border mb-8 ${mode('bg-slate-50 border-slate-200', 'bg-slate-800/50 border-slate-700')}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${mode('bg-white shadow-sm', 'bg-slate-700')}`}>
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg leading-tight mb-1 ${mode('text-slate-900', 'text-white')}`}>
                            {challenge.quizTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-xs">
                            <span className={`flex items-center gap-1 ${mode('text-slate-500', 'text-slate-400')}`}>
                                <Clock size={12} /> {challenge.timeLimit || '20'} min
                            </span>
                            <span className={`flex items-center gap-1 ${mode('text-slate-500', 'text-slate-400')}`}>
                                <Target size={12} /> Beat {challenge.challengerPercentage}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAccept}
                className="group relative w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/30 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <div className="relative flex items-center justify-center gap-3">
                    <Rocket className="w-5 h-5 animate-bounce" />
                    <span>ACCEPT CHALLENGE</span>
                </div>
            </motion.button>
            
            <p className={`text-center text-xs mt-4 ${mode('text-slate-400', 'text-slate-500')}`}>
                Can you top the leaderboard?
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeLanding;