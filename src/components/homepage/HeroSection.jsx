import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiArrowRight, 
  FiTrendingUp, 
  FiCommand, 
  FiCompass,
  FiZap 
} from 'react-icons/fi';
import { FaRocket, FaFire } from 'react-icons/fa';

const HeroSection = ({ isDark, currentUser, onViewAllSeries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // If a parent handler is provided, use it, otherwise navigate
      if (onViewAllSeries) {
        onViewAllSeries(searchTerm);
      } else {
        navigate(`/test-series?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const trendingTopics = [
    { label: 'SSC CGL', color: 'text-blue-500 bg-blue-500/10 border-blue-200' },
    { label: 'UPSC Prelims', color: 'text-orange-500 bg-orange-500/10 border-orange-200' },
    { label: 'Python', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-200' },
    { label: 'Banking', color: 'text-purple-500 bg-purple-500/10 border-purple-200' }
  ];

  return (
    <div className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
      isDark 
        ? 'bg-zinc-900 border border-zinc-800' 
        : 'bg-white border border-zinc-200 shadow-xl shadow-zinc-200/40'
    }`}>
      
      {/* 1. Animated Background Mesh (Subtle) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
        
        </div>

      <div className="relative z-10 px-6 py-12 md:py-16 text-center max-w-4xl mx-auto">
        
        {/* 2. Badge & Headline */}
        

        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Preparation</span>
        </h1>
        
        <p className={`text-lg mb-8 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Access premium mock tests, detailed analytics, and community insights to crack your dream exam.
        </p>

        {/* 3. Search Interface */}
        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${
              isFocused ? 'text-emerald-500' : (isDark ? 'text-zinc-500' : 'text-zinc-400')
            }`}>
              <FiSearch className="w-5 h-5" />
            </div>
            
            <input
              type="text"
              placeholder="Search for exams (e.g., JEE, NEET, Python)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl text-base font-medium transition-all duration-200 outline-none border-2 ${
                isDark 
                  ? `bg-zinc-950/50 ${isFocused ? 'border-emerald-500/50 ring-4 ring-emerald-500/10' : 'border-zinc-700 text-white placeholder-zinc-600'}`
                  : `bg-white ${isFocused ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-zinc-200 text-zinc-900 placeholder-zinc-400 shadow-sm'}`
              }`}
            />
            
            <div className="absolute inset-y-2 right-2 hidden sm:flex">
               <button 
                type="submit"
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isDark 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                 {searchTerm ? <FiArrowRight /> : <FiCommand className="w-3.5 h-3.5 opacity-50" />}
                 {searchTerm ? 'Go' : <span className="text-xs opacity-50">CMD+K</span>}
              </button>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <FiTrendingUp className="inline mr-1" /> Trending:
            </span>
            {trendingTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchTerm(topic.label);
                  // Optional: auto-submit or just fill
                }}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all hover:-translate-y-0.5 ${
                  isDark 
                    ? `bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:text-white`
                    : `bg-white border-zinc-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700`
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/test-series')}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <FaRocket className="w-4 h-4" />
            Explore All Series
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
              isDark 
                ? 'bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <FiCompass className="w-4 h-4" />
            View Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;