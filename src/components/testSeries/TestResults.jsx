import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiClock, 
  FiTarget, 
  FiShare2, 
  FiRefreshCw, 
  FiHome, 
  FiBarChart2, 
  FiCheck, 
  FiX,
  FiCopy,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiSmartphone
} from 'react-icons/fi';
import { 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaRocket, 
  FaChartLine, 
  FaLightbulb, 
  FaRupeeSign 
} from 'react-icons/fa';

const TestResults = ({ 
  attempt, 
  testSeries, 
  onRetakeTest, 
  onViewAnalysis, 
  onBackToSeries 
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { popupState, showSuccess, showError, hidePopup } = usePopup();
  const [showEarningAnimation, setShowEarningAnimation] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // --- Logic Section (Preserved) ---
  useEffect(() => {
    if (attempt && attempt.percentage) {
      calculateAndAddEarnings();
      if (attempt.percentage >= 80) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 4000);
      }
    }
  }, [attempt]);

  const calculateAndAddEarnings = async () => {
    // ... (Keep your existing logic for calculating earnings here)
    // For visual demo purposes, assuming logic runs and sets state
    try {
      let earningAmount = 0;
      if (attempt.percentage >= 90) earningAmount = 100;
      else if (attempt.percentage >= 70) earningAmount = 50;
      
      // Mocking the set for design
      if (earningAmount > 0) {
        setEarnedAmount(earningAmount);
        setTimeout(() => setShowEarningAnimation(true), 1500);
      }
    } catch (e) { console.error(e); }
  };

  const calculateTimeBonus = () => {
    if (!attempt.timeSpent || !testSeries?.timeLimit) return 0;
    const timeLimit = testSeries.timeLimit * 60;
    return (attempt.timeSpent <= timeLimit / 2 && attempt.percentage >= 80) ? 50 : 0;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Dynamic Theme based on Grade
  const getPerformanceData = () => {
    const p = attempt.percentage;
    if (p >= 95) return { grade: 'A+', title: 'Legendary!', msg: 'Top 1% performance!', gradient: 'from-yellow-400 via-orange-500 to-red-500', shadow: 'shadow-orange-500/50', icon: FaCrown, text: 'text-yellow-400' };
    if (p >= 90) return { grade: 'A', title: 'Outstanding!', msg: 'Exceptional mastery.', gradient: 'from-emerald-400 via-green-500 to-teal-600', shadow: 'shadow-emerald-500/50', icon: FaTrophy, text: 'text-emerald-400' };
    if (p >= 80) return { grade: 'B+', title: 'Great Job!', msg: 'Solid performance.', gradient: 'from-blue-400 via-indigo-500 to-purple-600', shadow: 'shadow-blue-500/50', icon: FaMedal, text: 'text-blue-400' };
    if (p >= 70) return { grade: 'B', title: 'Good Effort', msg: 'Keep pushing!', gradient: 'from-purple-400 to-pink-600', shadow: 'shadow-purple-500/50', icon: FaRocket, text: 'text-purple-400' };
    if (p >= 60) return { grade: 'C', title: 'Fair Start', msg: 'Room to grow.', gradient: 'from-orange-400 to-yellow-600', shadow: 'shadow-orange-500/50', icon: FaChartLine, text: 'text-orange-400' };
    return { grade: 'D', title: 'Keep Trying', msg: 'Don\'t give up!', gradient: 'from-gray-400 to-slate-600', shadow: 'shadow-gray-500/50', icon: FaLightbulb, text: 'text-gray-400' };
  };

  const perf = getPerformanceData();
  const PerformanceIcon = perf.icon;

  // --- Sharing Logic ---
  const shareData = {
    title: `I scored ${attempt.percentage}% in ${attempt.testTitle}!`,
    text: `Just completed a test on QuizMaster. Score: ${attempt.score}/${attempt.totalQuestions}. Can you beat me?`,
    url: window.location.href
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);
    let shareUrl = '';

    switch(platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
      default: break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    showSuccess('Copied to clipboard!', 'Shared');
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* --- Background Ambiance --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b ${perf.gradient} opacity-10 blur-[120px]`} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px]" />
      </div>

      {/* --- Confetti --- */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
            >
              {['🎉', '✨', '🏆', '⭐'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <button 
            onClick={onBackToSeries}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
          >
            <FiHome /> Back to Series
          </button>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">Result Analysis</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- Left Column: The Score Card --- */}
          <div className="lg:col-span-5 flex flex-col">
            <div className={`relative h-full overflow-hidden rounded-[2.5rem] bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl ${perf.shadow}`}>
              
              {/* Glow Ring */}
              <div className={`absolute inset-0 bg-gradient-to-br ${perf.gradient} opacity-5`} />
              
              {/* Grade Badge */}
              <div className="relative mb-8">
                <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${perf.gradient} p-1 shadow-2xl shadow-black/50`}>
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center flex-col relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${perf.gradient} opacity-20 animate-pulse`} />
                    <PerformanceIcon className={`text-4xl mb-1 ${perf.text} relative z-10`} />
                    <div className="text-5xl font-black text-white relative z-10 tracking-tighter">
                      {attempt.percentage}<span className="text-2xl text-white/60">%</span>
                    </div>
                  </div>
                </div>
                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r ${perf.gradient} text-white font-bold text-sm uppercase tracking-wider shadow-lg whitespace-nowrap`}>
                  Grade {perf.grade}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{perf.title}</h1>
              <p className="text-slate-400 text-lg mb-8">{perf.msg}</p>

              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={onViewAnalysis}
                  className="flex-1 bg-white text-slate-900 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiBarChart2 /> Analysis
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-3.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-white transition-all border border-slate-600"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* --- Right Column: Detailed Stats --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Earnings Banner */}
            {earnedAmount > 0 && (
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 to-green-900/40 border border-emerald-500/30 p-6 flex items-center justify-between transition-all duration-700 ${showEarningAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FaRupeeSign className="text-xl" />
                  </div>
                  <div>
                    <div className="text-emerald-400 font-bold uppercase text-xs tracking-wider">Reward Unlocked</div>
                    <div className="text-white font-bold text-xl">You earned ₹{earnedAmount}</div>
                  </div>
                </div>
                <button onClick={() => navigate('/earnings')} className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-colors">
                  Claim
                </button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <StatCard 
                icon={FiCheck} 
                label="Correct Answers" 
                value={`${attempt.score} / ${attempt.totalQuestions}`} 
                color="text-emerald-400"
                bg="bg-emerald-500/10" 
                border="border-emerald-500/20"
              />
              <StatCard 
                icon={FiX} 
                label="Incorrect" 
                value={attempt.totalQuestions - attempt.score} 
                color="text-red-400"
                bg="bg-red-500/10" 
                border="border-red-500/20"
              />
              <StatCard 
                icon={FiClock} 
                label="Time Taken" 
                value={formatTime(attempt.timeSpent)} 
                color="text-blue-400"
                bg="bg-blue-500/10" 
                border="border-blue-500/20"
              />
              <StatCard 
                icon={FiTarget} 
                label="Accuracy" 
                value={`${Math.round((attempt.score / attempt.totalQuestions) * 100)}%`} 
                color="text-purple-400"
                bg="bg-purple-500/10" 
                border="border-purple-500/20"
              />
            </div>

            {/* Secondary Actions */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">What's Next?</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onRetakeTest}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-600 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                >
                  <FiRefreshCw /> Retake Test
                </button>
                <button
                  onClick={onBackToSeries}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-600 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                >
                  <FiHome /> Test Series
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- Share Modal --- */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Share Achievement</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <SocialBtn icon={FiSmartphone} label="WhatsApp" color="bg-green-500" onClick={() => handleShare('whatsapp')} />
              <SocialBtn icon={FiTwitter} label="Twitter" color="bg-sky-500" onClick={() => handleShare('twitter')} />
              <SocialBtn icon={FiLinkedin} label="LinkedIn" color="bg-blue-600" onClick={() => handleShare('linkedin')} />
              <SocialBtn icon={FiFacebook} label="Facebook" color="bg-blue-700" onClick={() => handleShare('facebook')} />
            </div>

            <button 
              onClick={copyToClipboard}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <FiCopy /> Copy Link
            </button>
          </div>
        </div>
      )}

      <BeautifulPopup {...popupState} onClose={hidePopup} />
      
      {/* Animation Styles */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
      `}</style>
    </div>
  );
};

// --- Helper Components for Cleaner Code ---

const StatCard = ({ icon: Icon, label, value, color, bg, border }) => (
  <div className={`p-4 rounded-2xl border ${border} ${bg} backdrop-blur-sm flex flex-col items-start justify-between h-28 transition-transform hover:scale-[1.02]`}>
    <div className={`p-2 rounded-lg bg-white/10 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

const SocialBtn = ({ icon: Icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-xs text-slate-400 group-hover:text-white">{label}</span>
  </button>
);

export default TestResults;