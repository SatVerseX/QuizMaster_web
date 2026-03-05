import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Trash2,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  ImageIcon,
  X,
  Settings2,
  HelpCircle,
  Hash,
  CheckSquare,
  List
} from 'lucide-react';

const QuestionCard = ({ question, questionIndex, onUpdate, onRemove }) => {
  const { isDark } = useTheme();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Helper for conditional styles
  const cn = (...classes) => classes.filter(Boolean).join(' ');

  // Determine question type — defaults to 'mcq' for backward compatibility
  const questionType = question.type || 'mcq';

  const handleTypeChange = (newType) => {
    const updates = { type: newType };
    if (newType === 'numerical') {
      updates.options = [];
      updates.correctAnswer = question.correctAnswer !== undefined && typeof question.correctAnswer === 'number' && !Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : 0;
      updates.tolerance = question.tolerance || 0;
    } else if (newType === 'msq') {
      if (!question.options || question.options.length === 0) {
        updates.options = ['', '', '', ''];
      }
      updates.correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : (typeof question.correctAnswer === 'number' ? [question.correctAnswer] : [0]);
      updates.partialMarking = question.partialMarking ?? false;
    } else {
      // MCQ
      if (!question.options || question.options.length === 0) {
        updates.options = ['', '', '', ''];
      }
      updates.correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer[0] || 0
        : (typeof question.correctAnswer === 'number' ? question.correctAnswer : 0);
    }
    onUpdate(updates);
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const handleCorrectAnswerChange = (optionIndex) => {
    if (questionType === 'msq') {
      // Toggle in the array of correct answers
      const currentCorrect = Array.isArray(question.correctAnswer) ? [...question.correctAnswer] : [];
      const idx = currentCorrect.indexOf(optionIndex);
      if (idx > -1) {
        currentCorrect.splice(idx, 1);
      } else {
        currentCorrect.push(optionIndex);
        currentCorrect.sort();
      }
      onUpdate({ correctAnswer: currentCorrect });
    } else {
      onUpdate({ correctAnswer: optionIndex });
    }
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

  // Modern Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange, colorClass = "bg-rose-600" }) => (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
        enabled ? colorClass : (isDark ? "bg-zinc-700" : "bg-zinc-200")
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );

  // Get collapsed summary based on type
  const getCollapsedSummary = () => {
    if (questionType === 'numerical') {
      return `Numerical • Answer: ${question.correctAnswer ?? '—'}`;
    } else if (questionType === 'msq') {
      const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
      const labels = correctArr.map(i => String.fromCharCode(65 + i)).join(', ');
      return `${question.options?.length || 0} options • MSQ • Correct: ${labels || '—'}`;
    }
    return `${question.options?.length || 0} options • Correct: ${String.fromCharCode(65 + (question.correctAnswer || 0))}`;
  };

  // Type badge config
  const typeBadgeConfig = {
    mcq: { label: 'MCQ', icon: List, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' },
    numerical: { label: 'NUM', icon: Hash, color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30' },
    msq: { label: 'MSQ', icon: CheckSquare, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' }
  };
  const badge = typeBadgeConfig[questionType] || typeBadgeConfig.mcq;

  return (
    <div className={cn(
      "group w-full rounded-xl border transition-all duration-200",
      isDark
        ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
        : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
    )}>
      {/* --- Header --- */}
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer select-none",
          isExpanded && (isDark ? "border-b border-zinc-800" : "border-b border-zinc-100")
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-sm",
            isDark ? "bg-zinc-800 text-zinc-300" : "bg-white border border-zinc-200 text-zinc-700"
          )}>
            {questionIndex + 1}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "text-sm font-medium truncate pr-2",
                !question.question && "italic opacity-50",
                isDark ? "text-zinc-200" : "text-zinc-900"
              )}>
                {question.question || "Untitled Question"}
              </h3>
              <span className={cn("shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border", badge.color)}>
                <badge.icon className="w-3 h-3" />
                {badge.label}
              </span>
            </div>
            {!isExpanded && (
              <p className={cn("text-xs truncate", isDark ? "text-zinc-500" : "text-zinc-400")}>
                {getCollapsedSummary()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className={cn(
              "p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
              isDark ? "hover:bg-red-900/20 text-red-400" : "hover:bg-red-50 text-red-500"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className={cn("text-zinc-400", isExpanded && "rotate-180 transition-transform")}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* --- Expanded Content --- */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">

          {/* Question Type Selector */}
          <div className="space-y-2">
            <label className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
              Question Type
            </label>
            <div className="flex gap-2">
              {[
                { value: 'mcq', label: 'MCQ (Single)', icon: List, desc: 'Single correct option' },
                { value: 'numerical', label: 'Numerical', icon: Hash, desc: 'Integer answer' },
                { value: 'msq', label: 'MSQ (Multi)', icon: CheckSquare, desc: 'Multiple correct' }
              ].map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTypeChange(t.value); }}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all",
                    questionType === t.value
                      ? (isDark ? "bg-rose-500/10 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30" : "bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-500")
                      : (isDark ? "bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:border-zinc-700" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300")
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="font-semibold">{t.label}</span>
                  <span className="text-[10px] opacity-60">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <label className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
              Question Text
            </label>
            <textarea
              value={question.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-y",
                isDark
                  ? "bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-rose-500/50"
                  : "bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-rose-500"
              )}
              placeholder="What would you like to ask?"
            />
          </div>

          {/* Image URL Input (Compact) */}
          <div className="relative group/image">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-md shrink-0",
                isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              )}>
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={question.image || ''}
                onChange={(e) => onUpdate({ image: e.target.value })}
                className={cn(
                  "flex-1 bg-transparent border-b text-sm py-2 focus:outline-none focus:border-rose-500 transition-colors",
                  isDark
                    ? "border-zinc-800 text-zinc-300 placeholder-zinc-700"
                    : "border-zinc-200 text-zinc-700 placeholder-zinc-400"
                )}
                placeholder="Paste image URL here (optional)..."
              />
            </div>
            {question.image && (
              <div className="mt-3 relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <img
                  src={question.image}
                  alt="Preview"
                  className="h-32 object-contain mx-auto"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <button
                  onClick={() => onUpdate({ image: '' })}
                  className="absolute top-2 right-2 p-1 bg-zinc-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* ===== TYPE-SPECIFIC ANSWER SECTION ===== */}

          {/* NUMERICAL ANSWER INPUT */}
          {questionType === 'numerical' && (
            <div className="space-y-3">
              <label className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
                Correct Answer (Number)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
                  )}>
                    <Hash className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={question.correctAnswer ?? ''}
                    onChange={(e) => onUpdate({ correctAnswer: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className={cn(
                      "flex-1 rounded-lg px-4 py-3 text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                      isDark
                        ? "bg-zinc-950 border border-zinc-700 text-white focus:border-purple-500/50"
                        : "bg-white border border-zinc-200 text-zinc-900 focus:border-purple-500"
                    )}
                    placeholder="e.g. 42"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-zinc-600" : "text-zinc-400")}>
                    Tolerance (±)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={question.tolerance ?? 0}
                    onChange={(e) => onUpdate({ tolerance: parseFloat(e.target.value) || 0 })}
                    className={cn(
                      "w-24 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                      isDark
                        ? "bg-zinc-950 border border-zinc-700 text-white focus:border-purple-500/50"
                        : "bg-white border border-zinc-200 text-zinc-900 focus:border-purple-500"
                    )}
                    placeholder="0"
                  />
                </div>
              </div>
              <p className={cn("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>
                Student must enter this exact value{(question.tolerance > 0) ? ` (±${question.tolerance})` : ''} to get marks.
              </p>
            </div>
          )}

          {/* MCQ & MSQ OPTIONS */}
          {(questionType === 'mcq' || questionType === 'msq') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
                  Answer Options
                </label>
                <span className={cn("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>
                  {questionType === 'msq' ? 'Select all correct answers' : 'Select the correct answer'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(question.options || []).map((option, idx) => {
                  const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                  const isCorrect = questionType === 'msq'
                    ? correctArr.includes(idx)
                    : question.correctAnswer === idx;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                        isCorrect
                          ? (isDark ? "bg-emerald-900/10 border-emerald-500/50" : "bg-emerald-50 border-emerald-200")
                          : (isDark ? "bg-zinc-800/30 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300")
                      )}
                    >
                      <button
                        onClick={() => handleCorrectAnswerChange(idx)}
                        className={cn(
                          "mt-1 shrink-0 transition-colors duration-200",
                          isCorrect
                            ? "text-emerald-500"
                            : (isDark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-300 hover:text-zinc-400")
                        )}
                      >
                        {questionType === 'msq'
                          ? (isCorrect ? <CheckSquare className="w-5 h-5 fill-current" /> : <CheckSquare className="w-5 h-5" />)
                          : (isCorrect ? <CheckCircle2 className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />)
                        }
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-bold w-4",
                            isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            className={cn(
                              "w-full bg-transparent text-sm font-medium focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600",
                              isDark ? "text-zinc-200" : "text-zinc-800"
                            )}
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>

                        {/* Option Image Trigger/Input */}
                        <div className="pl-6">
                          <input
                            type="text"
                            value={question.optionImages?.[idx] || ''}
                            onChange={(e) => {
                              const imgs = question.optionImages || ['', '', '', ''];
                              imgs[idx] = e.target.value;
                              onUpdate({ optionImages: imgs });
                            }}
                            className={cn(
                              "w-full text-xs bg-transparent focus:outline-none border-b border-dashed border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors truncate",
                              isDark ? "text-zinc-500 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-500"
                            )}
                            placeholder="+ Add image URL (optional)"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MSQ Partial Marking Toggle */}
              {questionType === 'msq' && (
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border mt-2",
                  isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50/50 border-amber-200"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-md", isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700")}>
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className={cn("text-sm font-medium", isDark ? "text-zinc-200" : "text-zinc-700")}>Partial Marking</span>
                      <p className={cn("text-[10px]", isDark ? "text-zinc-500" : "text-zinc-400")}>
                        {question.partialMarking
                          ? "Proportional marks for partially correct answers"
                          : "All-or-nothing: full marks only if ALL correct options selected"
                        }
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={question.partialMarking}
                    onChange={() => onUpdate({ partialMarking: !question.partialMarking })}
                    colorClass="bg-amber-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <HelpCircle className={cn("w-3 h-3", isDark ? "text-zinc-600" : "text-zinc-400")} />
              <label className={cn("text-xs font-medium", isDark ? "text-zinc-500" : "text-zinc-500")}>
                Explanation (Optional)
              </label>
            </div>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-all",
                isDark
                  ? "bg-zinc-900/50 border border-zinc-800 text-zinc-300 focus:border-rose-500/50"
                  : "bg-zinc-50 border border-zinc-200 text-zinc-700 focus:border-rose-500"
              )}
              placeholder="Explain the correct answer..."
            />
          </div>

          {/* Settings Section */}
          <div className={cn(
            "rounded-lg overflow-hidden border",
            isDark ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-zinc-50/50"
          )}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "w-full flex items-center justify-between p-3 text-xs font-medium uppercase tracking-wider transition-colors",
                isDark ? "text-zinc-400 hover:bg-zinc-800/50" : "text-zinc-500 hover:bg-zinc-100"
              )}
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" />
                <span>Marking Rules</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showSettings && "rotate-180")} />
            </button>

            {showSettings && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t dark:border-zinc-800 border-zinc-200">

                {/* Positive Marking */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span className={cn("text-sm font-medium", isDark ? "text-zinc-200" : "text-zinc-700")}>Correct Answer</span>
                    </div>
                    <ToggleSwitch
                      enabled={question.positiveMarking?.enabled}
                      onChange={togglePositiveMarking}
                      colorClass="bg-emerald-600"
                    />
                  </div>

                  {question.positiveMarking?.enabled && (
                    <div className="pl-9 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex gap-2 p-1 rounded-lg border dark:border-zinc-700 border-zinc-200 bg-white dark:bg-zinc-950">
                        {['fractional', 'fixed'].map(type => (
                          <button
                            key={type}
                            onClick={() => onUpdate({ positiveMarking: { ...question.positiveMarking, type } })}
                            className={cn(
                              "flex-1 py-1 px-2 text-xs font-medium rounded-md capitalize transition-all",
                              question.positiveMarking?.type === type
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm"
                                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={question.positiveMarking?.value || 1.0}
                          onChange={(e) => onUpdate({ positiveMarking: { ...question.positiveMarking, value: parseFloat(e.target.value) } })}
                          className={cn(
                            "w-20 rounded-md py-1.5 px-2 text-sm border focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
                            isDark ? "bg-zinc-950 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                          )}
                        />
                        <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>marks awarded</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Negative Marking */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                        <Minus className="w-3.5 h-3.5" />
                      </div>
                      <span className={cn("text-sm font-medium", isDark ? "text-zinc-200" : "text-zinc-700")}>Wrong Answer</span>
                    </div>
                    <ToggleSwitch
                      enabled={question.negativeMarking?.enabled}
                      onChange={toggleNegativeMarking}
                      colorClass="bg-orange-600"
                    />
                  </div>

                  {question.negativeMarking?.enabled && (
                    <div className="pl-9 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex gap-2 p-1 rounded-lg border dark:border-zinc-700 border-zinc-200 bg-white dark:bg-zinc-950">
                        {['fractional', 'fixed'].map(type => (
                          <button
                            key={type}
                            onClick={() => onUpdate({ negativeMarking: { ...question.negativeMarking, type } })}
                            className={cn(
                              "flex-1 py-1 px-2 text-xs font-medium rounded-md capitalize transition-all",
                              question.negativeMarking?.type === type
                                ? "bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 shadow-sm"
                                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.05"
                          value={question.negativeMarking?.value || 0.25}
                          onChange={(e) => onUpdate({ negativeMarking: { ...question.negativeMarking, value: parseFloat(e.target.value) } })}
                          className={cn(
                            "w-20 rounded-md py-1.5 px-2 text-sm border focus:ring-2 focus:ring-orange-500/20 focus:outline-none",
                            isDark ? "bg-zinc-950 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                          )}
                        />
                        <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>deducted</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;