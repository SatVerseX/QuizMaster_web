import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiTarget, FiClock, FiTrendingUp, FiAward, FiCheckCircle, 
  FiXCircle, FiMinus, FiFlag, FiBarChart2, FiUsers 
} from 'react-icons/fi';

const PerformanceOverview = ({ attempt, questionAnalysis }) => {
  const { isDark } = useTheme();
  
  // Calculate overall stats
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
  
  // Check if it's a section-wise quiz
  const isSectionWise = questionAnalysis.some(q => q.sectionId);
  const sectionCount = isSectionWise ? new Set(questionAnalysis.map(q => q.sectionId)).size : 0;
  
  const StatCard = ({ icon: Icon, label, value, color, subtitle, trend }) => (
    <div className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
      isDark 
        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
        : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend > 0 
              ? 'text-green-600 bg-green-100' 
              : trend < 0 
              ? 'text-red-600 bg-red-100' 
              : 'text-gray-600 bg-gray-100'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className={`text-2xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {value}
        </div>
        <div className={`text-sm font-medium ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </div>
        {subtitle && (
          <div className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
  
  const getGradeInfo = (percentage) => {
    if (isDark) {
      if (percentage >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40' };
      if (percentage >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40' };
      if (percentage >= 70) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' };
      if (percentage >= 60) return { grade: 'C', color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/40' };
      return { grade: 'D', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' };
    } else {
      if (percentage >= 90) return { grade: 'A+', color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
      if (percentage >= 80) return { grade: 'A', color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
      if (percentage >= 70) return { grade: 'B', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
      if (percentage >= 60) return { grade: 'C', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
      return { grade: 'D', color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
    }
  };
  
  const gradeInfo = getGradeInfo(attempt.percentage || stats.accuracy);
  
  const MetricRow = ({ label, value, color, icon: Icon }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />}
        <span className={`text-sm font-medium ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </span>
      </div>
      <span className={`text-sm font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
  
  return (
    <div className="space-y-4">
      {/* Overall Performance Card */}
      <div className={`border rounded-xl p-5 ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <FiTarget className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Overall Performance
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isSectionWise ? `Section-wise quiz • ${sectionCount} sections` : 'Standard quiz format'}
            </p>
          </div>
        </div>
        
        {/* Grade Display */}
        <div className="text-center mb-6">
          <div className={`inline-flex flex-col items-center p-6 rounded-2xl border ${gradeInfo.bg}`}>
            <div className={`text-4xl font-bold mb-2 ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </div>
            <div className={`text-2xl font-bold mb-1 ${gradeInfo.color}`}>
              {(attempt.percentage || stats.accuracy).toFixed(1)}%
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Overall Score
            </div>
          </div>
        </div>
        
        {/* Progress Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Accuracy Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Accuracy
              </span>
              <span className={`text-sm font-bold ${
                stats.accuracy >= 80 ? 'text-green-500' : 
                stats.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {stats.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.accuracy >= 80 ? 'bg-green-500' : 
                  stats.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Completion Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Completion
              </span>
              <span className={`text-sm font-bold ${
                stats.completionRate >= 90 ? 'text-green-500' : 
                stats.completionRate >= 70 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {stats.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.completionRate >= 90 ? 'bg-green-500' : 
                  stats.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={FiCheckCircle}
            label="Correct"
            value={stats.correct}
            color={isDark ? "bg-green-600" : "bg-green-600"}
            subtitle={`${((stats.correct / stats.total) * 100).toFixed(1)}%`}
          />
          <StatCard
            icon={FiXCircle}
            label="Incorrect"
            value={stats.incorrect}
            color={isDark ? "bg-red-600" : "bg-red-600"}
            subtitle={`${((stats.incorrect / stats.total) * 100).toFixed(1)}%`}
          />
          <StatCard
            icon={FiMinus}
            label="Skipped"
            value={stats.skipped}
            color={isDark ? "bg-gray-600" : "bg-gray-600"}
            subtitle={`${((stats.skipped / stats.total) * 100).toFixed(1)}%`}
          />
          <StatCard
            icon={FiFlag}
            label="Flagged"
            value={stats.flagged}
            color={isDark ? "bg-yellow-600" : "bg-yellow-600"}
            subtitle="Review needed"
          />
        </div>
      </div>
      
      {/* Detailed Metrics Card */}
      <div className={`border rounded-xl p-5 ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-purple-600' : 'bg-purple-600'
          }`}>
            <FiBarChart2 className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-lg font-bold ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Detailed Metrics
          </h3>
        </div>
        
        <div className={`divide-y ${
          isDark ? 'divide-gray-700' : 'divide-gray-200'
        }`}>
          <MetricRow
            icon={FiTarget}
            label="Accuracy Rate"
            value={`${stats.accuracy.toFixed(1)}%`}
            color={stats.accuracy >= 80 ? 'text-green-500' : stats.accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}
          />
          
          <MetricRow
            icon={FiTrendingUp}
            label="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            color={stats.completionRate >= 90 ? 'text-green-500' : stats.completionRate >= 70 ? 'text-yellow-500' : 'text-red-500'}
          />
          
          <MetricRow
            icon={FiClock}
            label="Time Spent"
            value={`${Math.floor((attempt.timeSpent || 0) / 60)}m ${(attempt.timeSpent || 0) % 60}s`}
            color={isDark ? 'text-blue-400' : 'text-blue-600'}
          />
          
          <MetricRow
            icon={FiAward}
            label="Average per Question"
            value={`${stats.total > 0 ? ((attempt.timeSpent || 0) / stats.total).toFixed(1) : 0}s`}
            color={isDark ? 'text-purple-400' : 'text-purple-600'}
          />
          
          {isSectionWise && (
            <MetricRow
              icon={FiUsers}
              label="Total Sections"
              value={sectionCount.toString()}
              color={isDark ? 'text-indigo-400' : 'text-indigo-600'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;
