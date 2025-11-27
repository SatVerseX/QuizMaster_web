import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Square, Mic, Download, Settings, 
  Globe, Languages, Loader2
} from 'lucide-react'; // Using Lucide icons for consistency with project
import { motion, AnimatePresence } from 'framer-motion';
import IndianLanguageVoiceService from '../../../services/IndianLanguageVoiceService';
import usePopup from '../../../hooks/usePopup';
import BeautifulPopup from '../../common/BeautifulPopup';
import { useTheme } from '../../../contexts/ThemeContext';

const EnhancedIndianVoiceExplainer = ({ testSeries, testResults, reviewData }) => {
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Refs
  const audioRef = useRef(null);
  const voiceService = useRef(new IndianLanguageVoiceService());

  // Language Data
  const indianLanguages = voiceService.current.indianLanguages;

  // Helper: Generate content to be spoken
  const generateContent = () => {
    // Basic structure, could be more elaborate based on analysis data
    return `
      Namaste. Here is your analysis for ${testSeries.title}.
      You scored ${testResults?.score || 0} percent.
      ${reviewData?.strengths?.length ? `Your strengths are ${reviewData.strengths.join(', ')}.` : ''}
      ${reviewData?.weaknesses?.length ? `You need to focus on ${reviewData.weaknesses.join(', ')}.` : ''}
      Keep practicing to improve your rank!
    `;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const baseContent = generateContent();
      
      // 1. Translate (if needed) handled by service usually, but let's be explicit if we want UI feedback
      setIsTranslating(true);
      // The service handles prompt generation which includes translation instruction, 
      // but we can also pre-translate text if we want to show it.
      // For voice, we pass the content to the service's generation method.
      
      const blob = await voiceService.current.generateIndianVoiceExplanation(
        baseContent,
        selectedLanguage,
        { tone: 'encouraging', pace: 'moderate' }
      );

      setIsTranslating(false);
      setAudioBlob(blob);
      
      if (audioRef.current) {
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        // Revoke old URL if exists to prevent memory leak (handled in cleanup usually)
      }

    } catch (error) {
      console.error(error);
      setIsTranslating(false);
      showError(`Failed to generate voice in ${indianLanguages[selectedLanguage].name}`, "Generation Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const stopPlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${selectedLanguage}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Audio Events
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onUpdate = () => setCurrentTime(audio.currentTime);
      const onLoaded = () => setDuration(audio.duration);
      const onEnd = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', onUpdate);
      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('ended', onEnd);

      return () => {
        audio.removeEventListener('timeupdate', onUpdate);
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('ended', onEnd);
      };
    }
  }, [audioBlob]);

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
              <p className="text-orange-100 text-xs">AI Voice in 12+ Indian Languages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-black/20 rounded-full text-xs font-medium border border-white/10">
              {indianLanguages[selectedLanguage]?.name}
            </span>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(indianLanguages).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLanguage(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedLanguage === key
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                        : isDark 
                          ? 'border-gray-700 hover:border-gray-600 text-gray-300' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="text-lg mb-1">{lang.flag}</div>
                    <div className="font-bold text-sm">{lang.name}</div>
                    <div className="text-[10px] opacity-70">{lang.script}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div className="p-6 sm:p-8">
        {!audioBlob ? (
          <div className="text-center py-8">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              isDark ? 'bg-gray-800' : 'bg-slate-100'
            }`}>
              {isGenerating ? (
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              ) : (
                <Languages className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-slate-400'}`} />
              )}
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isGenerating ? 'Generating Voice...' : 'Generate Explanation'}
              {!isGenerating && <Mic className="w-5 h-5" />}
            </button>
            <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
              Get personalized feedback in your native language.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Waveform Placeholder */}
            <div className="flex items-center justify-center gap-1 h-16">
               {[...Array(30)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{ 
                     height: isPlaying ? [10, Math.random() * 40 + 10, 10] : 10,
                     backgroundColor: isPlaying ? '#f97316' : (isDark ? '#374151' : '#cbd5e1')
                   }}
                   transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.03 }}
                   className="w-1 rounded-full"
                 />
               ))}
            </div>

            {/* Audio Element (Hidden) */}
            <audio ref={audioRef} className="hidden" />

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
               <button onClick={stopPlay} className={`p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                 <Square className="w-5 h-5 fill-current" />
               </button>
               
               <button 
                 onClick={togglePlay}
                 className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform"
               >
                 {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
               </button>

               <button onClick={downloadAudio} className={`p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                 <Download className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}
      </div>

      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default EnhancedIndianVoiceExplainer;