import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { validateQuizJSON } from '../../services/geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import SectionWiseQuizCreator from './SectionWiseQuizCreator';
import { 
  FiUpload, 
  FiDownload, 
  FiZap, 
  FiFileText, 
  FiCheck, 
  FiX, 
  FiLoader,
  FiArrowLeft,
  FiCpu,
  FiBookOpen,
  FiStar,
  FiBriefcase,
  FiLayers,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiEdit3,
  FiEye
} from 'react-icons/fi';

const AIQuizGenerator = ({ onBack, onQuizCreated, testSeriesId }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // Theme mode function similar to other components
  const mode = (light, dark) => (isDark ? dark : light);
  const [step, setStep] = useState(1); // 1: Generate/Upload, 2: Review & Create
  const [activeTab, setActiveTab] = useState('ai'); // 'ai', 'upload', or 'section'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // AI Generation State
  const [aiForm, setAiForm] = useState({
    topic: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
    language: 'English',
    negativeMarking: {
      enabled: false,
      type: 'fractional',
      value: 0.25
    }
  });

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [jsonUploadSettings, setJsonUploadSettings] = useState({
    timeLimit: 30,
    difficulty: 'medium',
    negativeMarking: {
      enabled: false,
      type: 'fractional',
      value: 0.25
    }
  });

  // Test Series Selection State
  const [testSeriesList, setTestSeriesList] = useState([]);
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [loadingTestSeries, setLoadingTestSeries] = useState(false);
  const [showTestSeriesSelector, setShowTestSeriesSelector] = useState(false);
  const [testSeriesSearchTerm, setTestSeriesSearchTerm] = useState('');
  const [testSeriesFilter, setTestSeriesFilter] = useState('all'); // 'all', 'my-series', 'subscribed'

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Load Test Series
  const loadTestSeries = async () => {
    setLoadingTestSeries(true);
    try {
      let q;
      
      switch (testSeriesFilter) {
        case 'my-series':
          q = query(
            collection(db, 'test-series'),
            where('createdBy', '==', currentUser.uid),
            where('isPublished', '==', true)
          );
          break;
        case 'subscribed':
          // Get user's subscribed series
          const subscriptionsQuery = query(
            collection(db, 'test-series-subscriptions'),
            where('userId', '==', currentUser.uid),
            where('status', '==', 'active')
          );
          const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
          const subscribedSeriesIds = subscriptionsSnapshot.docs.map(doc => doc.data().testSeriesId);
          
          if (subscribedSeriesIds.length === 0) {
            setTestSeriesList([]);
            setLoadingTestSeries(false);
            return;
          }
          
          q = query(
            collection(db, 'test-series'),
            where('isPublished', '==', true)
          );
          break;
        default:
          q = query(
            collection(db, 'test-series'),
            where('isPublished', '==', true)
          );
      }
      
      const querySnapshot = await getDocs(q);
      const seriesData = [];
      
      // Handle subscribed filter separately
      if (testSeriesFilter === 'subscribed') {
        const subscriptionsQuery = query(
          collection(db, 'test-series-subscriptions'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const subscribedSeriesIds = subscriptionsSnapshot.docs.map(doc => doc.data().testSeriesId);
        
        querySnapshot.forEach((doc) => {
          const seriesInfo = { id: doc.id, ...doc.data() };
          if (subscribedSeriesIds.includes(seriesInfo.id)) {
            seriesData.push(seriesInfo);
          }
        });
      } else {
        querySnapshot.forEach((doc) => {
          const seriesInfo = { id: doc.id, ...doc.data() };
          seriesData.push(seriesInfo);
        });
      }
      
      setTestSeriesList(seriesData);
    } catch (error) {
      console.error('Error loading test series:', error);
      setError('Failed to load test series');
    } finally {
      setLoadingTestSeries(false);
    }
  };

  // Filter test series based on search term
  const filteredTestSeries = testSeriesList.filter(series => 
    series.title.toLowerCase().includes(testSeriesSearchTerm.toLowerCase()) ||
    series.description?.toLowerCase().includes(testSeriesSearchTerm.toLowerCase())
  );

  // Enhanced JSON cleanup function
  const cleanupJSONResponse = (text) => {
    // Remove common markdown code fence patterns
    let cleaned = text
      .replace(/```json\s*/gi, '')  // Remove ```
      .replace(/```\s*/g, '')       // Remove ```
      .replace(/````````````/g, '')
      .trim();
    
    // Find JSON object boundaries
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    
    return cleaned;
  };

  // AI Quiz Generation
  const handleAIGeneration = async () => {
    if (!aiForm.topic.trim()) {
      setError('Please enter a topic for the quiz');
      return;
    }

    if (!selectedTestSeries) {
      setError('Please select a test series first');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const prompt = `Create a quiz with exactly ${aiForm.numberOfQuestions} multiple-choice questions about "${aiForm.topic}".

Requirements:
- Difficulty: ${aiForm.difficulty}
- Each question must have exactly 4 options
- Include explanations for correct answers
- Language: ${aiForm.language}
- For each question, suggest a relevant Cloudinary image URL that would help illustrate the question
- Image URLs should be from Cloudinary (res.cloudinary.com) and relevant to the question content
- If no relevant image is available, use null for the image field

Return ONLY a valid JSON object in this exact format (no markdown, no code fences, no additional text):

{
  "title": "Quiz Title Here",
  "description": "Brief quiz description",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation for the correct answer",
      "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sample.jpg"
    }
  ]
}

Generate exactly ${aiForm.numberOfQuestions} questions total. Ensure all JSON is valid and properly formatted.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response
      const cleanedText = cleanupJSONResponse(text);
      
      try {
        const quizData = JSON.parse(cleanedText);
        
        // Validate the quiz data
        const validation = validateQuizJSON(quizData);
        if (validation.valid) {
          // Initialize negative marking settings for each question
          const quizDataWithNegativeMarking = {
            ...quizData,
            negativeMarking: aiForm.negativeMarking,
            questions: quizData.questions.map(q => ({
              ...q,
              negativeMarking: aiForm.negativeMarking
            }))
          };
          
          setPreviewData(quizDataWithNegativeMarking);
          setShowPreview(true);
          setStep(2);
          setSuccess(`Generated ${quizData.questions.length} questions successfully!`);
        } else {
          setError(`Invalid quiz format: ${validation.error}`);
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        setError('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred while generating the quiz');
      console.error('AI Generation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        const validation = validateQuizJSON(parsedData);
        
        if (validation.valid) {
          // Add metadata for JSON uploads using user input
          const finalData = {
            ...parsedData,
            timeLimit: jsonUploadSettings.timeLimit,
            difficulty: jsonUploadSettings.difficulty,
            negativeMarking: jsonUploadSettings.negativeMarking,
            questions: parsedData.questions.map(q => ({
              ...q,
              negativeMarking: jsonUploadSettings.negativeMarking
            }))
          };
          
          setJsonData(finalData);
          setPreviewData(finalData);
          setShowPreview(true);
          setStep(2);
          setSuccess('JSON file uploaded and validated successfully!');
          clearMessages();
        } else {
          setError(`Invalid JSON: ${validation.error}`);
          setJsonData(null);
          setPreviewData(null);
        }
      } catch (error) {
        setError('Invalid JSON file format');
        setJsonData(null);
        setPreviewData(null);
      }
    };
    
    reader.readAsText(file);
  };

  // Create Quiz in Firebase
  const createQuizFromData = async (quizData) => {
    setLoading(true);
    clearMessages();

    try {
      const processedQuestions = quizData.questions.map(q => ({
        id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        negativeMarking: q.negativeMarking || {
          enabled: false,
          type: 'fractional',
          value: 0.25
        }
      }));

      const finalQuizData = {
        title: quizData.title,
        description: quizData.description || '',
        questions: processedQuestions,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        totalQuestions: processedQuestions.length,
        isAIGenerated: activeTab === 'ai',
        testSeriesId: selectedTestSeries?.id || testSeriesId || null,
        testSeriesTitle: selectedTestSeries?.title || null,
        difficulty: quizData.difficulty || aiForm.difficulty,
        timeLimit: quizData.timeLimit,
        negativeMarking: quizData.negativeMarking || {
          enabled: false,
          type: 'fractional',
          value: 0.25
        },
        totalAttempts: 0,
        isPartOfSeries: selectedTestSeries ? true : false
      };

      const docRef = await addDoc(collection(db, 'quizzes'), finalQuizData);
      
      // If a test series is selected, update the series with the new quiz
      if (selectedTestSeries) {
        await updateDoc(doc(db, 'test-series', selectedTestSeries.id), {
          quizzes: arrayUnion(docRef.id),
          totalQuizzes: increment(1),
          updatedAt: serverTimestamp()
        });
      }
      
      setSuccess(`Quiz created successfully${selectedTestSeries ? ` and added to "${selectedTestSeries.title}"` : ''}!`);
      setTimeout(() => {
        onQuizCreated();
      }, 2000);
    } catch (error) {
      setError('Failed to create quiz. Please try again.');
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download Sample JSON
  const downloadSampleJSON = () => {
    const sampleData = {
      title: "Sample JavaScript Quiz",
      description: "Test your JavaScript knowledge",
      questions: [
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: [
            "var myVar = 5;",
            "variable myVar = 5;",
            "v myVar = 5;",
            "declare myVar = 5;"
          ],
          correctAnswer: 0,
          explanation: "The 'var' keyword is used to declare variables in JavaScript."
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: [
            "pop()",
            "push()",
            "shift()",
            "unshift()"
          ],
          correctAnswer: 1,
          explanation: "The push() method adds one or more elements to the end of an array."
        },
        {
          question: "What does the 'typeof' operator return for an array?",
          options: [
            "array",
            "Array",
            "object",
            "undefined"
          ],
          correctAnswer: 2,
          explanation: "In JavaScript, arrays are objects, so typeof returns 'object'."
        },
        {
          question: "Which of these is NOT a valid way to create an array?",
          options: [
            "let arr = [1, 2, 3];",
            "let arr = new Array(1, 2, 3);",
            "let arr = Array.from([1, 2, 3]);",
            "let arr = Array.create(1, 2, 3);"
          ],
          correctAnswer: 3,
          explanation: "Array.create() is not a valid method. Use Array.from() or new Array() instead."
        }
      ]
    };

    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-quiz.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Step 2: Review & Create
  if (showPreview && previewData && step === 2) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              setShowPreview(false);
              setStep(1);
            }}
            className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-700')}`}
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${mode('text-slate-800', 'text-white')}`}>
              Review Quiz
            </h1>
            <p className={mode('text-slate-600', 'text-gray-400')}>
              Check your questions before creating the quiz
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${mode('bg-red-50 border-red-200 text-red-700', 'bg-red-900/20 border-red-800/50 text-red-400')} border`}>
            {error}
          </div>
        )}

        {success && (
          <div className={`mb-4 p-4 rounded-lg ${mode('bg-green-50 border-green-200 text-green-700', 'bg-green-900/20 border-green-800/50 text-green-400')} border`}>
            {success}
          </div>
        )}

        {/* Quiz Info */}
        <div className={`backdrop-blur-sm border rounded-xl p-6 mb-6 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/60 border-gray-700/60')}`}>
          <h2 className={`text-2xl font-bold mb-2 ${mode('text-slate-800', 'text-white')}`}>
            {previewData.title}
          </h2>
          {previewData.description && (
            <p className={`mb-4 ${mode('text-slate-600', 'text-gray-400')}`}>
              {previewData.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${mode('bg-blue-100/30 text-blue-600', 'bg-blue-900/30 text-blue-400')}`}>
              <FiLayers className="w-4 h-4" />
              <span>{previewData.questions.length} questions</span>
            </div>
            
            <div className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${mode('bg-purple-100/30 text-purple-600', 'bg-purple-900/30 text-purple-400')}`}>
              {activeTab === 'ai' ? (
                <>
                  <FiCpu className="w-4 h-4" />
                  <span>AI Generated</span>
                </>
              ) : (
                <>
                  <FiFileText className="w-4 h-4" />
                  <span>JSON Upload</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-4 mb-8">
          {previewData.questions.map((question, index) => (
            <div 
              key={index} 
              className={`backdrop-blur-sm border rounded-xl p-6 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/60 border-gray-700/60')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${mode('text-slate-800', 'text-white')}`}>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${mode('bg-blue-100/30 text-blue-600', 'bg-blue-900/30 text-blue-400')}`}>
                    {index + 1}
                  </span>
                  <span>{question.question}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg ${
                      optionIndex === question.correctAnswer
                        ? mode('border-l-4 border-green-600 bg-green-100/20', 'border-l-4 border-green-600 bg-green-900/20')
                        : mode('border-l-4 border-slate-400 bg-slate-100/30', 'border-l-4 border-gray-600 bg-gray-700/30')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {optionIndex === question.correctAnswer ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${mode('bg-green-100/50', 'bg-green-900/50')}`}>
                          <FiCheck className={`w-3 h-3 ${mode('text-green-600', 'text-green-400')}`} />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode('border-slate-400', 'border-gray-600')}`}>
                          <span className={`text-xs font-medium ${mode('text-slate-600', 'text-gray-400')}`}>{String.fromCharCode(65 + optionIndex)}</span>
                        </div>
                      )}
                      <span className={`${optionIndex === question.correctAnswer ? mode('text-green-600 font-medium', 'text-green-400 font-medium') : mode('text-slate-700', 'text-gray-300')}`}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className={`border rounded-lg p-3 ${mode('bg-blue-100/20 border-blue-300/50', 'bg-blue-900/20 border-blue-800/50')}`}>
                  <p className={`text-sm ${mode('text-blue-700', 'text-blue-300')}`}>
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Quiz Button */}
        <div className="text-center">
          <button
            onClick={() => createQuizFromData(previewData)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Quiz...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                <span>Create Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Generate/Upload
  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 ${mode('bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/15', 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10')}`}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-green-500/5 rounded-full blur-2xl animate-pulse delay-1500"></div>
      </div>

      {/* Custom CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4); }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-glow {
            animation: glow 4s ease-in-out infinite;
          }

          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 3s infinite;
          }

          .gradient-text {
            background: linear-gradient(-45deg, #3B82F6, #8B5CF6, #06B6D4, #3B82F6);
            background-size: 400% 400%;
            animation: gradient 8s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
          }
        `}
      </style>
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className={`${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/80 border-gray-700/60')} backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden`}>
          {/* Enhanced Header */}
          <div className={`relative p-8 sm:p-10 border-b ${mode('border-slate-200/60', 'border-gray-700/60')}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className={`group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 ${mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400', 'bg-gray-700/60 border-gray-600/60 text-gray-300 hover:bg-gray-600/60 hover:border-gray-500/60')} border`}
                >
                  <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div>
                  <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r mb-2 ${mode('from-slate-800 via-blue-600 to-purple-600', 'from-white via-blue-200 to-purple-200')}`}>
                    AI Quiz Generator
                  </h1>
                  <p className={`text-lg flex items-center gap-2 ${mode('text-slate-600', 'text-gray-300')}`}>
                    <FiZap className="w-5 h-5 text-blue-400 animate-pulse" />
                    Generate tests for {testSeriesId ? '"GA"' : 'your series'} using AI
                  </p>
                </div>
              </div>
              
              {/* AI Status Indicator */}
              <div className={`flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border rounded-xl ${mode('border-blue-400/30', 'border-blue-500/30')}`}>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${mode('text-blue-600', 'text-blue-300')}`}>AI Ready</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {/* Enhanced Step Indicator */}
            <div className="flex justify-center mb-12">
              <div className="relative flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-2xl animate-pulse">
                      1
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <span className={`mt-3 font-semibold text-lg ${mode('text-blue-600', 'text-blue-400')}`}>Generate/Upload</span>
                </div>
                <div className="relative">
                  <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <div className="absolute inset-0 w-32 h-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl ${mode('bg-slate-200/60 border-slate-400/60 text-slate-500', 'bg-gray-700/60 border-gray-600/60 text-gray-400')}`}>
                    2
                  </div>
                  <span className={`mt-3 font-semibold text-lg ${mode('text-slate-500', 'text-gray-500')}`}>Review & Create</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className={`${mode('bg-slate-100/60 border-slate-300/60', 'bg-gray-900/60 border-gray-700/60')} border rounded-xl p-1`}>
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'ai'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : mode('text-slate-600 hover:text-slate-800 hover:bg-slate-200/60', 'text-gray-400 hover:text-white hover:bg-gray-800/60')
                    }`}
                  >
                    <FiCpu className="w-4 h-4" />
                    AI Generation
                  </button>
                  <button
                    onClick={() => setActiveTab('section')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'section'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : mode('text-slate-600 hover:text-slate-800 hover:bg-slate-200/60', 'text-gray-400 hover:text-white hover:bg-gray-800/60')
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                    Section-Wise
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'upload'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : mode('text-slate-600 hover:text-slate-800 hover:bg-slate-200/60', 'text-gray-400 hover:text-white hover:bg-gray-800/60')
                    }`}
                  >
                    <FiFileText className="w-4 h-4" />
                    JSON Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className={`mb-6 p-4 rounded-lg ${mode('bg-red-50 border-red-200 text-red-700', 'bg-red-900/20 border-red-800/50 text-red-400')} border`}>
                {error}
              </div>
            )}
            {success && (
              <div className={`mb-6 p-4 rounded-lg ${mode('bg-green-50 border-green-200 text-green-700', 'bg-green-900/20 border-green-800/50 text-green-400')} border`}>
                {success}
              </div>
            )}

            {/* Enhanced Test Series Selection */}
            <div className={`${mode('bg-gradient-to-r from-slate-100/60 to-slate-200/60 border-slate-300/60', 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-gray-700/60')} backdrop-blur-xl border rounded-2xl p-8 mb-8 flex flex-col gap-6`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                    <FiBookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${mode('text-slate-800', 'text-white')}`}>Select Test Series <span className="text-red-500">*</span></h2>
                  <p className={mode('text-slate-600', 'text-gray-300')}>Choose a test series to add this quiz to</p>
                </div>
              </div>

              {/* Selected Test Series Display */}
              {selectedTestSeries && (
                <div className={`mb-6 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border rounded-xl ${mode('border-purple-400/50', 'border-purple-700/50')}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FiBookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${mode('text-slate-800', 'text-white')}`}>{selectedTestSeries.title}</h3>
                        <p className={mode('text-slate-600', 'text-gray-300')}>{selectedTestSeries.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-sm px-2 py-1 rounded-full ${mode('text-purple-700 bg-purple-100/30', 'text-purple-300 bg-purple-900/30')}`}>
                            {selectedTestSeries.totalQuizzes || 0} quizzes
                          </span>
                          <span className={`text-sm px-2 py-1 rounded-full ${mode('text-blue-700 bg-blue-100/30', 'text-blue-300 bg-blue-900/30')}`}>
                            {selectedTestSeries.difficulty} level
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTestSeries(null)}
                      className={`transition-colors p-2 rounded-lg ${mode('text-slate-500 hover:text-slate-700 hover:bg-slate-200/50', 'text-gray-400 hover:text-white hover:bg-gray-700/50')}`}
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Test Series Selector */}
              {!selectedTestSeries && (
                <div>
                  <button
                    onClick={() => {
                      setShowTestSeriesSelector(!showTestSeriesSelector);
                      if (!showTestSeriesSelector) {
                        loadTestSeries();
                      }
                    }}
                    className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl px-6 py-4 transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FiBookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-lg">Select Test Series</span>
                      <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Section-Wise Quiz Creation */}
            {activeTab === 'section' && (
              <div className={`${mode('bg-gradient-to-r from-slate-100/60 to-slate-200/60 border-slate-300/60', 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-gray-700/60')} backdrop-blur-xl border rounded-2xl p-8 mb-8`}>
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiGrid className="w-8 h-8 text-white" />
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${mode('text-slate-800', 'text-white')}`}>Section-Wise Quiz Creator</h2>
                    <p className={mode('text-slate-600', 'text-gray-300')}>Create quizzes with multiple sections and section-specific settings</p>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        // Navigate to section-wise quiz creator
                        window.location.href = '/section-quiz-creator';
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
                    >
                                              <FiGrid className="w-6 h-6" />
                        <span>Open Section-Wise Quiz Creator</span>
                    </button>
                    
                    <div className={`text-sm max-w-md mx-auto ${mode('text-slate-600', 'text-gray-400')}`}>
                      <p>• Create multiple sections with different time limits</p>
                      <p>• Set section-specific negative marking rules</p>
                      <p>• Override negative marking for individual questions</p>
                      <p>• Manage questions within each section independently</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced AI Generation Form */}
            {activeTab === 'ai' && (
            <div className={`${mode('bg-gradient-to-r from-slate-100/60 to-slate-200/60 border-slate-300/60', 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-gray-700/60')} backdrop-blur-xl border rounded-2xl p-8 mb-8 flex flex-col gap-8`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                    <FiCpu className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${mode('text-slate-800', 'text-white')}`}>AI Quiz Generator</h2>
                  <p className={mode('text-slate-600', 'text-gray-300')}>Generate quiz questions using AI for {selectedTestSeries ? `"${selectedTestSeries.title}"` : 'your series'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topic/Subject */}
                <div className="flex flex-col gap-3">
                  <label className={`block text-sm font-semibold flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiBookOpen className="w-4 h-4 text-blue-400" />
                    Topic/Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics, Physics, Computer Science"
                    value={aiForm.topic}
                    onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                    className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-base shadow-lg ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-500')}`}
                  />
                </div>
                {/* Number of Questions */}
                <div className="flex flex-col gap-3">
                  <label className={`block text-sm font-semibold flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiLayers className="w-4 h-4 text-purple-400" />
                    Number of Questions
                  </label>
                  <select
                    value={aiForm.numberOfQuestions}
                    onChange={(e) => setAiForm(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
                    className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 appearance-none text-base shadow-lg ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>25 Questions</option>
                    <option value={25}>50 Questions</option>
                    <option value={30}>75 Questions</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Level */}
                <div className="flex flex-col gap-3">
                  <label className={`block text-sm font-semibold flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiStar className="w-4 h-4 text-yellow-400" />
                    Difficulty Level
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300 appearance-none text-base shadow-lg ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                {/* Language */}
                <div className="flex flex-col gap-3">
                  <label className={`block text-sm font-semibold flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiBriefcase className="w-4 h-4 text-green-400" />
                    Language
                  </label>
                  <select
                    value={aiForm.language}
                    onChange={(e) => setAiForm(prev => ({ ...prev, language: e.target.value }))}
                    className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 appearance-none text-base shadow-lg ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
              </div>

              {/* Negative Marking Settings */}
              <div className={`border-t pt-6 ${mode('border-slate-300/60', 'border-gray-700/60')}`}>
                <div className={`p-6 bg-gradient-to-r from-red-500/5 to-pink-500/5 border rounded-xl ${mode('border-red-300/20', 'border-red-500/20')}`}>
                  <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg">
                      <FiAlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <label className={`block text-lg font-semibold ${mode('text-slate-800', 'text-white')}`}>
                        Negative Marking Settings
                      </label>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex flex-col gap-3">
                      <label className={`block text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>Enable Negative Marking</label>
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${mode('border-slate-300 bg-slate-100/40', 'border-gray-700 bg-gray-800/40')}`}>
                        <span className={`text-sm ${mode('text-slate-600', 'text-gray-400')}`}>Off</span>
                        <button
                          type="button"
                          onClick={() => setAiForm(prev => ({
                            ...prev,
                            negativeMarking: {
                              ...prev.negativeMarking,
                              enabled: !prev.negativeMarking?.enabled
                            }
                          }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            aiForm.negativeMarking?.enabled
                              ? 'bg-red-500'
                              : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              aiForm.negativeMarking?.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-sm ${mode('text-slate-600', 'text-gray-400')}`}>On</span>
                      </div>
                    </div>

                    {/* Marking Type */}
                    <div className="flex flex-col gap-3">
                      <label className={`block text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>Marking Type</label>
                      <select
                        value={aiForm.negativeMarking?.type || 'fractional'}
                        onChange={(e) => setAiForm(prev => ({
                          ...prev,
                          negativeMarking: {
                            ...prev.negativeMarking,
                            type: e.target.value
                          }
                        }))}
                        disabled={!aiForm.negativeMarking?.enabled}
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 appearance-none text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
                      >
                        <option value="fractional">Fractional (1/4th mark deduction)</option>
                        <option value="fixed">Fixed mark deduction</option>
                      </select>
                    </div>

                    {/* Marking Value */}
                    <div className="flex flex-col gap-3">
                      <label className={`block text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>
                        {aiForm.negativeMarking?.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={aiForm.negativeMarking?.value || 0.25}
                        onChange={(e) => setAiForm(prev => ({
                          ...prev,
                          negativeMarking: {
                            ...prev.negativeMarking,
                            value: parseFloat(e.target.value) || 0.25
                          }
                        }))}
                        disabled={!aiForm.negativeMarking?.enabled}
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-500')}`}
                        placeholder="0.25"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {aiForm.negativeMarking?.enabled && (
                    <div className={`p-4 border rounded-lg ${mode('bg-red-50 border-red-300', 'bg-red-500/10 border-red-500/30')}`}>
                      <p className={`text-sm ${mode('text-red-700', 'text-red-300')}`}>
                        <strong>Negative Marking Active:</strong> For each wrong answer, 
                        {aiForm.negativeMarking?.type === 'fractional' 
                          ? ` ${aiForm.negativeMarking?.value || 0.25} marks will be deducted`
                          : ` ${aiForm.negativeMarking?.value || 0.25} marks will be deducted`
                        }
                      </p>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              
              {/* Enhanced Generate Button */}
              <div className="relative mt-6">
                <button
                  onClick={handleAIGeneration}
                  disabled={loading || !aiForm.topic.trim() || !selectedTestSeries}
                  className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold rounded-xl px-6 py-4 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">Generating Quiz...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FiZap className="w-6 h-6" />
                        </div>
                        <span className="text-lg">Generate with AI</span>
                        <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
            )}

            {/* Enhanced OR Separator */}
            <div className="relative flex items-center my-12">
              <div className={`flex-grow h-px bg-gradient-to-r from-transparent to-transparent ${mode('via-slate-400', 'via-gray-600')}`}></div>
              <div className="relative px-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl rounded-full"></div>
                <span className={`relative px-6 py-2 font-bold text-lg rounded-full border ${mode('text-slate-600 bg-slate-100/80 border-slate-300/60', 'text-gray-400 bg-gray-800/80 border-gray-700/60')}`}>OR</span>
              </div>
              <div className={`flex-grow h-px bg-gradient-to-r from-transparent to-transparent ${mode('via-slate-400', 'via-gray-600')}`}></div>
            </div>

            {/* Enhanced JSON Upload */}
            {activeTab === 'upload' && (
            <div className={`${mode('bg-gradient-to-r from-slate-100/60 to-slate-200/60 border-slate-300/60', 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-gray-700/60')} backdrop-blur-xl border rounded-2xl p-8 flex flex-col gap-6 hover:border-green-500/30 transition-all duration-300`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                    <FiFileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${mode('text-slate-800', 'text-white')}`}>Upload JSON File</h2>
                  <p className={mode('text-slate-600', 'text-gray-300')}>Upload a pre-made quiz in JSON format for instant creation</p>
                </div>
              </div>
              
              <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center hover:border-green-500/60 transition-all duration-300 group ${mode('border-slate-400/60', 'border-gray-600/60')}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <FiUpload className={`w-20 h-20 group-hover:text-green-400 transition-colors duration-300 ${mode('text-slate-500', 'text-gray-500')}`} />
                      <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-upload"
                  />
                  <label
                    htmlFor="json-upload"
                    className="group/btn relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 cursor-pointer inline-block shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <FiUpload className="w-5 h-5" />
                      <span>Choose JSON File</span>
                    </div>
                  </label>
                  <p className={`text-base mt-4 ${mode('text-slate-600', 'text-gray-400')}`}>Drag and drop or click to select a quiz JSON file</p>
                  <p className={`text-sm mt-2 ${mode('text-slate-500', 'text-gray-500')}`}>Supports standard quiz JSON format</p>
                </div>
              </div>

              {/* Time Limit and Difficulty Settings for JSON Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Time Limit */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiClock className="w-4 h-4 text-green-400" />
                    Time Limit (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={jsonUploadSettings.timeLimit}
                      onChange={(e) => setJsonUploadSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-800/60 border-gray-600/40 text-white placeholder-gray-500')}`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <FiClock className={`w-4 h-4 ${mode('text-slate-500', 'text-gray-500')}`} />
                    </div>
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiTrendingUp className="w-4 h-4 text-green-400" />
                    Difficulty Level
                  </label>
                  <div className="relative">
                    <select
                      value={jsonUploadSettings.difficulty}
                      onChange={(e) => setJsonUploadSettings(prev => ({ ...prev, difficulty: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all duration-300 font-medium ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-800/60 border-gray-600/40 text-white')}`}
                    >
                      <option value="easy">🟢 Easy Level</option>
                      <option value="medium">🟡 Medium Level</option>
                      <option value="hard">🔴 Hard Level</option>
                    </select>
                    <FiChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 ${mode('text-slate-500', 'text-gray-500')}`} />
                  </div>
                </div>

                {/* Negative Marking */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-2 text-sm font-semibold ${mode('text-slate-700', 'text-gray-300')}`}>
                    <FiAlertCircle className="w-4 h-4 text-red-400" />
                    Negative Marking
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${mode('text-slate-600', 'text-gray-400')}`}>{jsonUploadSettings.negativeMarking.enabled ? '✅ Enable' : '⚙️ Disable'}</span>
                      <button
                        type="button"
                        onClick={() => setJsonUploadSettings(prev => ({
                          ...prev,
                          negativeMarking: {
                            ...prev.negativeMarking,
                            enabled: !prev.negativeMarking.enabled
                          }
                        }))}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          jsonUploadSettings.negativeMarking.enabled
                            ? 'bg-red-500'
                            : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            jsonUploadSettings.negativeMarking.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {jsonUploadSettings.negativeMarking.enabled && (
                      <div className="space-y-2">
                        <select
                          value={jsonUploadSettings.negativeMarking.type}
                          onChange={(e) => setJsonUploadSettings(prev => ({
                            ...prev,
                            negativeMarking: {
                              ...prev.negativeMarking,
                              type: e.target.value
                            }
                          }))}
                          className={`w-full px-2 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-800 border-gray-600 text-white')}`}
                        >
                          <option value="fractional" className='rounded-md border-none text-black'>Fractional</option>
                          <option value="fixed" className='rounded-md border-none text-black'>Fixed</option>
                        </select>
                        
                        <input
                          type="number"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={jsonUploadSettings.negativeMarking.value}
                          onChange={(e) => setJsonUploadSettings(prev => ({
                            ...prev,
                            negativeMarking: {
                              ...prev.negativeMarking,
                              value: parseFloat(e.target.value) || 0.25
                            }
                          }))}
                          className={`w-full px-2 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`}
                          placeholder="0.25"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview and Edit Section */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/60 to-gray-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <FiEye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Review & Edit Quiz</h3>
                    <p className="text-gray-300">Review the generated quiz and customize settings before creating</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createQuizFromData(previewData)}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Quiz'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz Details */}
            <div className="p-6 border-b border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={previewData.title}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={previewData.description || ''}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Global Negative Marking Settings */}
            <div className="p-6 border-b border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700 bg-gray-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        Enable Global Negative Marking
                      </div>
                      <div className="text-sm text-gray-400">
                        Set default negative marking for all questions
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewData(prev => ({
                      ...prev,
                      negativeMarking: {
                        ...prev.negativeMarking,
                        enabled: !prev.negativeMarking?.enabled
                      }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      previewData.negativeMarking?.enabled
                        ? 'bg-red-500'
                        : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        previewData.negativeMarking?.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Global Negative Marking Settings */}
                {previewData.negativeMarking?.enabled && (
                  <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                    {/* Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            onClick={() => setPreviewData(prev => ({
                              ...prev,
                              negativeMarking: {
                                ...prev.negativeMarking,
                                type: type.value
                              }
                            }))}
                            className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                              previewData.negativeMarking?.type === type.value
                                ? 'bg-red-500/20 border-red-400 text-red-300'
                                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {previewData.negativeMarking?.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={previewData.negativeMarking?.value || 0.25}
                          onChange={(e) => setPreviewData(prev => ({
                            ...prev,
                            negativeMarking: {
                              ...prev.negativeMarking,
                              value: parseFloat(e.target.value) || 0.25
                            }
                          }))}
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                          placeholder="0.25"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          {previewData.negativeMarking?.type === 'fractional' ? 'fraction' : 'marks'}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {previewData.negativeMarking?.type === 'fractional' 
                          ? `For each wrong answer, ${previewData.negativeMarking?.value || 0.25} marks will be deducted`
                          : `For each wrong answer, ${previewData.negativeMarking?.value || 0.25} marks will be deducted`
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="p-6 overflow-y-auto max-h-96">
              {/* Negative Marking Summary */}
              <div className="mb-6 p-6 rounded-xl border-2 border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <FiAlertCircle className="w-5 h-5 text-red-400" />
                  <h4 className="text-lg font-semibold text-white">Negative Marking Summary</h4>
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🌐 Global Setting:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      previewData.negativeMarking?.enabled 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {previewData.negativeMarking?.enabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                    {previewData.negativeMarking?.enabled && (
                      <span className="text-red-300">
                        ({previewData.negativeMarking?.type === 'fractional' ? 'Fractional' : 'Fixed'}: {previewData.negativeMarking?.value})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🎯 Custom Questions:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {previewData.questions.filter(q => q.negativeMarking?.enabled).length} / {previewData.questions.length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-3 p-2 bg-gray-800/40 rounded-lg border border-gray-700/40">
                    💡 <strong>Pro Tip:</strong> You can override global settings for individual questions below. Each question can have its own negative marking rules!
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {previewData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                    {/* Question Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                          {qIndex + 1}
                        </div>
                        <h4 className="text-lg font-semibold text-white">Question {qIndex + 1}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiEdit3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Editable</span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Question Text</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => {
                          const updatedQuestions = [...previewData.questions];
                          updatedQuestions[qIndex] = { ...question, question: e.target.value };
                          setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 min-h-[80px] resize-y"
                        rows="3"
                      />
                    </div>

                    {/* Answer Options */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => {
                                const updatedQuestions = [...previewData.questions];
                                updatedQuestions[qIndex] = { ...question, correctAnswer: oIndex };
                                setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updatedQuestions = [...previewData.questions];
                                updatedQuestions[qIndex] = {
                                  ...question,
                                  options: question.options.map((opt, idx) => idx === oIndex ? e.target.value : opt)
                                };
                                setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                              }}
                              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Explanation</label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => {
                          const updatedQuestions = [...previewData.questions];
                          updatedQuestions[qIndex] = { ...question, explanation: e.target.value };
                          setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 min-h-[60px] resize-y"
                        rows="2"
                        placeholder="Explain why this is the correct answer..."
                      />
                    </div>

                    {/* Individual Question Negative Marking */}
                    <div className="space-y-4 border-t border-gray-700 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiAlertCircle className="w-4 h-4 text-red-400" />
                        <label className="block text-sm font-semibold text-red-300">
                          Question-Specific Negative Marking
                        </label>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Enable/Disable Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                              <FiAlertCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {question.negativeMarking?.enabled ? '✅ Custom Negative Marking' : '⚙️ Override Global Setting'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {question.negativeMarking?.enabled 
                                  ? `Custom: ${question.negativeMarking?.type === 'fractional' ? 'Fractional' : 'Fixed'} (${question.negativeMarking?.value})`
                                  : 'Set specific negative marking for this question'
                                }
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = [...previewData.questions];
                              if (!updatedQuestions[qIndex].negativeMarking) {
                                updatedQuestions[qIndex].negativeMarking = {
                                  enabled: false,
                                  type: 'fractional',
                                  value: 0.25
                                };
                              }
                              updatedQuestions[qIndex].negativeMarking.enabled = !updatedQuestions[qIndex].negativeMarking.enabled;
                              setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                            }}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                              question.negativeMarking?.enabled
                                ? 'bg-red-500'
                                : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                question.negativeMarking?.enabled ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Question-Specific Negative Marking Settings */}
                        {question.negativeMarking?.enabled && (
                          <div className="space-y-4 p-4 rounded-lg border-2 border-red-500/50 bg-red-500/20 shadow-lg">
                            {/* Type Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                                    onClick={() => {
                                      const updatedQuestions = [...previewData.questions];
                                      updatedQuestions[qIndex].negativeMarking.type = type.value;
                                      setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                                    }}
                                    className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                                      question.negativeMarking?.type === type.value
                                        ? 'bg-red-500/20 border-red-400 text-red-300'
                                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
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
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                {question.negativeMarking?.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={question.negativeMarking?.value || 0.25}
                                  onChange={(e) => {
                                    const updatedQuestions = [...previewData.questions];
                                    updatedQuestions[qIndex].negativeMarking.value = parseFloat(e.target.value) || 0.25;
                                    setPreviewData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                                  placeholder="0.25"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  {question.negativeMarking?.type === 'fractional' ? 'fraction' : 'marks'}
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {question.negativeMarking?.type === 'fractional' 
                                  ? `For this question, ${question.negativeMarking?.value || 0.25} marks will be deducted for wrong answers`
                                  : `For this question, ${question.negativeMarking?.value || 0.25} marks will be deducted for wrong answers`
                                }
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
        </div>
      )}

      {/* Move the modal here, as a sibling to the main form container */}
      {showTestSeriesSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] overflow-hidden ${mode('bg-white border-slate-300', 'bg-gray-900 border-gray-700')}`}>
            {/* Header */}
            <div className={`p-6 border-b ${mode('border-slate-300', 'border-gray-700')}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${mode('text-slate-800', 'text-white')}`}>Select Test Series</h3>
                <button
                  onClick={() => setShowTestSeriesSelector(false)}
                  className={`transition-colors ${mode('text-slate-500 hover:text-slate-700', 'text-gray-400 hover:text-white')}`}
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className={`p-6 border-b ${mode('border-slate-300', 'border-gray-700')}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
                    <input
                      type="text"
                      placeholder="Search test series..."
                      value={testSeriesSearchTerm}
                      onChange={(e) => setTestSeriesSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-800 border-gray-700 text-white placeholder-gray-400')}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={testSeriesFilter}
                    onChange={(e) => {
                      setTestSeriesFilter(e.target.value);
                      loadTestSeries();
                    }}
                    className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-800 border-gray-700 text-white')}`}
                  >
                    <option value="all">All Series</option>
                    <option value="my-series">My Series</option>
                    <option value="subscribed">Subscribed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Test Series List */}
            <div className="p-6 overflow-y-auto max-h-96">
              {loadingTestSeries ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`ml-3 ${mode('text-slate-600', 'text-gray-400')}`}>Loading test series...</span>
                </div>
              ) : filteredTestSeries.length === 0 ? (
                <div className="text-center py-8">
                  <FiBookOpen className={`w-12 h-12 mx-auto mb-4 ${mode('text-slate-500', 'text-gray-500')}`} />
                  <p className={mode('text-slate-600', 'text-gray-400')}>No test series found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTestSeries.map((series) => (
                    <div
                      key={series.id}
                      onClick={() => {
                        setSelectedTestSeries(series);
                        setShowTestSeriesSelector(false);
                      }}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${mode('bg-slate-100 border-slate-300 hover:bg-slate-200', 'bg-gray-800 border-gray-700 hover:bg-gray-700')}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <FiBookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${mode('text-slate-800', 'text-white')}`}>{series.title}</h4>
                            <p className={`text-sm ${mode('text-slate-600', 'text-gray-400')}`}>{series.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className={`text-xs ${mode('text-slate-500', 'text-gray-500')}`}>
                                {series.totalQuizzes || 0} quizzes
                              </span>
                              <span className={`text-xs ${mode('text-slate-500', 'text-gray-500')}`}>
                                {series.difficulty} difficulty
                              </span>
                            </div>
                          </div>
                        </div>
                        <FiChevronRight className={`w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;
