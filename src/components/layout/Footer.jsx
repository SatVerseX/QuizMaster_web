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

const Footer = () => {
  const { theme, isDark } = useTheme();
  const { isAdmin } = useAuth();
  const [showScrollTop, setShowScrollTop] = React.useState(false);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className={`p-3 mr-4 rounded-xl shadow-lg transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                    : 'bg-gradient-to-br from-orange-500 to-red-600'
                }`}>
                  <FaPuzzlePiece className="w-8 h-8 text-white" />
                </div>
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
                  { icon: FiTarget, label: 'My Progress', to: '/test-history' }
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
                
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30'
                    : 'bg-white/80 border border-slate-200/60 shadow-sm'
                }`}>
                  <p className={`text-sm font-medium mb-2 transition-all duration-300 ${
                    isDark ? 'text-blue-300' : 'text-slate-700'
                  }`}>
                    Get in touch
                  </p>
                  <a
                    href="mailto:support@quizmaster.com"
                    className={`text-sm transition-all duration-300 ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    support@quizmaster.com
                  </a>
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
                © {currentYear} QuizMaster. Made with 
                <FaHeart className="w-4 h-4 text-red-500 animate-pulse" /> 
                for learners worldwide.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`text-sm transition-all duration-300 ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                Version 2.0.0
              </div>
              
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
  );
};

export default Footer; 