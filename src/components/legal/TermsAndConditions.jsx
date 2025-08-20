import React from 'react';
import LegalLayout from '../layout/LegalLayout';
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
  const colorClasses = {
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    orange: "bg-orange-500/20 border-orange-500/30 text-orange-400"
  };

  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorClasses[color]} mr-4 shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className="text-gray-300 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
};

const InfoCard = ({ title, description, icon, color = "blue", children }) => {
  const colorClasses = {
    blue: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    green: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10",
    purple: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    orange: "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
  };

  const iconColorClasses = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  };

  return (
    <div className={`border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colorClasses[color]}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border ${iconColorClasses[color]} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
          <p className="text-gray-300 mb-3">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

const TermsAndConditions = () => {
  const updatedAt = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <LegalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <header className="mb-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-3xl mr-6 shadow-2xl">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl font-black text-white tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Terms & Conditions
                </h1>
              </div>
            </div>
            <p className="text-gray-400 text-xl mb-4">
              Last updated: <span className="text-purple-400 font-bold">{updatedAt}</span>
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 mx-auto rounded-full shadow-lg"></div>
          </header>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl">
            {/* Quick Overview */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30 flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Agreement Overview</h3>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    These terms govern your use of QuizMaster. By using our platform, you agree to these conditions. 
                    Please read them carefully before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance of Terms */}
            <Section title="Acceptance of Terms" icon={CheckCircle} color="green">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
                <p className="text-xl leading-relaxed">
                  By accessing or using <span className="text-white font-bold">QuizMaster</span>, you agree to be bound by these Terms. 
                  If you do not agree with any part, you must not use our services.
                </p>
              </div>
            </Section>

            {/* Account Section */}
            <Section title="Account Responsibility" icon={Users} color="blue">
              <div className="grid gap-6">
                <InfoCard 
                  title="🔐 Account Security" 
                  description="You are responsible for maintaining the confidentiality of your account credentials."
                  icon={<Shield className="w-5 h-5" />}
                  color="blue"
                >
                  <ul className="space-y-2 text-sm">
                                         <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-blue-400" />
                       Keep your password secure and confidential
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-blue-400" />
                       Notify us immediately of any unauthorized access
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-blue-400" />
                       You are responsible for all activities under your account
                     </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="✅ Accurate Information" 
                  description="Provide accurate and complete information during registration."
                  icon={<CheckCircle className="w-5 h-5" />}
                  color="green"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-300">
                                             <AlertTriangle className="w-4 h-4 inline mr-2" />
                       Providing false information may result in account termination.
                    </p>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Payment Terms */}
            <Section title="Payment & Subscription Terms" icon={CreditCard} color="purple">
              <div className="grid gap-6">
                <InfoCard 
                  title="💳 Payment Processing" 
                  description="All payments are processed securely through Razorpay."
                  icon={<CreditCard className="w-5 h-5" />}
                  color="purple"
                >
                  <ul className="space-y-2 text-sm">
                                         <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Secure payment processing via Razorpay
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Multiple payment methods accepted
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       All transactions are encrypted and secure
                     </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="🔄 Subscription Management" 
                  description="Manage your subscriptions and billing preferences."
                  icon={<RefreshCw className="w-5 h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <p className="text-sm">Subscriptions automatically renew unless cancelled before the renewal date.</p>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <p className="text-sm text-orange-300">
                                                 <AlertTriangle className="w-4 h-4 inline mr-2" />
                         Cancellations take effect at the end of the current billing period.
                      </p>
                    </div>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Usage Guidelines */}
            <Section title="Acceptable Use Policy" icon={Shield} color="orange">
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                                         <div className="bg-orange-500/20 p-3 rounded-xl flex-shrink-0">
                       <AlertTriangle className="w-6 h-6 text-orange-400" />
                     </div>
                    <div>
                      <h4 className="text-white font-bold text-xl mb-3">Prohibited Activities</h4>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>Sharing account credentials with others</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>Attempting to hack or disrupt the platform</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>Using automated tools to access the service</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>Violating intellectual property rights</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Intellectual Property */}
            <Section title="Intellectual Property Rights" icon={FileText} color="blue">
              <div className="grid gap-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
                  <h4 className="text-white font-bold text-xl mb-4">📚 Content Ownership</h4>
                  <div className="space-y-4">
                                         <div className="flex items-start gap-3">
                       <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
                       <div>
                         <p className="text-lg text-gray-300">
                           QuizMaster retains all rights to the platform, content, and intellectual property.
                         </p>
                       </div>
                     </div>
                     <div className="flex items-start gap-3">
                       <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
                       <div>
                         <p className="text-lg text-gray-300">
                           Users may not reproduce, distribute, or create derivative works without permission.
                         </p>
                       </div>
                     </div>
                     <div className="flex items-start gap-3">
                       <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
                       <div>
                         <p className="text-lg text-gray-300">
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
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                                         <div className="bg-green-500/20 p-3 rounded-xl flex-shrink-0">
                       <Lock className="w-6 h-6 text-green-400" />
                     </div>
                    <div>
                      <h4 className="text-white font-bold text-xl mb-3">Data Protection Commitment</h4>
                      <p className="text-lg text-gray-300 mb-4">
                        We are committed to protecting your privacy and personal data in accordance with applicable laws.
                      </p>
                      <div className="grid gap-3">
                                                 <div className="flex items-center gap-3">
                           <CheckCircle className="w-4 h-4 text-green-400" />
                           <span>Your data is processed securely and transparently</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <CheckCircle className="w-4 h-4 text-green-400" />
                           <span>We never sell your personal information</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <CheckCircle className="w-4 h-4 text-green-400" />
                           <span>You have rights to access, modify, and delete your data</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Termination */}
            <Section title="Termination & Suspension" icon={AlertTriangle} color="orange">
              <div className="grid gap-6">
                <InfoCard 
                  title="🚫 Account Termination" 
                  description="We reserve the right to terminate accounts that violate our terms."
                  icon={<AlertTriangle className="w-5 h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <p className="text-sm">Accounts may be terminated for:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Violation of these terms</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Fraudulent or illegal activities</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Extended periods of inactivity</span>
                      </li>
                    </ul>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Contact Information */}
            <Section title="Contact Us" icon={Mail} color="purple">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8 text-center">
                <h4 className="text-white font-bold text-xl mb-4">Questions About These Terms?</h4>
                <p className="text-lg text-gray-300 mb-6">
                  If you have any questions about these Terms & Conditions, 
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:legal@quizmaster.com" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Mail className="w-5 h-5" />
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
