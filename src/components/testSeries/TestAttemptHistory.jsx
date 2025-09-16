import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import TestHistoryHeader from '../progress/TestHistoryHeader';   
import TestHistoryStats from '../progress/TestHistoryStats';
import TestHistoryFilters from '../progress/TestHistoryFilters';
import TestSeriesList from '../progress/TestHistorySeriesList';
import TestHistoryEmpty from '../progress/TestHistoryEmpty';
import TestHistoryLoading from '../progress/TestHistoryLoading';

const TestAttemptHistory = ({ onBack, onViewAttempt }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState({});
  const [expandedTests, setExpandedTests] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'test-attempts'),
      where('userId', '==', currentUser.uid),
      orderBy('completedAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const attemptsData = [];
      querySnapshot.forEach((doc) => {
        attemptsData.push({ id: doc.id, ...doc.data() });
      });
      setAttempts(attemptsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const getCompletedDate = (attempt) => {
    const value = attempt?.completedAt;
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const groupedData = () => {
    const filtered = attempts.filter(attempt => {
      const matchesSearch = attempt.testTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attempt.testSeriesTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'ai') return matchesSearch && attempt.isAIGenerated;
      if (filter === 'manual') return matchesSearch && !attempt.isAIGenerated;
      if (filter === 'high-score') return matchesSearch && attempt.percentage >= 80;
      if (filter === 'low-score') return matchesSearch && attempt.percentage < 60;
      if (filter === 'recent-week') {
        const completedDate = getCompletedDate(attempt);
        if (!completedDate) return false;
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startWindow = new Date(startOfToday);
        startWindow.setDate(startWindow.getDate() - 6);
        return matchesSearch && completedDate >= startWindow && completedDate <= now;
      }
      
      return matchesSearch;
    });

    const seriesMap = {};
    filtered.forEach(attempt => {
      const seriesTitle = attempt.testSeriesTitle || 'Unknown Series';
      if (!seriesMap[seriesTitle]) {
        seriesMap[seriesTitle] = {};
      }
      
      const testTitle = attempt.testTitle || 'Unknown Test';
      if (!seriesMap[seriesTitle][testTitle]) {
        seriesMap[seriesTitle][testTitle] = [];
      }
      
      seriesMap[seriesTitle][testTitle].push(attempt);
    });

    Object.keys(seriesMap).forEach(seriesTitle => {
      Object.keys(seriesMap[seriesTitle]).forEach(testTitle => {
        seriesMap[seriesTitle][testTitle].sort((a, b) => {
          const dateA = getCompletedDate(a);
          const dateB = getCompletedDate(b);
          return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
        });
      });
    });

    return seriesMap;
  };

  const getStats = () => {
    if (attempts.length === 0) return { 
      avgScore: 0, 
      totalTests: 0, 
      bestScore: 0, 
      recentTrend: 0,
      totalTime: 0,
      streak: 0,
      improvement: 0
    };
    
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    const avgScore = Math.round(totalScore / attempts.length);
    const bestScore = Math.max(...attempts.map(attempt => attempt.percentage));
    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    
    const recent5 = attempts.slice(0, 5);
    const previous5 = attempts.slice(5, 10);
    const recentAvg = recent5.length > 0 ? recent5.reduce((sum, a) => sum + a.percentage, 0) / recent5.length : 0;
    const previousAvg = previous5.length > 0 ? previous5.reduce((sum, a) => sum + a.percentage, 0) / previous5.length : 0;
    const recentTrend = recentAvg - previousAvg;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < attempts.length; i++) {
      const attemptDate = attempts[i].completedAt?.toDate();
      if (attemptDate) {
        attemptDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - attemptDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return {
      avgScore,
      totalTests: attempts.length,
      bestScore,
      recentTrend: Math.round(recentTrend),
      totalTime: Math.round(totalTime / 60),
      streak,
      improvement: recentTrend
    };
  };

  const exportData = () => {
    const dataStr = JSON.stringify(attempts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `test-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleSeries = (seriesTitle) => {
    setExpandedSeries(prev => ({
      ...prev,
      [seriesTitle]: !prev[seriesTitle]
    }));
  };

  const toggleTest = (seriesTitle, testTitle) => {
    const key = `${seriesTitle}-${testTitle}`;
    setExpandedTests(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const stats = getStats();
  const groupedAttempts = groupedData();

  if (loading) {
    return <TestHistoryLoading />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-3">
        
        <TestHistoryHeader 
          onBack={onBack}
          showStatsDetails={showStatsDetails}
          setShowStatsDetails={setShowStatsDetails}
          exportData={exportData}
        />

        <TestHistoryStats 
          stats={stats}
          showStatsDetails={showStatsDetails}
        />

        <TestHistoryFilters
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
        />

        <div className="mt-4">
          <div className={`rounded-lg p-3 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {Object.keys(groupedAttempts).length > 0 ? (
              <TestSeriesList
                groupedAttempts={groupedAttempts}
                expandedSeries={expandedSeries}
                expandedTests={expandedTests}
                toggleSeries={toggleSeries}
                toggleTest={toggleTest}
                onViewAttempt={onViewAttempt}
              />
            ) : (
              <TestHistoryEmpty
                searchTerm={searchTerm}
                filter={filter}
                setSearchTerm={setSearchTerm}
                setFilter={setFilter}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAttemptHistory;
