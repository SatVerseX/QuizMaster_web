import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  X, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { z } from 'zod';
import { useTheme } from '../../contexts/ThemeContext';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// --- Schema Validation ---
const TopicSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  keyPoints: z.array(z.string()),
  example: z.string().optional().nullable(),
  commonPitfalls: z.array(z.string()).optional().nullable(),
});

const NotesSchema = z.object({
  summary: z.string(),
  topics: z.array(TopicSchema),
});

const ConceptNotesModal = ({ isOpen, onClose, mistakes, subject = "General" }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});

  // Reset and Generate on Open
  useEffect(() => {
    if (isOpen) {
      if (mistakes && mistakes.length > 0) {
        generateNotes();
      } else {
        setError("No mistakes found to generate notes from.");
        setLoading(false);
      }
    } else {
        setNotes(null);
        setLoading(true);
        setError(null);
        setExpandedTopics({});
    }
  }, [isOpen, mistakes]);

  const toggleTopic = (index) => {
    setExpandedTopics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const generateNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prepare context from mistakes
      const conceptsContext = mistakes.map((m, i) => 
        `Q${i+1}: ${m.question}\nCorrect Answer: ${m.options?.[m.correctAnswer] || 'N/A'}\nStudent Answer: ${m.options?.[m.userAnswer] || 'Skipped'}`
      ).join('\n---\n');

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        Act as a highly scientific or practical professor creating detailed conceptual notes for a student who just failed a test on "${subject}".
        
        Using the list of incorrect questions below, identify the *underlying concepts* the student is struggling with.
        Do not just answer the questions again. Instead, teach the core principles so they can answer any similar question in the future.
        

        INPUT DATA (Mistakes):
        ${conceptsContext}

        REQUIREMENTS:
        1. **Detailed Explanations**: Go deep into the "Why" and "How".
        2. **Structured Output**: Return ONLY valid JSON matching this schema:
        {
          "summary": "A supportive 2-3 sentence overview of performance gaps.",
          "topics": [
            {
              "title": "Concept Name (e.g., Thermodynamics Laws)",
              "explanation": "A comprehensive paragraph explaining the concept in detail .",
              "keyPoints": ["Crucial fact 1", "Formula or rule 2", "Important exception 3"],
              "example": "A clear, real-world application or calculation example.",
              "commonPitfalls": ["Misconception A", "Trap B"]
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Robust JSON Parsing
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      const jsonNotes = JSON.parse(cleanedText);
      
      // Validate
      const parsedNotes = NotesSchema.parse(jsonNotes);
      
      setNotes(parsedNotes);
      
      // Auto-expand all for better UX initially
      const initialExpanded = {};
      parsedNotes.topics.forEach((_, i) => initialExpanded[i] = true);
      setExpandedTopics(initialExpanded);

    } catch (err) {
      console.error("Notes generation failed:", err);
      setError("Failed to generate detailed notes. Our AI servers might be busy.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!notes) return;
    setIsDownloading(true);

    try {
      // 1. Construct Raw HTML with Inline Styles (Critical for html2pdf)
      // Using standard hex codes to ensure PDF looks the same regardless of ThemeContext
      const contentHtml = `
        <div style="font-family: 'Helvetica', 'Arial', sans-serif; color: #1F2937; background-color: #ffffff; padding: 40px; max-width: 800px; margin: 0 auto;">
          
          <!-- Brand Header -->
          <div style="border-bottom: 3px solid #e11d48; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: #111827; font-size: 28px; margin: 0 0 5px 0; font-weight: 800;">Concept Recovery Notes</h1>
              <h2 style="color: #6B7280; font-size: 16px; margin: 0; font-weight: 500;">Subject: ${subject}</h2>
            </div>
            <div style="text-align: right;">
              <span style="background-color: #e11d48; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">QuizMaster AI</span>
            </div>
          </div>

          <!-- Executive Summary -->
          <div style="background-color: #FFF1F2; border-left: 5px solid #BE123C; padding: 20px; margin-bottom: 35px; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; color: #881337; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Performance Summary</h3>
            <p style="margin: 0; font-style: italic; color: #4C0519; line-height: 1.6; font-size: 14px;">
              "${notes.summary}"
            </p>
          </div>

          <!-- Detailed Topics -->
          ${notes.topics.map((topic, index) => `
            <div style="margin-bottom: 40px; page-break-inside: avoid; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
              
              <!-- Topic Header -->
              <div style="background-color: #F9FAFB; padding: 15px 20px; border-bottom: 1px solid #E5E7EB;">
                <h2 style="color: #111827; font-size: 18px; margin: 0; font-weight: 700;">
                  <span style="background-color: #E5E7EB; color: #374151; padding: 2px 8px; border-radius: 4px; font-size: 14px; margin-right: 10px;">${index + 1}</span>
                  ${topic.title}
                </h2>
              </div>

              <div style="padding: 20px;">
                <!-- Explanation -->
                <div style="margin-bottom: 20px;">
                  <strong style="color: #e11d48; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px;">Core Concept</strong>
                  <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 14px; text-align: justify;">
                    ${topic.explanation}
                  </p>
                </div>

                <!-- Key Points -->
                <div style="margin-bottom: 20px;">
                  <strong style="color: #4B5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px;">Key Takeaways</strong>
                  <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
                    ${topic.keyPoints.map(point => `
                      <li style="margin-bottom: 6px; line-height: 1.5; font-size: 14px;">${point}</li>
                    `).join('')}
                  </ul>
                </div>

                <!-- Pitfalls -->
                ${topic.commonPitfalls && topic.commonPitfalls.length > 0 ? `
                  <div style="margin-bottom: 20px; background-color: #FEF2F2; padding: 12px; border-radius: 6px; border-left: 3px solid #F87171;">
                    <strong style="color: #991B1B; font-size: 12px; display: block; margin-bottom: 4px;">⚠️ Common Pitfalls:</strong>
                    <ul style="margin: 0; padding-left: 20px; color: #7F1D1D;">
                      ${topic.commonPitfalls.map(p => `
                        <li style="font-size: 13px; margin-bottom: 2px;">${p}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}

                <!-- Example -->
                ${topic.example ? `
                  <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 15px; border-radius: 6px;">
                    <strong style="color: #047857; font-size: 13px; display: block; margin-bottom: 5px;">💡 Practical Example:</strong>
                    <p style="color: #065F46; font-size: 14px; margin: 0; line-height: 1.5;">${topic.example}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}

          <!-- Footer -->
          <div style="text-align: center; margin-top: 50px; border-top: 1px solid #E5E7EB; pt: 20px; color: #9CA3AF; font-size: 12px;">
            <p>Generated by QuizMaster • Keep Learning, Keep Growing.</p>
          </div>
        </div>
      `;

      // 2. Generate
      const container = document.createElement('div');
      container.innerHTML = contentHtml;
      
      const options = {
        margin: 10,
        filename: `Study_Notes_${subject.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(options).from(container).save();
      
    } catch (error) {
      console.error("PDF Download Error:", error);
      // Fallback Alert
      alert("Download failed. Please check browser permissions.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-3xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Concept Recovery
                </h3>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    AI-Generated based on your performance
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isDark ? 'bg-zinc-950/50' : 'bg-zinc-50/50'}`}>
            
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                <div className="text-center">
                  <p className={`text-base font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    Analyzing Weak Areas...
                  </p>
                  <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Crafting personalized study notes
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-rose-500/10 mb-4">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <p className={`font-medium mb-4 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {error}
                </p>
                <button 
                  onClick={generateNotes}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-500/20"
                >
                  Retry Analysis
                </button>
              </div>
            ) : notes ? (
              <div className="space-y-8">
                
                {/* Summary Card */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-white text-rose-600 shadow-sm'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                        Analysis Summary
                      </h4>
                      <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>
                        {notes.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Topics List */}
                <div className="space-y-4">
                  {notes.topics.map((topic, idx) => (
                    <div key={idx} className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                      isDark 
                        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                    }`}>
                      
                      {/* Accordion Header */}
                      <button 
                        onClick={() => toggleTopic(idx)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <h4 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                            {topic.title}
                          </h4>
                        </div>
                        <div className={`transition-transform duration-300 ${expandedTopics[idx] ? 'rotate-180' : ''}`}>
                          <ChevronDown className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                        </div>
                      </button>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {expandedTopics[idx] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`border-t ${isDark ? 'border-zinc-800 bg-zinc-800/30' : 'border-zinc-100 bg-zinc-50/50'}`}
                          >
                            <div className="p-5 space-y-6">
                              {/* Explanation */}
                              <div>
                                <p className={`text-sm leading-7 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                  {topic.explanation}
                                </p>
                              </div>

                              {/* Key Points */}
                              <div className="grid gap-2">
                                {topic.keyPoints.map((point, i) => (
                                  <div key={i} className="flex gap-3 items-start text-sm">
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isDark ? 'bg-rose-500' : 'bg-rose-600'
                                    }`} />
                                    <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{point}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Common Pitfalls (If Available) */}
                              {topic.commonPitfalls && (
                                <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
                                   <p className="font-bold mb-1 flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3" /> Watch Out For:
                                   </p>
                                   <ul className="list-disc pl-4 space-y-1 opacity-90">
                                      {topic.commonPitfalls.map((p, pi) => (
                                         <li key={pi}>{p}</li>
                                      ))}
                                   </ul>
                                </div>
                              )}

                              {/* Example */}
                              {topic.example && (
                                <div className={`p-4 rounded-xl text-sm ${
                                  isDark 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200' 
                                    : 'bg-emerald-50 border border-emerald-100 text-emerald-900'
                                }`}>
                                  <strong className={`block mb-1 text-xs uppercase tracking-wider font-bold ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>
                                    Example
                                  </strong>
                                  {topic.example}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t flex justify-end gap-3 shrink-0 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
          }`}>
            <button 
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isDark 
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              Close
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={!notes || isDownloading || loading}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95
                ${isDownloading || loading || !notes
                  ? 'bg-zinc-700 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-500/20'}
              `}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Download Notes
                </>
              )}
            </button>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ConceptNotesModal;