import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Activity, Volume2, AlertCircle, Radio } from 'lucide-react';
import LiveVoiceAssistantService from '../../../services/LiveVoiceAssistant';
import { useTheme } from '../../../contexts/ThemeContext';

const LiveVoiceAssistant = ({ systemPrompt, onClose }) => {
  const { isDark } = useTheme();
  
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);
  
  const serviceRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      serviceRef.current = new LiveVoiceAssistantService(apiKey);
      serviceRef.current.startSession(systemPrompt).then(() => {
        setStatus('ready');
      });
    } catch (e) {
      setError(e.message);
    }
  }, [systemPrompt]);

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, 300, 80);
      ctx.fillStyle = isDark ? '#6366f1' : '#4f46e5';
      const bars = 15;
      for (let i = 0; i < bars; i++) {
        const h = Math.random() * 40 + 10;
        ctx.fillRect(i * 20 + 5, 40 - h/2, 10, h);
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, isDark]);

  const handleToggleListening = async () => {
    if (isActive) {
        // Manual stop if needed, though usually speech recognition stops automatically on silence
        setIsActive(false);
        setStatus('ready');
        return;
    }

    try {
        setIsActive(true);
        setStatus('listening');
        setError(null);

        // 1. Listen
        const userText = await serviceRef.current.startListening();
        setIsActive(false);
        
        // 2. Process
        setStatus('processing');
        const responseText = await serviceRef.current.sendInput(userText);
        
        // 3. Speak (Handled by service, just update UI)
        setStatus('speaking');
        
        // Reset UI after delay (simulating speech duration approx)
        setTimeout(() => setStatus('ready'), Math.min(responseText.length * 50, 5000));

    } catch (err) {
        console.error(err);
        setError("Could not hear you. Try again.");
        setIsActive(false);
        setStatus('error');
    }
  };

  const containerClass = isDark 
    ? "bg-gray-900 border-gray-800 text-white shadow-2xl shadow-black/50" 
    : "bg-white border-slate-200 text-slate-900 shadow-2xl shadow-slate-200/50";

  return (
    <div className={`fixed bottom-8 right-8 w-80 rounded-3xl border p-6 flex flex-col gap-6 z-50 ${containerClass}`}>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === 'listening' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="font-bold text-sm uppercase tracking-wider">AI Tutor</span>
        </div>
        <button onClick={onClose}><X className="w-5 h-5 opacity-50" /></button>
      </div>

      <div className="h-24 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative">
        {error ? (
          <div className="text-red-500 text-xs font-bold flex flex-col items-center">
             <AlertCircle className="w-6 h-6 mb-1" /> {error}
          </div>
        ) : isActive ? (
           <canvas ref={canvasRef} width={300} height={80} />
        ) : status === 'processing' ? (
           <Activity className="w-8 h-8 animate-bounce opacity-50" />
        ) : status === 'speaking' ? (
           <Volume2 className="w-8 h-8 animate-pulse text-indigo-500" />
        ) : (
           <div className="flex flex-col items-center opacity-40">
              <Radio className="w-6 h-6 mb-1" />
              <span className="text-xs">Tap mic to speak</span>
           </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleToggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
            isActive 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default LiveVoiceAssistant;