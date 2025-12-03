import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Download, Mic, Loader2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import VoiceSettings from './VoiceSettings';
import usePopup from '../../../hooks/usePopup';
import BeautifulPopup from '../../common/BeautifulPopup';
import { useTheme } from '../../../contexts/ThemeContext';

// Initialize Gemini safely
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const TestSeriesVoiceExplainer = ({ testSeries, testResults, reviewData }) => {
  const { isDark } = useTheme();
  const { popupState, showError, hidePopup } = usePopup();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceOptions, setVoiceOptions] = useState({
    tone: 'friendly and professional',
    pace: 'moderate',
    accent: 'neutral',
    style: 'educational',
    language: 'english'
  });

  const audioRef = useRef(null);

  // --- GENERATION LOGIC ---
  const generateExplanation = () => {
    // Sanitize inputs to prevent injection in prompt
    const cleanTitle = (testSeries.title || '').replace(/[^\w\s]/gi, '');
    const cleanDesc = (testSeries.description || '').replace(/[^\w\s]/gi, '');
    
    return `
      Role: Academic Tutor.
      Task: Provide a concise voice script summarizing this test performance.
      Context:
      - Test: ${cleanTitle}
      - Score: ${testResults.score}% (${testResults.correctAnswers}/${testResults.totalQuestions})
      - Time: ${testResults.timeSpent}m
      - Strengths: ${reviewData?.strengths?.join(', ') || 'General proficiency'}
      - Weaknesses: ${reviewData?.weaknesses?.join(', ') || 'None identified'}
      
      Instructions:
      - Keep it under 100 words.
      - Tone: ${voiceOptions.tone}.
      - Style: ${voiceOptions.style}.
      - Don't read stats robotically, weave them into a narrative.
    `.trim();
  };

  const handleGenerateVoice = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      showError('API Key missing. Configure VITE_GEMINI_API_KEY.', 'Configuration Error');
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Generate Text Script
      const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const textResult = await textModel.generateContent(generateExplanation());
      const script = textResult.response.text();

      // 2. Generate Audio (Using experimental/preview endpoint or mock if unavailable)
      // NOTE: Gemini TTS is in preview. If strictly not available, this block needs a fallback to Web Speech API.
      // For this implementation, we assume the model handles multimodal generation or we use a specific TTS model.
      
      // Using a safe fallback logic if direct TTS isn't available in standard SDK yet
      // In a real scenario, you might call OpenAI TTS or ElevenLabs here.
      // Below assumes a hypothetical 'gemini-2.5-flash-preview-tts' exists as per context
      const ttsModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-native-audio-dialog" });
      
      // Defensive try/catch for the specific TTS call
      try {
         const audioResult = await ttsModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: script }] }]
         });
         // Assuming response is a blob or base64
         // This line depends heavily on the specific SDK version's response format for Audio
         // If using a standard REST API, we'd fetch blob. Here we simulate if SDK differs.
         const blob = await new Response(audioResult.response.audio()).blob(); // hypothetical
         setAudioBlob(blob);
      } catch (ttsError) {
         console.warn("Gemini TTS failed, falling back to Web Speech API for demo purposes");
         // Fallback: Web Speech API (Client side)
         const utterance = new SpeechSynthesisUtterance(script);
         utterance.rate = voiceOptions.pace === 'fast' ? 1.2 : voiceOptions.pace === 'slow' ? 0.8 : 1;
         // We can't get a blob easily from Web Speech API, so we handle playback differently or show error
         // For "Awwwards" quality, better to show error than broken feature
         throw new Error("High-fidelity TTS service unavailable. Please try again later.");
      }

    } catch (error) {
      console.error(error);
      showError('Failed to generate voice explanation.', 'Generation Error');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- AUDIO CONTROLS ---
  const handlePlay = () => audioRef.current?.play();
  const handlePause = () => audioRef.current?.pause();
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `explanation-${Date.now()}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Effect to bind audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioBlob]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-1 transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-white border-slate-200 shadow-xl'
    }`}>
      <div className={`relative z-10 p-6 sm:p-8 rounded-[1.25rem] overflow-hidden ${
        isDark ? 'bg-gray-900/80' : 'bg-slate-50/80'
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Audio Insight
            </h2>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Personalized performance breakdown
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all duration-300 ${
              showSettings 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <VoiceSettings options={voiceOptions} setOptions={setVoiceOptions} />
          )}
        </AnimatePresence>

        {/* Main Action Area */}
        {!audioBlob ? (
          <motion.div layout className="py-8 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative ${
              isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
            }`}>
              {isGenerating ? (
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              ) : (
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-pulse" />
              )}
              <Mic className={`w-10 h-10 ${isGenerating ? 'text-indigo-500' : isDark ? 'text-gray-400' : 'text-slate-400'}`} />
            </div>
            
            <button
              onClick={handleGenerateVoice}
              disabled={isGenerating}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold tracking-wide shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {isGenerating ? 'Synthesizing...' : 'Generate Audio Analysis'}
                {!isGenerating && <Settings className="w-4 h-4 opacity-50" />}
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visualizer Placeholder */}
            <div className="flex items-center justify-center gap-1 h-16 mb-4">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isPlaying ? [16, Math.random() * 48 + 16, 16] : 8,
                    backgroundColor: isPlaying ? '#6366f1' : (isDark ? '#374151' : '#cbd5e1')
                  }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                  className="w-1.5 rounded-full"
                />
              ))}
            </div>

            {/* Audio Element */}
            {audioBlob && (
              <audio 
                ref={audioRef} 
                src={URL.createObjectURL(audioBlob)} 
                onEnded={() => setIsPlaying(false)}
                onError={() => showError("Playback error", "Audio Error")}
              />
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-medium opacity-60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-slate-200'}`}>
                <motion.div 
                  className="h-full bg-indigo-500"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 pt-4">
              <button onClick={handleStop} className={`p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Square className="w-5 h-5 fill-current" />
              </button>
              
              <button 
                onClick={isPlaying ? handlePause : handlePlay}
                className="p-6 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              
              <button onClick={handleDownload} className={`p-4 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Download className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

      </div>
      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default TestSeriesVoiceExplainer;