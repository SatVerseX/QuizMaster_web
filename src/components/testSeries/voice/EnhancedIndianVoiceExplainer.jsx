import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Mic, Settings, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IndianLanguageVoiceService from '../../../services/IndianLanguageVoiceService';
import usePopup from '../../../hooks/usePopup';
import { useTheme } from '../../../contexts/ThemeContext';

const EnhancedIndianVoiceExplainer = ({ testSeries, testResults, reviewData }) => {
  const { isDark } = useTheme();
  const { showError } = usePopup();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechObject, setSpeechObject] = useState(null); // Now holds utterance object
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  
  const voiceService = useRef(new IndianLanguageVoiceService());
  const indianLanguages = voiceService.current.indianLanguages;

  // Cleanup speech on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const generateContent = () => {
    return `
      Namaste. Here is your analysis for ${testSeries.title}.
      You scored ${testResults?.score || 0} percent.
      ${reviewData?.strengths?.length ? `Your strengths are ${reviewData.strengths.join(', ')}.` : ''}
      Keep practicing!
    `;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await voiceService.current.generateIndianVoiceExplanation(
        generateContent(),
        selectedLanguage
      );

      // Setup event listeners on the utterance for UI sync
      result.utterance.onstart = () => setIsPlaying(true);
      result.utterance.onend = () => setIsPlaying(false);
      result.utterance.onpause = () => setIsPlaying(false);
      result.utterance.onresume = () => setIsPlaying(true);
      result.utterance.onerror = () => setIsPlaying(false);

      setSpeechObject(result);

    } catch (error) {
      console.error(error);
      showError(`Failed to generate voice. Browser support missing.`, "Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!speechObject) return;
    
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      window.speechSynthesis.speak(speechObject.utterance);
      setIsPlaying(true);
    }
  };

  const stopPlay = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className={`rounded-3xl overflow-hidden border shadow-2xl ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Regional Analysis</h3>
              <p className="text-orange-100 text-xs">Feedback in {indianLanguages[selectedLanguage]?.name}</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 'auto' }} 
            exit={{ height: 0 }} 
            className={`border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'} overflow-hidden`}
          >
            <div className="p-6">
              <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Select Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(indianLanguages).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLanguage(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedLanguage === key
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                        : isDark ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="text-lg mb-1">{lang.flag}</div>
                    <div className="font-bold text-sm">{lang.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div className="p-6">
        {!speechObject ? (
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Mic />}
              Generate Explanation
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visualizer Animation */}
            <div className="flex items-center justify-center gap-1 h-12">
               {[...Array(15)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{ 
                     height: isPlaying ? [10, Math.random() * 30 + 10, 10] : 10,
                     backgroundColor: isPlaying ? '#f97316' : (isDark ? '#374151' : '#cbd5e1')
                   }}
                   transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                   className="w-1.5 rounded-full"
                 />
               ))}
            </div>

            <div className="flex items-center justify-center gap-6">
               <button onClick={stopPlay} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
                 <Square className="w-5 h-5 fill-current" />
               </button>
               <button onClick={togglePlay} className="p-6 bg-orange-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                 {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
               </button>
            </div>
            
            <p className={`text-center text-xs px-4 italic ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              (Generated translation in {indianLanguages[selectedLanguage].name})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedIndianVoiceExplainer;