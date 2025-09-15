import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc, arrayUnion, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiPlus, 
  FiTrash2, 
 
  FiArrowLeft,
  FiBookOpen,
  FiCheck,

  FiHelpCircle,
  FiClock,
  FiTarget,
  FiLayers,
  FiTrendingUp,
  FiChevronRight,
  FiZap,
  FiStar,
  FiList,
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiSmartphone,
  FiMonitor
} from 'react-icons/fi';
import { FaMagic, FaGraduationCap, FaBrain, FaMobile, FaDesktop } from 'react-icons/fa';

const TestSeriesQuizCreator = ({ testSeries, onBack, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'questions', 'preview'
  
  // Theme mode function similar to WelcomePage
  const mode = (light, dark) => (isDark ? dark : light);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      negativeMarking: {
        enabled: false,
        type: 'fractional',
        value: 0.25
      }
    }],
    timeLimit: 30, // minutes
    difficulty: 'medium',
    negativeMarking: {
      enabled: false,
      type: 'fractional', // 'fractional' or 'fixed'
      value: 0.25 // For fractional: 0.25 means 1/4th mark deduction, For fixed: 0.25 means 0.25 marks deduction
    }
  });

  const handleInputChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        negativeMarking: {
          enabled: false,
          type: 'fractional',
          value: 0.25
        }
      }]
    }));
    setActiveTab('questions');
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizData.title.trim()) {
      showError('Quiz title is required!', 'Validation Error');
      return;
    }

    if (quizData.questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
      showError('All questions and options must be filled!', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      // Create quiz document
      const quizDocument = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions,
        timeLimit: quizData.timeLimit,
        difficulty: quizData.difficulty,
        negativeMarking: quizData.negativeMarking,
        
        // Test Series linking
        testSeriesId: testSeries.id,
        testSeriesTitle: testSeries.title,
        
        // Creator info
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        
        // Quiz settings
        isPartOfSeries: true,
        isPaid: false, // Individual quizzes in series are not paid
        totalQuestions: quizData.questions.length,
        
        // Stats
        totalAttempts: 0,
        averageScore: 0
      };

      // Add quiz to database
      const docRef = await addDoc(collection(db, 'quizzes'), quizDocument);

      // Update test series with new quiz
      await updateDoc(doc(db, 'test-series', testSeries.id), {
        quizzes: arrayUnion(docRef.id),
        totalQuizzes: increment(1),
        updatedAt: serverTimestamp()
      });

      showSuccess('Test created successfully!', 'Success');
      
      setTimeout(() => {
      onQuizCreated({
        id: docRef.id,
        ...quizDocument
      });
      }, 1500);

    } catch (error) {
      console.error('Error creating quiz:', error);
      showError('Failed to create quiz. Please try again.', 'Creation Error');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { bg: 'from-emerald-500 to-green-600', text: 'emerald', emoji: '🟢' };
      case 'hard': return { bg: 'from-red-500 to-red-600', text: 'red', emoji: '🔴' };
      default: return { bg: 'from-yellow-500 to-orange-600', text: 'yellow', emoji: '🟡' };
    }
  };

  const getCompletionStats = () => {
    const totalFields = 1 + quizData.questions.length * 5; // title + (question + 4 options) per question
    const filledFields = (quizData.title ? 1 : 0) + 
      quizData.questions.reduce((acc, q) => 
        acc + (q.question ? 1 : 0) + q.options.filter(opt => opt.trim()).length, 0
      );
    return Math.round((filledFields / totalFields) * 100);
  };

  const renderMobileHeader = () => (
    <div className="lg:hidden relative z-10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className={mode(
            "group bg-white backdrop-blur-xl border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-all duration-300 flex items-center gap-2 shadow-sm",
            "group bg-gray-800/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-700/80 transition-all duration-300 flex items-center gap-2"
          )}
        >
          <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
        
        <div className={mode(
          "flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200",
          "flex items-center gap-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30"
        )}>
          <FiTarget className={mode("w-4 h-4 text-blue-600", "w-4 h-4 text-blue-400")} />
          <span className={mode("text-blue-700 font-bold text-sm", "text-blue-300 font-bold text-sm")}>{getCompletionStats()}%</span>
        </div>
        </div>

      <h1 className={mode(
        "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 mb-2",
        "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-2"
      )}>
        Create Test
      </h1>
      <p className={mode("text-slate-600 text-sm flex items-center gap-2", "text-gray-400 text-sm flex items-center gap-2")}>
        <FaGraduationCap className={mode("w-4 h-4 text-blue-600", "w-4 h-4 text-blue-400")} />
        Adding to <span className={mode("text-blue-600 font-semibold", "text-blue-400 font-semibold")}>"{testSeries.title}"</span>
      </p>
    </div>
  );

  const renderDesktopHeader = () => (
    <div className="hidden lg:block relative z-10 mb-12">
      <div className="flex items-center gap-6 mb-8">
          <button
            onClick={onBack}
          className={mode(
            "group bg-white backdrop-blur-xl border border-slate-200 text-slate-600 rounded-xl px-6 py-3 text-sm font-medium hover:bg-slate-50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105",
            "group bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-6 py-3 text-sm font-medium hover:from-gray-700/80 hover:to-gray-600/80 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
          )}
          >
            <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Series</span>
          </button>
          
          <div className="flex-1">
          <h1 className={mode(
            "text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 mb-3 leading-tight",
            "text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-3 leading-tight"
          )}>
              Create Test
            </h1>
          <p className={mode("text-xl text-slate-600 flex items-center gap-3", "text-xl text-gray-400 flex items-center gap-3")}>
            <FaGraduationCap className={mode("w-6 h-6 text-blue-600", "w-6 h-6 text-blue-400")} />
              Adding new test to{' '}
            <span className={mode("text-blue-600 font-semibold px-3 py-1 bg-blue-100 rounded-lg", "text-blue-400 font-semibold px-3 py-1 bg-blue-500/20 rounded-lg")}>
                "{testSeries.title}"
              </span>
            </p>
          </div>

          {/* Progress Indicator */}
        <div className={mode(
          "flex items-center gap-4 px-6 py-3 bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-lg",
          "flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 rounded-xl shadow-lg"
        )}>
          <FiTarget className={mode("w-5 h-5 text-blue-600", "w-5 h-5 text-blue-400")} />
            <div>
            <div className={mode("text-sm text-slate-600 font-medium", "text-sm text-gray-300 font-medium")}>Completion</div>
            <div className={mode("text-blue-600 font-bold", "text-blue-400 font-bold")}>{getCompletionStats()}%</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileTabs = () => (
    <div className="lg:hidden relative z-10 mb-6">
      <div className={mode(
        "bg-white backdrop-blur-xl border border-slate-200 rounded-xl p-1 shadow-sm",
        "bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-1"
      )}>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'info', label: 'Info', icon: FiBookOpen },
            { id: 'questions', label: 'Questions', icon: FaBrain },
            { id: 'preview', label: 'Preview', icon: FiEye }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : mode(
                        'text-slate-600 hover:text-slate-700 hover:bg-slate-100',
                        'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                      )
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDesktopTabs = () => (
    <div className="hidden lg:block relative z-10 mb-8">
      <div className={mode(
        "bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-2 shadow-lg",
        "bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-2"
      )}>
        <div className="flex gap-2">
          {[
            { id: 'info', label: 'Test Information', icon: FiBookOpen, desc: 'Configure test details and settings' },
            { id: 'questions', label: 'Questions & Options', icon: FaBrain, desc: 'Add and edit test questions' },
            { id: 'preview', label: 'Preview & Review', icon: FiEye, desc: 'Review your test before creation' }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex-1 flex flex-col items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                    : mode(
                        'text-slate-600 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200',
                        'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 border border-transparent hover:border-gray-600'
                      )
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                  activeTab === tab.id ? 'text-white' : mode('text-slate-500', 'text-gray-500')
                }`} />
                <div className="text-center">
                  <div className="font-bold text-sm mb-1">{tab.label}</div>
                  <div className={`text-xs opacity-80 ${activeTab === tab.id ? 'text-white' : mode('text-slate-500', 'text-gray-500')}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTestInfo = () => (
    <div className={mode(
      "relative z-10 bg-white backdrop-blur-xl border border-slate-200 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 shadow-xl",
      "relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 shadow-2xl"
    )}>
      <div className={mode(
        "absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl lg:rounded-3xl",
        "absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl lg:rounded-3xl"
      )}></div>
          <div className="relative">
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
          <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl shadow-lg">
            <FiBookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
            <h3 className={mode("text-2xl lg:text-3xl font-bold text-slate-800 mb-2", "text-2xl lg:text-3xl font-bold text-white mb-2")}>Test Information</h3>
            <p className={mode("text-slate-600 text-sm lg:text-lg", "text-gray-400 text-sm lg:text-lg")}>Configure your test details and settings</p>
              </div>
            </div>
            
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
              <div className="space-y-3">
            <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
              <FiEdit3 className={mode("w-4 h-4 text-blue-600", "w-4 h-4 text-blue-400")} />
              Test Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Chapter 1: Basic Concepts"
                    value={quizData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                className={mode(
                  "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-white backdrop-blur-sm border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base",
                  "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base"
                )}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {quizData.title ? (
                  <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
                    ) : (
                  <FiAlertCircle className={mode("w-4 h-4 lg:w-5 lg:h-5 text-slate-400", "w-4 h-4 lg:w-5 lg:h-5 text-gray-500")} />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
            <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
              <FiClock className={mode("w-4 h-4 text-emerald-600", "w-4 h-4 text-emerald-400")} />
                  Time Limit (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={quizData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 30)}
                className={mode(
                  "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-white backdrop-blur-sm border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base",
                  "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base"
                )}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <FiClock className={mode("w-4 h-4 lg:w-5 lg:h-5 text-slate-400", "w-4 h-4 lg:w-5 lg:h-5 text-gray-500")} />
                  </div>
                </div>
              </div>

              {/* Negative Marking Section */}
              <div className="space-y-3">
                <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
                  <FiAlertCircle className={mode("w-4 h-4 text-red-600", "w-4 h-4 text-red-400")} />
                  Negative Marking
                </label>
                
                <div className="space-y-4">
                  {/* Enable/Disable Toggle */}
                  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${mode(
                    "bg-white border-slate-200",
                    "bg-gray-800/60 border-gray-600/40"
                  )}`}>
                    <div className="flex items-center gap-3">
                      <div className={mode(
                        "w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center",
                        "w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center"
                      )}>
                        <FiAlertCircle className={mode("w-5 h-5 text-red-600", "w-5 h-5 text-red-400")} />
                      </div>
                      <div>
                        <div className={mode("font-semibold text-slate-800", "font-semibold text-gray-200")}>
                          Enable Negative Marking
                        </div>
                        <div className={mode("text-sm text-slate-600", "text-sm text-gray-400")}>
                          Deduct marks for wrong answers
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('negativeMarking', {
                        ...quizData.negativeMarking,
                        enabled: !quizData.negativeMarking.enabled
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        quizData.negativeMarking.enabled
                          ? 'bg-red-500'
                          : mode('bg-slate-200', 'bg-gray-600')
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          quizData.negativeMarking.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Negative Marking Settings */}
                  {quizData.negativeMarking.enabled && (
                    <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${mode(
                      "bg-slate-50 border-slate-200",
                      "bg-gray-700/40 border-gray-600/40"
                    )}`}>
                      {/* Type Selection */}
                      <div>
                        <label className={mode("block text-sm font-medium text-slate-700 mb-2", "block text-sm font-medium text-gray-300 mb-2")}>
                          Marking Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'fractional', label: 'Fractional', description: '1/4th mark deduction' },
                            { value: 'fixed', label: 'Fixed', description: 'Fixed mark deduction' }
                          ].map(type => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => handleInputChange('negativeMarking', {
                                ...quizData.negativeMarking,
                                type: type.value
                              })}
                              className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                                quizData.negativeMarking.type === type.value
                                  ? mode('bg-red-50 border-red-300 text-red-700', 'bg-red-500/20 border-red-400 text-red-300')
                                  : mode('bg-white border-slate-200 text-slate-700 hover:bg-slate-50', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                              }`}
                            >
                              <div className="font-semibold">{type.label}</div>
                              <div className="text-xs opacity-75">{type.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Value Input */}
                      <div>
                        <label className={mode("block text-sm font-medium text-slate-700 mb-2", "block text-sm font-medium text-gray-300 mb-2")}>
                          {quizData.negativeMarking.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={quizData.negativeMarking.value}
                            onChange={(e) => handleInputChange('negativeMarking', {
                              ...quizData.negativeMarking,
                              value: parseFloat(e.target.value) || 0.25
                            })}
                            className={mode(
                              "w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300",
                              "w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                            )}
                            placeholder={quizData.negativeMarking.type === 'fractional' ? "0.25" : "0.25"}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                            {quizData.negativeMarking.type === 'fractional' ? 'fraction' : 'marks'}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {quizData.negativeMarking.type === 'fractional' 
                            ? `For each wrong answer, ${quizData.negativeMarking.value} marks will be deducted`
                            : `For each wrong answer, ${quizData.negativeMarking.value} marks will be deducted`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

        <div className="mb-6 lg:mb-8 space-y-3">
          <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
            <FiList className={mode("w-4 h-4 text-purple-600", "w-4 h-4 text-purple-400")} />
                Description
              </label>
              <textarea
                placeholder="Brief description of this test..."
                value={quizData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
            className={mode(
              "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-white backdrop-blur-sm border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base h-24 lg:h-32 resize-none",
              "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base h-24 lg:h-32 resize-none"
            )}
                rows="3"
              />
            </div>

            <div className="space-y-3">
          <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
            <FiTrendingUp className={mode("w-4 h-4 text-orange-600", "w-4 h-4 text-orange-400")} />
                Difficulty Level
              </label>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
                {[
                  { value: 'easy', label: 'Easy', color: getDifficultyColor('easy') },
                  { value: 'medium', label: 'Medium', color: getDifficultyColor('medium') },
                  { value: 'hard', label: 'Hard', color: getDifficultyColor('hard') }
                ].map(diff => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => handleInputChange('difficulty', diff.value)}
                className={`group relative p-4 lg:p-6 rounded-xl lg:rounded-2xl text-center font-bold transition-all duration-300 ${
                      quizData.difficulty === diff.value
                    ? `bg-gradient-to-r ${diff.color.bg} text-white shadow-xl lg:shadow-2xl scale-105`
                    : mode(
                        'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-102 border border-slate-200',
                        'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102'
                      )
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${diff.color.bg} rounded-xl lg:rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    <div className="relative">
                  <div className="text-2xl lg:text-3xl mb-1 lg:mb-2">{diff.color.emoji}</div>
                  <div className="text-sm lg:text-lg">{diff.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
  );

  const renderQuestions = () => (
    <div className={mode(
      "relative z-10 bg-white backdrop-blur-xl border border-slate-200 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 shadow-xl",
      "relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 shadow-2xl"
    )}>
      <div className={mode(
        "absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl lg:rounded-3xl",
        "absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl lg:rounded-3xl"
      )}></div>
          <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-10">
              <div className="flex items-center gap-4">
            <div className={mode(
              "p-3 lg:p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl lg:rounded-2xl shadow-md",
              "p-3 lg:p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl lg:rounded-2xl shadow-lg"
            )}>
              <FaBrain className={mode("w-6 h-6 lg:w-8 lg:h-8 text-purple-700", "w-6 h-6 lg:w-8 lg:h-8 text-white")} />
                </div>
                <div>
              <h3 className={mode("text-2xl lg:text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3", "text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3")}>
                    Questions ({quizData.questions.length})
                  </h3>
              <p className={mode("text-slate-600 text-sm lg:text-lg", "text-gray-400 text-sm lg:text-lg")}>Create engaging questions for your test</p>
                </div>
              </div>
              
              <button
                onClick={addQuestion}
            className="group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl lg:rounded-2xl px-6 lg:px-8 py-3 lg:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25 w-full lg:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-xl lg:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center lg:justify-start gap-3">
              <FiPlus className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Add Question</span>
                </div>
              </button>
            </div>

        <div className="space-y-6 lg:space-y-10">
              {quizData.questions.map((question, qIndex) => (
            <div key={qIndex} className={mode(
              "group relative bg-white backdrop-blur-xl border border-slate-200 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.01] hover:border-purple-300",
              "group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-600/30 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-purple-500/30"
            )}>
              <div className={mode(
                "absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              )}></div>
                  
                  <div className="relative">
                    {/* Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                    <div className={mode(
                      "w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg lg:rounded-xl flex items-center justify-center font-bold text-purple-700 text-base lg:text-lg shadow-md",
                      "w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg lg:rounded-xl flex items-center justify-center font-bold text-white text-base lg:text-lg shadow-lg"
                    )}>
                          {qIndex + 1}
                        </div>
                    <h4 className={mode("text-xl lg:text-2xl font-bold text-slate-800", "text-xl lg:text-2xl font-bold text-white")}>
                          Question {qIndex + 1}
                        </h4>
                      </div>
                      
                      {quizData.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIndex)}
                      className={mode(
                        "group/btn p-2 lg:p-3 bg-red-100 hover:bg-red-200 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-110 self-start sm:self-auto",
                        "group/btn p-2 lg:p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-110 self-start sm:self-auto"
                      )}
                          title="Delete Question"
                        >
                      <FiTrash2 className={mode("w-4 h-4 lg:w-5 lg:h-5 text-red-600 group-hover/btn:text-red-700", "w-4 h-4 lg:w-5 lg:h-5 text-red-400 group-hover/btn:text-red-300")} />
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                <div className="mb-6 lg:mb-8 space-y-3">
                  <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
                    <FiHelpCircle className={mode("w-4 h-4 text-purple-600", "w-4 h-4 text-purple-400")} />
                    Question Text <span className={mode("text-red-500", "text-red-400")}>*</span>
                      </label>
                      <textarea
                        placeholder="Enter your question here..."
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className={mode(
                      "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-slate-50 backdrop-blur-sm border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base h-20 lg:h-24 resize-none",
                      "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base h-20 lg:h-24 resize-none"
                    )}
                        rows="3"
                      />
                    </div>

                    {/* Options */}
                <div className="mb-6 lg:mb-8 space-y-3">
                  <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
                    <FiCheckCircle className={mode("w-4 h-4 text-emerald-600", "w-4 h-4 text-emerald-400")} />
                    Answer Options <span className={mode("text-red-500", "text-red-400")}>*</span>
                      </label>
                  <div className="space-y-3 lg:space-y-4">
                        {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3 lg:gap-4">
                        <div className="relative flex-shrink-0">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                            className={mode(
                              "w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500 focus:ring-2",
                              "w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 bg-gray-700 border-gray-600 focus:ring-emerald-500 focus:ring-2"
                            )}
                              />
                              {question.correctAnswer === oIndex && (
                            <div className={mode(
                              "absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse",
                              "absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse"
                            )}></div>
                              )}
                            </div>
                            
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                value={option}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className={mode(
                              `w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl backdrop-blur-sm border text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base ${
                                question.correctAnswer === oIndex 
                                  ? 'border-emerald-500/40 bg-emerald-50 focus:ring-emerald-500' 
                                  : 'border-slate-300 bg-slate-50 focus:ring-blue-500'
                              }`,
                              `w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl backdrop-blur-sm border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base ${
                                  question.correctAnswer === oIndex 
                                    ? 'border-emerald-500/40 bg-emerald-500/10 focus:ring-emerald-500' 
                                    : 'border-gray-600/40 bg-gray-900/60 focus:ring-blue-500'
                              }`
                            )}
                              />
                              {question.correctAnswer === oIndex && (
                            <FiCheck className={mode("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-emerald-500", "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-emerald-400")} />
                              )}
                          <div className={mode(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600",
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 bg-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400"
                          )}>
                                {String.fromCharCode(65 + oIndex)}
                              </div>
                          <div className="pl-12 lg:pl-14"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                  <p className={mode("text-xs lg:text-sm text-slate-500 flex items-center gap-2 mt-3 lg:mt-4", "text-xs lg:text-sm text-gray-500 flex items-center gap-2 mt-3 lg:mt-4")}>
                    <FiTarget className={mode("w-3 h-3 lg:w-4 lg:h-4 text-slate-500", "w-3 h-3 lg:w-4 lg:h-4")} />
                        Select the radio button next to the correct answer
                      </p>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-3">
                  <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
                    <FiStar className={mode("w-4 h-4 text-yellow-600", "w-4 h-4 text-yellow-400")} />
                        Explanation (Optional)
                      </label>
                      <textarea
                        placeholder="Explain why this is the correct answer..."
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className={mode(
                      "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-slate-50 backdrop-blur-sm border border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base h-16 lg:h-20 resize-none",
                      "w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 font-medium text-sm lg:text-base h-16 lg:h-20 resize-none"
                    )}
                        rows="2"
                      />
                    </div>

                    {/* Individual Question Negative Marking */}
                    <div className="space-y-3">
                      <label className={mode("flex items-center gap-2 text-sm font-semibold text-slate-700", "flex items-center gap-2 text-sm font-semibold text-gray-300")}>
                        <FiAlertCircle className={mode("w-4 h-4 text-red-600", "w-4 h-4 text-red-400")} />
                        Question-Specific Negative Marking
                      </label>
                      
                      <div className="space-y-4">
                        {/* Enable/Disable Toggle */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${mode(
                          "bg-slate-50 border-slate-200",
                          "bg-gray-700/40 border-gray-600/40"
                        )}`}>
                          <div className="flex items-center gap-3">
                            <div className={mode(
                              "w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center",
                              "w-8 h-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center"
                            )}>
                              <FiAlertCircle className={mode("w-4 h-4 text-red-600", "w-4 h-4 text-red-400")} />
                            </div>
                            <div>
                              <div className={mode("font-semibold text-slate-800", "font-semibold text-gray-200")}>
                                Override Global Setting
                              </div>
                              <div className={mode("text-sm text-slate-600", "text-sm text-gray-400")}>
                                Set specific negative marking for this question
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuestionChange(qIndex, 'negativeMarking', {
                              ...question.negativeMarking,
                              enabled: !question.negativeMarking.enabled
                            })}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                              question.negativeMarking.enabled
                                ? 'bg-red-500'
                                : mode('bg-slate-200', 'bg-gray-600')
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                question.negativeMarking.enabled ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Question-Specific Negative Marking Settings */}
                        {question.negativeMarking.enabled && (
                          <div className={`space-y-4 p-4 rounded-lg border transition-all duration-300 ${mode(
                            "bg-red-50 border-red-200",
                            "bg-red-500/10 border-red-400/30"
                          )}`}>
                            {/* Type Selection */}
                            <div>
                              <label className={mode("block text-sm font-medium text-slate-700 mb-2", "block text-sm font-medium text-gray-300 mb-2")}>
                                Marking Type
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { value: 'fractional', label: 'Fractional', description: '1/4th mark deduction' },
                                  { value: 'fixed', label: 'Fixed', description: 'Fixed mark deduction' }
                                ].map(type => (
                                  <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleQuestionChange(qIndex, 'negativeMarking', {
                                      ...question.negativeMarking,
                                      type: type.value
                                    })}
                                    className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                                      question.negativeMarking.type === type.value
                                        ? mode('bg-red-100 border-red-300 text-red-700', 'bg-red-500/20 border-red-400 text-red-300')
                                        : mode('bg-white border-slate-200 text-slate-700 hover:bg-slate-50', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                                    }`}
                                  >
                                    <div className="font-semibold">{type.label}</div>
                                    <div className="text-xs opacity-75">{type.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Value Input */}
                            <div>
                              <label className={mode("block text-sm font-medium text-slate-700 mb-2", "block text-sm font-medium text-gray-300 mb-2")}>
                                {question.negativeMarking.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={question.negativeMarking.value}
                                  onChange={(e) => handleQuestionChange(qIndex, 'negativeMarking', {
                                    ...question.negativeMarking,
                                    value: parseFloat(e.target.value) || 0.25
                                  })}
                                  className={mode(
                                    "w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300",
                                    "w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                                  )}
                                  placeholder={question.negativeMarking.type === 'fractional' ? "0.25" : "0.25"}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                  {question.negativeMarking.type === 'fractional' ? 'fraction' : 'marks'}
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {question.negativeMarking.type === 'fractional' 
                                  ? `For this question, ${question.negativeMarking.value} marks will be deducted for wrong answers`
                                  : `For this question, ${question.negativeMarking.value} marks will be deducted for wrong answers`
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );

  const renderPreview = () => (
    <div className="relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl lg:rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
          <div className="p-3 lg:p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl lg:rounded-2xl shadow-lg">
            <FiEye className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Test Preview</h3>
            <p className="text-gray-400 text-sm lg:text-lg">Review your test before creating</p>
          </div>
        </div>

        {/* Test Summary */}
        <div className="bg-gray-800/40 rounded-xl lg:rounded-2xl p-6 lg:p-8 mb-6 lg:mb-8">
          <h4 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">{quizData.title || 'Untitled Test'}</h4>
          {quizData.description && (
            <p className="text-gray-300 text-sm lg:text-base mb-4 lg:mb-6">{quizData.description}</p>
          )}
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <FiLayers className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl lg:text-3xl font-bold text-blue-300">{quizData.questions.length}</div>
              <div className="text-xs lg:text-sm text-blue-200">Questions</div>
            </div>
            
            <div className="text-center p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <FiClock className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl lg:text-3xl font-bold text-emerald-300">{quizData.timeLimit}</div>
              <div className="text-xs lg:text-sm text-emerald-200">Minutes</div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <FiTrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl lg:text-3xl font-bold text-purple-300">{getDifficultyColor(quizData.difficulty).emoji}</div>
              <div className="text-xs lg:text-sm text-purple-200 capitalize">{quizData.difficulty}</div>
            </div>
            
            <div className="text-center p-4 bg-orange-500/20 rounded-xl border border-orange-500/30">
              <FiTarget className="w-6 h-6 lg:w-8 lg:h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl lg:text-3xl font-bold text-orange-300">{Math.ceil(quizData.questions.length * 1.5)}</div>
              <div className="text-xs lg:text-sm text-orange-200">Est. Time</div>
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-4 lg:space-y-6">
          {quizData.questions.map((question, index) => (
            <div key={index} className="bg-gray-800/40 rounded-xl lg:rounded-2xl p-4 lg:p-6">
              <div className="flex items-start gap-3 lg:gap-4 mb-3 lg:mb-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm lg:text-base flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h5 className="text-base lg:text-lg font-semibold text-white mb-2 lg:mb-3">
                    {question.question || 'Question text not provided'}
                  </h5>
                  
                  {/* Question Image Preview */}
                  {question.image && (
                    <div className="mb-3 lg:mb-4">
                      <div className="relative rounded-lg overflow-hidden border border-gray-600/40 max-w-xs mx-auto">
                        <img
                          src={question.image}
                          alt="Question illustration"
                          className="w-full h-auto object-contain bg-gray-700/50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-20 bg-gray-700/50 border border-dashed border-gray-600 rounded-lg items-center justify-center">
                          <div className="text-center">
                            <div className="w-4 h-4 text-gray-400 mx-auto mb-1">📷</div>
                            <p className="text-xs text-gray-400">Failed to load image</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 lg:space-y-3">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-3 p-2 lg:p-3 rounded-lg ${
                          optIndex === question.correctAnswer
                            ? 'bg-emerald-500/20 border border-emerald-500/40'
                            : 'bg-gray-700/30'
                        }`}
                      >
                        <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center ${
                          optIndex === question.correctAnswer
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-600 text-gray-400'
                        }`}>
                          {optIndex === question.correctAnswer ? (
                            <FiCheck className="w-2 h-2 lg:w-3 lg:h-3" />
                          ) : (
                            <span className="text-xs font-bold">{String.fromCharCode(65 + optIndex)}</span>
                          )}
                        </div>
                        <span className={`text-sm lg:text-base ${
                          optIndex === question.correctAnswer ? 'text-emerald-300 font-medium' : 'text-gray-300'
                        }`}>
                          {option || `Option ${String.fromCharCode(65 + optIndex)} not provided`}
                        </span>
                      </div>
                    ))}
        </div>

                  {question.explanation && (
                    <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-start gap-2 lg:gap-3">
                        <FiStar className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs lg:text-sm font-semibold text-blue-300 mb-1">Explanation</p>
                          <p className="text-xs lg:text-sm text-blue-200">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActionFooter = () => (
    <div className={mode(
      "relative z-10 bg-white backdrop-blur-xl border border-slate-200 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl",
      "relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl"
    )}>
      <div className={mode(
        "absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl lg:rounded-3xl",
        "absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl lg:rounded-3xl"
      )}></div>
      <div className="relative flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 lg:gap-6">
          <div className={mode(
            "p-3 lg:p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl",
            "p-3 lg:p-4 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl"
          )}>
            <FiLayers className={mode("w-6 h-6 lg:w-8 lg:h-8 text-indigo-600", "w-6 h-6 lg:w-8 lg:h-8 text-indigo-400")} />
          </div>
          <div className="text-center lg:text-left">
            <div className={mode("text-xl lg:text-2xl font-bold text-slate-800 mb-2", "text-xl lg:text-2xl font-bold text-white mb-2")}>
                  {quizData.questions.length} Question{quizData.questions.length !== 1 ? 's' : ''}
                </div>
            <div className={mode("flex flex-col sm:flex-row items-center gap-3 lg:gap-6 text-slate-600 text-sm lg:text-base", "flex flex-col sm:flex-row items-center gap-3 lg:gap-6 text-gray-400 text-sm lg:text-base")}>
                  <span className="flex items-center gap-2">
                <FiClock className={mode("w-4 h-4 text-slate-500", "w-4 h-4")} />
                {quizData.timeLimit} minutes
                  </span>
                  <span className="flex items-center gap-2">
                <FiTarget className={mode("w-4 h-4 text-slate-500", "w-4 h-4")} />
                    {getDifficultyColor(quizData.difficulty).emoji} {quizData.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateQuiz}
              disabled={loading || !quizData.title.trim()}
          className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl lg:rounded-2xl px-8 lg:px-12 py-4 lg:py-5 transition-all duration-300 transform hover:scale-105 shadow-xl lg:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full lg:w-auto"
            >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl lg:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center gap-3 lg:gap-4">
                {loading ? (
                  <>
                <div className="w-5 h-5 lg:w-6 lg:h-6 border-3 lg:border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-base lg:text-xl">Creating Test...</span>
                  </>
                ) : (
                  <>
                <FaMagic className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="text-base lg:text-xl">Create Test</span>
                <FiChevronRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
  );

  return (
    <div className={mode("min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50", "min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10")}>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Background elements removed for cleaner look */}

        {/* Mobile Header */}
        {renderMobileHeader()}
        
        {/* Desktop Header */}
        {renderDesktopHeader()}
        
        {/* Mobile Tabs */}
        {renderMobileTabs()}

        {/* Desktop Tabs */}
        {renderDesktopTabs()}

        {/* Content Based on Active Tab */}
        {activeTab === 'info' && renderTestInfo()}
        {activeTab === 'questions' && renderQuestions()}
        {activeTab === 'preview' && renderPreview()}

        {/* Action Footer - Always Visible */}
        {renderActionFooter()}
      </div>

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestSeriesQuizCreator;
