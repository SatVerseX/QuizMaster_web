import React, { useState, useEffect } from 'react';
import { FiStar, FiArrowLeft, FiArrowRight, FiAward, FiTrendingUp, FiClock } from 'react-icons/fi';
import { FaQuoteLeft, FaTrophy, FaMedal } from 'react-icons/fa';

// High-quality mock data to ensure the component renders beautifully immediately
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

  // Use props if available, otherwise fallback to default data
  const displayStories = stories.length > 0 ? stories : DEFAULT_STORIES;
  const currentData = displayStories[currentStory];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % displayStories.length);
    }, 6000); // Slightly slower for better reading time
    return () => clearInterval(interval);
  }, [isAutoPlaying, displayStories.length]);

  const handleNext = () => {
    setCurrentStory((prev) => (prev + 1) % displayStories.length);
    setIsAutoPlaying(false);
  };

  const handlePrev = () => {
    setCurrentStory((prev) => (prev - 1 + displayStories.length) % displayStories.length);
    setIsAutoPlaying(false);
  };

  if (displayStories.length === 0) return null;

  return (
    <section className={`py-20 relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            isDark ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
            <FaTrophy className="w-3.5 h-3.5" />
            <span>Hall of Fame</span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Success Stories that Inspire
          </h2>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Join thousands of students who achieved their dream ranks using our analytics-driven platform.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-6xl mx-auto">
          <div className={`relative rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'
          }`}>
            
            {/* Inner Content with Key for Animation */}
            <div key={currentStory} className="flex flex-col lg:flex-row animate-fadeIn">
              
              {/* Left Side: Visual Identity */}
              <div className={`relative lg:w-2/5 p-8 lg:p-12 flex flex-col items-center justify-center text-center ${
                isDark ? 'bg-slate-800/50' : 'bg-slate-50'
              }`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-current to-transparent" />
                
                {/* Photo Ring */}
                <div className="relative mb-6">
                  <div className={`w-40 h-40 rounded-full p-1.5 ${
                    isDark 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  }`}>
                    <img
                      src={currentData.photo}
                      alt={currentData.name}
                      className={`w-full h-full rounded-full object-cover border-4 ${isDark ? 'border-slate-800' : 'border-white'}`}
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5">
                       <FaMedal className="text-yellow-400" /> {currentData.rank}
                    </span>
                  </div>
                </div>

                <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentData.name}
                </h3>
                <p className={`text-sm font-medium mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentData.location}
                </p>

                {/* Achievement Box */}
                <div className={`w-full p-4 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-700' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Cracked {currentData.exam}
                  </p>
                  <p className={`text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent`}>
                    {currentData.achievement}
                  </p>
                </div>
              </div>

              {/* Right Side: Narrative & Stats */}
              <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center relative">
                <FaQuoteLeft className={`absolute top-8 left-8 text-6xl opacity-10 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                
                <blockquote className={`relative z-10 text-xl md:text-2xl leading-relaxed italic mb-8 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  "{currentData.testimonial}"
                </blockquote>

                <div className={`grid grid-cols-3 gap-4 p-6 rounded-2xl mb-8 ${
                  isDark ? 'bg-slate-900/50' : 'bg-slate-50'
                }`}>
                  <div className="text-center">
                    <div className={`flex items-center justify-center mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      <FiAward className="w-5 h-5" />
                    </div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentData.score}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Final Score</div>
                  </div>
                  <div className="text-center border-x border-slate-200 dark:border-slate-700">
                    <div className={`flex items-center justify-center mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      <FiTrendingUp className="w-5 h-5" />
                    </div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentData.testsCompleted}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Tests Taken</div>
                  </div>
                  <div className="text-center">
                    <div className={`flex items-center justify-center mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      <FiClock className="w-5 h-5" />
                    </div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentData.studyHours}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Hours Studied</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                   {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`w-5 h-5 ${i < currentData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <button 
                      onClick={handlePrev}
                      className={`p-3 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                        isDark 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleNext}
                      className={`p-3 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                        isDark 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <FiArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {displayStories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStory(idx);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStory 
                    ? 'w-8 bg-yellow-500' 
                    : `w-2 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`
                }`}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <button className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-900/20'
                : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl hover:shadow-2xl'
            }`}>
              Start Your Journey Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;