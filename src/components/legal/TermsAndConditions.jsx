import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FiFileText as FileText,
  FiShield as Shield,
  FiCreditCard as CreditCard,
  FiUsers as Users,
  FiAlertTriangle as AlertTriangle,
  FiRefreshCw as RefreshCw,
  FiMail as Mail,
  FiCheckCircle as CheckCircle,
  FiArrowRight,
  FiLock as Lock,
  FiEye as Eye
} from 'react-icons/fi';

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

const TermsAndConditions = () => {
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
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20' 
                  : 'bg-gradient-to-r from-purple-400/10 to-blue-400/10'
              }`}></div>
              <div className="relative flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl order-2 sm:order-1">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent order-1 sm:order-2">
                  Terms & Conditions
                </h1>
              </div>
            </div>
            <p className={`text-lg sm:text-xl mb-4 px-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Last updated: <span className="text-purple-400 font-bold">{updatedAt}</span>
            </p>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 mx-auto rounded-full shadow-lg"></div>
          </header>

          <div className={`border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 backdrop-blur-xl shadow-2xl transition-all duration-500 ${
            isDark 
              ? 'bg-gray-900/60 border-gray-700/50' 
              : 'bg-white/80 border-slate-200/60'
          }`}>
            {/* Quick Overview */}
            <div className={`border rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 ${
              isDark 
                ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20' 
                : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl border flex-shrink-0 self-center sm:self-start ${
                  isDark ? 'bg-purple-500/20 border-purple-500/30' : 'bg-purple-100 border-purple-200'
                }`}>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Agreement Overview</h3>
                  <p className={`text-lg sm:text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    These terms govern your use of QuizMaster. By using our platform, you agree to these conditions. 
                    Please read them carefully before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance of Terms */}
            <Section title="Acceptance of Terms" icon={CheckCircle} color="green">
              <div className={`border rounded-2xl p-6 sm:p-8 ${
                isDark 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}>
                <p className="text-lg sm:text-xl leading-relaxed">
                  By accessing or using <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>QuizMaster</span>, you agree to be bound by these Terms. 
                  If you do not agree with any part, you must not use our services.
                </p>
              </div>
            </Section>

            {/* Account Section */}
            <Section title="Account Responsibility" icon={Users} color="blue">
              <div className="grid gap-4 sm:gap-6">
                <InfoCard 
                  title="🔐 Account Security" 
                  description="You are responsible for maintaining the confidentiality of your account credentials."
                  icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="blue"
                >
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Keep your password secure and confidential</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Notify us immediately of any unauthorized access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>You are responsible for all activities under your account</span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="✅ Accurate Information" 
                  description="Provide accurate and complete information during registration."
                  icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="green"
                >
                  <div className={`border rounded-xl p-3 sm:p-4 ${
                    isDark 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Providing false information may result in account termination.
                    </p>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Payment Terms */}
            <Section title="Payment & Subscription Terms" icon={CreditCard} color="purple">
              <div className="grid gap-4 sm:gap-6">
                <InfoCard 
                  title="💳 Payment Processing" 
                  description="All payments are processed securely through Razorpay."
                  icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="purple"
                >
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Secure payment processing via Razorpay</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Multiple payment methods accepted</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>All transactions are encrypted and secure</span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="🔄 Subscription Management" 
                  description="Manage your subscriptions and billing preferences."
                  icon={<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Subscriptions automatically renew unless cancelled before the renewal date.</p>
                    <div className={`border rounded-xl p-3 sm:p-4 ${
                      isDark 
                        ? 'bg-orange-500/10 border-orange-500/20' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                        Cancellations take effect at the end of the current billing period.
                      </p>
                    </div>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Usage Guidelines */}
            <Section title="Acceptable Use Policy" icon={Shield} color="orange">
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
                      <h4 className={`font-bold text-lg sm:text-xl mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Prohibited Activities</h4>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Sharing account credentials with others</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Attempting to hack or disrupt the platform</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Using automated tools to access the service</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Violating intellectual property rights</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Intellectual Property */}
            <Section title="Intellectual Property Rights" icon={FileText} color="blue">
              <div className="grid gap-4 sm:gap-6">
                <div className={`border rounded-2xl p-6 sm:p-8 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                }`}>
                  <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>📚 Content Ownership</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          QuizMaster retains all rights to the platform, content, and intellectual property.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          Users may not reproduce, distribute, or create derivative works without permission.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          User-generated content remains the property of the user.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Privacy & Data */}
            <Section title="Privacy & Data Protection" icon={Eye} color="green">
              <div className={`border rounded-2xl p-6 sm:p-8 ${
                isDark 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 self-center sm:self-start ${
                      isDark ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className={`font-bold text-lg sm:text-xl mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Data Protection Commitment</h4>
                      <p className={`text-base sm:text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        We are committed to protecting your privacy and personal data in accordance with applicable laws.
                      </p>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Your data is processed securely and transparently</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>We never sell your personal information</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                          <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>You have rights to access, modify, and delete your data</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Termination */}
            <Section title="Termination & Suspension" icon={AlertTriangle} color="orange">
              <div className="grid gap-4 sm:gap-6">
                <InfoCard 
                  title="🚫 Account Termination" 
                  description="We reserve the right to terminate accounts that violate our terms."
                  icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Accounts may be terminated for:</p>
                    <ul className="space-y-2 text-xs sm:text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Violation of these terms</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Fraudulent or illegal activities</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Extended periods of inactivity</span>
                      </li>
                    </ul>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Contact Information */}
            <Section title="Contact Us" icon={Mail} color="purple">
              <div className={`border rounded-2xl p-6 sm:p-8 text-center ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20' 
                  : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
              }`}>
                <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Questions About These Terms?</h4>
                <p className={`text-base sm:text-lg mb-4 sm:mb-6 px-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  If you have any questions about these Terms & Conditions, 
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a 
                    href="mailto:legal@quizmaster.com" 
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    legal@quizmaster.com
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

export default TermsAndConditions;
