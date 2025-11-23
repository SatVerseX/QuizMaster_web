import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiClock, 
  FiCalendar, 
  FiTarget, 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinusCircle,
  FiFlag
} from 'react-icons/fi';
import { 
  FaTrophy, 
  FaMedal, 
  FaChartLine, 
  FaLightbulb, 
  FaArrowRight
} from 'react-icons/fa';

const PerformanceOverview = ({ attempt, questionAnalysis, showRecommendations, setShowRecommendations }) => {
  const { isDark } = useTheme();

  // --- Helper Functions ---
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return 'Invalid'; }
  };

  // Semantic Colors (Flat & Clean)
  const getGradeStyle = (percentage) => {
    if (percentage >= 90) return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: FaTrophy, label: 'Excellent' };
    if (percentage >= 75) return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: FaMedal, label: 'Very Good' };
    if (percentage >= 60) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: FaChartLine, label: 'Good' };
    return { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', icon: FaChartLine, label: 'Needs Practice' };
  };

  const correctAnswers = questionAnalysis.filter(q => q.isCorrect).length;
  const incorrectAnswers = questionAnalysis.filter(q => q.status === 'incorrect').length;
  const skippedAnswers = questionAnalysis.filter(q => q.status === 'skipped').length;
  const flaggedCount = attempt.flaggedQuestions?.length || 0;
  
  const grade = getGradeStyle(attempt.percentage);

  // --- Components ---

  const StatItem = ({ icon: Icon, label, value, subValue, colorClass }) => (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
        {value}
      </div>
      {subValue && <div className={`text-xs ${colorClass}`}>{subValue}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* MAIN CARD */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        
        {/* Header Section */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Score</p>
              <div className="flex items-baseline gap-2">
                <h2 className={`text-4xl font-extrabold tracking-tight ${grade.color}`}>
                  {attempt.percentage}%
                </h2>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  / 100%
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${grade.bg} ${grade.color}`}>
              <grade.icon className="w-4 h-4" />
              <span>{grade.label}</span>
            </div>
          </div>
        </div>

        {/* Grid Stats */}
        <div className={`grid grid-cols-2 gap-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className={`p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <StatItem 
              icon={FiCheckCircle} 
              label="Accuracy" 
              value={`${Math.round((attempt.score / attempt.totalQuestions) * 100)}%`}
              subValue={`${correctAnswers}/${attempt.totalQuestions} Correct`}
              colorClass="text-emerald-500"
            />
          </div>
          <div className={`p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <StatItem 
              icon={FiClock} 
              label="Time Taken" 
              value={formatTime(attempt.timeSpent)}
              subValue="Avg. 45s / q" // You could calculate this dynamically
              colorClass="text-blue-500"
            />
          </div>
          <div className={`p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
             <StatItem 
              icon={FiTarget} 
              label="Difficulty" 
              value={<span className="capitalize">{attempt.difficulty}</span>}
              colorClass="text-slate-500"
            />
          </div>
           <div className={`p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
             <StatItem 
              icon={FiCalendar} 
              label="Date" 
              value={formatDate(attempt.completedAt)}
              colorClass="text-slate-500"
            />
          </div>
        </div>

        {/* Visual Breakdown (Stacked Bar) */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Answer Distribution</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{attempt.totalQuestions} Questions</span>
          </div>

          {/* The Stacked Bar */}
          <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <div style={{ width: `${(correctAnswers / attempt.totalQuestions) * 100}%` }} className="bg-emerald-500 transition-all duration-500" />
            <div style={{ width: `${(incorrectAnswers / attempt.totalQuestions) * 100}%` }} className="bg-red-500 transition-all duration-500" />
            <div style={{ width: `${(skippedAnswers / attempt.totalQuestions) * 100}%` }} className="bg-slate-300 dark:bg-slate-600 transition-all duration-500" />
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{correctAnswers} Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{incorrectAnswers} Wrong</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{skippedAnswers} Skipped</span>
            </div>
          </div>
          
          {flaggedCount > 0 && (
             <div className={`mt-2 flex items-center gap-2 text-xs p-2 rounded ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
               <FiFlag className="w-3 h-3" />
               <span>You flagged {flaggedCount} questions for review</span>
             </div>
          )}
        </div>
      </div>

      {/* INTELLIGENT RECOMMENDATIONS CARD */}
      {showRecommendations && (
        <div className={`rounded-2xl border p-1 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
           <div className={`rounded-xl p-5 ${
             attempt.percentage >= 80 
               ? isDark ? 'bg-gradient-to-r from-emerald-900/20 to-transparent' : 'bg-gradient-to-r from-emerald-50 to-transparent'
               : isDark ? 'bg-gradient-to-r from-blue-900/20 to-transparent' : 'bg-gradient-to-r from-blue-50 to-transparent'
           }`}>
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  attempt.percentage >= 80 ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  <FaLightbulb className="w-3.5 h-3.5" />
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  AI Insights
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {attempt.percentage >= 80 ? (
                <div>
                  <p className={`text-sm font-medium mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Ready for Advanced Topics
                  </p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    You've demonstrated mastery here. We recommend moving to the "Advanced" difficulty section to challenge your application skills.
                  </p>
                </div>
              ) : (
                 <div>
                  <p className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    Focus on Accuracy
                  </p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Review the {incorrectAnswers} incorrect answers below. Focus specifically on the explanations provided to bridge the gap.
                  </p>
                </div>
              )}
              
              <button 
                onClick={() => setShowRecommendations(false)}
                className={`flex items-center gap-1 text-xs font-semibold hover:underline ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PerformanceOverview;