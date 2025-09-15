import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiTrash2, 
  FiEdit3, 
  FiAlertCircle,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
  FiMinus,
  FiImage,
  FiX
} from 'react-icons/fi';

const QuestionCard = ({ question, questionIndex, onUpdate, onRemove }) => {
  const { isDark } = useTheme();
  const mode = (light, dark) => (isDark ? dark : light);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const handleCorrectAnswerChange = (optionIndex) => {
    onUpdate({ correctAnswer: optionIndex });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const togglePositiveMarking = () => {
    onUpdate({
      positiveMarking: {
        ...question.positiveMarking,
        enabled: !question.positiveMarking?.enabled
      }
    });
  };

  const toggleNegativeMarking = () => {
    onUpdate({
      negativeMarking: {
        ...question.negativeMarking,
        enabled: !question.negativeMarking?.enabled
      }
    });
  };

  return (
    <div className={`w-full max-w-full border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${mode('bg-white/80 border-slate-200/60', 'bg-gray-800/80 border-gray-700/60')}`}>
      {/* Question Header - Mobile Optimized */}
      <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 w-full">
          <button
            onClick={toggleExpanded}
            className={`p-2 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 flex-shrink-0 ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
          >
            {isExpanded ? (
              <FiChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ${mode('text-slate-500', 'text-gray-400')} transition-transform`} />
            ) : (
              <FiChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${mode('text-slate-500', 'text-gray-400')} transition-transform`} />
            )}
          </button>
          
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg flex-shrink-0">
            {questionIndex + 1}
          </div>
          
          <h4 className={`text-lg sm:text-xl font-bold truncate flex-1 ${mode('text-slate-800', 'text-white')}`}>
            <span className="hidden sm:inline">Question {questionIndex + 1}</span>
            <span className="sm:hidden">Q{questionIndex + 1}</span>
          </h4>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
            title="Edit Question"
          >
            <FiEdit3 className={`w-4 h-4 sm:w-5 sm:h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
          </button>
          <button
            onClick={onRemove}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 ${mode('hover:bg-red-100/50', 'hover:bg-red-600/20')}`}
            title="Remove Question"
          >
            <FiTrash2 className={`w-4 h-4 sm:w-5 sm:h-5 ${mode('text-red-600', 'text-red-400')}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Question Text */}
          <div className="w-full mb-4 sm:mb-6">
            <label className={`block text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              Question Text
            </label>
            <textarea
              value={question.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 min-h-[80px] sm:min-h-[100px] resize-y text-base sm:text-lg font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500 hover:border-slate-400', 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 hover:border-gray-600')}`}
              rows="3"
              placeholder="Enter your question here..."
            />
          </div>

          {/* Question Image */}
          <div className="w-full mb-4 sm:mb-6">
            <label className={`block text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              Question Image (Optional)
            </label>
            
            {/* Image URL Input */}
            <div className="w-full mb-3">
              <input
                type="url"
                value={question.image || ''}
                onChange={(e) => onUpdate({ image: e.target.value })}
                className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 text-sm sm:text-base font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500 hover:border-slate-400', 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 hover:border-gray-600')}`}
                placeholder="Enter image URL (optional)"
              />
            </div>

            {/* Image Preview */}
            {question.image && (
              <div className="relative w-full max-w-sm mx-auto">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={question.image}
                    alt="Question illustration"
                    className="w-full h-auto object-contain bg-gray-50 dark:bg-gray-800"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-24 sm:h-28 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl items-center justify-center">
                    <div className="text-center">
                      <FiImage className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load image</p>
                    </div>
                  </div>
                </div>
                
                {/* Remove Image Button */}
                <button
                  type="button"
                  onClick={() => onUpdate({ image: '' })}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
                  title="Remove image"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Image Help Text */}
            <div className={`w-full mt-2 text-xs sm:text-sm ${mode('text-slate-500', 'text-gray-500')}`}>
              <div className="flex items-center gap-2">
                <FiImage className="w-4 h-4" />
                <span>Enter a Cloudinary image URL to add visual context to your question</span>
              </div>
            </div>
          </div>

          {/* Answer Options - Mobile Optimized */}
          <div className="w-full mb-4 sm:mb-6">
            <label className={`block text-sm font-bold mb-3 sm:mb-4 flex items-center gap-2 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              Answer Options
            </label>
            <div className="w-full space-y-3 sm:space-y-4">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${question.correctAnswer === optionIndex ? mode('bg-green-50 border-green-300', 'bg-green-900/20 border-green-600') : mode('bg-slate-50 border-slate-200', 'bg-gray-800/50 border-gray-700')}`}>
                  <button
                    type="button"
                    onClick={() => handleCorrectAnswerChange(optionIndex)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 flex items-center justify-center font-bold text-sm sm:text-lg transition-all duration-300 flex-shrink-0 ${question.correctAnswer === optionIndex ? mode('bg-green-600 border-green-600 text-white', 'bg-green-600 border-green-600 text-white') : mode('bg-white border-slate-300 text-slate-700 hover:border-slate-400', 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500')}`}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </button>
                  <div className="flex-1 min-w-0 w-full">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                      className={`w-full max-w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500 hover:border-slate-400', 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 hover:border-gray-600')}`}
                      placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    />
                    
                    {/* Option Image Input */}
                    <div className="mt-2">
                      <input
                        type="url"
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)} image URL (optional)`}
                        value={question.optionImages?.[optionIndex] || ''}
                        onChange={(e) => {
                          const currentOptionImages = question.optionImages || ['', '', '', ''];
                          const newOptionImages = [...currentOptionImages];
                          newOptionImages[optionIndex] = e.target.value;
                          onUpdate({ optionImages: newOptionImages });
                        }}
                        className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-800 border-gray-700 text-white placeholder-gray-500')}`}
                      />
                      
                      {/* Option Image Preview */}
                      {question.optionImages?.[optionIndex] && (
                        <div className="mt-2">
                          <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 max-w-xs">
                            <img
                              src={question.optionImages[optionIndex]}
                              alt={`Option ${String.fromCharCode(65 + optionIndex)} illustration`}
                              className="w-full h-auto object-contain bg-gray-50 dark:bg-gray-800"
                              style={{ maxHeight: '120px' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-16 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg items-center justify-center">
                              <div className="text-center">
                                <div className="w-3 h-3 text-gray-400 mx-auto mb-1">📷</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {question.correctAnswer === optionIndex && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="w-full mb-4 sm:mb-6">
            <label className={`block text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              Explanation
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 min-h-[60px] sm:min-h-[80px] resize-y text-sm sm:text-base font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500 hover:border-slate-400', 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 hover:border-gray-600')}`}
              rows="2"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          {/* Question-Specific Marking Settings - Mobile Optimized */}
          <div className={`w-full border-t-2 pt-4 sm:pt-6 ${mode('border-slate-300/60', 'border-gray-700/60')}`}>
            <div className="w-full space-y-6 sm:space-y-8">
              {/* Marking Buttons Row - Mobile Stack */}
              <div className="w-full">
                <label className={`block text-sm font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base">Question-Specific Marking</span>
                </label>
                
                {/* Mobile: Stack buttons, Desktop: Side by side */}
                <div className="w-full flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
                  {/* Positive Marking Button */}
                  <button
                    type="button"
                    onClick={togglePositiveMarking}
                    className={`w-full flex items-center justify-start sm:justify-center gap-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                      question.positiveMarking?.enabled
                        ? mode('bg-green-100/50 border-green-300 text-green-600 shadow-lg', 'bg-green-500/20 border-green-400 text-green-300 shadow-lg')
                        : mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                    }`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      question.positiveMarking?.enabled 
                        ? 'bg-green-500 text-white' 
                        : mode('bg-green-100 text-green-500', 'bg-green-500/20 text-green-400')
                    }`}>
                      <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-sm sm:text-base">Positive Marking</div>
                      <div className="text-xs sm:text-sm opacity-75">
                        {question.positiveMarking?.enabled ? 'Enabled' : 'Click to enable'}
                      </div>
                    </div>
                  </button>

                  {/* Negative Marking Button */}
                  <button
                    type="button"
                    onClick={toggleNegativeMarking}
                    className={`w-full flex items-center justify-start sm:justify-center gap-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                      question.negativeMarking?.enabled
                        ? mode('bg-red-100/50 border-red-300 text-red-600 shadow-lg', 'bg-red-500/20 border-red-400 text-red-300 shadow-lg')
                        : mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                    }`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      question.negativeMarking?.enabled 
                        ? 'bg-red-500 text-white' 
                        : mode('bg-red-100 text-red-500', 'bg-red-500/20 text-red-400')
                    }`}>
                      <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-sm sm:text-base">Negative Marking</div>
                      <div className="text-xs sm:text-sm opacity-75">
                        {question.negativeMarking?.enabled ? 'Enabled' : 'Click to enable'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Positive Marking Settings - Mobile Optimized */}
              {question.positiveMarking?.enabled && (
                <div className={`w-full space-y-4 sm:space-y-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${mode('border-green-300/30 bg-green-50/10', 'border-green-500/30 bg-green-500/10')}`}>
                  <div className="w-full flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiPlus className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <h4 className={`text-base sm:text-lg font-bold flex-1 ${mode('text-green-700', 'text-green-300')}`}>
                      Positive Marking Config
                    </h4>
                  </div>

                  {/* Type Selection - Mobile Stack */}
                  <div className="w-full">
                    <label className={`block text-sm font-bold mb-3 sm:mb-4 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
                      Marking Type
                    </label>
                    <div className="w-full flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { value: 'fractional', label: 'Fractional', description: '1.0 mark bonus' },
                        { value: 'fixed', label: 'Fixed', description: 'Fixed mark bonus' }
                      ].map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => onUpdate({
                            positiveMarking: {
                              ...question.positiveMarking,
                              type: type.value
                            }
                          })}
                          className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                            question.positiveMarking?.type === type.value
                              ? mode('bg-green-100/20 border-green-300 text-green-600 shadow-lg', 'bg-green-500/20 border-green-400 text-green-300 shadow-lg')
                              : mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                          }`}
                        >
                          <div className="font-bold text-sm sm:text-base">{type.label}</div>
                          <div className="text-xs sm:text-sm opacity-75">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Value Input */}
                  <div className="w-full">
                    <label className={`block text-sm font-bold mb-2 sm:mb-3 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
                      {question.positiveMarking?.type === 'fractional' ? 'Fraction Value' : 'Mark Bonus'}
                    </label>
                    <div className="w-full relative">
                      <input
                        type="number"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={question.positiveMarking?.value || 1.0}
                        onChange={(e) => onUpdate({
                          positiveMarking: {
                            ...question.positiveMarking,
                            value: parseFloat(e.target.value) || 1.0
                          }
                        })}
                        className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base font-medium focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500 hover:border-slate-400', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 hover:border-gray-500')}`}
                        placeholder="1.0"
                      />
                      <div className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium ${mode('text-slate-500', 'text-gray-500')}`}>
                        {question.positiveMarking?.type === 'fractional' ? 'fraction' : 'marks'}
                      </div>
                    </div>
                    <div className={`w-full mt-2 sm:mt-3 text-xs sm:text-sm ${mode('text-slate-500', 'text-gray-500')}`}>
                      For this question, {question.positiveMarking?.value || 1.0} marks will be awarded for correct answers
                    </div>
                  </div>
                </div>
              )}

              {/* Negative Marking Settings - Mobile Optimized */}
              {question.negativeMarking?.enabled && (
                <div className={`w-full space-y-4 sm:space-y-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${mode('border-red-300/30 bg-red-50/10', 'border-red-500/30 bg-red-500/10')}`}>
                  <div className="w-full flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMinus className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    </div>
                    <h4 className={`text-base sm:text-lg font-bold flex-1 ${mode('text-red-700', 'text-red-300')}`}>
                      Negative Marking Config
                    </h4>
                  </div>

                  {/* Type Selection - Mobile Stack */}
                  <div className="w-full">
                    <label className={`block text-sm font-bold mb-3 sm:mb-4 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
                      Marking Type
                    </label>
                    <div className="w-full flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { value: 'fractional', label: 'Fractional', description: '1/4th mark deduction' },
                        { value: 'fixed', label: 'Fixed', description: 'Fixed mark deduction' }
                      ].map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => onUpdate({
                            negativeMarking: {
                              ...question.negativeMarking,
                              type: type.value
                            }
                          })}
                          className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                            question.negativeMarking?.type === type.value
                              ? mode('bg-red-100/20 border-red-300 text-red-600 shadow-lg', 'bg-red-500/20 border-red-400 text-red-300 shadow-lg')
                              : mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                          }`}
                        >
                          <div className="font-bold text-sm sm:text-base">{type.label}</div>
                          <div className="text-xs sm:text-sm opacity-75">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Value Input */}
                  <div className="w-full">
                    <label className={`block text-sm font-bold mb-2 sm:mb-3 w-full ${mode('text-slate-700', 'text-gray-300')}`}>
                      {question.negativeMarking?.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                    </label>
                    <div className="w-full relative">
                      <input
                        type="number"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={question.negativeMarking?.value || 0.25}
                        onChange={(e) => onUpdate({
                          negativeMarking: {
                            ...question.negativeMarking,
                            value: parseFloat(e.target.value) || 0.25
                          }
                        })}
                        className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base font-medium focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500 hover:border-slate-400', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 hover:border-gray-500')}`}
                        placeholder="0.25"
                      />
                      <div className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium ${mode('text-slate-500', 'text-gray-500')}`}>
                        {question.negativeMarking?.type === 'fractional' ? 'fraction' : 'marks'}
                      </div>
                    </div>
                    <div className={`w-full mt-2 sm:mt-3 text-xs sm:text-sm ${mode('text-slate-500', 'text-gray-500')}`}>
                      For this question, {question.negativeMarking?.value || 0.25} marks will be deducted for wrong answers
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionCard;
