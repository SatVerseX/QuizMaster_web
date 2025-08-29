import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMail as Mail, FiMapPin as MapPin, FiClock as Clock, FiMessageCircle, FiArrowRight, FiPhone, FiGlobe } from 'react-icons/fi';

const ContactCard = ({ title, subtitle, icon, color, children, href, onClick }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark 
      ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
      : "border-blue-200 bg-blue-50/80 hover:bg-blue-100/80",
    purple: isDark 
      ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10"
      : "border-purple-200 bg-purple-50/80 hover:bg-purple-100/80",
    green: isDark 
      ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
      : "border-green-200 bg-green-50/80 hover:bg-green-100/80",
    orange: isDark 
      ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
      : "border-orange-200 bg-orange-50/80 hover:bg-orange-100/80"
  };

  const iconColorClasses = {
    blue: isDark 
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-blue-100 text-blue-600 border-blue-200",
    purple: isDark 
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-purple-100 text-purple-600 border-purple-200",
    green: isDark 
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-green-100 text-green-600 border-green-200",
    orange: isDark 
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-orange-100 text-orange-600 border-orange-200"
  };

  const Component = href ? 'a' : onClick ? 'button' : 'div';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`group border rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer active:scale-[0.98] ${colorClasses[color]}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-xl border ${iconColorClasses[color]} flex-shrink-0 group-hover:scale-110 transition-transform duration-300 self-center sm:self-start`}>
          {icon}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className={`font-bold text-lg sm:text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
          <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{subtitle}</p>
          {children}
        </div>
      </div>
    </Component>
  );
};

const ContactUs = () => {
  const { isDark } = useTheme();

  return (
    <LegalLayout>
      <div className={`min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
            <div className="relative">
              <div className={`absolute inset-0 blur-3xl rounded-full ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20' 
                  : 'bg-gradient-to-r from-blue-400/10 to-purple-400/10'
              }`}></div>
              <div className="relative flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl order-2 sm:order-1">
                  <FiMessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent order-1 sm:order-2">
                  Contact Us
                </h1>
              </div>
            </div>
            <p className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed px-4 ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              We're here to help! Reach out using any of the options below and we'll get back to you within 24–48 hours.
            </p>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mt-4 sm:mt-6 rounded-full shadow-lg"></div>
          </header>

          <div className={`border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 backdrop-blur-xl shadow-2xl transition-all duration-500 ${
            isDark 
              ? 'bg-gray-900/60 border-gray-700/50' 
              : 'bg-white/80 border-slate-200/60'
          }`}>
            {/* Primary Contact Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <ContactCard 
                title="Technical Support"
                subtitle="Get help with technical issues, bugs, and platform questions"
                icon={<Mail className="w-5 h-5 sm:w-6 sm:h-6" />}
                color="blue"
                href="mailto:support@quizmaster.com"
              >
                <div className="space-y-3">
                  <div className={`flex items-center justify-center sm:justify-start gap-2 font-semibold text-sm sm:text-base ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    <Mail className="w-4 h-4" />
                    <span className="break-all">support@quizmaster.com</span>
                  </div>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    For login issues, payment problems, test series access, and technical support
                  </p>
                  <div className={`flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    <Clock className="w-4 h-4" />
                    Response within 24 hours
                  </div>
                </div>
              </ContactCard>

              <ContactCard 
                title="General Inquiries"
                subtitle="Business partnerships, feature requests, and general questions"
                icon={<FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                color="purple"
                href="mailto:hello@quizmaster.com"
              >
                <div className="space-y-3">
                  <div className={`flex items-center justify-center sm:justify-start gap-2 font-semibold text-sm sm:text-base ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    <Mail className="w-4 h-4" />
                    <span className="break-all">hello@quizmaster.com</span>
                  </div>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    For partnerships, content creation, feature suggestions, and business inquiries
                  </p>
                  <div className={`flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    <Clock className="w-4 h-4" />
                    Response within 48 hours
                  </div>
                </div>
              </ContactCard>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <ContactCard 
                title="Our Location"
                subtitle="Based in India, serving students worldwide"
                icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6" />}
                color="green"
              >
                <div className="space-y-3">
                  <div className={`border rounded-xl p-3 sm:p-4 ${
                    isDark 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`font-semibold mb-2 text-center sm:text-left ${isDark ? 'text-white' : 'text-slate-800'}`}>QuizMaster Headquarters</div>
                    <div className={`text-xs sm:text-sm space-y-1 text-center sm:text-left ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      <div>South West Delhi</div>
                      <div>New Delhi, India</div>
                      <div className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Serving students globally</div>
                    </div>
                  </div>
                </div>
              </ContactCard>

              <ContactCard 
                title="Response Time"
                subtitle="We value your time and respond quickly"
                icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                color="orange"
              >
                <div className="space-y-3">
                  <div className={`border rounded-xl p-3 sm:p-4 ${
                    isDark 
                      ? 'bg-orange-500/10 border-orange-500/20' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className={`font-semibold mb-2 text-center sm:text-left ${isDark ? 'text-white' : 'text-slate-800'}`}>Quick Response Guarantee</div>
                    <div className={`text-xs sm:text-sm space-y-1 text-center sm:text-left ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                        <span>24–48 hours</span>
                      </div>
                      <div>Monday to Friday</div>
                      <div className={`font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Emergency support available</div>
                    </div>
                  </div>
                </div>
              </ContactCard>
            </div>

            {/* Additional Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className={`border rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <div className={`p-3 rounded-xl inline-block mb-3 sm:mb-4 ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <FiGlobe className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h4 className={`font-bold mb-2 text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Website</h4>
                <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Visit our platform</p>
                <a 
                  href="/" 
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm sm:text-base"
                >
                  Go to QuizMaster
                  <FiArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className={`border rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 ${
                isDark 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className={`p-3 rounded-xl inline-block mb-3 sm:mb-4 ${
                  isDark ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <FiMessageCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h4 className={`font-bold mb-2 text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Live Chat</h4>
                <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Coming soon</p>
                <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-green-400' : 'text-green-600'}`}>Real-time support</span>
              </div>

              <div className={`border rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 sm:col-span-2 lg:col-span-1 ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
              }`}>
                <div className={`p-3 rounded-xl inline-block mb-3 sm:mb-4 ${
                  isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <FiPhone className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h4 className={`font-bold mb-2 text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Phone Support</h4>
                <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Coming soon</p>
                <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Direct assistance</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className={`text-center pt-6 sm:pt-8 border-t ${
              isDark ? 'border-gray-700/50' : 'border-slate-200'
            }`}>
              <div className={`border rounded-2xl p-6 sm:p-8 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <h3 className={`font-bold text-xl sm:text-2xl mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Ready to Get Started?</h3>
                <p className={`text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto px-4 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Have a question? Don't hesitate to reach out! Our team is here to help you succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a 
                    href="mailto:support@quizmaster.com" 
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    Email Support
                    <FiArrowRight className="w-4 h-4" />
                  </a>
                  <a 
                    href="mailto:hello@quizmaster.com" 
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
                  >
                    <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    General Inquiry
                    <FiArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactUs;
