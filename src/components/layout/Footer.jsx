import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaPuzzlePiece, 
  FaGithub, 
  FaTwitter, 
  FaLinkedin, 
  FaEnvelope,
  FaHeart,
  FaArrowUp
} from 'react-icons/fa';
import { 
  FiHome, 
  FiBookOpen, 
  FiTarget, 
  FiShield, 
  FiFileText, 
  FiHelpCircle,
  FiChevronUp
} from 'react-icons/fi';
import ComplaintForm from '../feedback/ComplaintForm';
import RecommendationForm from '../feedback/RecommendationForm';

const Footer = () => {
  const { theme, isDark } = useTheme();
  const { isAdmin, currentUser } = useAuth();
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [showComplaint, setShowComplaint] = React.useState(false);
  const [showRecommendation, setShowRecommendation] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
    <footer className={`relative transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/5' : 'bg-blue-400/3'
        }`}></div>
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500/5' : 'bg-purple-400/3'
        }`}></div>
      </div>

      <div className="container-responsive relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          {/* Mobile: Collapsible sections */}
          <div className="md:hidden space-y-4 mb-10">
            {(() => {
              const quickLinks = [
                { icon: FiHome, label: 'Test Series', to: '/test-series' },
                ...(isAdmin ? [
                  { icon: FiBookOpen, label: 'Create Series', to: '/create-series' },
                  { icon: FiHelpCircle, label: 'AI Generator', to: '/ai-generator' }
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
              const supportItems = [
                { type: 'button', label: 'Report Issue', onClick: () => setShowComplaint(true) },
                { type: 'button', label: 'Suggest Feature', onClick: () => setShowRecommendation(true) },
                { type: 'link', label: 'support@quizmaster.com', href: 'mailto:support@quizmaster.com' }
              ];

              const Section = ({ title, children }) => (
                <details className={`${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/90 border-slate-200/60'} rounded-xl border`}>
                  <summary className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <span className="font-semibold">{title}</span>
                    <FiChevronUp className="w-4 h-4 transition-transform details-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4">
                    {children}
                  </div>
                </details>
              );

              return (
                <>
                  <Section title="Quick Links">
                    <ul className="space-y-3">
                      {quickLinks.map((link, i) => (
                        <li key={i}>
                          <Link to={link.to} className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'} flex items-center gap-3`}>
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Legal">
                    <ul className="space-y-3">
                      {legalLinks.map((link, i) => (
                        <li key={i}>
                          <Link to={link.to} className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'} flex items-center gap-3`}>
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Support">
                    <div className="space-y-3">
                      <button onClick={supportItems[0].onClick} className={`${isDark ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-700'} text-sm underline underline-offset-4`}>
                        {supportItems[0].label}
                      </button>
                      <button onClick={supportItems[1].onClick} className={`${isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'} text-sm underline underline-offset-4`}>
                        {supportItems[1].label}
                      </button>
                      <div className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm`}>
                        <a href={supportItems[2].href}>{supportItems[2].label}</a>
                      </div>
                    </div>
                  </Section>
                </>
              );
            })()}
          </div>

          {/* Desktop: 4-column layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                
                <div>
                  <h3 className={`text-2xl font-bold transition-all duration-300 ${
                    isDark 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500'
                  }`}>
                    QuizMaster
                  </h3>
                  <p className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>
                    Transform Learning with AI
                  </p>
                </div>
              </div>
              
              <p className={`text-sm leading-relaxed mb-6 transition-all duration-300 ${
                isDark ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Create intelligent assessments, track progress with advanced analytics, 
                and deliver exceptional learning experiences with our AI-powered platform.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { icon: FaGithub, href: '#', label: 'GitHub' },
                  { icon: FaTwitter, href: '#', label: 'Twitter' },
                  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
                  { icon: FaEnvelope, href: 'mailto:contact@quizmaster.com', label: 'Email' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-md'
                    }`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`text-lg font-semibold mb-6 transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { icon: FiHome, label: 'Test Series', to: '/test-series' },
                  ...(isAdmin ? [
                    { icon: FiBookOpen, label: 'Create Series', to: '/create-series' },
                    { icon: FiHelpCircle, label: 'AI Generator', to: '/ai-generator' }
                  ] : []),
                  ...(currentUser ? [
                    { icon: FiTarget, label: 'My Progress', to: '/test-history' }
                  ] : [])
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className={`flex items-center gap-3 transition-all duration-200 hover:translate-x-1 ${
                        isDark
                          ? 'text-gray-300 hover:text-white'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className={`text-lg font-semibold mb-6 transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  { icon: FiShield, label: 'Privacy Policy', to: '/privacy' },
                  { icon: FiFileText, label: 'Terms & Conditions', to: '/terms' },
                  { icon: FiHelpCircle, label: 'Refund Policy', to: '/refunds' },
                  { icon: FaEnvelope, label: 'Contact Us', to: '/contact' }
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className={`flex items-center gap-3 transition-all duration-200 hover:translate-x-1 ${
                        isDark
                          ? 'text-gray-300 hover:text-white'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className={`text-lg font-semibold mb-6 transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Support
              </h4>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    Need help? Our support team is here for you 24/7.
                  </p>
                </div>
                
                {/* Help Us Improve - links */}
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => setShowComplaint(true)}
                    className={`text-sm underline underline-offset-4 transition-colors ${
                      isDark ? 'text-red-300 hover:text-red-500' : 'text-red-600 hover:text-red-700'
                    }`}
                  >
                    Report Issue
                  </button>
                  
                  <button
                    onClick={() => setShowRecommendation(true)}
                    className={`text-sm underline underline-offset-4 transition-colors ${
                      isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Suggest Feature
                  </button>
                </div>

                
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`py-6 border-t transition-all duration-300 ${
          isDark ? 'border-gray-700' : 'border-slate-200/60'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className={`text-sm transition-all duration-300 ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              <p className="flex items-center gap-2">
                © {currentYear} QuizMaster
                
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              
              
              <button
                onClick={scrollToTop}
                className={`group p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-md'
                } ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                aria-label="Scroll to top"
              >
                <FiChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>

    {/* Feedback Modals */}
    {showComplaint && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className={` flex justify-center rounded-xl shadow-2xl p-6 relative w-full max-w-lg mx-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'
        }`}>
          <button
            onClick={() => setShowComplaint(false)}
            aria-label="Close"
            className={`absolute top-4 right-4 text-2xl ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
          >
            ×
          </button>
          <ComplaintForm onClose={() => setShowComplaint(false)} />
        </div>
      </div>
    )}

    {showRecommendation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className={` flex justify-center rounded-xl shadow-2xl p-6 relative w-full max-w-lg mx-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'
        }`}>
          <button
            onClick={() => setShowRecommendation(false)}
            aria-label="Close"
            className={`absolute top-4 right-4 text-2xl ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
          >
            ×
          </button>
          <RecommendationForm onClose={() => setShowRecommendation(false)} />
        </div>
      </div>
    )}
    </>
  );
};

export default Footer; 