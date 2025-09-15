import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { collection, addDoc, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SectionCard from './SectionCard';
import Header from '../layout/Header';         
import { v4 as uuidv4 } from 'uuid';
import { 
  FiPlus, 
  FiSave, 
  FiArrowLeft,
  FiAlertCircle,
  FiCheck,
  FiBookOpen,
  FiLock
} from 'react-icons/fi';

const SectionWiseQuizCreator = ({ onBack, onQuizCreated, testSeriesId }) => {
  const { currentUser, isAdmin, isCreator } = useAuth();
  const { isDark } = useTheme();
  
  // Theme mode function
  const mode = useCallback((light, dark) => (isDark ? dark : light), [isDark]);
  const [sections, setSections] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [testSeriesLoading, setTestSeriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasInitialized = useRef(false);

  // Clear errors when user starts typing
  const clearError = useCallback(() => {
    if (error) {
      setError('');
    }
  }, [error]);

  const addNewSection = useCallback(() => {
    const newSection = {
      id: uuidv4(),
      name: `Section ${sections.length + 1}`,
      description: '',
      questions: [],
      negativeMarking: {
        enabled: false,
        type: 'fractional',
        value: 0.25
      },
      positiveMarking: {
        enabled: false,
        type: 'fractional',
        value: 1.0
      },
      timeLimit: 30,
      difficulty: 'medium',
      isExpanded: true
    };
    setSections(prevSections => [...prevSections, newSection]);
  }, [sections.length]);

  // Initialize with a default section
  useEffect(() => {
    if (!hasInitialized.current && sections.length === 0) {
      hasInitialized.current = true;
      addNewSection();
    }
  }, [sections.length, addNewSection]);

  // Auto-load test series information when testSeriesId is provided
  useEffect(() => {
    const loadTestSeries = async () => {
      if (!testSeriesId || !currentUser?.uid) {
        return;
      }

      setTestSeriesLoading(true);
      setError('');

      try {
        const seriesRef = doc(db, 'test-series', testSeriesId);
        const seriesSnap = await getDoc(seriesRef);

        if (!seriesSnap.exists()) {
          setError('Test series not found. Please check the link and try again.');
          return;
        }

        const seriesData = seriesSnap.data();

        // Verify that the current user owns this test series
        if (seriesData.createdBy !== currentUser.uid) {
          setError('You do not have permission to create quizzes for this test series.');
          return;
        }

        setSelectedTestSeries({
          id: seriesSnap.id,
          ...seriesData
        });

        // Pre-fill quiz title with series context if empty
        if (!quizTitle.trim() && seriesData.title) {
          setQuizTitle(`${seriesData.title} - Section Quiz`);
        }

      } catch (error) {
        console.error('Error loading test series:', error);
        setError('Failed to load test series information. Please try again.');
      } finally {
        setTestSeriesLoading(false);
      }
    };

    loadTestSeries();
  }, [testSeriesId, currentUser?.uid]);

  const removeSection = useCallback((sectionId) => {
    if (sections.length > 1) {
      setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
    } else {
      setError('Cannot remove the last section. A quiz must have at least one section.');
    }
  }, [sections.length]);

  const updateSection = useCallback((sectionId, updates) => {
    setSections(prevSections => prevSections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  }, []);

  const addQuestionToSection = useCallback((sectionId) => {
    const newQuestion = {
      id: uuidv4(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      image: null,
      optionImages: ['', '', '', ''], // Option images array
      negativeMarking: {
        enabled: false,
        type: 'fractional',
        value: 0.25
      },
      positiveMarking: {
        enabled: false,
        type: 'fractional',
        value: 1.0
      }
    };

    setSections(prevSections => prevSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, newQuestion]
        };
      }
      return section;
    }));
  }, []);

  const removeQuestionFromSection = useCallback((sectionId, questionId) => {
    setSections(prevSections => prevSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  }, []);

  const updateQuestionInSection = useCallback((sectionId, questionId, updates) => {
    setSections(prevSections => prevSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  }, []);

  const createQuiz = async () => {
    // Clear previous errors
    setError('');
    setSuccess('');

    // Validate quiz title
    if (!quizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (quizTitle.trim().length < 3) {
      setError('Quiz title must be at least 3 characters long');
      return;
    }

    // Validate test series
    if (!testSeriesId || !selectedTestSeries) {
      setError('Test series information is required');
      return;
    }

    // Validate sections
    if (sections.length === 0) {
      setError('Please add at least one section');
      return;
    }

    // Validate that each section has at least one question
    for (const section of sections) {
      if (section.questions.length === 0) {
        setError(`Section "${section.name}" must have at least one question`);
        return;
      }
    }

    // Validate that all questions have required fields
    for (const section of sections) {
      for (const question of section.questions) {
        if (!question.question || !question.question.trim()) {
          setError(`Question in section "${section.name}" must have question text`);
          return;
        }
        if (!question.options || question.options.length < 2) {
          setError(`Question in section "${section.name}" must have at least 2 options`);
          return;
        }
        // Check for empty options
        const hasEmptyOptions = question.options.some(option => !option.trim());
        if (hasEmptyOptions) {
          setError(`Question in section "${section.name}" has empty options. Please fill all options.`);
          return;
        }
        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          setError(`Question in section "${section.name}" must have a correct answer selected`);
          return;
        }
        // Validate correct answer index
        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          setError(`Question in section "${section.name}" has an invalid correct answer selection`);
          return;
        }
      }
    }

    // Validate user authentication
    if (!currentUser) {
      setError('You must be logged in to create a quiz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const quizData = {
        title: quizTitle.trim(),
        description: quizDescription.trim() || '',
        sections: sections.map(section => ({
          id: section.id,
          name: section.name || '',
          description: section.description || '',
          questions: section.questions.map(q => ({
            id: q.id,
            question: q.question || '',
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || '',
            image: q.image || null,
            optionImages: q.optionImages || ['', '', '', ''], // Option images array
            negativeMarking: q.negativeMarking || {
              enabled: false,
              type: 'fractional',
              value: 0.25
            },
            positiveMarking: q.positiveMarking || {
              enabled: false,
              type: 'fractional',
              value: 1.0
            }
          })),
          negativeMarking: section.negativeMarking || {
            enabled: false,
            type: 'fractional',
            value: 0.25
          },
          positiveMarking: section.positiveMarking || {
            enabled: false,
            type: 'fractional',
            value: 1.0
          },
          timeLimit: section.timeLimit || 30,
          difficulty: section.difficulty || 'medium'
        })),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email || 'Anonymous',
        createdAt: serverTimestamp(),
        totalSections: sections.length,
        totalQuestions: sections.reduce((total, section) => total + (section.questions?.length || 0), 0),
        testSeriesId: testSeriesId,
        testSeriesTitle: selectedTestSeries.title,
        isPartOfSeries: true
      };

      // Validate data structure
      if (!quizData.title || quizData.title.length < 3) {
        throw new Error('Quiz title must be at least 3 characters long');
      }
      
      if (!quizData.sections || quizData.sections.length === 0) {
        throw new Error('Quiz must have at least one section');
      }

      if (!quizData.createdBy) {
        throw new Error('User authentication required');
      }

      if (!quizData.testSeriesId || !quizData.testSeriesTitle) {
        throw new Error('Test series information is required');
      }

      const docRef = await addDoc(collection(db, 'section-quizzes'), quizData);
      
      // Update the parent test series
      await updateDoc(doc(db, 'test-series', testSeriesId), {
        quizzes: arrayUnion(docRef.id),
        totalQuizzes: increment(1),
        updatedAt: serverTimestamp()
      });
      
      setSuccess('Section-wise quiz created successfully!');
      setTimeout(() => {
        onQuizCreated();
      }, 2000);
    } catch (error) {
      console.error('Error creating quiz:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your authentication status and try again.');
      } else if (error.code === 'unauthenticated') {
        setError('You must be logged in to create a quiz. Please refresh the page and try again.');
      } else if (error.code === 'invalid-argument') {
        setError('Invalid data format. Please check your quiz content and try again.');
      } else if (error.code === 'failed-precondition') {
        setError('Database operation failed. Please check your internet connection and try again.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Please try again in a few moments.');
      } else if (error.code === 'deadline-exceeded') {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (error.code === 'resource-exhausted') {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(`Failed to create quiz: ${error.message || 'An unexpected error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={`min-h-screen overflow-x-hidden sm:mt-20 py-4 sm:py-8 px-3 sm:px-6 pb-24 sm:pb-8 ${mode('bg-gradient-to-br from-slate-50 to-blue-50/20', 'bg-gradient-to-br from-gray-900 to-blue-900/10')}`}>
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Mobile Header */}
          <div className="sm:hidden mb-4">
            <div className="flex items-center gap-3 mb-4 min-w-0">
              <button
                onClick={onBack}
                className={`w-10 h-10 rounded-xl flex items-center hidden md:flex justify-center flex-shrink-0 ${mode('bg-white border border-slate-200 text-slate-600', 'bg-gray-800 border border-gray-700 text-gray-300')}`}
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className={`text-xl font-bold truncate ${mode('text-slate-800', 'text-white')}`}>
                  Section-Wise Quiz
                </h1>
                
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className={`hidden sm:block backdrop-blur-xl border rounded-3xl shadow-lg overflow-hidden mb-8 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/80 border-gray-700/60')}`}>
            <div className={`p-6 lg:p-8 border-b ${mode('border-slate-200/60', 'border-gray-700/60')}`}>
              <div className="flex items-center gap-6 mb-6 min-w-0">
                <button
                  onClick={onBack}
                  className={`border rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 flex-shrink-0 ${mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-700/60 border-gray-600/60 text-gray-300 hover:bg-gray-600/60')}`}
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FiSave className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className={`text-3xl lg:text-4xl font-bold truncate ${mode('text-slate-800', 'text-white')}`}>
                        Section-Wise Quiz Creator
                      </h1>
                      <p className={`text-base lg:text-lg ${mode('text-slate-600', 'text-gray-300')} mt-1 truncate`}>
                        Create comprehensive quizzes with multiple sections
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Selected Test Series Display */}
          {testSeriesId && (
            <div className={`backdrop-blur-xl border rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden mb-6 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/80 border-gray-700/60')}`}>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FiBookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {testSeriesLoading ? (
                        <div className="animate-pulse">
                          <div className={`h-4 sm:h-5 rounded mb-2 ${mode('bg-slate-200', 'bg-gray-700')}`}></div>
                          <div className={`h-3 sm:h-4 rounded w-3/4 ${mode('bg-slate-200', 'bg-gray-700')}`}></div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className={`text-xs ${mode('text-slate-500', 'text-gray-400')}`}>Loading test series...</span>
                          </div>
                        </div>
                      ) : selectedTestSeries ? (
                        <>
                          <h3 className={`text-base sm:text-lg font-bold truncate ${mode('text-slate-800', 'text-white')}`}>
                           {selectedTestSeries.title}
                          </h3>
                          
                          
                        </>
                      ) : (
                        <div className={`text-sm ${mode('text-slate-500', 'text-gray-400')}`}>
                          Loading test series information...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mode('bg-slate-100 text-slate-600', 'bg-gray-700 text-gray-300')}`}>
                      <FiLock className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium ${mode('text-slate-500', 'text-gray-400')} hidden sm:inline`}>
                      Auto-selected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Info Form */}
          <div className={`backdrop-blur-xl border rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden mb-6 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/80 border-gray-700/60')}`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => {
                      setQuizTitle(e.target.value);
                      clearError();
                    }}
                    placeholder="Enter quiz title..."
                    className={`w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-blue-500 text-base sm:text-lg font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-500')}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={quizDescription}
                    onChange={(e) => {
                      setQuizDescription(e.target.value);
                      clearError();
                    }}
                    placeholder="Describe the quiz..."
                    className={`w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-blue-500 text-base sm:text-lg font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-500')}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${mode('bg-red-50 border-red-200 text-red-700', 'bg-red-900/20 border-red-800/50 text-red-400')}`}>
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm sm:text-base font-medium">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${mode('bg-green-50 border-green-200 text-green-700', 'bg-green-900/20 border-green-800/50 text-green-400')}`}>
              <div className="flex items-start gap-3">
                <FiCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm sm:text-base font-medium">{success}</div>
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-4 sm:space-y-6">
            {sections.map((section, sectionIndex) => (
              <SectionCard
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                onUpdate={(updates) => updateSection(section.id, updates)}
                onRemove={() => removeSection(section.id)}
                onAddQuestion={() => addQuestionToSection(section.id)}
                onUpdateQuestion={(questionId, updates) => updateQuestionInSection(section.id, questionId, updates)}
                onRemoveQuestion={(questionId) => removeQuestionFromSection(section.id, questionId)}
              />
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12 flex-wrap">
            <button
              onClick={addNewSection}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-2xl px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-3 shadow-lg flex-shrink-0"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add New Section</span>
            </button>

            <button
              onClick={createQuiz}
              disabled={loading || !selectedTestSeries}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl px-8 sm:px-12 py-4 sm:py-5 flex items-center justify-center gap-3 text-lg sm:text-xl shadow-lg disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5 sm:w-7 sm:h-7" />
                  <span>Create Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-4 pt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 overflow-x-hidden">
          <div className="flex gap-3 min-w-0">
            <button
              onClick={addNewSection}
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 min-w-0"
            >
              <FiPlus className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Add Section</span>
            </button>
            <button
              onClick={createQuiz}
              disabled={loading || !selectedTestSeries}
              className="flex-[2] rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center gap-2 min-w-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span className="truncate">Creating...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Create Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionWiseQuizCreator;
