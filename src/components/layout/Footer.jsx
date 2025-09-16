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
    <footer className={`relative transition duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/5 to-purple-900/5' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-2xl animate-pulse ${
          isDark ? 'bg-blue-500/3' : 'bg-blue-400/2'
        }`}></div>
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-2xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500/3' : 'bg-purple-400/2'
        }`}></div>
      </div>

      <div className="container-responsive relative z-10">
        {/* Main Footer Content */}
        <div className="py-12">
          {/* Mobile: Collapsible sections */}
          <div className="md:hidden space-y-3 mb-8">
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
                <details className={`${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/90 border-slate-200/60'} rounded-lg border`}>
                  <summary className={`flex items-center justify-between px-3 py-2.5 cursor-pointer select-none hover:cursor-pointer ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <span className="font-normal">{title}</span>
                    <FiChevronUp className="w-3 h-3 transition-transform details-open:rotate-180" />
                  </summary>
                  <div className="px-3 pb-3">
                    {children}
                  </div>
                </details>
              );

              return (
                <>
                  <Section title="Quick Links">
                    <ul className="space-y-2">
                      {quickLinks.map((link, i) => (
                        <li key={i}>
                          <Link to={link.to} className={`${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-slate-700 hover:text-gray-800'} flex items-center gap-2 hover:cursor-pointer`}>
                            <link.icon className="w-3 h-3" />
                            <span className="text-xs">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Legal">
                    <ul className="space-y-2">
                      {legalLinks.map((link, i) => (
                        <li key={i}>
                          <Link to={link.to} className={`${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-slate-700 hover:text-gray-800'} flex items-center gap-2 hover:cursor-pointer`}>
                            <link.icon className="w-3 h-3" />
                            <span className="text-xs">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="Support">
                    <div className="space-y-2">
                      <button onClick={supportItems[0].onClick} className={`${isDark ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-700'} text-xs underline underline-offset-4 hover:cursor-pointer`}>
                        {supportItems[0].label}
                      </button>
                      <button onClick={supportItems[1].onClick} className={`${isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-500 hover:text-blue-700'} text-xs underline underline-offset-4 hover:cursor-pointer`}>
                        {supportItems[1].label}
                      </button>
                      <div className={`${isDark ? 'text-blue-300' : 'text-blue-500'} text-xs`}>
                        <a href={supportItems[2].href} className="hover:cursor-pointer">{supportItems[2].label}</a>
                      </div>
                    </div>
                  </Section>
                </>
              );
            })()}
          </div>

          {/* Desktop: 4-column layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-5">
                <div>
                  <h3 className={`text-xl font-bold transition duration-200 ${
                    isDark 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500'
                  }`}>
                    QuizMaster
                  </h3>
                  <p className={`text-xs transition duration-200 ${
                    isDark ? 'text-gray-400' : 'text-slate-700'
                  }`}>
                    Transform Learning with AI
                  </p>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed mb-5 transition duration-200 ${
                isDark ? 'text-gray-400' : 'text-slate-700'
              }`}>
                Create intelligent assessments, track progress with advanced analytics, 
                and deliver exceptional learning experiences with our AI-powered platform.
              </p>

              {/* Social Links */}
              <div className="flex space-x-3">
                {[
                  { icon: FaGithub, href: '#', label: 'GitHub' },
                  { icon: FaTwitter, href: '#', label: 'Twitter' },
                  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
                  { icon: FaEnvelope, href: 'mailto:contact@quizmaster.com', label: 'Email' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-2 rounded-lg transition duration-200 hover:scale-103 hover:cursor-pointer ${
                      isDark
                        ? 'text-gray-400 hover:text-gray-50 hover:bg-gray-800'
                        : 'text-slate-700 hover:text-gray-800 hover:bg-white hover:shadow-sm'
                    }`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`text-base font-normal mb-5 transition duration-200 ${
                isDark ? 'text-gray-50' : 'text-slate-800'
              }`}>
                Quick Links
              </h4>
              <ul className="space-y-2">
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
                      className={`flex items-center gap-2 transition duration-200 hover:translate-x-1 hover:cursor-pointer ${
                        isDark
                          ? 'text-gray-400 hover:text-gray-100'
                          : 'text-slate-700 hover:text-gray-800'
                      }`}
                    >
                      <link.icon className="w-3 h-3" />
                      <span className="text-xs">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className={`text-base font-normal mb-5 transition duration-200 ${
                isDark ? 'text-gray-50' : 'text-slate-800'
              }`}>
                Legal
              </h4>
              <ul className="space-y-2">
                {[
                  { icon: FiShield, label: 'Privacy Policy', to: '/privacy' },
                  { icon: FiFileText, label: 'Terms & Conditions', to: '/terms' },
                  { icon: FiHelpCircle, label: 'Refund Policy', to: '/refunds' },
                  { icon: FaEnvelope, label: 'Contact Us', to: '/contact' }
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className={`flex items-center gap-2 transition duration-200 hover:translate-x-1 hover:cursor-pointer ${
                        isDark
                          ? 'text-gray-400 hover:text-gray-100'
                          : 'text-slate-700 hover:text-gray-800'
                      }`}
                    >
                      <link.icon className="w-3 h-3" />
                      <span className="text-xs">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className={`text-base font-normal mb-5 transition duration-200 ${
                isDark ? 'text-gray-50' : 'text-slate-800'
              }`}>
                Support
              </h4>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs transition duration-200 ${
                    isDark ? 'text-gray-400' : 'text-slate-700'
                  }`}>
                    Need help? Our support team is here for you 24/7.
                  </p>
                </div>
                
                {/* Help Us Improve - links */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowComplaint(true)}
                    className={`text-xs underline underline-offset-4 transition-colors hover:cursor-pointer ${
                      isDark ? 'text-red-300 hover:text-red-500' : 'text-red-600 hover:text-red-700'
                    }`}
                  >
                    Report Issue
                  </button>
                  
                  <button
                    onClick={() => setShowRecommendation(true)}
                    className={`text-xs underline underline-offset-4 transition-colors hover:cursor-pointer ${
                      isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-500 hover:text-blue-700'
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
        <div className={`py-5 border-t transition duration-200 ${
          isDark ? 'border-gray-700' : 'border-slate-200/60'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className={`text-xs transition duration-200 ${
              isDark ? 'text-gray-400' : 'text-slate-700'
            }`}>
              <p className="flex items-center gap-2">
                © {currentYear} QuizMaster
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToTop}
                className={`group p-2 rounded-lg transition duration-200 hover:scale-103 hover:cursor-pointer ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-50 hover:bg-gray-800'
                    : 'text-slate-700 hover:text-gray-800 hover:bg-white hover:shadow-sm'
                } ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                aria-label="Scroll to top"
              >
                <FiChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>

    {/* Feedback Modals */}
    {showComplaint && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className={`flex justify-center rounded-lg shadow-lg p-5 relative w-full max-w-lg mx-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'
        }`}>
          <button
            onClick={() => setShowComplaint(false)}
            aria-label="Close"
            className={`absolute top-3 right-3 text-xl hover:cursor-pointer ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
          >
            ×
          </button>
          <ComplaintForm onClose={() => setShowComplaint(false)} />
        </div>
      </div>
    )}

    {showRecommendation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className={`flex justify-center rounded-lg shadow-lg p-5 relative w-full max-w-lg mx-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'
        }`}>
          <button
            onClick={() => setShowRecommendation(false)}
            aria-label="Close"
            className={`absolute top-3 right-3 text-xl hover:cursor-pointer ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
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
