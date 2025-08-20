import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { validateQuizJSON } from '../../services/geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
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
  FiList
} from 'react-icons/fi';

const AIQuizGenerator = ({ onBack, onQuizCreated, testSeriesId }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1); // 1: Generate/Upload, 2: Review & Create
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'upload'
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
    language: 'English'
  });

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);

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

Return ONLY a valid JSON object in this exact format (no markdown, no code fences, no additional text):

{
  "title": "Quiz Title Here",
  "description": "Brief quiz description",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation for the correct answer"
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
          setPreviewData(quizData);
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
          setJsonData(parsedData);
          setPreviewData(parsedData);
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
        explanation: q.explanation || ''
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
        difficulty: aiForm.difficulty,
        timeLimit: 30,
        totalAttempts: 0,
        isPartOfSeries: selectedTestSeries ? true : false
      };

      const docRef = await addDoc(collection(db, 'quizzes'), finalQuizData);
      
      // If a test series is selected, update the series with the new quiz
      if (selectedTestSeries) {
        await updateDoc(doc(db, 'test-series', selectedTestSeries.id), {
          quizzes: arrayUnion(docRef.id),
          totalQuizzes: (selectedTestSeries.totalQuizzes || 0) + 1,
          updatedAt: new Date()
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
            "push()",
            "pop()",
            "shift()",
            "unshift()"
          ],
          correctAnswer: 0,
          explanation: "The push() method adds one or more elements to the end of an array."
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
            className="bg-gray-800/60 border border-gray-700/60 text-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Review Quiz
            </h1>
            <p className="text-gray-400">
              Check your questions before creating the quiz
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-800/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Quiz Info */}
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {previewData.title}
          </h2>
          {previewData.description && (
            <p className="text-gray-400 mb-4">
              {previewData.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="px-3 py-1.5 bg-blue-900/30 rounded-full text-blue-400 font-medium flex items-center gap-1.5">
              <FiLayers className="w-4 h-4" />
              <span>{previewData.questions.length} questions</span>
            </div>
            
            <div className="px-3 py-1.5 bg-purple-900/30 rounded-full text-purple-400 font-medium flex items-center gap-1.5">
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
              className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 font-bold text-sm">
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
                        ? 'border-l-4 border-green-600 bg-green-900/20'
                        : 'border-l-4 border-gray-600 bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {optionIndex === question.correctAnswer ? (
                        <div className="w-5 h-5 rounded-full bg-green-900/50 flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-400">{String.fromCharCode(65 + optionIndex)}</span>
                        </div>
                      )}
                      <span className={`${optionIndex === question.correctAnswer ? 'text-green-400 font-medium' : 'text-gray-300'}`}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 py-8 px-4 sm:px-6">
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
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-3xl shadow-2xl overflow-hidden">
          {/* Enhanced Header */}
          <div className="relative p-8 sm:p-10 border-b border-gray-700/60">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="group bg-gray-700/60 border border-gray-600/60 text-gray-300 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-600/60 hover:border-gray-500/60 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-2">
                    AI Quiz Generator
                  </h1>
                  <p className="text-lg text-gray-300 flex items-center gap-2">
                    <FiZap className="w-5 h-5 text-blue-400 animate-pulse" />
                    Generate tests for {testSeriesId ? '"GA"' : 'your series'} using AI
                  </p>
                </div>
              </div>
              
              {/* AI Status Indicator */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-300">AI Ready</span>
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
                  <span className="mt-3 font-semibold text-blue-400 text-lg">Generate/Upload</span>
                </div>
                <div className="relative">
                  <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <div className="absolute inset-0 w-32 h-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700/60 border-2 border-gray-600/60 text-gray-400 flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <span className="mt-3 font-semibold text-gray-500 text-lg">Review & Create</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-lg text-green-400">
                {success}
              </div>
            )}

            {/* Enhanced Test Series Selection */}
            <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-8 mb-8 flex flex-col gap-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                    <FiBookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Select Test Series <span className="text-red-500">*</span></h2>
                  <p className="text-gray-300">Choose a test series to add this quiz to</p>
                </div>
              </div>

              {/* Selected Test Series Display */}
              {selectedTestSeries && (
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FiBookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{selectedTestSeries.title}</h3>
                        <p className="text-gray-300">{selectedTestSeries.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-purple-300 bg-purple-900/30 px-2 py-1 rounded-full">
                            {selectedTestSeries.totalQuizzes || 0} quizzes
                          </span>
                          <span className="text-sm text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full">
                            {selectedTestSeries.difficulty} level
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTestSeries(null)}
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
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

            {/* Enhanced AI Generation Form */}
            <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-8 mb-8 flex flex-col gap-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                    <FiCpu className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI Quiz Generator</h2>
                  <p className="text-gray-300">Generate quiz questions using AI for {selectedTestSeries ? `"${selectedTestSeries.title}"` : 'your series'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topic/Subject */}
                <div className="flex flex-col gap-3">
                  <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <FiBookOpen className="w-4 h-4 text-blue-400" />
                    Topic/Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics, Physics, Computer Science"
                    value={aiForm.topic}
                    onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-4 py-4 rounded-xl bg-gray-900/60 border-2 border-gray-700/60 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-base shadow-lg"
                  />
                </div>
                {/* Number of Questions */}
                <div className="flex flex-col gap-3">
                  <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <FiLayers className="w-4 h-4 text-purple-400" />
                    Number of Questions
                  </label>
                  <select
                    value={aiForm.numberOfQuestions}
                    onChange={(e) => setAiForm(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-xl bg-gray-900/60 border-2 border-gray-700/60 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 appearance-none text-base shadow-lg"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                    <option value={30}>30 Questions</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Level */}
                <div className="flex flex-col gap-3">
                  <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <FiStar className="w-4 h-4 text-yellow-400" />
                    Difficulty Level
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-4 rounded-xl bg-gray-900/60 border-2 border-gray-700/60 text-white focus:outline-none focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300 appearance-none text-base shadow-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                {/* Language */}
                <div className="flex flex-col gap-3">
                  <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <FiBriefcase className="w-4 h-4 text-green-400" />
                    Language
                  </label>
                  <select
                    value={aiForm.language}
                    onChange={(e) => setAiForm(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-4 rounded-xl bg-gray-900/60 border-2 border-gray-700/60 text-white focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 appearance-none text-base shadow-lg"
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

            {/* Enhanced OR Separator */}
            <div className="relative flex items-center my-12">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              <div className="relative px-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl rounded-full"></div>
                <span className="relative px-6 py-2 text-gray-400 font-bold text-lg bg-gray-800/80 rounded-full border border-gray-700/60">OR</span>
              </div>
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>

            {/* Enhanced JSON Upload */}
            <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-8 flex flex-col gap-6 hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                    <FiFileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Upload JSON File</h2>
                  <p className="text-gray-300">Upload a pre-made quiz in JSON format for instant creation</p>
                </div>
              </div>
              
              <div className="relative border-2 border-dashed border-gray-600/60 rounded-2xl p-12 text-center hover:border-green-500/60 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <FiUpload className="w-20 h-20 text-gray-500 group-hover:text-green-400 transition-colors duration-300" />
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
                  <p className="text-gray-400 text-base mt-4">Drag and drop or click to select a quiz JSON file</p>
                  <p className="text-gray-500 text-sm mt-2">Supports standard quiz JSON format</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Move the modal here, as a sibling to the main form container */}
      {showTestSeriesSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Select Test Series</h3>
                <button
                  onClick={() => setShowTestSeriesSelector(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search test series..."
                      value={testSeriesSearchTerm}
                      onChange={(e) => setTestSeriesSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <span className="ml-3 text-gray-400">Loading test series...</span>
                </div>
              ) : filteredTestSeries.length === 0 ? (
                <div className="text-center py-8">
                  <FiBookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No test series found</p>
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
                      className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <FiBookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{series.title}</h4>
                            <p className="text-sm text-gray-400">{series.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {series.totalQuizzes || 0} quizzes
                              </span>
                              <span className="text-xs text-gray-500">
                                {series.difficulty} difficulty
                              </span>
                            </div>
                          </div>
                        </div>
                        <FiChevronRight className="w-5 h-5 text-gray-400" />
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
