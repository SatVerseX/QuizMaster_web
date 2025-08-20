import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { FiShield as Shield, FiEye as Eye, FiLock as Lock, FiUsers as Users, FiFileText as FileText, FiMail as Mail, FiCheckCircle as CheckCircle, FiAlertTriangle as AlertTriangle, FiArrowRight } from 'react-icons/fi';

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

const PrivacyPolicy = () => {
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl mr-6 shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Privacy Policy
                </h1>
              </div>
            </div>
            <p className="text-gray-400 text-xl mb-4">
              Last updated: <span className="text-blue-400 font-bold">{updatedAt}</span>
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full shadow-lg"></div>
          </header>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl">
            {/* Overview Section */}
            <Section title="Overview" icon={FileText} color="blue">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
                <p className="text-xl leading-relaxed">
                  This Privacy Policy explains how <span className="text-white font-bold">QuizMaster</span> ("we", "us", or "our") collects, uses, discloses,
                  and safeguards your information when you use our website and services. By accessing or using QuizMaster,
                  you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </Section>

            {/* Information Collection */}
            <Section title="Information We Collect" icon={Eye} color="green">
              <div className="grid gap-6">
                <InfoCard 
                  title="🔐 Account Information" 
                  description="Personal details provided during registration and profile setup."
                  icon={<Lock className="w-5 h-5" />}
                  color="blue"
                >
                  <ul className="space-y-2 text-sm">
                                         <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-400" />
                       Name, email address, and profile details
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-green-400" />
                       Authentication data via Firebase
                     </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="💳 Payment Data" 
                  description="Transaction information processed securely through Razorpay."
                  icon={<Shield className="w-5 h-5" />}
                  color="green"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-300">
                                             <AlertTriangle className="w-4 h-4 inline mr-2" />
                       We do not store sensitive payment information like card numbers or UPI details.
                    </p>
                  </div>
                </InfoCard>

                <InfoCard 
                  title="📊 Usage Analytics" 
                  description="Data about how you interact with our platform."
                  icon={<Users className="w-5 h-5" />}
                  color="purple"
                >
                  <ul className="space-y-2 text-sm">
                                         <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Pages visited and time spent
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Test performance and progress
                     </li>
                     <li className="flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                       Device and browser information
                     </li>
                  </ul>
                </InfoCard>

                <InfoCard 
                  title="💬 Communications" 
                  description="Messages and feedback you send to our support team."
                  icon={<Mail className="w-5 h-5" />}
                  color="orange"
                >
                  <p className="text-sm">Support requests, feedback forms, and other communications are stored securely for customer service purposes.</p>
                </InfoCard>
              </div>
            </Section>

            {/* How We Use Information */}
            <Section title="How We Use Information" icon={Users} color="purple">
              <div className="grid gap-4">
                {[
                  "Provide and improve learning features, tests, analytics, and personalization.",
                  "Process payments and maintain transaction records securely.",
                  "Detect, prevent, and address fraud, abuse, or security incidents.",
                  "Communicate service updates, changes to terms, and customer support responses."
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition-all duration-300">
                                         <div className="bg-purple-500/20 p-2 rounded-full mt-1 flex-shrink-0">
                       <CheckCircle className="w-4 h-4 text-purple-400" />
                     </div>
                    <p className="text-lg">{item}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Information Sharing */}
            <Section title="Information Sharing & Disclosure" icon={Shield} color="orange">
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                                         <div className="bg-orange-500/20 p-3 rounded-xl flex-shrink-0">
                       <AlertTriangle className="w-6 h-6 text-orange-400" />
                     </div>
                    <div>
                      <h4 className="text-white font-bold text-xl mb-3">We Do Not Sell Your Data</h4>
                      <p className="text-lg text-gray-300">
                        QuizMaster does not sell, trade, or rent your personal information to third parties. 
                        We may share information only in the following limited circumstances:
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 ml-16">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>With your explicit consent</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>To comply with legal obligations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>To protect our rights and prevent fraud</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Data Security */}
            <Section title="Data Security" icon={Lock} color="green">
              <div className="grid gap-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
                  <h4 className="text-white font-bold text-xl mb-4">🔒 Industry-Standard Protection</h4>
                  <div className="grid gap-4">
                                         <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span>End-to-end encryption for all data transmission</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span>Secure cloud infrastructure with regular security audits</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span>Access controls and authentication mechanisms</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-green-400" />
                       <span>Regular security updates and vulnerability assessments</span>
                     </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Contact Information */}
            <Section title="Contact Us" icon={Mail} color="blue">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
                <h4 className="text-white font-bold text-xl mb-4">Questions About This Policy?</h4>
                <p className="text-lg text-gray-300 mb-6">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:privacy@quizmaster.com" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Mail className="w-5 h-5" />
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
