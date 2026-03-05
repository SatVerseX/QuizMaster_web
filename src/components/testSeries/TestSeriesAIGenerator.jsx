import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc, doc, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FiZap,
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiUpload,
  FiBookOpen,
  FiCpu,
  FiSave,
  FiTarget,
  FiTrendingUp,
  FiSettings,
  FiLayers,
  FiChevronRight,
  FiPlay,
  FiStar,
  FiGlobe,
  FiAlertCircle,
  FiClock,
  FiMoreHorizontal,
  FiFileText
} from 'react-icons/fi';
import { FaRobot, FaMagic, FaBrain } from 'react-icons/fa';

/**
 * TestSeriesAIGenerator
 * 
 * A high-conversion, professional UI for generating quizzes using AI or uploading JSON.
 * Uses the Rose/Orange/Emerald palette with a clean Linear/Stripe aesthetic.
 */
const TestSeriesAIGenerator = ({ testSeries, onBack, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // -- State Management --
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState({
    topic: '',
    questionCount: 10,
    difficulty: 'medium',
    questionType: 'mixed',
    language: 'english',
    negativeMarking: {
      enabled: false,
      type: 'fractional',
      value: 0.25
    }
  });

  // JSON Upload State
  const [jsonUploadData, setJsonUploadData] = useState({
    timeLimit: 30,
    difficulty: 'medium',
    negativeMarking: {
      enabled: false,
      type: 'fractional',
      value: 0.25
    }
  });

  const fileInputRef = useRef(null);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // -- Helpers --

  const mode = (light, dark) => (isDark ? dark : light);

  // Clean JSON response from AI
  const cleanupJSONResponse = (text) => {
    let cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/````````````/g, '')
      .trim();

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    return cleaned;
  };

  // -- Handlers --

  const generateWithAI = async () => {
    if (!aiPrompt.topic.trim()) {
      setError('Please enter a topic for the quiz');
      return;
    }

    if (!testSeries) {
      setError('Test series information is missing.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      const prompt = `Create a quiz with exactly ${aiPrompt.questionCount} questions about "${aiPrompt.topic}" for ${testSeries.title}.

Requirements:
- Difficulty: ${aiPrompt.difficulty}
- Language: ${aiPrompt.language}
- Mix of question types: MCQ (single correct from 4 options), Numerical (answer is a number with optional tolerance), and MSQ (multiple correct answers from 4 options).
- Include explanations for correct answers.
- For each question, suggest a relevant Cloudinary image URL that would help illustrate the question (or null).

Return ONLY a valid JSON object in this exact format:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "type": "mcq",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why it is correct"
    },
    {
      "type": "numerical",
      "question": "What is the value of X?",
      "correctAnswer": 42,
      "tolerance": 0.5,
      "explanation": "How to calculate"
    },
    {
      "type": "msq",
      "question": "Select all correct options:",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": [0, 2],
      "partialMarking": true,
      "explanation": "Why A and C are correct"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = cleanupJSONResponse(text);

      try {
        const quizData = JSON.parse(text);

        // Basic Validation
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          throw new Error('Invalid quiz structure received from AI');
        }

        const finalQuiz = {
          ...quizData,
          title: quizData.title || `${aiPrompt.topic} Quiz`,
          description: quizData.description || `Test your knowledge of ${aiPrompt.topic}`,
          timeLimit: Math.max(10, (quizData.timeLimit || (quizData.questions.length * 1.5))), // 1.5 min per question default
          difficulty: aiPrompt.difficulty,
          isAIGenerated: true,
          aiPrompt: aiPrompt.topic,
          language: aiPrompt.language,
          // Apply global negative marking preference to generated questions
          questions: quizData.questions.map(q => ({
            ...q,
            type: q.type || 'mcq',
            negativeMarking: aiPrompt.negativeMarking.enabled ? { ...aiPrompt.negativeMarking } : null,
            image: q.image || null,
            tolerance: q.tolerance !== undefined ? q.tolerance : (q.type === 'numerical' ? 0 : undefined),
            partialMarking: q.partialMarking !== undefined ? q.partialMarking : (q.type === 'msq' ? false : undefined),
          }))
        };

        setGeneratedQuiz(finalQuiz);
        setStep(2);
        setSuccess(`Generated ${finalQuiz.questions.length} questions successfully!`);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setError('Failed to process AI response. Please try again.');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setError(error.message.includes('API key') ? 'Invalid API Key configuration.' : 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    setError('');
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large (Max 10MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const quizData = JSON.parse(e.target.result);

        if (!quizData.questions || !Array.isArray(quizData.questions)) {
          throw new Error('Invalid JSON: Missing "questions" array.');
        }

        const finalQuizData = {
          ...quizData,
          timeLimit: jsonUploadData.timeLimit,
          difficulty: jsonUploadData.difficulty,
          isAIGenerated: false,
          language: quizData.language || 'english',
          // Apply global settings to uploaded questions
          questions: quizData.questions.map(q => ({
            ...q,
            type: q.type || 'mcq',
            correctAnswer: q.type === 'msq' ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : [])
              : q.type === 'numerical' ? (typeof q.correctAnswer === 'number' ? q.correctAnswer : parseFloat(q.correctAnswer) || 0)
                : (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0),
            options: Array.isArray(q.options) ? q.options : (q.type === 'numerical' ? undefined : []),
            tolerance: q.tolerance !== undefined ? q.tolerance : (q.type === 'numerical' ? 0 : undefined),
            partialMarking: q.partialMarking !== undefined ? q.partialMarking : (q.type === 'msq' ? false : undefined),
            negativeMarking: jsonUploadData.negativeMarking.enabled ? { ...jsonUploadData.negativeMarking } : null,
            image: q.image || null
          }))
        };

        setGeneratedQuiz(finalQuizData);
        setStep(2);
        setSuccess(`Loaded ${finalQuizData.questions.length} questions from file.`);
      } catch (err) {
        setError('Invalid JSON file format.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const createQuizFromGenerated = async () => {
    if (!generatedQuiz || !testSeries) return;

    setLoading(true);
    try {
      // FIX: Sanitize questions array to strictly remove 'undefined' values
      // Firestore throws an error if any field is explicitly 'undefined'
      const sanitizedQuestions = generatedQuiz.questions.map(q => {
        const base = {
          ...q,
          type: q.type || 'mcq',
          image: q.image || null,
          negativeMarking: q.negativeMarking || null,
          explanation: q.explanation || "No explanation provided"
        };
        // Clean up undefined fields for Firestore
        if (base.tolerance === undefined) delete base.tolerance;
        if (base.partialMarking === undefined) delete base.partialMarking;
        if (base.options === undefined) delete base.options;
        return base;
      });

      const quizDocument = {
        ...generatedQuiz,
        title: (generatedQuiz.title || 'Untitled Quiz').toString(),
        description: (generatedQuiz.description || '').toString(),
        testSeriesId: testSeries.id,
        testSeriesTitle: testSeries.title,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        isPartOfSeries: true,
        isPaid: false, // Default to free within series, or inherit
        totalQuestions: generatedQuiz.questions.length,
        // FIX: Ensure this is null, not undefined
        negativeMarking: generatedQuiz.isAIGenerated
          ? (aiPrompt.negativeMarking.enabled ? aiPrompt.negativeMarking : null)
          : (jsonUploadData.negativeMarking.enabled ? jsonUploadData.negativeMarking : null),
        totalAttempts: 0,
        averageScore: 0,
        questions: sanitizedQuestions // Use the sanitized array
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quizDocument);

      await updateDoc(doc(db, 'test-series', testSeries.id), {
        quizzes: arrayUnion(docRef.id),
        totalQuizzes: increment(1),
        updatedAt: serverTimestamp()
      });

      setSuccess('Quiz created successfully!');
      setTimeout(() => {
        onQuizCreated({ id: docRef.id, ...quizDocument });
      }, 1000);
    } catch (err) {
      console.error('Creation Error:', err);
      setError('Failed to save quiz to database.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleJSON = () => {
    const sample = {
      title: "Sample Quiz",
      questions: [
        {
          type: "mcq",
          question: "What is the capital of France?",
          options: ["London", "Paris", "Berlin", "Madrid"],
          correctAnswer: 1,
          explanation: "Paris is the capital city of France."
        },
        {
          type: "numerical",
          question: "What is the value of acceleration due to gravity (m/s²)?",
          correctAnswer: 9.8,
          tolerance: 0.1,
          explanation: "The standard value of g is approximately 9.8 m/s²."
        },
        {
          type: "msq",
          question: "Which of the following are noble gases?",
          options: ["Helium", "Oxygen", "Neon", "Nitrogen"],
          correctAnswer: [0, 2],
          partialMarking: true,
          explanation: "Helium and Neon are noble gases."
        }
      ]
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_quiz.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -- Render Helpers --

  // Common styles for inputs to ensure consistency
  const inputClasses = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium outline-none 
    ${mode(
    "bg-white border-zinc-200 text-zinc-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-zinc-400",
    "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-zinc-500"
  )}`;

  const labelClasses = `block text-xs font-semibold uppercase tracking-wider mb-2 ${mode("text-zinc-500", "text-zinc-400")}`;

  const cardClasses = `rounded-xl border shadow-sm p-6 ${mode(
    "bg-white border-zinc-200",
    "bg-zinc-900/50 border-zinc-800"
  )}`;

  // -- Views --

  if (!testSeries) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FiAlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className={`text-lg font-semibold ${mode("text-zinc-900", "text-white")}`}>Data Missing</h3>
        <p className={`mt-2 mb-6 ${mode("text-zinc-600", "text-zinc-400")}`}>Could not load test series context.</p>
        <button onClick={onBack} className={isDark ? "px-4 py-2 bg-zinc-800 rounded-lg text-sm font-medium" : "px-4 py-2 bg-zinc-100  rounded-lg text-sm font-medium"}>Go Back</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${mode("bg-zinc-50", "bg-zinc-950")}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className={`mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors ${mode("text-zinc-500 hover:text-rose-600", "text-zinc-400 hover:text-rose-400")}`}
          >
            <FiArrowLeft /> Back to Series
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${mode("text-zinc-900", "text-white")}`}>
                Content Generator
              </h1>
              <p className={`mt-1 flex items-center gap-2 text-sm ${mode("text-zinc-600", "text-zinc-400")}`}>
                Add content to <span className={`font-semibold ${mode("text-rose-600", "text-rose-400")}`}>{testSeries.title}</span>
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${mode("bg-white border-zinc-200", "bg-zinc-900 border-zinc-800")}`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? "text-rose-600" : "text-zinc-400"}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${step >= 1 ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-500"}`}>1</span>
                Input
              </div>
              <div className={isDark ? "w-4 h-px bg-zinc-700" : "w-4 h-px bg-zinc-300"}></div>
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= 2 ? "text-rose-600" : "text-zinc-400"}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${step >= 2 ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-500"}`}>2</span>
                Preview
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Messages */}
        {error && (
          <div className={isDark ? "mb-6 p-4 rounded-lg bg-red-900/20 border border-red-800 flex items-start gap-3" : "mb-6 p-4 rounded-lg bg-red-50  border border-red-200  flex items-start gap-3"}>
            <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className={isDark ? "text-sm text-red-200" : "text-sm text-red-800 "}>{error}</div>
          </div>
        )}

        {success && (
          <div className={isDark ? "mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-800 flex items-start gap-3" : "mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3"}>
            <FiCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className={isDark ? "text-sm text-emerald-200" : "text-sm text-emerald-800"}>{success}</div>
          </div>
        )}

        {/* Step 1: Input & Upload */}
        {step === 1 && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left: AI Generator */}
            <div className="lg:col-span-7 space-y-6">
              <div className={cardClasses}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
                    <FaMagic className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${mode("text-zinc-900", "text-white")}`}>AI Generator</h2>
                    <p className={`text-xs ${mode("text-zinc-500", "text-zinc-400")}`}>Use Gemini AI to generate questions instantly</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>Topic</label>
                    <div className="relative">
                      <FiTarget className="absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="e.g. Modern History, Organic Chemistry"
                        className={`${inputClasses} pl-10`}
                        value={aiPrompt.topic}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, topic: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Questions</label>
                      <select
                        className={inputClasses}
                        value={aiPrompt.questionCount}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      >
                        {[5, 10, 15, 20, 25, 30, 40, 50].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Language</label>
                      <select
                        className={inputClasses}
                        value={aiPrompt.language}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, language: e.target.value }))}
                      >
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                        <option value="mixed">Hinglish</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Difficulty</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setAiPrompt(prev => ({ ...prev, difficulty: level }))}
                          className={`capitalize py-2 px-3 text-sm rounded-lg border transition-all ${aiPrompt.difficulty === level
                              ? "bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-500"
                              : mode("bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50", "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800")
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Negative Marking Collapsible / Block */}
                  <div className={`p-4 rounded-lg border ${mode("bg-zinc-50 border-zinc-200", "bg-zinc-800/30 border-zinc-700")}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiAlertCircle className="text-orange-500" />
                        <span className={`text-sm font-medium ${mode("text-zinc-700", "text-zinc-200")}`}>Negative Marking</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={aiPrompt.negativeMarking.enabled}
                          onChange={(e) => setAiPrompt(prev => ({
                            ...prev,
                            negativeMarking: { ...prev.negativeMarking, enabled: e.target.checked }
                          }))}
                        />
                        <div className={isDark ? "w-9 h-5 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-800 rounded-full peer bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-rose-600" : "w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-300  rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-rose-600"}></div>
                      </label>
                    </div>

                    {aiPrompt.negativeMarking.enabled && (
                      <div className={isDark ? "grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-700" : "grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-200 "}>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Type</label>
                          <select
                            className={`${inputClasses} py-1.5 text-xs`}
                            value={aiPrompt.negativeMarking.type}
                            onChange={(e) => setAiPrompt(prev => ({ ...prev, negativeMarking: { ...prev.negativeMarking, type: e.target.value } }))}
                          >
                            <option value="fractional">Fractional</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Value</label>
                          <input
                            type="number"
                            step="0.05"
                            className={`${inputClasses} py-1.5 text-xs`}
                            value={aiPrompt.negativeMarking.value}
                            onChange={(e) => setAiPrompt(prev => ({ ...prev, negativeMarking: { ...prev.negativeMarking, value: parseFloat(e.target.value) } }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={generateWithAI}
                    disabled={loading || !aiPrompt.topic.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white shadow-md transition-all ${loading
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-rose-600 hover:bg-rose-700 hover:shadow-lg active:scale-[0.99]"
                      }`}
                  >
                    {loading ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                    {loading ? 'Generating...' : 'Generate Questions'}
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Divider */}
            <div className="flex lg:hidden items-center gap-4 text-zinc-400 text-sm font-medium py-2">
              <div className={isDark ? "h-px bg-zinc-700 flex-1" : "h-px bg-zinc-200  flex-1"}></div>
              OR
              <div className={isDark ? "h-px bg-zinc-700 flex-1" : "h-px bg-zinc-200  flex-1"}></div>
            </div>

            {/* Right: Upload */}
            <div className="lg:col-span-5 space-y-6">
              <div className={`${cardClasses} relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${mode("bg-emerald-500", "bg-emerald-600")}`}></div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={isDark ? "p-2.5 rounded-lg bg-emerald-900/30 text-emerald-400" : "p-2.5 rounded-lg bg-emerald-100  text-emerald-600 "}>
                    <FiUpload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${mode("text-zinc-900", "text-white")}`}>JSON Upload</h2>
                    <p className={`text-xs ${mode("text-zinc-500", "text-zinc-400")}`}>Import pre-made quiz structure</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors group ${mode(
                      "border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50/50",
                      "border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-900/10"
                    )
                      }`}
                  >
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <div className={isDark ? "mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" : "mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"}>
                      <FiFileText className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500" />
                    </div>
                    <p className={`text-sm font-medium ${mode("text-zinc-700", "text-zinc-300")}`}>Click to upload JSON</p>
                    <p className="text-xs text-zinc-400 mt-1">max size 10MB</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Time (min)</label>
                      <input
                        type="number"
                        className={inputClasses}
                        value={jsonUploadData.timeLimit}
                        onChange={(e) => setJsonUploadData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Difficulty</label>
                      <select
                        className={inputClasses}
                        value={jsonUploadData.difficulty}
                        onChange={(e) => setJsonUploadData(prev => ({ ...prev, difficulty: e.target.value }))}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload Settings - Simplified Negative Marking */}
                  <div className={`p-3 rounded-lg border ${mode("bg-zinc-50 border-zinc-200", "bg-zinc-800/30 border-zinc-700")}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">Negative Marking</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={jsonUploadData.negativeMarking.enabled}
                          onChange={(e) => setJsonUploadData(prev => ({
                            ...prev, negativeMarking: { ...prev.negativeMarking, enabled: e.target.checked }
                          }))}
                          className="accent-emerald-500 w-4 h-4 rounded"
                        />
                        {jsonUploadData.negativeMarking.enabled && (
                          <span className="text-xs text-emerald-600 font-medium">
                            -{jsonUploadData.negativeMarking.value} ({jsonUploadData.negativeMarking.type})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={downloadSampleJSON}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode(
                      "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50",
                      "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                    )
                      }`}
                  >
                    <FiDownload className="w-4 h-4" /> Download Sample JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Confirm */}
        {step === 2 && generatedQuiz && (
          <div className="space-y-6">

            {/* Summary Card */}
            <div className={`${cardClasses} relative overflow-hidden`}>
              {/* Subtle top border accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-emerald-500"></div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h2 className={`text-2xl font-bold ${mode("text-zinc-900", "text-white")}`}>{generatedQuiz.title}</h2>
                  <p className={`mt-2 ${mode("text-zinc-600", "text-zinc-400")}`}>{generatedQuiz.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={isDark ? "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700" : "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-600  border border-zinc-200 "}>
                      <FiLayers className="w-3.5 h-3.5" /> {generatedQuiz.questions.length} Questions
                    </span>
                    <span className={isDark ? "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700" : "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600  border border-zinc-200 "}>
                      <FiClock className="w-3.5 h-3.5" /> {generatedQuiz.timeLimit} Mins
                    </span>
                    <span className={isDark ? "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize" : "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100  text-zinc-600  border border-zinc-200  capitalize"}>
                      <FiTrendingUp className="w-3.5 h-3.5" /> {generatedQuiz.difficulty}
                    </span>
                    {generatedQuiz.isAIGenerated && (
                      <span className={isDark ? "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-900/30 text-indigo-300 border border-indigo-800" : "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50  text-indigo-700  border border-indigo-200 "}>
                        <FaMagic className="w-3 h-3" /> AI Generated
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => setStep(1)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${mode("bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50", "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800")}`}
                  >
                    Edit Settings
                  </button>
                  <button
                    onClick={createQuizFromGenerated}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-sm flex items-center gap-2"
                  >
                    {loading ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    Save Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold px-1 ${mode("text-zinc-800", "text-zinc-200")}`}>Questions Preview</h3>

              {generatedQuiz.questions.map((q, idx) => (
                <div key={idx} className={`p-6 rounded-xl border ${mode("bg-white border-zinc-200", "bg-zinc-900/50 border-zinc-800")}`}>
                  <div className="flex items-start gap-4">
                    <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${mode("bg-zinc-100 text-zinc-500", "bg-zinc-800 text-zinc-400")}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-base font-medium mb-4 ${mode("text-zinc-900", "text-zinc-100")}`}>{q.question}</p>

                      {q.image && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 w-fit max-w-full">
                          <img src={q.image} alt="Question Reference" className="h-48 object-contain bg-zinc-50 dark:bg-zinc-800" />
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-3 transition-colors ${oIdx === q.correctAnswer
                                ? isDark ? " text-emerald-800 bg-emerald-900/10 border-emerald-800 dark:text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800  "
                                : mode("bg-white border-zinc-200 text-zinc-600", "bg-zinc-900 border-zinc-700 text-zinc-400")
                              }`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${oIdx === q.correctAnswer ? "border-emerald-500 bg-emerald-500" : "border-zinc-400"
                              }`}>
                              {oIdx === q.correctAnswer && <FiCheck className="w-3 h-3 text-white" />}
                            </div>
                            {opt}
                          </div>
                        ))}
                      </div>

                      <div className={isDark ? "flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-4 border-t border-zinc-800" : "flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-4 border-t border-zinc-100 "}>
                        {/* Explanation */}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Explanation</p>
                          <p className={`text-sm ${mode("text-zinc-600", "text-zinc-400")}`}>{q.explanation}</p>
                        </div>

                        {/* Inline Negative Marking Toggle */}
                        <div className={`flex items-center gap-3 p-2 rounded border ${mode("bg-zinc-50 border-zinc-200", "bg-zinc-800 border-zinc-700")}`}>
                          <FiAlertCircle className={`w-4 h-4 ${q.negativeMarking?.enabled ? "text-orange-500" : "text-zinc-400"}`} />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Neg. Marking</span>
                            <span className={`text-xs font-medium ${q.negativeMarking?.enabled ? "text-orange-600" : "text-zinc-400"}`}>
                              {q.negativeMarking?.enabled ? `On (-${q.negativeMarking.value})` : 'Off'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newQs = [...generatedQuiz.questions];
                              const current = newQs[idx].negativeMarking || { enabled: false, type: 'fractional', value: 0.25 };
                              newQs[idx].negativeMarking = current.enabled ? null : { ...current, enabled: true };
                              setGeneratedQuiz({ ...generatedQuiz, questions: newQs });
                            }}
                            className={isDark ? `text-xs px-2 py-1 rounded bg-zinc-700 border border-zinc-600 shadow-sm ${mode("text-zinc-700", "text-zinc-200")}` : `text-xs px-2 py-1 rounded bg-white  border border-zinc-200  shadow-sm ${mode("text-zinc-700", "text-zinc-200")}`}
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar for Step 2 */}
      {step === 2 && (
        <div className={isDark ? "fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 sm:hidden z-50 flex gap-3 shadow-lg" : "fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 sm:hidden z-50 flex gap-3 shadow-lg"}>
          <button
            onClick={() => setStep(1)}
            className={isDark ? "flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-300 font-medium" : "flex-1 py-3 rounded-lg border border-zinc-300  text-zinc-700  font-medium"}
          >
            Back
          </button>
          <button
            onClick={createQuizFromGenerated}
            disabled={loading}
            className="flex-[2] py-3 rounded-lg bg-rose-600 text-white font-medium shadow-md flex justify-center items-center gap-2"
          >
            {loading ? <FiRefreshCw className="animate-spin" /> : 'Create Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TestSeriesAIGenerator;