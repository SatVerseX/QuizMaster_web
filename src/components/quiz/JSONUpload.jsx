import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiUpload, 
  FiX, 
  FiFile,
  FiAlertCircle,
  FiCheck,
  FiClock
} from 'react-icons/fi';

const JSONUpload = ({ onQuestionsUploaded, onClose }) => {
  const { isDark } = useTheme();
  const mode = (light, dark) => (isDark ? dark : light);
  
  const [file, setFile] = useState(null);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid JSON file');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid JSON file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processFile = async () => {
    if (!file) {
      setError('Please select a JSON file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate JSON structure
      if (Array.isArray(data)) {
        // Array of questions
        const questions = data.map((q, index) => ({
          id: `uploaded-${Date.now()}-${index}`,
          question: q.question || '',
          options: q.options || ['', '', '', ''],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
          image: q.image || null,
          negativeMarking: {
            enabled: q.negativeMarking?.enabled || false,
            type: q.negativeMarking?.type || 'fractional',
            value: q.negativeMarking?.value || 0.25
          }
        }));
        
        setSuccess(`Successfully uploaded ${questions.length} questions!`);
        onQuestionsUploaded(questions);
      } else if (data.questions && Array.isArray(data.questions)) {
        // Object with questions array
        const questions = data.questions.map((q, index) => ({
          id: `uploaded-${Date.now()}-${index}`,
          question: q.question || '',
          options: q.options || ['', '', '', ''],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
          image: q.image || null,
          negativeMarking: {
            enabled: q.negativeMarking?.enabled || false,
            type: q.negativeMarking?.type || 'fractional',
            value: q.negativeMarking?.value || 0.25
          }
        }));
        
        setSuccess(`Successfully uploaded ${questions.length} questions!`);
        onQuestionsUploaded(questions);
      } else {
        setError('Invalid JSON format. Please ensure the file contains an array of questions or an object with a questions array.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process JSON file. Please check the file format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed  inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto`}>
      <div className={`backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[45vh] flex flex-col my-8 ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/95 border-gray-700/60')}`}>
        {/* Header */}
        <div className={`p-6 border-b ${mode('border-slate-200/60', 'border-gray-700/60')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <FiUpload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${mode('text-slate-800', 'text-white')}`}>JSON Upload</h2>
                <p className={`text-sm ${mode('text-slate-600', 'text-gray-300')}`}>Upload questions from JSON file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
            >
              <FiX className={`w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 pb-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {/* Messages */}
          {error && (
            <div className={`p-4 rounded-lg ${mode('bg-red-50 border-red-200 text-red-700', 'bg-red-900/20 border-red-800/50 text-red-400')} border`}>
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className={`p-4 rounded-lg ${mode('bg-green-50 border-green-200 text-green-700', 'bg-green-900/20 border-green-800/50 text-green-400')} border`}>
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                {success}
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-gray-300')}`}>
              Select JSON File *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center hover:border-green-500/60 transition-all duration-300 group ${mode('border-slate-400/60 hover:bg-green-50/30', 'border-gray-600/60 hover:bg-green-900/10')}`}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FiFile className={`w-8 h-8 ${mode('text-green-600', 'text-green-400')}`} />
                  <div>
                    <p className={`font-medium ${mode('text-slate-800', 'text-white')}`}>{file.name}</p>
                    <p className={`text-sm ${mode('text-slate-600', 'text-gray-400')}`}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <FiUpload className={`w-12 h-12 group-hover:text-green-400 transition-colors duration-300 mx-auto ${mode('text-slate-500', 'text-gray-500')}`} />
                  <p className={`text-base mt-4 ${mode('text-slate-600', 'text-gray-400')}`}>
                    Drag and drop or click to select a JSON file
                  </p>
                  <p className={`text-sm mt-2 ${mode('text-slate-500', 'text-gray-500')}`}>
                    Supports standard quiz JSON format
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Time Limit Setting */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
              <FiClock className="w-4 h-4" />
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-900/60 border-gray-700/60 text-white')}`}
            />
          </div>

          {/* JSON Format Info */}
          <div className={`p-4 rounded-lg ${mode('bg-blue-50 border-blue-200', 'bg-blue-900/20 border-blue-800/50')} border`}>
            <h3 className={`font-semibold mb-2 ${mode('text-blue-800', 'text-blue-300')}`}>Expected JSON Format:</h3>
            <div className={`text-xs overflow-x-auto max-h-32 overflow-y-auto ${mode('text-blue-700', 'text-blue-400')}`}>
              <pre className="whitespace-pre-wrap break-words">
{`[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation here",
    "negativeMarking": {
      "enabled": false,
      "type": "fractional",
      "value": 0.25
    }
  }
]`}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={processFile}
              disabled={loading || !file}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                loading || !file
                  ? mode('bg-slate-300 text-slate-500 cursor-not-allowed', 'bg-gray-600 text-gray-400 cursor-not-allowed')
                  : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <FiUpload className="w-4 h-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Upload Questions
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${mode('bg-slate-200 text-slate-700 hover:bg-slate-300', 'bg-gray-700 text-gray-300 hover:bg-gray-600')}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONUpload;
