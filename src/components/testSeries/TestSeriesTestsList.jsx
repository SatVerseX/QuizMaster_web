import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiBookOpen,
  FiClock,
  FiPlay,
  FiTrendingUp,
  FiArrowLeft,
  FiTarget,
  FiUsers,
  FiStar,
  FiAward,
  FiActivity,
  FiCalendar,
  FiZap,
  FiAlertCircle
} from 'react-icons/fi';
import { FaRobot, FaGraduationCap } from 'react-icons/fa';

const TestSeriesTestsList = ({ testSeries, onBack, onTakeTest, onViewLeaderboard }) => {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!testSeries?.id) {
      setError('Test series ID is missing');
      setLoading(false);
      return;
    }

    const unsubscribe = loadTests();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [testSeries]);

  const loadTests = () => {
    console.log('Loading tests for series:', testSeries.id); // Debug log
    
    try {
      // First try without orderBy to see if that's causing issues
      const q = query(
        collection(db, 'quizzes'),
        where('testSeriesId', '==', testSeries.id)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('Firestore query results:', snapshot.size); // Debug log
          const testsData = [];
          
          snapshot.forEach(doc => {
            const testData = { id: doc.id, ...doc.data() };
            console.log('Test found:', testData.title); // Debug log
            testsData.push(testData);
          });
          
          // Sort by order field if it exists, otherwise by creation date
          testsData.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            if (a.createdAt && b.createdAt) {
              return a.createdAt.toDate() - b.createdAt.toDate();
            }
            return 0;
          });
          
          console.log('Final tests array:', testsData.length); // Debug log
          setTests(testsData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore query error:', err);
          setError(`Failed to load tests: ${err.message}`);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(`Query setup failed: ${err.message}`);
      setLoading(false);
      return null;
    }
  };

  // Alternative loading method using getDocs (for debugging)
  const loadTestsWithGetDocs = async () => {
    try {
      console.log('Trying getDocs method for series:', testSeries.id);
      
      const q = query(
        collection(db, 'quizzes'),
        where('testSeriesId', '==', testSeries.id)
      );
      
      const snapshot = await getDocs(q);
      console.log('getDocs results:', snapshot.size);
      
      const testsData = [];
      snapshot.forEach(doc => {
        const testData = { id: doc.id, ...doc.data() };
        console.log('Test found with getDocs:', testData.title);
        testsData.push(testData);
      });
      
      setTests(testsData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('getDocs error:', err);
      setError(`Alternative loading failed: ${err.message}`);
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-yellow-500 to-orange-500';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-64"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-700/30 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-8">
          <button
            onClick={onBack}
            className="group bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/40 text-gray-300 hover:text-white rounded-2xl px-4 py-3 transition-all duration-300 flex items-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Series
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <FaGraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200">
                {testSeries.title}
              </h1>
              <p className="text-gray-400 text-base sm:text-lg">All Available Tests • {tests.length} Tests</p>
            </div>
          </div>
        </div>
        {/* Error Display */}
        {error && (
          <div className="relative z-10 mb-8">
            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiAlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-red-300">Error Loading Tests</h3>
              </div>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  loadTests();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Series Stats */}
        <div className="relative z-10 mb-8">
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-3 sm:p-6 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <FiBookOpen className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-blue-300">{tests.length}</div>
                    <div className="text-sm text-blue-200">Total Tests</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <FiUsers className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-purple-300">{testSeries.totalSubscribers || 0}</div>
                    <div className="text-sm text-purple-200">Students</div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <FiClock className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="text-2xl font-bold text-emerald-300">{testSeries.estimatedDuration || 60}</div>
                    <div className="text-sm text-emerald-200">Total Minutes</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <FiStar className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-300">4.8</div>
                    <div className="text-sm text-yellow-200">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="relative z-10">
          {tests.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {tests.map((test, index) => (
                <div key={test.id} className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-4 sm:p-8 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.01] hover:border-blue-500/30 overflow-hidden">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    {/* Test Number */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-lg sm:text-2xl font-black text-white">{index + 1}</span>
                      </div>
                    </div>

                    {/* Test Info */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-blue-200 transition-colors truncate max-w-[220px] sm:max-w-none">
                              {test.title}
                            </h3>
                            {test.isAIGenerated && (
                              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                                <FaRobot className="w-3 h-3" />
                                AI Generated
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 leading-relaxed mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                            {test.description || 'Comprehensive test to evaluate your knowledge and skills.'}
                          </p>
                        </div>

                        {/* Difficulty Badge */}
                        <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-xl bg-gradient-to-r ${getDifficultyColor(test.difficulty)} text-white font-bold text-xs sm:text-sm shadow-lg flex-shrink-0 mt-2 sm:mt-0`}>
                          {test.difficulty?.toUpperCase() || 'MEDIUM'}
                        </div>
                      </div>

                      {/* Test Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                          <FiTarget className="w-4 h-4 text-blue-400" />
                          <span className="text-xs sm:text-sm">
                            <strong className="text-white">{test.questions?.length || 0}</strong> Questions
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                          <FiClock className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs sm:text-sm">
                            <strong className="text-white">{test.timeLimit || 0}</strong> Minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                          <FiActivity className="w-4 h-4 text-purple-400" />
                          <span className="text-xs sm:text-sm">
                            <strong className="text-white">{test.totalAttempts || 0}</strong> Attempts
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                          <FiCalendar className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs sm:text-sm">
                            <strong className="text-white">{formatDate(test.createdAt)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                        <button
                          onClick={() => onTakeTest && onTakeTest(test, testSeries)}
                          className="group/btn relative w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-4 sm:py-4 sm:px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                            <FiPlay className="w-5 h-5" />
                            <span className="text-base sm:text-lg">Take Test Now</span>
                            <FiZap className="w-4 h-4" />
                          </div>
                        </button>
                        <button
                          onClick={() => onViewLeaderboard && onViewLeaderboard(test)}
                          className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-600/30 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 font-bold"
                        >
                          <FiTrendingUp className="w-5 h-5" />
                          <span>Leaderboard</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-20">
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 backdrop-blur-xl border border-blue-500/30">
                <FiBookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">No Tests Available</h3>
              <p className="text-base sm:text-xl text-gray-400 mb-4 sm:mb-8">
                This test series doesn't have any tests yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSeriesTestsList;
