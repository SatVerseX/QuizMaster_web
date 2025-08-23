import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-white'
    }`}>
      {/* Hero Section */}
      <section className={`relative section-padding transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Professional Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-400/8'
          }`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
            isDark ? 'bg-purple-500/10' : 'bg-indigo-400/6'
          }`}></div>
          <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
            isDark ? 'bg-orange-500/10' : 'bg-blue-300/5'
          }`}></div>
        </div>
        
        <div className="container-responsive relative z-10">
          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md mb-6 shadow-sm border transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/30 text-blue-300' 
                  : 'bg-white/90 border-slate-200/60 text-slate-700 shadow-slate-200/40'
              }`}>
                <span className="text-blue-500">✨</span>
                <span className="text-sm font-medium">Enterprise-Grade Learning Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight">
                <span className={`transition-all duration-300 ${
                  isDark 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600'
                }`}>
                  Transform Learning with 
                </span>
                <div className="mt-2 flex items-center justify-center lg:justify-start">
                  <div className={`p-3 mr-4 rounded-xl shadow-lg transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                      : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                  }`}>
                    <FaPuzzlePiece className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <span className={`transition-all duration-300 ${
                    isDark 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'
                  }`}>
                    QuizMaster
                  </span>
                </div>
              </h1>
              
              <p className={`text-lg lg:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium transition-all duration-300 ${
                isDark ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Create intelligent assessments, track progress with advanced analytics, 
                and deliver exceptional learning experiences with our AI-powered platform.
              </p>
              
              {/* Professional CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onGetStarted}
                  className={`group relative w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white hover:shadow-blue-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-blue-500/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <span>Get Started</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                {isAdmin && (
                  <button 
                    onClick={onCreateSeries}
                    className={`group relative w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg border-2 ${
                      isDark 
                        ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white border-emerald-500/40'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 hover:shadow-slate-300/30'
                    }`}
                  >
                    <div className="relative flex items-center justify-center gap-3">
                      <FiPlus className="w-5 h-5" />
                      <span>Create Series</span>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Professional Legal Links */}
              <div className="mt-6 flex gap-6 justify-center lg:justify-start text-sm">
                {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Contact Support'].map((link, index) => (
                  <a 
                    key={index}
                    href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                    className={`transition-colors duration-200 hover:underline ${
                      isDark ? 'text-gray-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Professional Hero Visual */}
            <div className="flex-1 relative">
              <div className={`relative p-6 sm:p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 hover:shadow-blue-500/10' 
                  : 'bg-white border-slate-200/60 hover:shadow-slate-300/20'
              }`}>
                <div className="relative">
                  {/* Interactive Quiz Visualization */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-300 ${
                        isDark 
                          ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30' 
                          : 'bg-white border-blue-200/60 shadow-sm'
                      }`}>
                        <FaBrain className={`w-4 h-4 sm:w-6 sm:h-6 ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <h3 className={`text-xl lg:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>Advanced Physics Assessment</h3>
                    </div>
                    
                    <div className={`rounded-xl p-4 sm:p-6 border transition-all duration-300 ${
                      isDark 
                        ? 'bg-gray-800/60 border-gray-700/50' 
                        : 'bg-white border-slate-200/60 shadow-sm'
                    }`}>
                      <p className={`text-base mb-4 font-medium transition-all duration-300 ${
                        isDark ? 'text-gray-300' : 'text-slate-700'
                      }`}>What is the fundamental unit of force in the International System of Units?</p>
                      
                      {/* Options */}
                      <div className="space-y-3">
                        {[
                          { option: 'A. Newton (N)', correct: true },
                          { option: 'B. Joule (J)', correct: false },
                          { option: 'C. Watt (W)', correct: false },
                          { option: 'D. Pascal (Pa)', correct: false }
                        ].map((item, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              item.correct 
                                ? (isDark 
                                    ? 'bg-blue-600/30 border-blue-500/50 text-blue-200' 
                                    : 'bg-blue-50 border-blue-300/60 text-blue-700')
                                : (isDark 
                                    ? 'bg-gray-700/70 border-gray-600/50 hover:border-blue-500/50 text-gray-200' 
                                    : 'bg-white border-slate-200/60 hover:border-blue-300/60 text-slate-700')
                            } hover:scale-[1.02]`}>
                            <span className="text-sm font-medium">{item.option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          Question 1 of 25
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          4%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${
                        isDark ? 'bg-gray-700' : 'bg-slate-200'
                      }`}>
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-[4%]"></div>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num, index) => (
                          <div key={index} className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                            index === 0 
                              ? (isDark 
                                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' 
                                  : 'bg-blue-100 border-blue-400/60 text-blue-700')
                              : index === 1
                                ? (isDark 
                                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' 
                                    : 'bg-blue-50 border-blue-300/50 text-blue-600')
                                : (isDark 
                                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                                    : 'bg-white border-slate-300/60 text-slate-500')
                          }`}>
                            {index < 2 ? num : (index === 4 ? '25' : '...')}
                          </div>
                        ))}
                      </div>
                      
                      <button className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        isDark 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      }`}>
                        Continue
                      </button>
                    </div>
                  </div>
                  
                  {/* Professional Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: FiBook, value: '25', label: 'Questions', color: 'blue' },
                      { icon: FiCpu, value: '45', label: 'Minutes', color: 'indigo' },
                      { icon: FiAward, value: '100', label: 'Points', color: 'emerald' }
                    ].map((stat, index) => (
                      <div key={index} className={`rounded-xl p-3 border transition-all duration-300 hover:scale-105 ${
                        isDark 
                          ? `bg-${stat.color}-500/10 border-${stat.color}-500/20` 
                          : `bg-white border-${stat.color}-200/60 shadow-sm`
                      }`}>
                        <div className="flex items-center gap-2">
                          <stat.icon className={`w-5 h-5 ${
                            isDark ? `text-${stat.color}-400` : `text-${stat.color}-600`
                          }`} />
                          <div>
                            <div className={`text-lg font-bold ${
                              isDark ? `text-${stat.color}-300` : `text-${stat.color}-700`
                            }`}>{stat.value}</div>
                            <div className={`text-xs ${
                              isDark ? `text-${stat.color}-200` : `text-${stat.color}-600`
                            }`}>{stat.label}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Professional Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Assessment Progress
                      </span>
                      <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        4%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${
                      isDark ? 'bg-gray-700' : 'bg-slate-200'
                    }`}>
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-[4%]"></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className={`absolute -top-4 sm:-top-8 -right-4 sm:-right-8 p-2 sm:p-4 border rounded-xl sm:rounded-2xl shadow-lg transform rotate-6 backdrop-blur-sm transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30' 
                    : 'bg-white border-orange-200/60 shadow-orange-200/30'
                }`}>
                  <FaGraduationCap className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
                    isDark ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
                
                <div className={`absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 p-2 sm:p-4 border rounded-xl sm:rounded-2xl shadow-lg transform -rotate-6 backdrop-blur-sm transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30' 
                    : 'bg-white border-blue-200/60 shadow-blue-200/30'
                }`}>
                  <FaRocket className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Features Section */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Enterprise-Grade Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed transition-all duration-300 ${
              isDark ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Powerful tools designed for educational institutions, corporate training, 
              and professional development programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaBrain,
                title: 'AI-Powered Assessment Generation',
                description: 'Advanced machine learning algorithms create tailored assessments that adapt to learning objectives and skill levels.',
                color: 'blue'
              },
              {
                icon: FiTrendingUp,
                title: 'Advanced Analytics Dashboard',
                description: 'Comprehensive insights with detailed performance metrics, learning patterns, and predictive analytics.',
                color: 'purple'
              },
              {
                icon: FaTrophy,
                title: 'Enterprise Certification System',
                description: 'Issue verified certificates and badges with blockchain-based verification for professional credentials.',
                color: 'emerald'
              }
            ].map((feature, index) => (
              <div key={index} className={`group p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                isDark 
                  ? `bg-gray-800/50 border-gray-700/50 hover:border-${feature.color}-500/50 hover:shadow-${feature.color}-500/20` 
                  : `bg-white border-slate-200/60 hover:border-${feature.color}-300/60 hover:shadow-${feature.color}-300/20`
              }`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  isDark 
                    ? `bg-${feature.color}-500/20 text-${feature.color}-400 group-hover:bg-${feature.color}-500/30` 
                    : `bg-${feature.color}-50 text-${feature.color}-600 group-hover:bg-${feature.color}-100`
                }`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold mb-4 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Professional Trust Metrics */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className={`mt-16 pt-10 border-t ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: FiUsers, value: '50,000+', label: 'Active Learners', color: 'blue' },
                { icon: FiBook, value: '10,000+', label: 'Assessments', color: 'purple' },
                { icon: FiBriefcase, value: '1,500+', label: 'Educators', color: 'green' },
                { icon: FiCheckCircle, value: '2.5M+', label: 'Tests Completed', color: 'yellow' }
              ].map((metric, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isDark 
                      ? `bg-${metric.color}-500/10 border-${metric.color}-500/30`
                      : `bg-white border-${metric.color}-200/60 shadow-sm`
                  }`}>
                    <metric.icon className={`w-8 h-8 ${
                      isDark ? `text-${metric.color}-400` : `text-${metric.color}-600`
                    }`} />
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {metric.value}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Discover the incredible value we offer!
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed transition-all duration-300 ${
              isDark ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Unlock amazing benefits tailored just for you!
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className={`flex items-center p-1 rounded-xl border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-slate-200 shadow-lg'
            }`}>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Annual billing
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className={`group relative p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105 hover:shadow-xl flex flex-col ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50 hover:shadow-blue-500/20' 
                : 'bg-white border-slate-200/60 hover:border-blue-300/60 hover:shadow-blue-300/20'
            }`}>
              <div className="text-center flex-1">
                <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  Basic Plan
                </h3>
                
                <div className="mb-6">
                  <div className={`text-4xl font-bold transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    ₹{billingCycle === 'monthly' ? '299' : '2,999'}
                  </div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    {billingCycle === 'monthly' ? 'user/month' : 'user/year'}
                  </div>
                </div>

                <p className={`text-sm mb-8 leading-relaxed transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Check out the cool features of our Basic Plan, made just for you to hit your goals!
                </p>

                <ul className={`space-y-3 mb-8 text-left transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Essential support ticket management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Access to basic analytics and reporting tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Email and chat support capabilities</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Integration with core CRM systems</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>24/5 customer support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>User-friendly onboarding resources</span>
                  </li>
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 text-center ${
                  isDark 
                    ? 'bg-transparent text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-white'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                }`}>
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Premium Plan - Most Popular */}
            <div className={`group relative p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105 hover:shadow-xl flex flex-col ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50 hover:border-orange-500/50 hover:shadow-orange-500/20' 
                : 'bg-white border-slate-200/60 hover:border-orange-300/60 hover:shadow-orange-300/20'
            }`}>
              {/* Most Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                  🔥 Most popular
                </span>
              </div>

              <div className="text-center flex-1">
                <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  Premium Plan
                </h3>
                
                <div className="mb-6">
                  <div className={`text-4xl font-bold transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    ₹{billingCycle === 'monthly' ? '499' : '4,999'}
                  </div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    {billingCycle === 'monthly' ? 'user/month' : 'user/year'}
                  </div>
                </div>

                <p className={`text-sm mb-8 leading-relaxed transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Unlock the ultimate experience with our most popular premium plan!
                </p>

                <ul className={`space-y-3 mb-8 text-left transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Everything in Standard, plus:</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>AI-driven insights and recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Real-time customer sentiment analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Customizable dashboard and advanced reporting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}>
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Standard Plan */}
            <div className={`group relative p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105 hover:shadow-xl flex flex-col ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50 hover:shadow-blue-500/20' 
                : 'bg-white border-slate-200/60 hover:border-blue-300/60 hover:shadow-blue-300/20'
            }`}>
              <div className="text-center flex-1">
                <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  Standard Plan
                </h3>
                
                <div className="mb-6">
                  <div className={`text-4xl font-bold transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    ₹{billingCycle === 'monthly' ? '399' : '3,999'}
                  </div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    {billingCycle === 'monthly' ? 'user/month' : 'user/year'}
                  </div>
                </div>

                <p className={`text-sm mb-8 leading-relaxed transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Check out our Standard Plan! It's all about making your experience even better.
                </p>

                <ul className={`space-y-3 mb-8 text-left transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Everything in Basic, plus:</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Advanced analytics and reporting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Multi-channel support (email, chat, phone)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Customizable automation workflows</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Priority support response times</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 text-center ${
                  isDark 
                    ? 'bg-transparent text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-white'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                }`}>
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className={`text-sm transition-all duration-300 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <FiCheckCircle className="w-4 h-4 text-blue-500" />
                <span>No Setup Fees</span>
              </div>
              <div className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <FiCheckCircle className="w-4 h-4 text-blue-500" />
                <span>Instant Access</span>
              </div>
              <div className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <FiCheckCircle className="w-4 h-4 text-blue-500" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Dashboard Button */}
      {isAdmin && (
        <div className="fixed z-50 top-6 right-8">
          <button
            className={`px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-all border-2 text-lg ${
              isDark 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-white/70 hover:from-cyan-600 hover:to-teal-500'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-slate-300/30'
            }`}
            onClick={() => navigate('/admin-dashboard')}
          >
            Admin Dashboard
          </button>
        </div>
      )}

      {/* Professional Feedback Section */}
      <div className={`mt-16 p-8 rounded-2xl border ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700/50'
          : 'bg-white border-slate-200/60 shadow-sm'
      }`}>
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Help Us Improve
          </h3>
          <p className={`text-base ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
            Your feedback drives our continuous improvement and innovation.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <button
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 border ${
              isDark 
                ? 'bg-gradient-to-r from-red-600 to-pink-500 text-white border-red-400/30 focus:ring-red-400/50'
                : 'bg-white text-red-600 border-red-200/60 hover:bg-red-50 hover:border-red-300/60'
            }`}
            onClick={() => setShowComplaint(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 1018.364 5.636z" />
            </svg>
            Report Issue
          </button>
          
          <button
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 border ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white border-cyan-400/30 focus:ring-cyan-400/50'
                : 'bg-white text-blue-600 border-blue-200/60 hover:bg-blue-50 hover:border-blue-300/60'
            }`}
            onClick={() => setShowRecommendation(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Suggest Feature
          </button>
        </div>
      </div>

      {/* Modal Components */}
      {showComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl p-6 relative w-full max-w-lg mx-4 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'
          }`}>
            <button
              className={`absolute top-4 right-4 text-2xl transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setShowComplaint(false)}
              aria-label="Close"
            >
              ×
            </button>
            <ComplaintForm />
          </div>
        </div>
      )}
      
      {showRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl p-6 relative w-full max-w-lg mx-4 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'
          }`}>
            <button
              className={`absolute top-4 right-4 text-2xl transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setShowRecommendation(false)}
              aria-label="Close"
            >
              ×
            </button>
            <RecommendationForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
