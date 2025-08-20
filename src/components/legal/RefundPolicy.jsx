import React from 'react';
import LegalLayout from '../layout/LegalLayout';
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

const InfoCard = ({ title, description, icon, color = "blue", children, status = "info" }) => {
  const colorClasses = {
    blue: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    green: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10",
    purple: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    orange: "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10",
    red: "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
  };

  const iconColorClasses = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30"
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

const RefundPolicy = () => {
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-3xl mr-6 shadow-2xl">
                  <RefreshCw className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl font-black text-white tracking-tight bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Cancellations & Refunds
                </h1>
              </div>
            </div>
            <p className="text-gray-400 text-xl mb-4">
              Last updated: <span className="text-green-400 font-bold">{updatedAt}</span>
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-cyan-500 mx-auto rounded-full shadow-lg"></div>
          </header>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl">
            {/* Quick Overview */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30 flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Customer Satisfaction Guarantee</h3>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    We want you to be satisfied with your purchase. If you're not happy with your QuizMaster subscription or purchase, 
                    we offer refunds under specific conditions outlined below.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Eligibility */}
            <Section title="Refund Eligibility" icon={CheckCircle} color="green">
              <div className="grid gap-6">
                <InfoCard 
                  title="⏰ 7-Day Refund Window" 
                  description="Refund requests must be made within 7 days of purchase."
                  icon={<Clock className="w-5 h-5" />}
                  color="green"
                >
                  <ul className="space-y-2 text-sm">
                                         <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-400" />
                       Full refund within 7 days of purchase
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-400" />
                       No questions asked for valid requests
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-400" />
                       Processing time: 3-5 business days
                     </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="❌ Usage Restrictions" 
                  description="No refunds for content already consumed substantially or downloaded."
                  icon={<XCircle className="w-5 h-5" />}
                  color="red"
                >
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-sm text-red-300">
                                             <AlertTriangle className="w-4 h-4 inline mr-2" />
                       Refunds are not available if you have completed more than 50% of the content or downloaded materials.
                    </p>
                  </div>
                </InfoCard>

                <InfoCard 
                  title="⚠️ Policy Violations" 
                  description="Abuse, cheating, or policy violations void refund eligibility."
                  icon={<AlertTriangle className="w-5 h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <p className="text-sm">Refund eligibility is voided if:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Account sharing or credential misuse</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Attempting to circumvent payment systems</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Violation of our terms of service</span>
                      </li>
                    </ul>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Refund Process */}
            <Section title="Refund Process" icon={RefreshCw} color="blue">
              <div className="grid gap-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
                  <h4 className="text-white font-bold text-xl mb-4">🔄 How to Request a Refund</h4>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-full mt-1 flex-shrink-0">
                        <span className="text-blue-400 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="text-lg text-gray-300">
                          Contact our support team at <span className="text-blue-400 font-semibold">support@quizmaster.com</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-full mt-1 flex-shrink-0">
                        <span className="text-blue-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="text-lg text-gray-300">
                          Include your order details and reason for refund
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-full mt-1 flex-shrink-0">
                        <span className="text-blue-400 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="text-lg text-gray-300">
                          We'll review and process your request within 24-48 hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-full mt-1 flex-shrink-0">
                        <span className="text-blue-400 font-bold text-sm">4</span>
                      </div>
                      <div>
                        <p className="text-lg text-gray-300">
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
              <div className="grid gap-6">
                <InfoCard 
                  title="🛑 How to Cancel" 
                  description="Cancel your subscription at any time through your account settings."
                  icon={<CreditCard className="w-5 h-5" />}
                  color="purple"
                >
                  <ul className="space-y-2 text-sm">
                                         <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Go to your account settings
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Navigate to subscription management
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Click "Cancel Subscription"
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Confirm cancellation
                     </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="⏱️ Cancellation Timing" 
                  description="Understand when your cancellation takes effect."
                  icon={<Clock className="w-5 h-5" />}
                  color="orange"
                >
                  <div className="space-y-3">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <p className="text-sm text-orange-300">
                                                 <AlertTriangle className="w-4 h-4 inline mr-2" />
                         Cancellations take effect at the end of your current billing period.
                      </p>
                    </div>
                    <p className="text-sm">You'll continue to have access until the end of your paid period.</p>
                  </div>
                </InfoCard>
              </div>
            </Section>

            {/* Processing Time */}
            <Section title="Processing Time & Methods" icon={DollarSign} color="green">
              <div className="grid gap-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
                  <h4 className="text-white font-bold text-xl mb-4">💰 Refund Processing</h4>
                  <div className="grid gap-4">
                                         <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span className="text-lg">Processing time: 3-5 business days</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span className="text-lg">Refunded to original payment method</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span className="text-lg">Email confirmation sent upon completion</span>
                     </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Exceptions */}
            <Section title="Exceptions & Special Cases" icon={Shield} color="orange">
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                                         <div className="bg-orange-500/20 p-3 rounded-xl flex-shrink-0">
                       <AlertTriangle className="w-6 h-6 text-orange-400" />
                     </div>
                    <div>
                      <h4 className="text-white font-bold text-xl mb-3">Special Circumstances</h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-lg text-gray-300">
                              <span className="text-white font-semibold">Technical Issues:</span> Extended refund window for platform-related problems
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-lg text-gray-300">
                              <span className="text-white font-semibold">Duplicate Charges:</span> Immediate refund for accidental double billing
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-lg text-gray-300">
                              <span className="text-white font-semibold">Service Disruption:</span> Pro-rated refunds for extended outages
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
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
                <h4 className="text-white font-bold text-xl mb-4">Need Help with Refunds?</h4>
                <p className="text-lg text-gray-300 mb-6">
                  If you have questions about our refund policy or need assistance with a refund request, 
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:support@quizmaster.com" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Mail className="w-5 h-5" />
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
