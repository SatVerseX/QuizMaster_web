import React, { useState, useEffect } from 'react';
import { FiStar, FiArrowLeft, FiArrowRight, FiAward, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import { FaQuoteLeft, FaTrophy, FaMedal, FaUniversity } from 'react-icons/fa';

// High-quality mock data
const DEFAULT_STORIES = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, India",
    exam: "JEE Advanced",
    rank: "AIR 142",
    achievement: "IIT Bombay CSE",
    score: "98.5%",
    testsCompleted: 124,
    studyHours: "450+",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    testimonial: "The chapter-wise analytics were a game changer. I realized I was losing marks in Rotational Mechanics and fixed it just in time for the finals. This platform didn't just test me; it taught me how to take tests."
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi, India",
    exam: "NEET UG",
    rank: "AIR 45",
    achievement: "AIIMS Delhi",
    score: "715/720",
    testsCompleted: 156,
    studyHours: "600+",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    testimonial: "I tried many test series, but the difficulty level here matched the actual exam perfectly. The 'Time Management' insights helped me increase my speed by 20%. Highly recommended for serious aspirants."
  },
  {
    id: 3,
    name: "Ananya Gupta",
    location: "Bangalore, India",
    exam: "CAT",
    rank: "99.98 %ile",
    achievement: "IIM Ahmedabad",
    score: "99.98 %ile",
    testsCompleted: 89,
    studyHours: "300+",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    testimonial: "The mock analysis is superior to anything else in the market. It pinpointed my weak areas in DILR so accurately. Being able to compare my performance with toppers gave me the competitive edge I needed."
  }
];

const SuccessStoriesSection = ({ isDark, stories = [] }) => {
  const [currentStory, setCurrentStory] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animating, setAnimating] = useState(false);

  const displayStories = stories.length > 0 ? stories : DEFAULT_STORIES;
  const currentData = displayStories[currentStory];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      handleNext();
    }, 8000); 
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStory]);

  const triggerAnimation = (callback) => {
    setAnimating(true);
    setTimeout(() => {
      callback();
      setAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    triggerAnimation(() => {
      setCurrentStory((prev) => (prev + 1) % displayStories.length);
    });
    setIsAutoPlaying(false);
  };

  const handlePrev = () => {
    triggerAnimation(() => {
      setCurrentStory((prev) => (prev - 1 + displayStories.length) % displayStories.length);
    });
    setIsAutoPlaying(false);
  };

  if (displayStories.length === 0) return null;

  return (
    <section className={`py-24 relative overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      
      {/* Ambient Background Elements */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40`}>
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100/60'}`} />
        <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t ${isDark ? 'from-zinc-950 via-zinc-950 to-transparent' : 'from-zinc-50 via-zinc-50 to-transparent'}`} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${
            isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <FaTrophy className="w-3 h-3" />
            <span>Hall of Fame</span>
          </div>
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Success Stories that Inspire
          </h2>
          <p className={`text-lg max-w-2xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Join thousands of students who transformed their preparation and achieved their dream ranks using our analytics-driven platform.
          </p>
        </div>

        {/* Main Feature Card */}
        <div className="max-w-6xl mx-auto">
          <div className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
            isDark ? 'bg-zinc-900 border-zinc-800 shadow-black/40' : 'bg-white border-zinc-200 shadow-zinc-200/50'
          }`}>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
              
              {/* LEFT: Profile Column (4/12) */}
              <div className={`lg:col-span-5 relative p-8 lg:p-10 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r ${
                isDark ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50/80 border-zinc-100'
              }`}>
                {/* Decorative Grid Pattern */}
                <div className={`absolute inset-0 opacity-[0.03] ${isDark ? 'bg-[radial-gradient(#fff_1px,transparent_1px)]' : 'bg-[radial-gradient(#000_1px,transparent_1px)]'} [background-size:16px_16px]`} />

                {/* Profile Image with Animated Ring */}
                <div className={`relative mb-8 transition-opacity duration-300 ${animating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 blur-md opacity-40 animate-pulse" />
                  <div className={`relative w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-orange-500`}>
                     <img
                      src={currentData.photo}
                      alt={currentData.name}
                      className={`w-full h-full rounded-full object-cover border-4 ${isDark ? 'border-zinc-900' : 'border-white'}`}
                    />
                  </div>
                  
                  {/* Floating Rank Badge */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg text-xs font-bold uppercase tracking-wide border ${
                      isDark ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-white text-zinc-900 border-zinc-200'
                    }`}>
                      <FaMedal className="text-amber-400" />
                      {currentData.rank}
                    </div>
                  </div>
                </div>

                {/* Name & Info */}
                <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {currentData.name}
                  </h3>
                  <p className={`text-sm font-medium mb-6 flex items-center justify-center gap-2 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                    {currentData.location}
                  </p>

                  {/* Key Achievement */}
                  <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${
                    isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                      <FaUniversity size={16} />
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Selected In
                      </p>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {currentData.achievement}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Content Column (7/12) */}
              <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center relative">
                
                {/* Quote Icon Watermark */}
                <FaQuoteLeft className={`absolute top-10 left-10 text-8xl opacity-5 pointer-events-none ${isDark ? 'text-white' : 'text-black'}`} />
                
                {/* Navigation (Top Right) */}
                <div className="absolute top-8 right-8 flex gap-2">
                  <button onClick={handlePrev} className={`p-2 rounded-full border transition-colors ${isDark ? 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                    <FiArrowLeft size={18} />
                  </button>
                  <button onClick={handleNext} className={`p-2 rounded-full border transition-colors ${isDark ? 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                    <FiArrowRight size={18} />
                  </button>
                </div>

                <div className={`relative z-10 flex flex-col h-full justify-center transition-all duration-500 ${animating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
                  
                  {/* Testimonial Text */}
                  <blockquote className={`text-xl md:text-2xl leading-relaxed font-serif mb-8 ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                    "{currentData.testimonial}"
                  </blockquote>

                  {/* Verification Badge */}
                  <div className="flex items-center gap-2 mb-10">
                    <FiCheckCircle className="text-emerald-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Verified Student • {currentData.exam} Aspirant</span>
                  </div>

                  {/* Stats Row */}
                  <div className={`grid grid-cols-3 gap-4 lg:gap-8 pt-8 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    <div>
                      <div className={`flex items-center gap-2 mb-1 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <FiAward className="text-emerald-500" /> Score
                      </div>
                      <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {currentData.score}
                      </div>
                    </div>
                    <div className={`border-l pl-4 lg:pl-8 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                      <div className={`flex items-center gap-2 mb-1 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <FiTrendingUp className="text-blue-500" /> Tests
                      </div>
                      <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {currentData.testsCompleted}
                      </div>
                    </div>
                    <div className={`border-l pl-4 lg:pl-8 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                      <div className={`flex items-center gap-2 mb-1 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <FiClock className="text-purple-500" /> Hours
                      </div>
                      <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {currentData.studyHours}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {displayStories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerAnimation(() => setCurrentStory(idx));
                  setIsAutoPlaying(false);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStory 
                    ? 'w-8 bg-emerald-500' 
                    : `w-2 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300 hover:bg-zinc-400'}`
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;