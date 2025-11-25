import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiClock, FiCheckCircle, FiXCircle, FiMinus, 
  FiActivity, FiBarChart2, FiAward, FiAlertCircle 
} from 'react-icons/fi';

// --- Reusable Components ---

const CircularProgress = ({ percentage, color, size = 160, strokeWidth = 12, trackColor, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackColor} 
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const KPIBox = ({ icon: Icon, label, value, iconColor, styles, isDark }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-xl border border-transparent transition-all ${styles.boxBg}`}>
    <div className={isDark ? "p-2 rounded-full mb-2 bg-black/20 shadow-sm" : "p-2 rounded-full mb-2 bg-white/80 shadow-sm"}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <span className={`text-lg font-bold tabular-nums ${styles.textPrimary}`}>
      {value}
    </span>
    <span className={`text-xs font-bold uppercase tracking-wide ${styles.textSecondary}`}>
      {label}
    </span>
  </div>
);

const ProgressBar = ({ label, value, color, trackColor, styles }) => (
  <div className="w-full">
    <div className="flex justify-between items-end mb-2">
      <span className={`text-sm font-bold ${styles.textSecondary}`}>{label}</span>
      <span className={`text-sm font-bold ${styles.textPrimary}`}>{value.toFixed(0)}%</span>
    </div>
    <div className={`h-2.5 w-full rounded-full ${trackColor}`}>
      <div 
        className="h-2.5 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

// --- Main Component ---

const PerformanceOverview = ({ attempt, questionAnalysis }) => {
  const { isDark } = useTheme();

  const styles = {
    card: isDark 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-slate-200',
    headerBorder: isDark 
      ? 'border-gray-700' 
      : 'border-slate-100',
    subSectionBg: isDark 
      ? 'bg-gray-900/50' 
      : 'bg-slate-50',
    textPrimary: isDark 
      ? 'text-white' 
      : 'text-slate-900',
    textSecondary: isDark 
      ? 'text-slate-400' 
      : 'text-slate-600',
    progressTrack: isDark 
      ? 'text-gray-700'  
      : 'text-slate-200', 
    barTrack: isDark
      ? 'bg-gray-700'
      : 'bg-slate-200',
    
    // KPI Box Backgrounds
    kpi: {
      correct: isDark ? 'bg-emerald-900/10' : '',
      incorrect: isDark ? 'bg-rose-900/10' : '',
      skipped: isDark ? 'bg-gray-700/30' : '',
      time: isDark ? 'bg-blue-900/10' : '',
    }
  };

  // 2. Stats Calculation
  const stats = {
    total: questionAnalysis.length,
    correct: questionAnalysis.filter(q => q.status === 'correct').length,
    incorrect: questionAnalysis.filter(q => q.status === 'incorrect').length,
    skipped: questionAnalysis.filter(q => q.status === 'skipped').length,
    flagged: questionAnalysis.filter(q => q.isFlagged).length,
    attempted: questionAnalysis.filter(q => q.isAnswered).length
  };
  
  stats.accuracy = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;
  stats.completionRate = stats.total > 0 ? (stats.attempted / stats.total) * 100 : 0;
  
  const finalScore = attempt.percentage || stats.accuracy;

  // 3. Helper for Grade Colors
  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', label: 'Excellent', color: '#10b981', text: 'text-emerald-600' };
    if (percentage >= 80) return { grade: 'A', label: 'Very Good', color: '#10b981', text: 'text-emerald-600' };
    if (percentage >= 70) return { grade: 'B', label: 'Good', color: '#3b82f6', text: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'C', label: 'Average', color: '#f59e0b', text: 'text-amber-600' };
    return { grade: 'D', label: 'Needs Improvement', color: '#ef4444', text: 'text-rose-600' };
  };

  const resolvePassingThreshold = () => {
    const totalMarks = attempt?.totalMarks || attempt?.totalQuestions || 0;
    const candidates = [
      attempt?.passPercentage,
      attempt?.passingPercentage,
      attempt?.passingPercent,
      attempt?.passPercent,
      attempt?.minPassPercentage,
      attempt?.minimumPassingPercentage,
      attempt?.passingScore && totalMarks > 0 ? (attempt.passingScore / totalMarks) * 100 : null,
      attempt?.passScore && totalMarks > 0 ? (attempt.passScore / totalMarks) * 100 : null,
      attempt?.passMarks && totalMarks > 0 ? (attempt.passMarks / totalMarks) * 100 : null
    ];

    return candidates.find(value => typeof value === 'number' && !Number.isNaN(value)) ?? 33;
  };

  const passThreshold = resolvePassingThreshold();
  const derivedIsPassed = typeof attempt?.isPassed === 'boolean'
    ? attempt.isPassed
    : finalScore >= passThreshold;

  const grade = getGradeInfo(finalScore);
  const timeDisplay = `${Math.floor((attempt.timeSpent || 0) / 60)}m ${(attempt.timeSpent || 0) % 60}s`;
  const avgTime = stats.total > 0 ? ((attempt.timeSpent || 0) / stats.total).toFixed(1) : 0;

  return (
    <div className={`w-full border rounded-2xl shadow-sm overflow-hidden ${styles.card}`}>
      
      {/* Header */}
      <div className={`px-6 py-5 border-b flex items-center gap-3 ${styles.headerBorder}`}>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <FiBarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`text-lg font-bold leading-tight ${styles.textPrimary}`}>
            Performance Overview
          </h2>
          <p className={`text-xs font-bold mt-0.5 ${styles.textSecondary}`}>
            {stats.total} Questions • {stats.attempted} Attempted
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          
          {/* Left: Circular Progress */}
          <div className="flex flex-col items-center justify-center shrink-0 lg:w-1/3">
            <CircularProgress 
              percentage={finalScore} 
              color={grade.color} 
              size={150} 
              trackColor={styles.progressTrack} // Passing dynamic style
            >
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-extrabold tabular-nums ${styles.textPrimary}`}>
                  {finalScore.toFixed(0)}%
                </span>
                <span className={`text-sm font-bold mt-1 ${grade.text}`}>
                  Grade {grade.grade}
                </span>
              </div>
            </CircularProgress>
            
            <div className="mt-4 text-center">
              <p className={`text-sm font-bold mb-1 ${styles.textSecondary}`}>Performance Status</p>
              <p className={`text-lg font-bold ${grade.text}`}>{grade.label}</p>
            </div>
          </div>

          {/* Right: KPI Grid */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-2/3 ">
            <KPIBox 
              icon={FiCheckCircle} label="Correct" value={stats.correct} 
              iconColor="text-emerald-600 "
              styles={{ ...styles, boxBg: styles.kpi.correct }}
              isDark={isDark}
            />
            <KPIBox 
              icon={FiXCircle} label="Incorrect" value={stats.incorrect} 
              iconColor="text-rose-600"
              styles={{ ...styles, boxBg: styles.kpi.incorrect }}
              isDark={isDark}
            />
            <KPIBox 
              icon={FiMinus} label="Skipped" value={stats.skipped} 
              iconColor="text-slate-500"
              styles={{ ...styles, boxBg: styles.kpi.skipped }}
              isDark={isDark}
            />
            <KPIBox 
              icon={FiClock} label="Total Time" value={timeDisplay} 
              iconColor="text-blue-600"
              styles={{ ...styles, boxBg: styles.kpi.time }}
              isDark={isDark}
              />
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <ProgressBar 
            label="Accuracy Rate" value={stats.accuracy} color={grade.color} 
            trackColor={styles.barTrack}
            styles={styles}
            isDark={isDark}
          />
          <ProgressBar 
            label="Completion Rate" value={stats.completionRate} color="#6366f1" 
            trackColor={styles.barTrack}
            styles={styles}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Footer */}
      <div className={`px-6 py-4 border-t ${styles.headerBorder} ${styles.subSectionBg}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${styles.textSecondary}`}>
                Avg Time/Q
              </span>
              <div className={`font-bold flex items-center gap-1.5 ${styles.textPrimary}`}>
                <FiActivity className="w-4 h-4 text-slate-400" />
                {avgTime}s
              </div>
            </div>
            
            <div className={`h-8 w-px mx-2 hidden sm:block ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`}></div>

            <div>
              <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${styles.textSecondary}`}>
                Flagged
              </span>
              <div className={`font-bold flex items-center gap-1.5 ${styles.textPrimary}`}>
                <FiAlertCircle className={`w-4 h-4 ${stats.flagged > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                {stats.flagged}
              </div>
            </div>
          </div>

          {/* Badge (Logic kept inline as it depends on pass/fail AND isDark) */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
            derivedIsPassed
              ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}>
              {derivedIsPassed ? 'Passed Exam' : 'Not Passed'}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;