import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMail, FiMapPin, FiClock, FiMessageCircle, FiArrowRight, FiPhone, FiGlobe } from 'react-icons/fi';

const ContactUs = () => {
  const { isDark } = useTheme();

  // --- Styles ---
  const styles = {
    page: isDark ? 'bg-gray-900' : 'bg-slate-50',
    text: {
      heading: isDark ? 'text-white' : 'text-slate-900',
      body: isDark ? 'text-gray-400' : 'text-slate-600',
      highlight: 'text-indigo-500'
    },
    card: `
      group relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
      ${isDark ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-slate-100 hover:border-slate-200 shadow-lg'}
    `,
    iconCircle: (color) => `
      w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors
      ${isDark ? `bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20` : `bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100`}
    `
  };

  return (
    <LegalLayout>
      <div className={`min-h-screen py-16 px-4 ${styles.page}`}>
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className={`text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent`}>
              Get in Touch
            </h1>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${styles.text.body}`}>
              Have questions about the quiz platform? We're here to help. 
              Our team typically responds within <span className="font-bold text-indigo-500">24 hours</span>.
            </p>
          </div>

          {/* Main Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            
            {/* Technical Support */}
            <a href="mailto:support@quizmaster.com" className={styles.card}>
              <div className={styles.iconCircle('indigo')}>
                <FiMail className="w-7 h-7" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${styles.text.heading}`}>Technical Support</h3>
              <p className={`mb-6 ${styles.text.body}`}>Login issues, payment problems, or bugs.</p>
              <div className="flex items-center gap-2 text-indigo-500 font-bold">
                support@quizmaster.com <FiArrowRight />
              </div>
            </a>

            {/* Partnerships */}
            <a href="mailto:hello@quizmaster.com" className={styles.card}>
              <div className={styles.iconCircle('purple')}>
                <FiMessageCircle className="w-7 h-7" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${styles.text.heading}`}>General Inquiries</h3>
              <p className={`mb-6 ${styles.text.body}`}>Partnerships, features, and business.</p>
              <div className="flex items-center gap-2 text-purple-500 font-bold">
                hello@quizmaster.com <FiArrowRight />
              </div>
            </a>
          </div>

          {/* Secondary Info Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Location */}
            <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-slate-200'}`}>
              <FiMapPin className={`w-6 h-6 mx-auto mb-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h4 className={`font-bold mb-1 ${styles.text.heading}`}>HQ Location</h4>
              <p className={`text-sm ${styles.text.body}`}>South West Delhi, India</p>
            </div>

            {/* Hours */}
            <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-slate-200'}`}>
              <FiClock className={`w-6 h-6 mx-auto mb-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <h4 className={`font-bold mb-1 ${styles.text.heading}`}>Working Hours</h4>
              <p className={`text-sm ${styles.text.body}`}>Mon-Fri, 9AM - 6PM IST</p>
            </div>

            {/* Community */}
            <div className={`p-6 rounded-2xl border text-center sm:col-span-2 lg:col-span-1 ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-slate-200'}`}>
              <FiGlobe className={`w-6 h-6 mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h4 className={`font-bold mb-1 ${styles.text.heading}`}>Global Access</h4>
              <p className={`text-sm ${styles.text.body}`}>24/7 Online Platform</p>
            </div>

          </div>

        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactUs;