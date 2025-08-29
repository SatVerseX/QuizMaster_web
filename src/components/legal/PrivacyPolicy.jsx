import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { FiShield as Shield, FiEye as Eye, FiLock as Lock, FiUsers as Users, FiFileText as FileText, FiMail as Mail, FiCheckCircle as CheckCircle, FiAlertTriangle as AlertTriangle, FiArrowRight } from 'react-icons/fi';

const Section = ({ title, children, icon: Icon, color = "blue" }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark 
      ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
      : "bg-blue-100 border-blue-200 text-blue-600",
    green: isDark 
      ? "bg-green-500/20 border-green-500/30 text-green-400"
      : "bg-green-100 border-green-200 text-green-600",
    purple: isDark 
      ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
      : "bg-purple-100 border-purple-200 text-purple-600",
    orange: isDark 
      ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
      : "bg-orange-100 border-orange-200 text-orange-600"
  };

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        {Icon && (
          <div className={`p-2 sm:p-3 rounded-xl border ${colorClasses[color]} self-center sm:self-start shadow-lg`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight text-center sm:text-left ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
      </div>
      <div className={`leading-relaxed space-y-3 sm:space-y-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        {children}
      </div>
    </section>
  );
};

const InfoCard = ({ title, description, icon, color = "blue", children }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark 
      ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
      : "border-blue-200 bg-blue-50/80 hover:bg-blue-100/80",
    green: isDark 
      ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
      : "border-green-200 bg-green-50/80 hover:bg-green-100/80",
    purple: isDark 
      ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10"
      : "border-purple-200 bg-purple-50/80 hover:bg-purple-100/80",
    orange: isDark 
      ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
      : "border-orange-200 bg-orange-50/80 hover:bg-orange-100/80"
  };

  const iconColorClasses = {
    blue: isDark 
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-blue-100 text-blue-600 border-blue-200",
    green: isDark 
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-green-100 text-green-600 border-green-200",
    purple: isDark 
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-purple-100 text-purple-600 border-purple-200",
    orange: isDark 
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-orange-100 text-orange-600 border-orange-200"
  };

  return (
    <div className={`border rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${colorClasses[color]}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-xl border ${iconColorClasses[color]} flex-shrink-0 self-center sm:self-start`}>
          {icon}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className={`font-bold text-base sm:text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
          <p className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicy = () => {
  const { isDark } = useTheme();
  const updatedAt = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent order-1 sm:order-2">
                  Privacy Policy
                </h1>
              </div>
            </div>
            <p className={`text-lg sm:text-xl mb-4 px-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Last updated: <span className="text-blue-400 font-bold">{updatedAt}</span>
            </p>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full shadow-lg"></div>
          </header>

          <div className={`border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 backdrop-blur-xl shadow-2xl transition-all duration-500 ${
            isDark 
              ? 'bg-gray-900/60 border-gray-700/50' 
              : 'bg-white/80 border-slate-200/60'
          }`}>
            {/* Overview Section */}
            <Section title="Overview" icon={FileText} color="blue">
              <div className={`border rounded-2xl p-6 sm:p-8 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <p className="text-lg sm:text-xl leading-relaxed">
                  This Privacy Policy explains how <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>QuizMaster</span> ("we", "us", or "our") collects, uses, discloses,
                  and safeguards your information when you use our website and services. By accessing or using QuizMaster,
                  you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </Section>

            {/* Information Collection */}
            <Section title="Information We Collect" icon={Eye} color="green">
              <div className="grid gap-4 sm:gap-6">
                <InfoCard 
                  title="🔐 Account Information" 
                  description="Personal details provided during registration and profile setup."
                  icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="blue"
                >
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Name, email address, and profile details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Authentication data via Firebase</span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="💳 Payment Data" 
                  description="Transaction information processed securely through Razorpay."
                  icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="green"
                >
                  <div className={`border rounded-xl p-3 sm:p-4 ${
                    isDark 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      We do not store sensitive payment information like card numbers or UPI details.
                    </p>
                  </div>
                </InfoCard>

                <InfoCard 
                  title="📊 Usage Analytics" 
                  description="Data about how you interact with our platform."
                  icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="purple"
                >
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Pages visited and time spent</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Test performance and progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Device and browser information</span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="💬 Communications" 
                  description="Messages and feedback you send to our support team."
                  icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="orange"
                >
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Support requests, feedback forms, and other communications are stored securely for customer service purposes.</p>
                </InfoCard>
              </div>
            </Section>

            {/* How We Use Information */}
            <Section title="How We Use Information" icon={Users} color="purple">
              <div className="grid gap-3 sm:gap-4">
                {[
                  "Provide and improve learning features, tests, analytics, and personalization.",
                  "Process payments and maintain transaction records securely.",
                  "Detect, prevent, and address fraud, abuse, or security incidents.",
                  "Communicate service updates, changes to terms, and customer support responses."
                ].map((item, index) => (
                  <div key={index} className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-xl hover:scale-[1.02] transition-all duration-300 ${
                    isDark 
                      ? 'bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10' 
                      : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                  }`}>
                    <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${
                      isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    </div>
                    <p className="text-base sm:text-lg">{item}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Information Sharing */}
            <Section title="Information Sharing & Disclosure" icon={Shield} color="orange">
              <div className={`border rounded-2xl p-6 sm:p-8 ${
                isDark 
                  ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20' 
                  : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
              }`}>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 self-center sm:self-start ${
                      isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                    }`}>
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className={`font-bold text-lg sm:text-xl mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>We Do Not Sell Your Data</h4>
                      <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        QuizMaster does not sell, trade, or rent your personal information to third parties. 
                        We may share information only in the following limited circumstances:
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 sm:gap-4 ml-0 sm:ml-16">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>With your explicit consent</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>To comply with legal obligations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>To protect our rights and prevent fraud</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Data Security */}
            <Section title="Data Security" icon={Lock} color="green">
              <div className="grid gap-4 sm:gap-6">
                <div className={`border rounded-2xl p-6 sm:p-8 ${
                  isDark 
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>🔒 Industry-Standard Protection</h4>
                  <div className="grid gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>End-to-end encryption for all data transmission</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Secure cloud infrastructure with regular security audits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Access controls and authentication mechanisms</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Regular security updates and vulnerability assessments</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Contact Information */}
            <Section title="Contact Us" icon={Mail} color="blue">
              <div className={`border rounded-2xl p-6 sm:p-8 text-center ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Questions About This Policy?</h4>
                <p className={`text-base sm:text-lg mb-4 sm:mb-6 px-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a 
                    href="mailto:privacy@quizmaster.com" 
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    privacy@quizmaster.com
                    <FiArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
