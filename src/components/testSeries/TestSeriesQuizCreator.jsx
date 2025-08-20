import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiPlus, 
  FiTrash2, 
  FiSave,
  FiArrowLeft,
  FiBookOpen,
  FiEdit,
  FiCheck,
  FiX,
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
  FiAlertCircle
} from 'react-icons/fi';
import { FaMagic, FaGraduationCap, FaBrain } from 'react-icons/fa';

const TestSeriesQuizCreator = ({ testSeries, onBack, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }],
    timeLimit: 30, // minutes
    difficulty: 'medium'
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
        explanation: ''
      }]
    }));
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
      alert('Quiz title is required!');
      return;
    }

    if (quizData.questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
      alert('All questions and options must be filled!');
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
        totalQuizzes: (testSeries.totalQuizzes || 0) + 1,
        updatedAt: new Date()
      });

      onQuizCreated({
        id: docRef.id,
        ...quizDocument
      });

    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Enhanced Header */}
        <div className="relative z-10 flex items-center gap-6 mb-12">
          <button
            onClick={onBack}
            className="group bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-6 py-3 text-sm font-medium hover:from-gray-700/80 hover:to-gray-600/80 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Series</span>
          </button>
          
          <div className="flex-1">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-3 leading-tight">
              Create Test
            </h1>
            <p className="text-xl text-gray-400 flex items-center gap-3">
              <FaGraduationCap className="w-6 h-6 text-blue-400" />
              Adding new test to{' '}
              <span className="text-blue-400 font-semibold px-3 py-1 bg-blue-500/20 rounded-lg">
                "{testSeries.title}"
              </span>
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 rounded-xl shadow-lg">
            <FiTarget className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm text-gray-300 font-medium">Completion</div>
              <div className="text-blue-400 font-bold">{getCompletionStats()}%</div>
            </div>
          </div>
        </div>

        {/* Enhanced Quiz Basic Info */}
        <div className="relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-10 mb-10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <FiBookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Test Information</h3>
                <p className="text-gray-400 text-lg">Configure your test details and settings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <FiEdit3 className="w-4 h-4 text-blue-400" />
                  Test Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Chapter 1: Basic Concepts"
                    value={quizData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {quizData.title ? (
                      <FiCheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <FiClock className="w-4 h-4 text-emerald-400" />
                  Time Limit (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={quizData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 30)}
                    className="w-full px-6 py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FiClock className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiList className="w-4 h-4 text-purple-400" />
                Description
              </label>
              <textarea
                placeholder="Brief description of this test..."
                value={quizData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium h-32 resize-none"
                rows="3"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiTrendingUp className="w-4 h-4 text-orange-400" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'easy', label: 'Easy', color: getDifficultyColor('easy') },
                  { value: 'medium', label: 'Medium', color: getDifficultyColor('medium') },
                  { value: 'hard', label: 'Hard', color: getDifficultyColor('hard') }
                ].map(diff => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => handleInputChange('difficulty', diff.value)}
                    className={`group relative p-6 rounded-2xl text-center font-bold transition-all duration-300 ${
                      quizData.difficulty === diff.value
                        ? `bg-gradient-to-r ${diff.color.bg} text-white shadow-2xl scale-105`
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${diff.color.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    <div className="relative">
                      <div className="text-3xl mb-2">{diff.color.emoji}</div>
                      <div className="text-lg">{diff.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Questions Section */}
        <div className="relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-10 mb-10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <FaBrain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    Questions ({quizData.questions.length})
                  </h3>
                  <p className="text-gray-400 text-lg">Create engaging questions for your test</p>
                </div>
              </div>
              
              <button
                onClick={addQuestion}
                className="group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl px-8 py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <FiPlus className="w-5 h-5" />
                  <span>Add Question</span>
                </div>
              </button>
            </div>

            <div className="space-y-10">
              {quizData.questions.map((question, qIndex) => (
                <div key={qIndex} className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-purple-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg">
                          {qIndex + 1}
                        </div>
                        <h4 className="text-2xl font-bold text-white">
                          Question {qIndex + 1}
                        </h4>
                      </div>
                      
                      {quizData.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="group/btn p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Delete Question"
                        >
                          <FiTrash2 className="w-5 h-5 text-red-400 group-hover/btn:text-red-300" />
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="mb-8 space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                        <FiHelpCircle className="w-4 h-4 text-purple-400" />
                        Question Text <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        placeholder="Enter your question here..."
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        className="w-full px-6 py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium h-24 resize-none"
                        rows="3"
                      />
                    </div>

                    {/* Options */}
                    <div className="mb-8 space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                        <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                        Answer Options <span className="text-red-400">*</span>
                      </label>
                      <div className="space-y-4">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-4">
                            <div className="relative">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                className="w-6 h-6 text-emerald-600 bg-gray-700 border-gray-600 focus:ring-emerald-500 focus:ring-2"
                              />
                              {question.correctAnswer === oIndex && (
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                value={option}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                className={`w-full px-6 py-4 rounded-xl backdrop-blur-sm border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 font-medium ${
                                  question.correctAnswer === oIndex 
                                    ? 'border-emerald-500/40 bg-emerald-500/10 focus:ring-emerald-500' 
                                    : 'border-gray-600/40 bg-gray-900/60 focus:ring-blue-500'
                                }`}
                              />
                              {question.correctAnswer === oIndex && (
                                <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                              )}
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                                {String.fromCharCode(65 + oIndex)}
                              </div>
                              <div className="pl-12"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-4">
                        <FiTarget className="w-4 h-4" />
                        Select the radio button next to the correct answer
                      </p>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                        <FiStar className="w-4 h-4 text-yellow-400" />
                        Explanation (Optional)
                      </label>
                      <textarea
                        placeholder="Explain why this is the correct answer..."
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                        className="w-full px-6 py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 font-medium h-20 resize-none"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Action Footer */}
        <div className="relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl"></div>
          <div className="relative flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl">
                <FiLayers className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">
                  {quizData.questions.length} Question{quizData.questions.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-6 text-gray-400">
                  <span className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    Estimated time: {Math.ceil(quizData.questions.length * 1.5)} minutes
                  </span>
                  <span className="flex items-center gap-2">
                    <FiTarget className="w-4 h-4" />
                    {getDifficultyColor(quizData.difficulty).emoji} {quizData.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateQuiz}
              disabled={loading || !quizData.title.trim()}
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl px-12 py-5 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xl">Creating Test...</span>
                  </>
                ) : (
                  <>
                    <FaMagic className="w-6 h-6" />
                    <span className="text-xl">Create Test</span>
                    <FiChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSeriesQuizCreator;
