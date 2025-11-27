import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, X, Radio, Activity, Volume2, AlertCircle } from 'lucide-react';
import LiveVoiceAssistantService from '../../../services/LiveVoiceAssistant'; // Service Class
import { useTheme } from '../../../contexts/ThemeContext';

const LiveVoiceAssistant = ({ systemPrompt, onResult, onClose }) => {
  const { isDark } = useTheme();
  
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0);
  
  const serviceRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    try {
      // Initialize service with API Key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      
      serviceRef.current = new LiveVoiceAssistantService(apiKey);
      
      // Establish Session
      serviceRef.current.startSession(systemPrompt).then(() => {
        setStatus('ready');
      }).catch(err => {
        setError("Failed to connect to AI service.");
        console.error(err);
      });

    } catch (e) {
      setError(e.message);
    }

    return () => {
      stopSession();
    };
  }, [systemPrompt]);

  // --- AUDIO VISUALIZER ---
  const drawVisualizer = () => {
    if (!isActive || !canvasRef.current) return;
    
    // Simulating volume changes for visual effect if real analyser not connected to component state efficiently
    // In a real implementation, you'd connect an AudioContext AnalyserNode here.
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#6366f1' : '#4f46e5'; // Indigo
    
    const bars = 20;
    const barWidth = width / bars;
    
    for (let i = 0; i < bars; i++) {
      const h = Math.random() * (height * 0.8) * (volume > 0.1 ? 1 : 0.2);
      const x = i * barWidth;
      const y = (height - h) / 2;
      
      // Rounded bar
      ctx.beginPath();
      ctx.roundRect(x + 2, y, barWidth - 4, h, 5);
      ctx.fill();
    }
    
    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  useEffect(() => {
    if (isActive) {
      drawVisualizer();
      // Mock volume fluctuation for demo
      const volInterval = setInterval(() => {
        setVolume(Math.random());
      }, 100);
      return () => clearInterval(volInterval);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isActive, isDark]);

  // --- HANDLERS ---
  
  const startListening = async () => {
    if (!serviceRef.current) return;
    try {
      setError(null);
      await serviceRef.current.startListening();
      setIsActive(true);
      setStatus('listening');
    } catch (e) {
      setError("Microphone access denied or failed.");
      setStatus('error');
    }
  };

  const stopListening = async () => {
    if (!serviceRef.current || !isActive) return;
    
    setIsActive(false);
    setStatus('processing');
    
    try {
      const audioBlob = await serviceRef.current.stopListening();
      // Send to AI
      const response = await serviceRef.current.sendAudioInput(audioBlob);
      
      setStatus('speaking');
      // Handle response audio playback here if returned, or text
      if (onResult) onResult(response);
      
      // Reset after interaction
      setTimeout(() => setStatus('ready'), 2000);
      
    } catch (e) {
      setError("Failed to process audio.");
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (serviceRef.current) {
       // Cleanup logic if service supports it
    }
    setIsActive(false);
  };

  // --- RENDER ---

  const containerClass = isDark 
    ? "bg-gray-900 border-gray-800 text-white shadow-2xl shadow-black/50" 
    : "bg-white border-slate-200 text-slate-900 shadow-2xl shadow-slate-200/50";

  return (
    <div className={`fixed bottom-8 right-8 w-80 sm:w-96 rounded-3xl border p-6 flex flex-col gap-6 z-50 ${containerClass}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${isActive ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </div>
          <span className="font-bold text-sm uppercase tracking-wider">Live Tutor</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 opacity-50" />
        </button>
      </div>

      {/* Visualizer / Status */}
      <div className="h-24 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative">
        {error ? (
          <div className="flex flex-col items-center text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs font-bold">Connection Error</span>
          </div>
        ) : isActive ? (
          <canvas ref={canvasRef} width={300} height={80} className="w-full h-full" />
        ) : (
          <div className="text-center opacity-40">
            {status === 'processing' ? (
              <Activity className="w-8 h-8 animate-bounce mx-auto" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-8 h-8 animate-pulse mx-auto" />
            ) : (
              <div className="flex flex-col items-center">
                 <Radio className="w-8 h-8 mb-2" />
                 <span className="text-xs font-medium">Ready to listen</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={!!error}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95 ${
            isActive 
              ? 'bg-red-500 text-white shadow-red-500/30 scale-110' 
              : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isActive ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
      </div>
      
      <p className="text-center text-xs opacity-50">
        {isActive ? "Release to send" : "Hold to speak"}
      </p>

    </div>
  );
};

export default LiveVoiceAssistant;