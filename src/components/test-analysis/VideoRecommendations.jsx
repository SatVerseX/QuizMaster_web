import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { generateVideoRecommendations } from '../../services/geminiService';
import { 
  FiYoutube, 
  FiExternalLink, 
  FiAlertCircle, 
  FiPlay,
  FiSearch,
  FiArrowRight,
  FiTv,
  FiClock
} from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const VideoRecommendations = ({ mistakes, testTitle }) => {
  const { isDark } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      if (!mistakes || mistakes.length === 0) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await generateVideoRecommendations(mistakes, testTitle);
        
        if (isMounted) {
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setRecommendations(result.data);
          } else if (!result.success) {
            console.warn("Could not generate recommendations:", result.error);
          }
        }
      } catch (err) {
        if (isMounted) console.error("Failed to load video suggestions.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();

    return () => { isMounted = false; };
  }, [mistakes, testTitle]);

  // --- Neo-Brutalist Styles ---
  const theme = {
    container: isDark 
      ? 'bg-zinc-900 border-4 border-black shadow-[6px_6px_0px_0px_#000]' 
      : 'bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000]',
    
    header: isDark
      ? 'bg-zinc-800 border-b-4 border-black text-white'
      : 'bg-yellow-400 border-b-4 border-black text-black',

    card: isDark
      ? 'bg-zinc-800 border-2 border-black text-zinc-100 hover:bg-zinc-700'
      : 'bg-white border-2 border-black text-slate-900 hover:bg-blue-50',

    // Slightly reduced shadow offset for compactness
    cardShadow: 'shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none',
    
    badge: isDark
      ? 'bg-black text-white border border-zinc-700'
      : 'bg-black text-white',
      
    iconBox: isDark
      ? 'bg-red-600 text-white border-2 border-black'
      : 'bg-red-600 text-white border-2 border-black',
      
    thumbnailBorder: isDark ? 'border-zinc-700' : 'border-black',
  };

  if (!loading && (!mistakes || mistakes.length === 0)) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl overflow-hidden mt-8 mb-8 ${theme.container}`}
    >
      {/* Header Section */}
      <div className={`p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${theme.header}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] ${theme.iconBox}`}>
            <FaYoutube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              Concept Remediation
            </h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
              Curated Video Tutorials
            </p>
          </div>
        </div>
        
        {!loading && !error && recommendations.length > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] ${theme.badge}`}>
            <FiTv className="w-3 h-3" />
            <span>{recommendations.length} Videos</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className={`p-4 md:p-5 ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-black border-t-transparent rounded-full mb-4"
            />
            <p className={`font-bold text-base ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              ANALYZING WEAK AREAS...
            </p>
          </div>
        ) : error ? (
          <div className="py-8 text-center border-2 border-dashed border-red-400 rounded-xl bg-red-50 dark:bg-red-900/10">
            <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-3 border-2 border-black">
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-red-600 dark:text-red-400 text-sm">UNABLE TO LOAD RECOMMENDATIONS</p>
          </div>
        ) : (
          // GAP Reduced to gap-4 for compactness
          <div className="flex flex-col gap-4 w-full">
            <AnimatePresence>
              {recommendations.map((rec, idx) => (
                <motion.a 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.youtubeQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  // lg:flex-row for horizontal desktop layout
                  className={`w-full group relative flex flex-col lg:flex-row p-0 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${theme.card} ${theme.cardShadow}`}
                >
                  
                  {/* Thumbnail Section */}
                  {/* Reduced height (h-40 -> h-32) and width (w-64 -> w-56) */}
                  <div className={`relative w-full lg:w-56 shrink-0 h-36 lg:h-auto flex flex-col items-center justify-center overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 ${theme.thumbnailBorder} ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
                    {/* Simulated Thumbnail Pattern */}
                    <div className="absolute inset-0 opacity-[0.1]" 
                         style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '8px 8px' }} 
                    />
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 bg-red-600 text-white border-2 border-black`}>
                      <FiPlay className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <div className={`mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-current ${isDark ? 'text-zinc-400 border-zinc-700' : 'text-zinc-500 border-zinc-300'}`}>
                       Preview
                    </div>
                  </div>

                  {/* Content Section */}
                  {/* Padding reduced (p-5 -> p-4) */}
                  <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] ${
                          rec.difficulty === 'High Priority' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
                        }`}>
                          {rec.difficulty || 'TOPIC'}
                        </span>
                        <FiExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>

                      {/* Title reduced to text-base/lg */}
                      <h4 className="text-base md:text-lg font-black leading-tight mb-1.5 group-hover:underline decoration-4 decoration-red-500 underline-offset-4 line-clamp-2 break-words">
                        {rec.conceptName}
                      </h4>
                      
                      <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {rec.reason}
                      </p>
                    </div>

                    {/* Footer Section */}
                    <div className={`mt-3 pt-3 border-t-2 border-dashed ${isDark ? 'border-zinc-700' : 'border-zinc-300'} flex flex-wrap items-center justify-between gap-2`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60 min-w-0 flex-1">
                        <FiSearch className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {rec.youtubeQuery}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-black text-[10px] sm:text-xs group-hover:text-red-600 transition-colors whitespace-nowrap ml-auto bg-black text-white px-2 py-1 rounded">
                        WATCH <FiArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoRecommendations;