import React, { useState, useEffect } from 'react';
import { FiStar, FiArrowLeft, FiArrowRight, FiAward } from 'react-icons/fi';
import { FaQuoteLeft, FaTrophy, FaMedal } from 'react-icons/fa';

const SuccessStoriesSection = ({ isDark }) => {
  const [currentStory, setCurrentStory] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Success stories will be loaded from Firebase
  const [successStories, setSuccessStories] = useState([]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, successStories.length]);

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % successStories.length);
    setIsAutoPlaying(false);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + successStories.length) % successStories.length);
    setIsAutoPlaying(false);
  };

  const goToStory = (index) => {
    setCurrentStory(index);
    setIsAutoPlaying(false);
  };

  const currentStoryData = successStories[currentStory];

  // Don't render if no success stories
  if (successStories.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${isDark ? 'bg-gray-900/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaTrophy className="text-yellow-500 text-3xl" />
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Success Stories
            </h2>
            <FaMedal className="text-yellow-500 text-3xl" />
          </div>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Real students, real results. See how QuizMaster helped them achieve their dreams.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Main Story Card */}
            <div className={`relative rounded-3xl overflow-hidden backdrop-blur-xl border-2 ${
              isDark 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30' 
                : 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200'
            }`}>
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 z-20">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-white/10' : 'bg-white/50'
                }`}>
                  <FaQuoteLeft className="text-yellow-500 text-xl" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left Side - Photo and Basic Info */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                      isDark ? 'border-yellow-400/50' : 'border-yellow-300/50'
                    }`}>
                      <img
                        src={currentStoryData.photo}
                        alt={currentStoryData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className={`hidden w-full h-full items-center justify-center ${
                        isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-gray-200 to-gray-300'
                      }`}>
                        <div className="text-center">
                          <FaTrophy className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {currentStoryData.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Achievement Badge */}
                    <div className="absolute -bottom-2 -right-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl">
                        {currentStoryData.achievement}
                      </div>
                    </div>
                  </div>

                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentStoryData.name}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentStoryData.location}
                  </p>

                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentStoryData.score}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Final Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentStoryData.testsCompleted}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Tests Done
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentStoryData.studyHours}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Study Hours
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Testimonial and Details */}
                <div className="flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        isDark 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {currentStoryData.exam}
                      </span>
                      <span className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {currentStoryData.rank}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({currentStoryData.year})
                      </span>
                    </div>

                    <h4 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentStoryData.achievement}
                    </h4>
                  </div>

                  {/* Testimonial */}
                  <div className={`mb-6 p-6 rounded-2xl ${
                    isDark ? 'bg-white/5' : 'bg-white/50'
                  }`}>
                    <p className={`text-lg italic leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      "{currentStoryData.testimonial}"
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-5 h-5 ${
                            star <= currentStoryData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentStoryData.rating}.0
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Rating
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isDark
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-2xl shadow-yellow-500/25'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-2xl shadow-yellow-500/25'
                    }`}
                  >
                    Start Your Success Story
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevStory}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full backdrop-blur-xl border-2 transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-white/80 border-white/40 text-gray-700 hover:bg-white'
              }`}
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextStory}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full backdrop-blur-xl border-2 transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-white/80 border-white/40 text-gray-700 hover:bg-white'
              }`}
            >
              <FiArrowRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStory(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStory
                      ? 'bg-yellow-500 scale-125'
                      : isDark
                      ? 'bg-white/30 hover:bg-white/50'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
