import React, { useState, useMemo } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiPlus, 
  FiTrash2, 
  FiSave, 
  FiArrowLeft, 
  FiAlertCircle, 
  FiClock, 
  FiTarget, 
  FiAward,
  FiCheckCircle
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const QuizCreator = ({ onBack, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30, // Default 30 mins
    difficulty: 'medium',
    passingScore: 0, // New Field
    questions: [{ 
      id: uuidv4(), 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0,
      negativeMarking: {
        enabled: false,
        type: 'fractional',
        value: 0.25
      }
    }],
    negativeMarking: {
      enabled: false,
      type: 'fractional',
      value: 0.25
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helpers
  const mode = (light, dark) => (isDark ? dark : light);

  const calculateMaxScore = useMemo(() => {
    // Assuming 1 mark per question for now
    return quiz.questions.length;
  }, [quiz.questions.length]);

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { 
          id: uuidv4(), 
          question: '', 
          options: ['', '', '', ''], 
          correctAnswer: 0,
          negativeMarking: {
            enabled: false,
            type: 'fractional',
            value: 0.25
          }
        }
      ]
    }));
  };

  const removeQuestion = (questionId) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const saveQuiz = async () => {
    if (!quiz.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    // Validate Passing Score
    if (quiz.passingScore > calculateMaxScore) {
      setError(`Passing score cannot exceed total marks (${calculateMaxScore})`);
      return;
    }

    const hasEmptyQuestions = quiz.questions.some(q => 
      !q.question.trim() || q.options.some(opt => !opt.trim())
    );

    if (hasEmptyQuestions) {
      setError('All questions and options must be filled out');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'quizzes'), {
        ...quiz,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        totalQuestions: quiz.questions.length,
        // Ensure passing score is saved as number
        passingScore: Number(quiz.passingScore)
      });
      
      onQuizCreated?.();
    } catch (error) {
      setError('Failed to save quiz. Please try again.');
      console.error('Error saving quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">Create New Quiz</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addQuestion}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border transition-colors ${
              isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiPlus /> Add Question
          </button>
          <button
            onClick={saveQuiz}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><FiSave /> Save Quiz</>}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Quiz Settings Card */}
        <div className={`p-6 rounded-2xl border shadow-sm ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <FiTarget className="text-indigo-500" /> Quiz Settings
          </h2>
          
          <div className="space-y-6">
            {/* Title & Description */}
            <div className="grid gap-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 'Modern Art History'"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Description
                </label>
                <textarea
                  placeholder="A short summary of what this quiz is about"
                  value={quiz.description}
                  onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              
              {/* Time Limit */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiClock /> Time Limit (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiAward /> Difficulty
                </label>
                <select
                  value={quiz.difficulty}
                  onChange={(e) => setQuiz(prev => ({ ...prev, difficulty: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Passing Score - NEW FEATURE */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiCheckCircle /> Passing Score
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={calculateMaxScore}
                    value={quiz.passingScore}
                    onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    / {calculateMaxScore}
                  </div>
                </div>
              </div>

            </div>
            
            {/* Negative Marking Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Negative Marking</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deduct 0.25 marks per wrong answer</div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setQuiz(prev => ({
                  ...prev,
                  negativeMarking: { ...prev.negativeMarking, enabled: !prev.negativeMarking.enabled }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  quiz.negativeMarking.enabled ? 'bg-red-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  quiz.negativeMarking.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
               Questions ({quiz.questions.length})
             </h2>
          </div>

          {quiz.questions.map((question, index) => (
            <div 
              key={question.id} 
              className={`p-6 rounded-2xl border shadow-sm relative group ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {index + 1}
                </div>
                
                {quiz.questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <input
                  type="text"
                  placeholder="Enter question text..."
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="relative flex items-center">
                      <div className="absolute left-3 flex items-center">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          question.correctAnswer === optionIndex
                            ? isDark ? 'bg-indigo-900/20 border-indigo-500' : 'bg-indigo-50 border-indigo-500'
                            : isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Add Button */}
        <button
          onClick={addQuestion}
          className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 font-bold transition-all ${
            isDark 
              ? 'border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <FiPlus className="w-5 h-5" /> Add New Question
        </button>
      </div>
      
      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default QuizCreator;