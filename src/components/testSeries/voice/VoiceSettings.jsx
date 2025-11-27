import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, Mic2, Gauge, Languages, MessageSquare } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const VoiceSettings = ({ options, setOptions }) => {
  const { isDark } = useTheme();

  const handleChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const containerClass = isDark 
    ? "bg-black/40 border-white/10 text-white" 
    : "bg-white/60 border-slate-200 text-slate-800";

  const selectClass = isDark
    ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500/20"
    : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20";

  const labelClass = isDark ? "text-zinc-400" : "text-slate-500";

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`rounded-2xl border backdrop-blur-xl p-6 mb-6 overflow-hidden ${containerClass}`}
    >
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-dashed border-current/10">
        <Settings2 className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-lg">Voice Configuration</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Tone */}
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${labelClass}`}>
            <Mic2 className="w-3 h-3" /> Tone
          </label>
          <select
            value={options.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none transition-all appearance-none font-medium text-sm ${selectClass}`}
          >
            <option value="friendly and professional">Friendly & Professional</option>
            <option value="enthusiastic and encouraging">Enthusiastic & Encouraging</option>
            <option value="calm and reassuring">Calm & Reassuring</option>
            <option value="authoritative and confident">Authoritative & Confident</option>
          </select>
        </div>

        {/* Pace */}
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${labelClass}`}>
            <Gauge className="w-3 h-3" /> Pace
          </label>
          <select
            value={options.pace}
            onChange={(e) => handleChange('pace', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none transition-all appearance-none font-medium text-sm ${selectClass}`}
          >
            <option value="slow">Slow (Detailed)</option>
            <option value="moderate">Moderate (Natural)</option>
            <option value="fast">Fast (Brief)</option>
          </select>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${labelClass}`}>
            <MessageSquare className="w-3 h-3" /> Style
          </label>
          <select
            value={options.style}
            onChange={(e) => handleChange('style', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none transition-all appearance-none font-medium text-sm ${selectClass}`}
          >
            <option value="educational">Educational (Tutor)</option>
            <option value="conversational">Conversational (Peer)</option>
            <option value="formal">Formal (Exam)</option>
            <option value="storytelling">Storytelling (Engaging)</option>
          </select>
        </div>

        {/* Language - Only basic ones here, enhanced component handles Indian languages */}
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${labelClass}`}>
            <Languages className="w-3 h-3" /> Base Language
          </label>
          <select
            value={options.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none transition-all appearance-none font-medium text-sm ${selectClass}`}
          >
            <option value="english">English (Default)</option>
            <option value="hindi">Hindi</option>
            
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceSettings;