import React, { useState } from 'react';
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
  FiClock
} from 'react-icons/fi';
import { FaRobot, FaMagic, FaBrain } from 'react-icons/fa';

const TestSeriesAIGenerator = ({ testSeries, onBack, onQuizCreated }) => {
  // Validate that testSeries is provided
  if (!testSeries) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className={`text-center py-16 rounded-xl ${mode(
          "bg-slate-100 border border-slate-200",
          "bg-gray-900/40 border border-gray-700/60"
        )}`}>
          <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${mode("text-red-600", "text-red-500")}`} />
          <h3 className={`text-xl font-semibold mb-2 ${mode("text-slate-800", "text-white")}`}>
            Test Series Not Found
          </h3>
          <p className={`mb-6 ${mode("text-slate-600", "text-gray-400")}`}>
            Unable to load test series information. Please go back and try again.
          </p>
          <button
            onClick={onBack}
            className={`font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors mx-auto ${mode(
              "bg-slate-200 hover:bg-slate-300 text-slate-700",
              "bg-gray-800 hover:bg-gray-700 text-white"
            )}`}
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // Theme mode function similar to other components
  const mode = (light, dark) => (isDark ? dark : light);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  const [jsonUploadData, setJsonUploadData] = useState({
    timeLimit: 30,
    difficulty: 'medium',
    negativeMarking: {
      enabled: false,
      type: 'fractional',
      value: 0.25
    }
  });

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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

  const generateWithAI = async () => {
    if (!aiPrompt.topic.trim()) {
      setError('Please enter a topic for the quiz');
      return;
    }

    if (!testSeries) {
      setError('Test series information is missing. Please go back and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const prompt = `Create a quiz with exactly ${aiPrompt.questionCount} multiple-choice questions about "${aiPrompt.topic}" for ${testSeries.title}.

Requirements:
- Difficulty: ${aiPrompt.difficulty}
- Each question must have exactly 4 options
- Include explanations for correct answers
- Make it relevant to "${testSeries.title}" test series
- Language: ${aiPrompt.language}
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

Generate exactly ${aiPrompt.questionCount} questions total. Ensure all JSON is valid and properly formatted.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Enhanced cleanup
      text = cleanupJSONResponse(text);
      
      try {
        const quizData = JSON.parse(text);
        
        // Validate structure
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
          throw new Error('Invalid quiz structure - missing questions array');
        }
        
        if (quizData.questions.length === 0) {
          throw new Error('No questions found in the generated quiz');
        }
        
        // Validate each question
        quizData.questions.forEach((q, index) => {
          if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Question ${index + 1}: Missing or invalid question text`);
          }
          
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
          }
          
          if (q.options.some(opt => !opt || typeof opt !== 'string')) {
            throw new Error(`Question ${index + 1}: All options must be non-empty strings`);
          }
          
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
            throw new Error(`Question ${index + 1}: correctAnswer must be a number between 0 and 3`);
          }
        });

        // Add metadata
        const finalQuiz = {
          ...quizData,
          title: quizData.title || `${aiPrompt.topic} Quiz`,
          description: quizData.description || `Test your knowledge of ${aiPrompt.topic}`,
          timeLimit: Math.max(10, (quizData.timeLimit || (quizData.questions.length * 2))),
          difficulty: aiPrompt.difficulty,
          isAIGenerated: true,
          aiPrompt: aiPrompt.topic,
          language: aiPrompt.language
        };

        setGeneratedQuiz(finalQuiz);
        setStep(2);
        setSuccess(`Successfully generated ${finalQuiz.questions.length} questions!`);
        
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setError(`Failed to parse AI response: ${parseError.message}. Please try again with a different topic or adjust your request.`);
        
        // Log the raw response for debugging
        console.log('Raw AI Response:', text);
      }
      
    } catch (error) {
      console.error('AI Generation Error:', error);
      if (error.message.includes('API key')) {
        setError('Invalid API key. Please check your Gemini API configuration.');
      } else if (error.message.includes('quota')) {
        setError('API quota exceeded. Please try again later.');
      } else {
        setError('Failed to generate quiz. Please try again or check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };


const handleFileUpload = (event) => {
  // Clear previous messages and state
  setError('');
  setSuccess('');
  
  if (!testSeries) {
    setError('Test series information is missing. Please go back and try again.');
    return;
  }
  
  // Get the FileList from the input element
  const files = event.target.files;

  // Check if any file was selected
  if (!files || files.length === 0) {
    return;
  }

  // Access the first file from the FileList
  const file = files[0];

  // Validate file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    setError('File size too large. Please upload a file smaller than 10MB.');
    event.target.value = '';
    return;
  }

  // Validate the file type and extension
  const isValidType = file.type === 'application/json' || 
                     file.type === 'text/json' || 
                     file.type === '' || // Some systems don't set MIME type
                     file.type === 'application/octet-stream'; // Fallback
  
  const isValidExtension = file.name.toLowerCase().endsWith('.json');

  if (!isValidType && !isValidExtension) {
    setError('Please upload a valid JSON file (.json extension required).');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();

  // Define what happens when the file is successfully read
  reader.onload = (e) => {
    try {
      // Parse the file content as JSON
      const quizData = JSON.parse(e.target.result);

      // --- Start: Validation of the JSON structure ---

      // 1. Validate root properties
      if (!quizData || typeof quizData !== 'object') {
        throw new Error('Invalid JSON structure: Root must be an object.');
      }

      if (!quizData.title || typeof quizData.title !== 'string' || quizData.title.trim() === '') {
        throw new Error('Missing or invalid "title" property. Must be a non-empty string.');
      }

      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Missing or invalid "questions" property. Must be an array.');
      }

      if (quizData.questions.length === 0) {
        throw new Error('Questions array cannot be empty.');
      }

      // Limit number of questions (optional - adjust as needed)
      if (quizData.questions.length > 100) {
        throw new Error('Too many questions. Maximum 100 questions allowed.');
      }

      // 2. Validate each question object
      quizData.questions.forEach((q, index) => {
        const qNum = `Question ${index + 1}`;

        if (!q || typeof q !== 'object') {
          throw new Error(`${qNum}: Must be an object.`);
        }

        if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
          throw new Error(`${qNum}: Missing or invalid "question" text.`);
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`${qNum}: Must have exactly 4 options.`);
        }

        // Validate each option is a non-empty string
        q.options.forEach((option, optIndex) => {
          if (!option || typeof option !== 'string' || option.trim() === '') {
            throw new Error(`${qNum}: Option ${optIndex + 1} must be a non-empty string.`);
          }
        });

        if (typeof q.correctAnswer !== 'number' || 
            !Number.isInteger(q.correctAnswer) || 
            q.correctAnswer < 0 || 
            q.correctAnswer > 3) {
          throw new Error(`${qNum}: "correctAnswer" must be an integer between 0 and 3.`);
        }

        if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim() === '') {
          throw new Error(`${qNum}: Missing or invalid "explanation" text.`);
        }

        // Validate image field (optional)
        if (q.image !== undefined && q.image !== null && typeof q.image !== 'string') {
          throw new Error(`${qNum}: Image field must be a string URL or null.`);
        }
      });

      // --- End: Validation ---

      // Add metadata for JSON uploads using user input
      const finalQuizData = {
        ...quizData,
        timeLimit: jsonUploadData.timeLimit,
        difficulty: jsonUploadData.difficulty,
        isAIGenerated: false,
        language: quizData.language || 'english'
      };

      // If all validations pass, update the application state
      setGeneratedQuiz(finalQuizData);
      setStep(2);
      setSuccess(`Successfully loaded ${finalQuizData.questions.length} questions from "${file.name}"!`);
      
      // Clear the input only on success to allow re-uploading if needed
      event.target.value = '';

    } catch (error) {
      // Handle JSON parsing or validation errors
      if (error instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your file syntax.');
      } else {
        setError(error.message);
      }
      setGeneratedQuiz(null);
      event.target.value = '';
    }
  };

  // Define what happens on a file read error
  reader.onerror = () => {
    setError('Failed to read the file. Please try again.');
    event.target.value = '';
  };

  // Read the file as text
  reader.readAsText(file);
};


  const createQuizFromGenerated = async () => {
    if (!generatedQuiz) return;
    
    if (!testSeries) {
      setError('Test series information is missing. Please go back and try again.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Debug logging
    console.log('testSeries object:', testSeries);
    console.log('testSeries.title:', testSeries?.title);
    console.log('testSeries.id:', testSeries?.id);
    
    try {
      const quizDocument = {
        ...generatedQuiz,
        // Ensure rule-required fields are present and valid
        title: (generatedQuiz.title || `${aiPrompt.topic} Quiz`).toString(),
        description: (generatedQuiz.description || `Test your knowledge of ${aiPrompt.topic}`).toString(),
        questions: Array.isArray(generatedQuiz.questions) ? generatedQuiz.questions : [],
        timeLimit: Math.max(10, Number(generatedQuiz.timeLimit) || 30),
        
        // Test Series linking - with defensive programming
        testSeriesId: testSeries?.id || 'unknown',
        testSeriesTitle: testSeries?.title || 'Unknown Test Series',
        
        // Creator info
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        
        // Quiz settings
        isPartOfSeries: true,
        isPaid: false,
        totalQuestions: generatedQuiz.questions.length,
        
        // Negative Marking Settings
        negativeMarking: aiPrompt.negativeMarking || {
          enabled: false,
          type: 'fractional',
          value: 0.25
        },
        
        // Stats
        totalAttempts: 0,
        averageScore: 0
      };

      // Add quiz to database
      const docRef = await addDoc(collection(db, 'quizzes'), quizDocument);

      // Update test series - with defensive programming
      if (testSeries?.id) {
        await updateDoc(doc(db, 'test-series', testSeries.id), {
          quizzes: arrayUnion(docRef.id),
          totalQuizzes: increment(1),
          updatedAt: serverTimestamp()
        });
      } else {
        console.warn('Cannot update test series - testSeries.id is missing');
      }

      setSuccess('Quiz created successfully!');
      
      setTimeout(() => {
        onQuizCreated({
          id: docRef.id,
          ...quizDocument
        });
      }, 1500);

    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const renderStep1 = () => (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Error/Success Messages */}
      {error && (
        <div className="relative bg-gradient-to-r from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl animate-slideDown">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-xl sm:rounded-2xl"></div>
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-300 mb-1 text-sm sm:text-base">Generation Failed</p>
              <p className="text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="relative bg-gradient-to-r from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl animate-slideDown">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 rounded-xl sm:rounded-2xl"></div>
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-300 mb-1 text-sm sm:text-base">Success!</p>
              <p className="text-green-200 text-sm sm:text-base">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Card */}
      <div className={`relative backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl ${mode(
        "bg-white border-slate-200",
        "bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40"
      )}`}>
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl ${mode(
          "bg-gradient-to-br from-blue-50/50 to-purple-50/50",
          "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
        )}`}></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <div className="relative p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FaBrain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${mode("text-slate-800", "text-white")}`}>
                <span className="flex items-center gap-2 sm:gap-3">
                  <FaMagic className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                  AI Quiz Generator
                </span>
              </h3>
              <p className={`text-sm sm:text-base lg:text-lg ${mode("text-slate-600", "text-gray-400")}`}>
                Generate intelligent quiz questions for{' '}
                <span className={`font-semibold ${mode("text-blue-600", "text-blue-400")}`}>"{testSeries.title}"</span>
              </p>
            </div>
            <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border ${mode(
              "bg-green-100 border-green-300",
              "bg-green-500/20 border-green-500/30"
            )}`}>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`font-semibold text-sm ${mode("text-green-700", "text-green-300")}`}>AI Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Topic Input */}
            <div className="space-y-2 sm:space-y-3">
              <label className={`flex items-center gap-2 text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                <FiTarget className={`w-4 h-4 ${mode("text-blue-600", "text-blue-400")}`} />
                Topic/Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Physics, History..."
                  value={aiPrompt.topic}
                  onChange={(e) => setAiPrompt(prev => ({ ...prev, topic: e.target.value }))}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border transition-all duration-300 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${mode(
                    "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500 focus:ring-blue-500",
                    "bg-gray-900/60 border-gray-600/40 text-white placeholder-gray-500 focus:ring-blue-500"
                  )}`}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                  <FiBookOpen className={`w-4 h-4 sm:w-5 sm:h-5 ${mode("text-slate-500", "text-gray-500")}`} />
                </div>
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2 sm:space-y-3">
              <label className={`flex items-center gap-2 text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                <FiLayers className={`w-4 h-4 ${mode("text-purple-600", "text-purple-400")}`} />
                Number of Questions
              </label>
              <div className="relative">
                <select
                  value={aiPrompt.questionCount}
                  onChange={(e) => setAiPrompt(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border appearance-none transition-all duration-300 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${mode(
                    "bg-slate-50 border-slate-300 text-slate-800 focus:ring-purple-500",
                    "bg-gray-900/60 border-gray-600/40 text-white focus:ring-purple-500"
                  )}`}
                >
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => (
                    <option key={num} value={num}>{num} Questions</option>
                  ))}
                </select>
                <FiChevronRight className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2 sm:space-y-3">
              <label className={`flex items-center gap-2 text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                <FiTrendingUp className={`w-4 h-4 ${mode("text-emerald-600", "text-emerald-400")}`} />
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  value={aiPrompt.difficulty}
                  onChange={(e) => setAiPrompt(prev => ({ ...prev, difficulty: e.target.value }))}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border appearance-none transition-all duration-300 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${mode(
                    "bg-slate-50 border-slate-300 text-slate-800 focus:ring-emerald-500",
                    "bg-gray-900/60 border-gray-600/40 text-white focus:ring-emerald-500"
                  )}`}
                >
                  <option value="easy">🟢 Easy Level</option>
                  <option value="medium">🟡 Medium Level</option>
                  <option value="hard">🔴 Hard Level</option>
                </select>
                <FiChevronRight className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 sm:w-5 sm:h-5 ${mode("text-slate-500", "text-gray-500")}`} />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2 sm:space-y-3">
              <label className={`flex items-center gap-2 text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                <FiGlobe className={`w-4 h-4 ${mode("text-orange-600", "text-orange-400")}`} />
                Language
              </label>
              <div className="relative">
                <select
                  value={aiPrompt.language}
                  onChange={(e) => setAiPrompt(prev => ({ ...prev, language: e.target.value }))}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border appearance-none transition-all duration-300 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${mode(
                    "bg-slate-50 border-slate-300 text-slate-800 focus:ring-orange-500",
                    "bg-gray-900/60 border-gray-600/40 text-white focus:ring-orange-500"
                  )}`}
                >
                  <option value="english">🇺🇸 English</option>
                  <option value="hindi">🇮🇳 Hindi</option>
                  <option value="mixed">🌐 Mixed (Hindi + English)</option>
                </select>
                <FiChevronRight className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 sm:w-5 sm:h-5 ${mode("text-slate-500", "text-gray-500")}`} />
              </div>
            </div>
          </div>

          {/* Negative Marking Settings */}
          <div className={`border-t pt-6 mt-6 ${mode("border-slate-300", "border-gray-700/60")}`}>
            <div className={`p-6 border rounded-xl ${mode(
              "bg-red-50 border-red-200",
              "bg-gradient-to-r from-red-500/5 to-pink-500/5 border-red-500/20"
            )}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${mode(
                    "bg-red-100",
                    "bg-gradient-to-r from-red-500/20 to-pink-500/20"
                  )}`}>
                    <FiAlertCircle className={`w-5 h-5 ${mode("text-red-600", "text-red-400")}`} />
                  </div>
                  <div>
                    <label className={`block text-lg font-semibold ${mode("text-slate-800", "text-white")}`}>
                      ⚠️ Negative Marking Settings
                    </label>
                    <p className={`text-sm ${mode("text-slate-600", "text-gray-400")}`}>Configure negative marking for wrong answers</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Enable/Disable Toggle */}
                  <div className="flex flex-col gap-3">
                    <label className={`block text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>Enable Negative Marking</label>
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${mode(
                      "border-slate-300 bg-slate-100",
                      "border-gray-700 bg-gray-800/40"
                    )}`}>
                      <span className={`text-sm ${mode("text-slate-600", "text-gray-400")}`}>Off</span>
                      <button
                        type="button"
                        onClick={() => setAiPrompt(prev => ({
                          ...prev,
                          negativeMarking: {
                            ...prev.negativeMarking,
                            enabled: !prev.negativeMarking?.enabled
                          }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          aiPrompt.negativeMarking?.enabled
                            ? 'bg-red-500'
                            : mode('bg-slate-300', 'bg-gray-600')
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            aiPrompt.negativeMarking?.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm ${mode("text-slate-600", "text-gray-400")}`}>On</span>
                    </div>
                  </div>

                  {/* Marking Type */}
                  <div className="flex flex-col gap-3">
                    <label className={`block text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>Marking Type</label>
                    <select
                      value={aiPrompt.negativeMarking?.type || 'fractional'}
                      onChange={(e) => setAiPrompt(prev => ({
                        ...prev,
                        negativeMarking: {
                          ...prev.negativeMarking,
                          type: e.target.value
                        }
                      }))}
                      disabled={!aiPrompt.negativeMarking?.enabled}
                      className={`w-full px-4 py-3 rounded-xl border-2 appearance-none text-base shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${mode(
                        "bg-slate-50 border-slate-300 text-slate-800 focus:ring-red-500/30 focus:border-red-500",
                        "bg-gray-900/60 border-gray-700/60 text-white focus:ring-red-500/30 focus:border-red-500"
                      )}`}
                    >
                      <option value="fractional">Fractional (1/4th mark deduction)</option>
                      <option value="fixed">Fixed mark deduction</option>
                    </select>
                  </div>

                  {/* Marking Value */}
                  <div className="flex flex-col gap-3">
                    <label className={`block text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                      {aiPrompt.negativeMarking?.type === 'fractional' ? 'Fraction Value' : 'Mark Deduction'}
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={aiPrompt.negativeMarking?.value || 0.25}
                      onChange={(e) => setAiPrompt(prev => ({
                        ...prev,
                        negativeMarking: {
                          ...prev.negativeMarking,
                          value: parseFloat(e.target.value) || 0.25
                        }
                      }))}
                      disabled={!aiPrompt.negativeMarking?.enabled}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-base shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${mode(
                        "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500 focus:ring-red-500/30 focus:border-red-500",
                        "bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-500 focus:ring-red-500/30 focus:border-red-500"
                      )}`}
                      placeholder="0.25"
                    />
                  </div>
                </div>

                {/* Description */}
                {aiPrompt.negativeMarking?.enabled && (
                  <div className={`p-4 border rounded-lg ${mode(
                    "bg-red-50 border-red-300",
                    "bg-red-500/10 border-red-500/30"
                  )}`}>
                    <p className={`text-sm ${mode("text-red-700", "text-red-300")}`}>
                      <strong>Negative Marking Active:</strong> For each wrong answer, 
                      {aiPrompt.negativeMarking?.type === 'fractional' 
                        ? ` ${aiPrompt.negativeMarking?.value || 0.25} marks will be deducted`
                        : ` ${aiPrompt.negativeMarking?.value || 0.25} marks will be deducted`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateWithAI}
            disabled={loading || !aiPrompt.topic.trim()}
            className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-5 transition-all duration-300 transform hover:scale-[1.02] shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3 sm:gap-4">
              {loading ? (
                <>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 border-3 sm:border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-base sm:text-xl">Generating Quiz with AI...</span>
                </>
              ) : (
                <>
                  <FiZap className="w-5 h-5 sm:w-7 sm:h-7" />
                  <span className="text-base sm:text-xl">Generate Quiz with AI</span>
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced OR Separator */}
      <div className="relative flex items-center my-8 sm:my-12">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        <div className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 rounded-lg sm:rounded-xl shadow-lg">
          <span className="text-gray-300 font-bold text-base sm:text-lg">OR</span>
        </div>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
      </div>

      {/* Enhanced JSON Upload */}
      <div className={`relative backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl ${mode(
        "bg-white border-slate-200",
        "bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40"
      )}`}>
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl ${mode(
          "bg-gradient-to-br from-emerald-50/50 to-green-50/50",
          "bg-gradient-to-br from-emerald-500/5 to-green-500/5"
        )}`}></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FiUpload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2 sm:gap-3 ${mode("text-slate-800", "text-white")}`}>
                📁 Upload JSON File
              </h3>
              <p className={`text-sm sm:text-base lg:text-lg ${mode("text-slate-600", "text-gray-400")}`}>
                Upload a pre-made quiz in JSON format
              </p>
            </div>
            <button
              onClick={downloadSampleJSON}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium ${mode(
                "bg-slate-200 hover:bg-slate-300 text-slate-700",
                "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white"
              )}`}
            >
              <FiDownload className="w-4 h-4" />
              Sample JSON
            </button>
          </div>

          <div className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-8 sm:p-12 lg:p-16 text-center transition-all duration-500 group ${mode(
            "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50",
            "border-gray-600/50 hover:border-emerald-500/50 hover:bg-emerald-500/5"
          )}`}>
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 ${mode(
                "bg-emerald-100",
                "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
              )}`}>
                <FiUpload className={`w-12 h-12 sm:w-16 sm:h-16 ${mode("text-emerald-600", "text-emerald-400")}`} />
              </div>
            </div>

            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-upload-series"
            />

            <label
              htmlFor="json-upload-series"
              className="group/btn relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl sm:rounded-2xl px-6 sm:px-10 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25 cursor-pointer inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 sm:gap-3">
                <FiUpload className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-base sm:text-lg">Choose JSON File</span>
              </div>
            </label>

            <p className={`mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg ${mode("text-slate-600", "text-gray-400")}`}>
              Select a quiz JSON file from your computer
            </p>

            {/* Time Limit and Difficulty Settings for JSON Upload */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Time Limit */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                  <FiClock className={`w-4 h-4 ${mode("text-emerald-600", "text-emerald-400")}`} />
                  Time Limit (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={jsonUploadData.timeLimit}
                    onChange={(e) => setJsonUploadData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:border-transparent ${mode(
                      "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500 focus:ring-emerald-500",
                      "bg-gray-900/60 border-gray-600/40 text-white placeholder-gray-500 focus:ring-emerald-500"
                    )}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FiClock className={`w-4 h-4 ${mode("text-slate-500", "text-gray-500")}`} />
                  </div>
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-semibold ${mode("text-slate-700", "text-gray-300")}`}>
                  <FiTrendingUp className={`w-4 h-4 ${mode("text-emerald-600", "text-emerald-400")}`} />
                  Difficulty Level
                </label>
                <div className="relative">
                  <select
                    value={jsonUploadData.difficulty}
                    onChange={(e) => setJsonUploadData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border appearance-none transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:border-transparent ${mode(
                      "bg-slate-50 border-slate-300 text-slate-800 focus:ring-emerald-500",
                      "bg-gray-900/60 border-gray-600/40 text-white focus:ring-emerald-500"
                    )}`}
                  >
                    <option value="easy">🟢 Easy Level</option>
                    <option value="medium">🟡 Medium Level</option>
                    <option value="hard">🔴 Hard Level</option>
                  </select>
                  <FiChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 ${mode("text-slate-500", "text-gray-500")}`} />
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:hidden">
              <button
                onClick={downloadSampleJSON}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl text-gray-300 hover:text-white transition-colors font-medium mx-auto"
              >
                <FiDownload className="w-4 h-4" />
                Download Sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Success Message */}
      {success && (
        <div className="relative bg-gradient-to-r from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl animate-slideDown">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 rounded-xl sm:rounded-2xl"></div>
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-300 mb-1 text-sm sm:text-base">Success!</p>
              <p className="text-green-200 text-sm sm:text-base">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="relative bg-gradient-to-r from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl animate-slideDown">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-xl sm:rounded-2xl"></div>
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-300 mb-1 text-sm sm:text-base">Error</p>
              <p className="text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile-Friendly Quiz Preview Header */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl sm:rounded-2xl"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl">
              <FiBookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Quiz Preview</h3>
              <p className="text-gray-400 text-sm sm:text-base">Review your generated quiz before creating</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => setStep(1)}
              className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium hover:from-gray-600/80 hover:to-gray-500/80 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
            >
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Generator</span>
            </button>
            <button
              onClick={createQuizFromGenerated}
              disabled={loading}
              className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold rounded-lg sm:rounded-xl px-6 sm:px-8 py-2 sm:py-3 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg sm:rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Create Quiz</span>
                  </>
                )}
              </div>
            </button>
          </div>
          {/* Mobile sticky action bar */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
              >
                Back
              </button>
              <button
                onClick={createQuizFromGenerated}
                disabled={loading}
                className="flex-[2] rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-blue-700"
              >
                {loading ? 'Creating…' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile-Friendly Quiz Info Card */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-xl sm:rounded-2xl"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <FiStar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                {generatedQuiz?.title}
              </h4>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4">
                {generatedQuiz?.description}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-blue-300 font-semibold flex items-center gap-1.5 sm:gap-2 border border-blue-500/20 text-xs sm:text-sm">
                  <FiLayers className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{generatedQuiz?.questions?.length} Questions</span>
                </div>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-purple-300 font-semibold flex items-center gap-1.5 sm:gap-2 border border-purple-500/20 text-xs sm:text-sm">
                  <FiCpu className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{generatedQuiz?.isAIGenerated ? 'AI Generated' : 'File Upload'}</span>
                </div>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-emerald-300 font-semibold flex items-center gap-1.5 sm:gap-2 border border-emerald-500/20 text-xs sm:text-sm">
                  <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="capitalize">{generatedQuiz?.difficulty || aiPrompt.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              aiPrompt.negativeMarking?.enabled 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {aiPrompt.negativeMarking?.enabled ? '✅ Enabled' : '❌ Disabled'}
            </span>
            {aiPrompt.negativeMarking?.enabled && (
              <span className="text-red-300">
                ({aiPrompt.negativeMarking?.type === 'fractional' ? 'Fractional' : 'Fixed'}: {aiPrompt.negativeMarking?.value})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">🎯 Custom Questions:</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {generatedQuiz?.questions?.filter(q => q.negativeMarking?.enabled).length || 0} / {generatedQuiz?.questions?.length || 0}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-3 p-2 bg-gray-800/40 rounded-lg border border-gray-700/40">
            💡 <strong>Pro Tip:</strong> You can override global settings for individual questions below. Each question can have its own negative marking rules!
          </div>
        </div>
      </div>

      {/* Enhanced Mobile-Friendly Questions Preview */}
      <div className="space-y-4 sm:space-y-6">
        {generatedQuiz?.questions?.map((question, index) => (
          <div 
            key={index} 
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-600/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-blue-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h5 className="text-base sm:text-lg lg:text-xl font-semibold text-white leading-relaxed">
                    {question.question}
                  </h5>
                  
                  {/* Question Image Preview */}
                  {question.image && (
                    <div className="mt-3 sm:mt-4">
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
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      optIndex === question.correctAnswer
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 shadow-lg'
                        : 'bg-gradient-to-r from-gray-700/30 to-gray-600/30 border-2 border-gray-600/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {optIndex === question.correctAnswer ? (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-500 flex items-center justify-center bg-gray-700/50">
                          <span className="text-xs sm:text-sm font-bold text-gray-400">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                        </div>
                      )}
                      <span className={`font-medium text-sm sm:text-base ${
                        optIndex === question.correctAnswer ? 'text-green-300' : 'text-gray-300'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FiBookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-blue-300 mb-1">Explanation</p>
                      <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Question Negative Marking */}
              <div className="border-t border-gray-700/60 pt-4 mt-4">
                <div className="space-y-4">
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
                          const updatedQuestions = [...generatedQuiz.questions];
                          if (!updatedQuestions[index].negativeMarking) {
                            updatedQuestions[index].negativeMarking = {
                              enabled: false,
                              type: 'fractional',
                              value: 0.25
                            };
                          }
                          updatedQuestions[index].negativeMarking.enabled = !updatedQuestions[index].negativeMarking.enabled;
                          setGeneratedQuiz(prev => ({ ...prev, questions: updatedQuestions }));
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
                                  const updatedQuestions = [...generatedQuiz.questions];
                                  updatedQuestions[index].negativeMarking.type = type.value;
                                  setGeneratedQuiz(prev => ({ ...prev, questions: updatedQuestions }));
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
                                const updatedQuestions = [...generatedQuiz.questions];
                                updatedQuestions[index].negativeMarking.value = parseFloat(e.target.value) || 0.25;
                                setGeneratedQuiz(prev => ({ ...prev, questions: updatedQuestions }));
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-24 sm:pb-0 transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/10 to-purple-50/10'
    }`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Enhanced Mobile-Friendly Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className={`self-start group backdrop-blur-xl border rounded-xl px-4 sm:px-6 py-3 text-sm font-medium transition-all duration-300 hidden sm:flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 ${mode(
              "bg-slate-200/80 border-slate-300/40 text-slate-700 hover:bg-slate-300/80",
              "bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/40 text-gray-300 hover:from-gray-700/80 hover:to-gray-600/80"
            )}`}
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Series</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex-1">
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 leading-tight ${mode(
              "text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600",
              "text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200"
            )}`}>
              AI Quiz Generator
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${mode("text-slate-600", "text-gray-400")}`}>
              <span className="flex items-center gap-2">
                <FaBrain className={`w-5 h-5 sm:w-6 sm:h-6 ${mode("text-blue-600", "text-blue-400")}`} />
                Generate intelligent tests for
              </span>
              <span className={`font-semibold px-2 sm:px-3 py-1 rounded-lg text-sm sm:text-base ${mode(
                "text-blue-700 bg-blue-100",
                "text-blue-400 bg-blue-500/20"
              )}`}>
                "{testSeries.title}"
              </span>
            </p>
          </div>
        </div>

        {/* Enhanced Mobile-Friendly Progress Indicator */}
        <div className="relative z-10 flex justify-center mb-8 sm:mb-12">
          <div className={`backdrop-blur-xl border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl w-full max-w-2xl ${mode(
            "bg-slate-100/80 border-slate-300/40",
            "bg-gradient-to-r from-gray-800/60 to-gray-700/60 border-gray-600/40"
          )}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl lg:text-2xl shadow-lg transition-all duration-300 ${
                  step >= 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : mode('bg-slate-300 text-slate-600', 'bg-gray-600 text-gray-400')
                }`}>
                  {step > 1 ? <FiCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /> : '1'}
                </div>
                <span className={`mt-2 sm:mt-3 font-bold text-sm sm:text-base lg:text-lg ${step >= 1 ? 'text-blue-600' : mode('text-slate-500', 'text-gray-500')}`}>
                  Generate/Upload
                </span>
                <span className={`text-xs sm:text-sm mt-1 ${mode('text-slate-500', 'text-gray-500')}`}>Create content</span>
              </div>
              
              <div className={`w-16 sm:w-20 lg:w-32 h-1 mx-2 sm:mx-4 lg:mx-6 rounded-full relative transition-all duration-500 ${
                step > 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-500/50 to-gray-600/50'
              }`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full shadow-lg"></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl lg:text-2xl shadow-lg transition-all duration-300 ${
                  step >= 2 ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : mode('bg-slate-300 text-slate-600', 'bg-gray-600 text-gray-400')
                }`}>
                  {step > 2 ? <FiCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /> : '2'}
                </div>
                <span className={`mt-2 sm:mt-3 font-bold text-sm sm:text-base lg:text-lg ${step >= 2 ? 'text-blue-600' : mode('text-slate-500', 'text-gray-500')}`}>
                  Review & Create
                </span>
                <span className={`text-xs sm:text-sm mt-1 ${mode('text-slate-500', 'text-gray-500')}`}>Finalize quiz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative z-10">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>
      </div>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TestSeriesAIGenerator;
