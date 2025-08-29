import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiRefreshCw as RefreshCw,
  FiClock as Clock,
  FiCreditCard as CreditCard,
  FiAlertTriangle as AlertTriangle,
  FiMail as Mail,
  FiCheckCircle as CheckCircle,
  FiXCircle as XCircle,
  FiArrowRight,
  FiShield as Shield,
  FiDollarSign as DollarSign
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

const InfoCard = ({ title, description, icon, color = "blue", children, status = "info" }) => {
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
      : "border-orange-200 bg-orange-50/80 hover:bg-orange-100/80",
    red: isDark 
      ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
      : "border-red-200 bg-red-50/80 hover:bg-red-100/80"
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
      : "bg-orange-100 text-orange-600 border-orange-200",
    red: isDark 
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-red-100 text-red-600 border-red-200"
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

const RefundPolicy = () => {
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
                  ? 'bg-gradient-to-r from-green-600/20 to-blue-600/20' 
                  : 'bg-gradient-to-r from-green-400/10 to-blue-400/10'
              }`}></div>
              <div className="relative flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-4 sm:gap-6">
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent order-1 sm:order-2">
                  Cancellations & Refunds
                </h1>
              </div>
            </div>
            <p className={`text-lg sm:text-xl mb-4 px-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Last updated: <span className="text-green-400 font-bold">{updatedAt}</span>
            </p>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-cyan-500 mx-auto rounded-full shadow-lg"></div>
          </header>

          <div className={`border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 backdrop-blur-xl shadow-2xl transition-all duration-500 ${
            isDark 
              ? 'bg-gray-900/60 border-gray-700/50' 
              : 'bg-white/80 border-slate-200/60'
          }`}>
            {/* Quick Overview */}
            <div className={`border rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 ${
              isDark 
                ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20' 
                : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl border flex-shrink-0 self-center sm:self-start ${
                  isDark ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200'
                }`}>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Customer Satisfaction Guarantee</h3>
                  <p className={`text-lg sm:text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    We want you to be satisfied with your purchase. If you're not happy with your QuizMaster subscription or purchase, 
                    we offer refunds under specific conditions outlined below.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Eligibility */}
            <Section title="Refund Eligibility" icon={CheckCircle} color="green">
              <div className="grid gap-4 sm:gap-6">
                <InfoCard 
                  title="⏰ 7-Day Refund Window" 
                  description="Refund requests must be made within 7 days of purchase."
                  icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="green"
                >
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Full refund within 7 days of purchase</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>No questions asked for valid requests</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Processing time: 3-5 business days</span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="❌ Usage Restrictions" 
                  description="No refunds for content already consumed substantially or downloaded."
                  icon={<XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="red"
                >
                  <div className={`border rounded-xl p-3 sm:p-4 ${
                    isDark 
                      ? 'bg-red-500/10 border-red-500/20' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Refunds are not available if you have completed more than 50% of the content or downloaded materials.
                    </p>
                  </div>
                </InfoCard>

                <InfoCard 
                  title="⚠️ Policy Violations" 
                  description="Abuse, cheating, or policy violations void refund eligibility."
                  icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Refund eligibility is voided if:</p>
                    <ul className="space-y-2 text-xs sm:text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Account sharing or credential misuse</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Attempting to circumvent payment systems</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Violation of our terms of service</span>
                      </li>
                    </ul>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Refund Process */}
            <Section title="Refund Process" icon={RefreshCw} color="blue">
              <div className="grid gap-4 sm:gap-6">
                <div className={`border rounded-2xl p-6 sm:p-8 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                }`}>
                  <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>🔄 How to Request a Refund</h4>
                  <div className="grid gap-3 sm:gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <span className="text-blue-400 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          Contact our support team at <span className="text-blue-400 font-semibold break-all">support@quizmaster.com</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <span className="text-blue-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          Include your order details and reason for refund
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <span className="text-blue-400 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          We'll review and process your request within 24-48 hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <span className="text-blue-400 font-bold text-sm">4</span>
                      </div>
                      <div>
                        <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          Refund will be credited to your original payment method
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Cancellation Policy */}
            <Section title="Subscription Cancellation" icon={CreditCard} color="purple">
              <div className="grid gap-4 sm:gap-6">
                <InfoCard 
                  title="🛑 How to Cancel" 
                  description="Cancel your subscription at any time through your account settings."
                  icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="purple"
                >
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Go to your account settings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Navigate to subscription management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Click "Cancel Subscription"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>Confirm cancellation</span>
                    </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="⏱️ Cancellation Timing" 
                  description="Understand when your cancellation takes effect."
                  icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <div className={`border rounded-xl p-3 sm:p-4 ${
                      isDark 
                        ? 'bg-orange-500/10 border-orange-500/20' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                        Cancellations take effect at the end of your current billing period.
                      </p>
                    </div>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>You'll continue to have access until the end of your paid period.</p>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Processing Time */}
            <Section title="Processing Time & Methods" icon={DollarSign} color="green">
              <div className="grid gap-4 sm:gap-6">
                <div className={`border rounded-2xl p-6 sm:p-8 ${
                  isDark 
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>💰 Refund Processing</h4>
                  <div className="grid gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg">Processing time: 3-5 business days</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg">Refunded to original payment method</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg">Email confirmation sent upon completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Exceptions */}
            <Section title="Exceptions & Special Cases" icon={Shield} color="orange">
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
                      <h4 className={`font-bold text-lg sm:text-xl mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Special Circumstances</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Technical Issues:</span> Extended refund window for platform-related problems
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Duplicate Charges:</span> Immediate refund for accidental double billing
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Service Disruption:</span> Pro-rated refunds for extended outages
                            </p>
                          </div>
                        </div>
                      </div>
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
                <h4 className={`font-bold text-lg sm:text-xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Need Help with Refunds?</h4>
                <p className={`text-base sm:text-lg mb-4 sm:mb-6 px-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  If you have questions about our refund policy or need assistance with a refund request, 
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a 
                    href="mailto:support@quizmaster.com" 
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    support@quizmaster.com
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

export default RefundPolicy;
