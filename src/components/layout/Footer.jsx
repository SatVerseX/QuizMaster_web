import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaArrowUp 
} from 'react-icons/fa';
import { 
  FiHome, FiBookOpen, FiTarget, FiShield, FiFileText, 
  FiHelpCircle, FiChevronUp, FiMessageSquare, FiCpu
} from 'react-icons/fi';
import ComplaintForm from '../feedback/ComplaintForm';
import RecommendationForm from '../feedback/RecommendationForm';

const Footer = () => {
  const { isDark } = useTheme();
  const { isAdmin, currentUser } = useAuth();
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'complaint' | 'recommendation' | null

  // --- Styles Configuration ---
  const styles = {
    wrapper: isDark 
      ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black border-t border-gray-800' 
      : 'bg-gradient-to-b from-slate-50 via-white to-slate-100 border-t border-slate-200',
    
    text: {
      heading: isDark ? 'text-white' : 'text-slate-900',
      body: isDark ? 'text-gray-400' : 'text-slate-600',
      link: isDark ? 'text-gray-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600',
      accent: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500'
    },

    iconBtn: isDark 
      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
      : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-slate-100',

    glassModal: isDark 
      ? 'bg-gray-800/90 border-gray-700 backdrop-blur-xl' 
      : 'bg-white/90 border-slate-200 backdrop-blur-xl',

    mobileDetails: isDark 
      ? 'bg-gray-800/50 border-gray-700' 
      : 'bg-white border-slate-200',
      
    linkItem: 'flex items-center gap-2 text-sm transition-all duration-200 hover:translate-x-1 cursor-pointer'
  };

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- Data Definitions ---
  const socialLinks = [
    { icon: FaGithub, href: '#', label: 'GitHub' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaEnvelope, href: 'mailto:contact@quizmaster.com', label: 'Email' }
  ];

  const quickLinks = [
    { icon: FiHome, label: 'Test Series', to: '/test-series' },
    ...(isAdmin ? [
      { icon: FiBookOpen, label: 'Create Series', to: '/create-series' },
      { icon: FiCpu, label: 'AI Generator', to: '/ai-generator' }
    ] : []),
    ...(currentUser ? [
      { icon: FiTarget, label: 'My Progress', to: '/test-history' }
    ] : [])
  ];

  const legalLinks = [
    { icon: FiShield, label: 'Privacy Policy', to: '/privacy' },
    { icon: FiFileText, label: 'Terms & Conditions', to: '/terms' },
    { icon: FiHelpCircle, label: 'Refund Policy', to: '/refunds' },
    { icon: FaEnvelope, label: 'Contact Us', to: '/contact' }
  ];

  return (
    <>
      <footer className={`relative mt-16 pt-16 pb-8 transition-colors duration-300 ${styles.wrapper}`}>
      

        <div className="container-responsive relative z-10">
          
          {/* --- Main Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
            
            {/* 1. Brand Column (Lg: 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <h3 className={`text-2xl font-black tracking-tight mb-2 ${styles.text.heading}`}>
                  <span className={styles.text.accent}>QuizMaster</span>
                </h3>
                <p className={`text-sm leading-relaxed max-w-xs ${styles.text.body}`}>
                  Empowering learners with AI-driven assessments, real-time analytics, and a seamless testing environment.
                </p>
              </div>
              
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className={`p-3 rounded-xl transition-all duration-300 hover:-translate-y-1 ${styles.iconBtn}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* 2. Quick Links (Lg: 3 cols) */}
            <div className="lg:col-span-3 hidden md:block">
              <h4 className={`font-bold mb-6 ${styles.text.heading}`}>Platform</h4>
              <ul className="space-y-4">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className={`${styles.linkItem} ${styles.text.link}`}>
                      <link.icon className="w-4 h-4 opacity-70" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Legal (Lg: 3 cols) */}
            <div className="lg:col-span-3 hidden md:block">
              <h4 className={`font-bold mb-6 ${styles.text.heading}`}>Legal & Help</h4>
              <ul className="space-y-4">
                {legalLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className={`${styles.linkItem} ${styles.text.link}`}>
                      <link.icon className="w-4 h-4 opacity-70" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Support (Lg: 2 cols) */}
            <div className="lg:col-span-2">
              <h4 className={`font-bold mb-6 ${styles.text.heading}`}>Feedback</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveModal('complaint')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all hover:shadow-md ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-red-400' : 'bg-white border-slate-200 hover:border-red-200 text-red-600'
                  }`}
                >
                  Report Issue
                </button>
                <button 
                  onClick={() => setActiveModal('recommendation')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all hover:shadow-md ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-blue-400' : 'bg-white border-slate-200 hover:border-blue-200 text-blue-600'
                  }`}
                >
                  Suggest Feature
                </button>
              </div>
            </div>
          </div>

          {/* --- Mobile Accordion (Visible only on small screens) --- */}
          <div className="md:hidden space-y-3 mb-12">
            <MobileSection title="Quick Links" styles={styles}>
              {quickLinks.map((link, idx) => (
                <Link key={idx} to={link.to} className={`block py-2 ${styles.text.link}`}>{link.label}</Link>
              ))}
            </MobileSection>
            <MobileSection title="Legal" styles={styles}>
              {legalLinks.map((link, idx) => (
                <Link key={idx} to={link.to} className={`block py-2 ${styles.text.link}`}>{link.label}</Link>
              ))}
            </MobileSection>
          </div>

          {/* --- Footer Bottom --- */}
          <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
            <p className={`text-sm ${styles.text.body}`}>
              &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
            </p>
            
            <button
              onClick={scrollToTop}
              className={`
                p-3 rounded-full shadow-lg transition-all duration-300 
                ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
                ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white hover:bg-slate-50 text-indigo-600 border border-slate-100'}
              `}
              aria-label="Scroll to top"
            >
              <FaArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* --- Modals --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border p-1 ${styles.glassModal}`}>
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setActiveModal(null)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            {activeModal === 'complaint' && <ComplaintForm onClose={() => setActiveModal(null)} />}
            {activeModal === 'recommendation' && <RecommendationForm onClose={() => setActiveModal(null)} />}
          </div>
        </div>
      )}
    </>
  );
};

// Helper Component for Mobile Accordion
const MobileSection = ({ title, children, styles }) => (
  <details className={`rounded-xl border overflow-hidden group ${styles.mobileDetails}`}>
    <summary className={`flex items-center justify-between px-4 py-3 font-medium cursor-pointer list-none ${styles.text.heading}`}>
      {title}
      <FiChevronUp className="w-4 h-4 transition-transform duration-300 group-open:rotate-180" />
    </summary>
    <div className="px-4 pb-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
      {children}
    </div>
  </details>
);

export default Footer;