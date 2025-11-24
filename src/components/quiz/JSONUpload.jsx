import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  UploadCloud, 
  X, 
  FileJson, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Code2,
  File
} from 'lucide-react';

const JSONUpload = ({ onQuestionsUploaded, onClose }) => {
  const { isDark } = useTheme();
  const [file, setFile] = useState(null);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  // Helper for conditional styles
  const cn = (...classes) => classes.filter(Boolean).join(' ');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
        setFile(selectedFile);
        setError('');
        setSuccess('');
      } else {
        setError('Please upload a valid .json file');
        setFile(null);
      }
    }
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
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON syntax");
      }
      
      let rawQuestions = [];
      
      // Handle different JSON structures
      if (Array.isArray(data)) {
        rawQuestions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        rawQuestions = data.questions;
      } else {
        throw new Error('JSON must contain an array of questions or an object with a "questions" array.');
      }

      // Map and validate structure
      const processedQuestions = rawQuestions.map((q, index) => ({
        id: `uploaded-${Date.now()}-${index}`,
        question: q.question || 'Untitled Question',
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || '',
        image: q.image || null,
        negativeMarking: {
          enabled: q.negativeMarking?.enabled || false,
          type: q.negativeMarking?.type || 'fractional',
          value: q.negativeMarking?.value || 0.25
        }
      }));
      
      // Simulate a small delay for UX
      await new Promise(r => setTimeout(r, 600));

      setSuccess(`Successfully processed ${processedQuestions.length} questions.`);
      
      // Pass data back up (including timeLimit if parent needs it)
      onQuestionsUploaded(processedQuestions, timeLimit);
      
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className={cn(
        "relative w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          isDark ? "border-zinc-800" : "border-zinc-100"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
            )}>
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>
                Import Questions
              </h2>
              <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>
                Upload a JSON file to bulk add questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDark ? "hover:bg-zinc-800 text-zinc-500 hover:text-white" : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Messages */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter} // Essential for drop to work
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center text-center",
              isDragging
                ? "border-rose-500 bg-rose-500/5" 
                : (isDark 
                    ? "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50" 
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"),
              file && !error ? (isDark ? "bg-zinc-800/30 border-zinc-700" : "bg-zinc-50 border-zinc-200") : ""
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <p className={cn("font-medium", isDark ? "text-zinc-200" : "text-zinc-900")}>
                    {file.name}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>
                    {(file.size / 1024).toFixed(1)} KB • Click to change
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pointer-events-none">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-colors",
                  isDragging 
                    ? "bg-rose-100 text-rose-600" 
                    : (isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-400 group-hover:text-zinc-600")
                )}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className={cn("text-sm font-medium", isDark ? "text-zinc-300" : "text-zinc-700")}>
                    {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                  </p>
                  <p className={cn("text-xs mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                    JSON files only (max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
                <Clock className="w-3.5 h-3.5" />
                Default Time Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                  className={cn(
                    "w-full rounded-lg px-4 py-2.5 text-sm border focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all",
                    isDark 
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-rose-500/50" 
                      : "bg-white border-zinc-200 text-zinc-900 focus:border-rose-500"
                  )}
                />
                <span className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium", isDark ? "text-zinc-600" : "text-zinc-400")}>
                  minutes
                </span>
              </div>
            </div>
          </div>

          {/* JSON Structure Hint */}
          <div className={cn(
            "rounded-lg border p-4 text-xs font-mono overflow-hidden",
            isDark ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          )}>
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Code2 className="w-3.5 h-3.5" />
              <span className="font-sans font-semibold">Expected Format</span>
            </div>
            <pre className={cn("overflow-x-auto", isDark ? "text-zinc-400" : "text-zinc-600")}>
{`[
  {
    "question": "What is React?",
    "options": ["Library", "Framework", "Language", "Tool"],
    "correctAnswer": 0,
    "negativeMarking": { "enabled": true, "value": 0.25 }
  }
]`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-end gap-3 px-6 py-4 border-t",
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50/50 border-zinc-100"
        )}>
          <button
            onClick={onClose}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              isDark 
                ? "text-zinc-300 hover:bg-zinc-800" 
                : "text-zinc-600 hover:bg-zinc-200"
            )}
          >
            Cancel
          </button>
          <button
            onClick={processFile}
            disabled={loading || !file}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm",
              loading || !file
                ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
            )}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Import Questions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JSONUpload;