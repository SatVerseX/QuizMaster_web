import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SectionCard from './SectionCard';
import { v4 as uuidv4 } from 'uuid';
import { 
  FiPlus, FiSave, FiArrowLeft, FiAlertCircle, FiCheck, FiBookOpen, 
  FiLock, FiGrid, FiLayout, FiTrash2, FiSettings, FiCheckCircle, FiTarget
} from 'react-icons/fi';

const SectionWiseQuizCreator = ({ onBack, onQuizCreated, testSeriesId }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // Theme Helper
  const mode = (light, dark) => (isDark ? dark : light);
  
  // State
  const [sections, setSections] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [passingScore, setPassingScore] = useState(0); // Added Passing Score State
  
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [testSeriesLoading, setTestSeriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasInitialized = useRef(false);

  // --- Logic ---
  const clearError = useCallback(() => error && setError(''), [error]);

  const addNewSection = useCallback(() => {
    const newSection = {
      id: uuidv4(),
      name: `Section ${sections.length + 1}`,
      description: '',
      questions: [],
      negativeMarking: { enabled: false, type: 'fractional', value: 0.25 },
      positiveMarking: { enabled: false, type: 'fractional', value: 1.0 },
      timeLimit: 30,
      difficulty: 'medium',
      isExpanded: true
    };
    setSections(prev => [...prev, newSection]);
  }, [sections.length]);

  useEffect(() => {
    if (!hasInitialized.current && sections.length === 0) {
      hasInitialized.current = true;
      addNewSection();
    }
  }, [sections.length, addNewSection]);

  // Calculate Total Max Score based on questions
  const totalMaxScore = useMemo(() => {
    return sections.reduce((acc, section) => {
      const sectionScore = section.questions.reduce((qAcc, q) => {
        // Use question specific marking if enabled, otherwise default to 1
        const mark = q.positiveMarking?.enabled ? parseFloat(q.positiveMarking.value || 1) : 1;
        return qAcc + mark;
      }, 0);
      return acc + sectionScore;
    }, 0);
  }, [sections]);

  useEffect(() => {
    const loadTestSeries = async () => {
      if (!testSeriesId || !currentUser?.uid) return;
      setTestSeriesLoading(true); setError('');
      try {
        const seriesSnap = await getDoc(doc(db, 'test-series', testSeriesId));
        if (!seriesSnap.exists()) return setError('Test series not found.');
        
        const seriesData = seriesSnap.data();
        if (seriesData.createdBy !== currentUser.uid) return setError('Permission denied.');

        setSelectedTestSeries({ id: seriesSnap.id, ...seriesData });
        if (!quizTitle.trim() && seriesData.title) setQuizTitle(`${seriesData.title} - Section Quiz`);
      } catch (err) { setError('Failed to load test series.'); }
      finally { setTestSeriesLoading(false); }
    };
    loadTestSeries();
  }, [testSeriesId, currentUser?.uid]);

  const removeSection = useCallback((id) => {
    if (sections.length > 1) setSections(prev => prev.filter(s => s.id !== id));
    else setError('Quiz must have at least one section.');
  }, [sections.length]);

  const updateSection = useCallback((id, updates) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const addQuestionToSection = useCallback((sectionId) => {
    const newQ = {
      id: uuidv4(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      image: null,
      optionImages: ['', '', '', ''],
      negativeMarking: { enabled: false, type: 'fractional', value: 0.25 },
      positiveMarking: { enabled: false, type: 'fixed', value: 1.0 }
    };
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, questions: [...s.questions, newQ] } : s));
  }, []);

  const removeQuestionFromSection = useCallback((sId, qId) => {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, questions: s.questions.filter(q => q.id !== qId) } : s));
  }, []);

  const updateQuestionInSection = useCallback((sId, qId, updates) => {
    setSections(prev => prev.map(s => s.id === sId ? {
      ...s, questions: s.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    } : s));
  }, []);

  const createQuiz = async () => {
    setError(''); setSuccess('');
    
    // Validation
    if (!quizTitle.trim() || quizTitle.length < 3) return setError('Quiz title required (min 3 chars).');
    if (!selectedTestSeries) return setError('Test series required.');
    if (sections.length === 0) return setError('At least one section required.');
    
    // Validate Passing Score
    if (passingScore > totalMaxScore) {
      return setError(`Passing score (${passingScore}) cannot be greater than total marks (${totalMaxScore}).`);
    }
    
    const invalidSection = sections.find(s => s.questions.length === 0);
    if (invalidSection) return setError(`Section "${invalidSection.name}" is empty.`);
    
    setLoading(true);
    try {
      const quizData = {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        sections: sections.map(s => ({
          ...s,
          questions: s.questions.map(q => ({
            ...q,
            // Ensure safe defaults
            negativeMarking: q.negativeMarking || { enabled: false, type: 'fractional', value: 0.25 },
            positiveMarking: q.positiveMarking || { enabled: false, type: 'fixed', value: 1.0 }
          }))
        })),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Creator',
        createdAt: serverTimestamp(),
        totalSections: sections.length,
        totalQuestions: sections.reduce((acc, s) => acc + s.questions.length, 0),
        passingScore: parseFloat(passingScore), // Save passing score
        totalMarks: totalMaxScore, // Save total marks for reference
        testSeriesId,
        testSeriesTitle: selectedTestSeries.title,
        isPartOfSeries: true
      };

      const docRef = await addDoc(collection(db, 'section-quizzes'), quizData);
      await updateDoc(doc(db, 'test-series', testSeriesId), {
        quizzes: arrayUnion(docRef.id),
        totalQuizzes: increment(1),
        updatedAt: serverTimestamp()
      });

      setSuccess('Quiz created successfully!');
      setTimeout(onQuizCreated, 1500);
    } catch (err) {
      setError(`Failed to create quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${mode('bg-slate-50', 'bg-slate-950')}`}>
      {/* 1. STICKY WORKSPACE HEADER */}
      <div className={`sticky top-0 z-30 border-b backdrop-blur-md shadow-sm ${mode('bg-white/90 border-slate-200', 'bg-slate-900/90 border-slate-800')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 flex-1 min-w-0">
             <button onClick={onBack} className={`p-2 rounded-lg transition-colors ${mode('hover:bg-slate-100 text-slate-500', 'hover:bg-slate-800 text-slate-400')}`}>
                <FiArrowLeft className="w-5 h-5" />
             </button>
             
             <div className="flex-1 min-w-0">
                <input 
                  value={quizTitle}
                  onChange={(e) => { setQuizTitle(e.target.value); clearError(); }}
                  placeholder="Untitled Quiz"
                  className={`w-full bg-transparent border-none p-0 text-lg font-bold focus:ring-0 placeholder-opacity-50 truncate ${mode('text-slate-900 placeholder-slate-400', 'text-white placeholder-slate-600')}`}
                />
                <div className="flex items-center gap-2 text-xs opacity-70">
                   <span className={mode('text-slate-500', 'text-slate-400')}>{selectedTestSeries?.title || 'Loading Series...'}</span>
                   <span className="w-1 h-1 rounded-full bg-current" />
                   <span className={mode('text-slate-500', 'text-slate-400')}>{sections.reduce((acc, s) => acc + s.questions.length, 0)} Questions</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <span className={`hidden sm:flex text-xs px-2 py-1 rounded border ${mode('bg-slate-100 border-slate-200 text-slate-500', 'bg-slate-800 border-slate-700 text-slate-400')}`}>
               {loading ? 'Saving...' : 'Auto-save off'}
             </span>
             <button 
                onClick={createQuiz}
                disabled={loading || !selectedTestSeries}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
                <span className="hidden sm:inline">Publish Quiz</span>
                <span className="sm:hidden">Save</span>
             </button>
          </div>

        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-32">
         
         {/* Messages */}
         {(error || success) && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-top-4 ${
               error ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400' 
                     : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400'
            }`}>
               {error ? <FiAlertCircle className="w-5 h-5" /> : <FiCheck className="w-5 h-5" />}
               <span className="font-medium text-sm">{error || success}</span>
            </div>
         )}

         {/* Quiz Meta Configuration Card */}
         <div className={`mb-8 p-5 rounded-2xl border shadow-sm ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Description Input */}
               <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-slate-500')}`}>
                     Description (Optional)
                  </label>
                  <textarea 
                     value={quizDescription}
                     onChange={(e) => setQuizDescription(e.target.value)}
                     placeholder="Add a brief description..."
                     rows={3}
                     className={`w-full rounded-xl p-3 text-sm resize-none border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                        mode('bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400', 
                             'bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder-zinc-600')
                     }`}
                  />
               </div>

               {/* Scoring Settings */}
               <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-slate-500')}`}>
                     Scoring Rules
                  </label>
                  <div className={`rounded-xl p-4 border ${mode('bg-slate-50 border-slate-200', 'bg-zinc-800/50 border-zinc-700')}`}>
                     
                     <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                           <FiTarget className="text-indigo-500" />
                           <span className={`text-sm font-semibold ${mode('text-slate-700', 'text-zinc-300')}`}>Total Marks</span>
                        </div>
                        <span className={`text-xl font-bold ${mode('text-slate-900', 'text-white')}`}>
                           {totalMaxScore}
                        </span>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <FiCheckCircle className="text-emerald-500" />
                           <span className={`text-sm font-semibold ${mode('text-slate-700', 'text-zinc-300')}`}>Passing Score</span>
                        </div>
                        <div className="relative w-24">
                           <input 
                              type="number" 
                              min="0" 
                              max={totalMaxScore}
                              value={passingScore}
                              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                              className={`w-full px-3 py-1.5 rounded-lg border text-right font-bold outline-none focus:ring-2 focus:ring-emerald-500 ${
                                 mode('bg-white border-slate-300 text-slate-900', 'bg-zinc-900 border-zinc-600 text-white')
                              }`}
                           />
                        </div>
                     </div>
                     
                     <div className="mt-2 flex justify-between text-xs">
                        <span className="text-zinc-400">Recommendation: {Math.ceil(totalMaxScore * 0.4)} (40%)</span>
                        <span className={`font-medium ${passingScore > totalMaxScore ? 'text-red-500' : 'text-emerald-500'}`}>
                           {totalMaxScore > 0 ? Math.round((passingScore/totalMaxScore)*100) : 0}%
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Sections List */}
         <div className="space-y-8">
            {sections.map((section, index) => (
               <div key={section.id} className="relative group">
                  {/* Connector Line */}
                  {index < sections.length - 1 && (
                     <div className={`absolute left-8 top-full h-8 w-0.5 z-0 ${mode('bg-slate-200', 'bg-slate-800')}`} />
                  )}
                  
                  <div className="relative z-10">
                     <SectionCard
                        section={section}
                        sectionIndex={index}
                        onUpdate={(updates) => updateSection(section.id, updates)}
                        onRemove={() => removeSection(section.id)}
                        onAddQuestion={() => addQuestionToSection(section.id)}
                        onUpdateQuestion={(qId, updates) => updateQuestionInSection(section.id, qId, updates)}
                        onRemoveQuestion={(qId) => removeQuestionFromSection(section.id, qId)}
                     />
                  </div>
               </div>
            ))}
         </div>

         {/* Add Section Button */}
         <div className="mt-8 flex justify-center">
            <button
               onClick={addNewSection}
               className={`group flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01] active:scale-[0.99] w-full sm:w-auto min-w-[200px] ${
                  mode('border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30', 
                       'border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-900/10')
               }`}
            >
               <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${mode('bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white', 'bg-indigo-900/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white')}`}>
                  <FiPlus className="w-5 h-5" />
               </div>
               <span className={`font-semibold ${mode('text-slate-600 group-hover:text-indigo-700', 'text-slate-400 group-hover:text-indigo-300')}`}>Add New Section</span>
            </button>
         </div>

      </div>

      {/* Mobile Sticky Action Bar */}
      <div className={`sm:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-lg z-40 flex gap-3 ${mode('bg-white/90 border-slate-200', 'bg-slate-900/90 border-slate-800')}`}>
         <button onClick={addNewSection} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border ${mode('bg-slate-50 border-slate-200 text-slate-700', 'bg-slate-800 border-slate-700 text-slate-300')}`}>
            <FiPlus /> Section
         </button>
         <button 
            onClick={createQuiz}
            disabled={loading}
            className="flex-[2] py-3 rounded-xl font-bold bg-indigo-600 text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
         >
            {loading ? 'Saving...' : 'Publish'}
         </button>
      </div>

    </div>
  );
};

export default SectionWiseQuizCreator;