import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiArrowRight,
  FiPlay,
  FiBook,
  FiCpu,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
  FiStar,
  FiPlus
} from 'react-icons/fi';
import { 
  FaBrain, 
  FaGraduationCap, 
  FaRocket, 
  FaPuzzlePiece, 
  FaRegLightbulb,
  FaTrophy
} from 'react-icons/fa';
import ComplaintForm from '../feedback/ComplaintForm';
import RecommendationForm from '../feedback/RecommendationForm';

const WelcomePage = ({ onGetStarted, onCreateSeries, onViewExistingSeries }) => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  // Animation delay for elements
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      {/* Hero Section */}
      <section className={`relative section-padding transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 sm:w-96 h-48 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container-responsive relative z-10">
          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/30 backdrop-blur-md mb-4 sm:mb-6 text-blue-300 shadow-lg">
                <span className="animate-pulse">✨</span>
                <span className="text-xs sm:text-sm font-medium">Next-gen quiz platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200">
                  Master Knowledge with 
                </span>
                <div className="mt-2 flex items-center justify-center lg:justify-start">
                  <div className="p-2 mr-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <FaPuzzlePiece className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">
                    QuizMaster
                  </span>
                </div>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Create, discover, and conquer intelligent quizzes and test series. 
                Elevate your learning with AI-powered assessments and real-time analytics.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onGetStarted}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 text-base sm:text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <span>Get Started</span>
                    <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                {isAdmin && (
                  <button 
                    onClick={onCreateSeries}
                    className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 border border-emerald-500/40 shadow-xl text-base sm:text-lg"
                  >
                    <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                      <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Create Series</span>
                    </div>
                  </button>
                )}
              </div>
              {/* quick legal links */}
              <div className="mt-4 flex gap-4 justify-center lg:justify-start text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-blue-400">Privacy</a>
                <a href="/terms" className="text-gray-400 hover:text-blue-400">Terms</a>
                <a href="/refunds" className="text-gray-400 hover:text-blue-400">Refunds</a>
                <a href="/contact" className="text-gray-400 hover:text-blue-400">Contact</a>
              </div>
            </div>
            
            {/* Hero Image/Visual */}
            <div className="flex-1 relative">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 hover:shadow-blue-500/10">
                <div className="relative">
                  {/* Interactive Quiz Visualization */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl border border-blue-500/30">
                        <FaBrain className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Physics Test Series</h3>
                    </div>
                    
                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-5 mb-3 sm:mb-4">
                      <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">What is the SI unit of force?</p>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="bg-gray-700/70 border border-gray-600/50 hover:border-blue-500/50 rounded-lg p-2 sm:p-3 cursor-pointer transition-colors">
                          <span className="text-xs sm:text-sm text-gray-200">A. Joule</span>
                        </div>
                        <div className="bg-blue-600/30 border border-blue-500/50 rounded-lg p-2 sm:p-3 cursor-pointer transition-colors">
                          <span className="text-xs sm:text-sm text-blue-200 font-medium">B. Newton</span>
                        </div>
                        <div className="bg-gray-700/70 border border-gray-600/50 hover:border-blue-500/50 rounded-lg p-2 sm:p-3 cursor-pointer transition-colors">
                          <span className="text-xs sm:text-sm text-gray-200">C. Watt</span>
                        </div>
                        <div className="bg-gray-700/70 border border-gray-600/50 hover:border-blue-500/50 rounded-lg p-2 sm:p-3 cursor-pointer transition-colors">
                          <span className="text-xs sm:text-sm text-gray-200">D. Pascal</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-blue-300 font-bold">1</span>
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-blue-300 font-medium">2</span>
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-gray-400">3</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">...</div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-gray-400">20</span>
                        </div>
                      </div>
                      
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold">
                        Next
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-500/20">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FiBook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        <div>
                          <div className="text-sm sm:text-lg font-bold text-blue-300">20</div>
                          <div className="text-xs text-blue-200">Questions</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-purple-500/20">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FiCpu className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        <div>
                          <div className="text-sm sm:text-lg font-bold text-purple-300">30</div>
                          <div className="text-xs text-purple-200">Minutes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-emerald-500/20">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        <div>
                          <div className="text-sm sm:text-lg font-bold text-emerald-300">100</div>
                          <div className="text-xs text-emerald-200">Points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400">Progress</span>
                      <span className="text-blue-400">5%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[5%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 sm:-top-8 -right-4 sm:-right-8 p-2 sm:p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl sm:rounded-2xl shadow-lg transform rotate-6 backdrop-blur-sm">
                <FaGraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
              </div>
              
              <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 p-2 sm:p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl shadow-lg transform -rotate-6 backdrop-blur-sm">
                <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30">
                  <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">10,000+</div>
                <div className="text-xs sm:text-sm text-gray-400">Active Users</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30">
                  <FiBook className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">5,000+</div>
                <div className="text-xs sm:text-sm text-gray-400">Test Series</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
                  <FiBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-xs sm:text-sm text-gray-400">Educators</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
                  <FiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">1M+</div>
                <div className="text-xs sm:text-sm text-gray-400">Tests Taken</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
        <div className="container-responsive relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200">
              Powerful Features for Learning
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
              Our comprehensive platform is designed to enhance your learning experience with cutting-edge tools and features.
            </p>
          </div>
          
          <div className="grid-responsive-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Feature Card 1 */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30">
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl sm:rounded-2xl inline-block border border-blue-500/30">
                <FaBrain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">AI-Powered Tests</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                Generate intelligent quizzes and tests with our advanced AI engine. Personalized questions based on difficulty and topic.
              </p>
              
              <div className="flex items-center text-blue-400 text-sm font-medium">
                <span>Learn more</span>
                <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-purple-500/30">
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl inline-block border border-purple-500/30">
                <FaRocket className="w-8 h-8 text-purple-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Test Series</h3>
              <p className="text-gray-400 mb-6">
                Comprehensive test series for competitive exams. Track progress, analyze performance, and identify improvement areas.
              </p>
              
              <div className="flex items-center text-purple-400 text-sm font-medium">
                <span>Learn more</span>
                <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-green-500/30">
              <div className="mb-6 p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl inline-block border border-green-500/30">
                <FaTrophy className="w-8 h-8 text-green-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Leaderboards</h3>
              <p className="text-gray-400 mb-6">
                Compete with peers on global and test-specific leaderboards. Earn achievements and showcase your knowledge ranking.
              </p>
              
              <div className="flex items-center text-green-400 text-sm font-medium">
                <span>Learn more</span>
                <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 4 */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-xl hover:shadow-yellow-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-yellow-500/30">
              <div className="mb-6 p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl inline-block border border-yellow-500/30">
                <FiTrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Analytics</h3>
              <p className="text-gray-400 mb-6">
                Detailed performance analytics with visual insights. Track improvement over time and identify knowledge gaps.
              </p>
              
              <div className="flex items-center text-yellow-400 text-sm font-medium">
                <span>Learn more</span>
                <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 5 */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-xl hover:shadow-red-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-red-500/30">
              <div className="mb-6 p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl inline-block border border-red-500/30">
                <FaRegLightbulb className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Creator Tools</h3>
              <p className="text-gray-400 mb-6">
                Powerful tools for educators and content creators. Build professional quizzes and monetize your expertise.
              </p>
              
              <div className="flex items-center text-red-400 text-sm font-medium">
                <span>Learn more</span>
                <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Feature Card 6 */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/30">
              <div className="mb-6 p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl inline-block border border-orange-500/30">
                <FaGraduationCap className="w-8 h-8 text-orange-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Subscriptions</h3>
              <p className="text-gray-400 mb-6">
                Access premium test series with flexible subscription plans. Unlock exclusive content from top educators.
              </p>
              
              <div className="flex items-center text-orange-400 text-sm font-medium">
                <span>Learn more</span>
                <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action removed */}

      {/* Admin Dashboard Button */}
      {isAdmin && (
        <div className="fixed z-50 w-full flex justify-center sm:block sm:w-auto top-4 left-1/2 -translate-x-1/2 sm:top-6 sm:right-8 sm:left-auto sm:translate-x-0">
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 sm:py-2 rounded-full font-bold shadow-lg hover:scale-105 hover:from-cyan-600 hover:to-teal-500 transition-all border-2 border-white/70 text-base sm:text-lg"
            onClick={() => navigate('/admin-dashboard')}
            style={{ minWidth: 200 }}
          >
            Go to Admin Dashboard
          </button>
        </div>
      )}

      {/* Feedback Section */}
      <div className="mt-16 flex flex-col items-center">
        <div className="text-xl font-bold mb-6 text-white text-center">We value your feedback!</div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full max-w-md">
          <button
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-pink-500 text-white px-6 py-4 rounded-xl font-semibold shadow-xl text-base hover:from-pink-600 hover:to-red-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-400/50 border border-red-400/30"
            onClick={() => setShowComplaint(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 1018.364 5.636z" /></svg>
            Submit Complaint
          </button>
          <button
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-500 text-white px-6 py-4 rounded-xl font-semibold shadow-xl text-base hover:from-blue-600 hover:to-cyan-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 border border-cyan-400/30"
            onClick={() => setShowRecommendation(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Submit Recommendation
          </button>
        </div>
        <div className="text-sm text-gray-300 text-center max-w-md">Help us improve by sharing your experience or suggestions.</div>
      </div>

      {/* Complaint Modal */}
      {showComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-4 relative w-full max-w-lg mx-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setShowComplaint(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <ComplaintForm />
          </div>
        </div>
      )}
      {/* Recommendation Modal */}
      {showRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-4 relative w-full max-w-lg mx-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setShowRecommendation(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <RecommendationForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage; 