import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { FiMail as Mail, FiMapPin as MapPin, FiClock as Clock, FiMessageCircle, FiArrowRight, FiPhone, FiGlobe } from 'react-icons/fi';

const ContactCard = ({ title, subtitle, icon, color, children, href, onClick }) => {
  const colorClasses = {
    blue: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    purple: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    green: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10",
    orange: "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
  };

  const iconColorClasses = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  };

  const Component = href ? 'a' : onClick ? 'button' : 'div';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`group border rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-xl border ${iconColorClasses[color]} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
          <p className="text-gray-400 mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
    </Component>
  );
};

const ContactUs = () => {
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
                  <FiMessageCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl font-black text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Contact Us
                </h1>
              </div>
            </div>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
              We're here to help! Reach out using any of the options below and we'll get back to you within 24–48 hours.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mt-6 rounded-full shadow-lg"></div>
          </header>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl">
            {/* Primary Contact Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <ContactCard 
                title="Technical Support"
                subtitle="Get help with technical issues, bugs, and platform questions"
                icon={<Mail className="w-6 h-6" />}
                color="blue"
                href="mailto:support@quizmaster.com"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold">
                    <Mail className="w-4 h-4" />
                    support@quizmaster.com
                  </div>
                  <p className="text-sm text-gray-300">
                    For login issues, payment problems, test series access, and technical support
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    Response within 24 hours
                  </div>
                </div>
              </ContactCard>

              <ContactCard 
                title="General Inquiries"
                subtitle="Business partnerships, feature requests, and general questions"
                icon={<FiMessageCircle className="w-6 h-6" />}
                color="purple"
                href="mailto:hello@quizmaster.com"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold">
                    <Mail className="w-4 h-4" />
                    hello@quizmaster.com
                  </div>
                  <p className="text-sm text-gray-300">
                    For partnerships, content creation, feature suggestions, and business inquiries
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    Response within 48 hours
                  </div>
                </div>
              </ContactCard>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <ContactCard 
                title="Our Location"
                subtitle="Based in India, serving students worldwide"
                icon={<MapPin className="w-6 h-6" />}
                color="green"
              >
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="font-semibold text-white mb-2">QuizMaster Headquarters</div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>South West Delhi</div>
                      <div>New Delhi, India</div>
                      <div className="text-green-400 font-medium">Serving students globally</div>
                    </div>
                  </div>
                </div>
              </ContactCard>

              <ContactCard 
                title="Response Time"
                subtitle="We value your time and respond quickly"
                icon={<Clock className="w-6 h-6" />}
                color="orange"
              >
                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="font-semibold text-white mb-2">Quick Response Guarantee</div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span>24–48 hours</span>
                      </div>
                      <div>Monday to Friday</div>
                      <div className="text-orange-400 font-medium">Emergency support available</div>
                    </div>
                  </div>
                </div>
              </ContactCard>
            </div>

            {/* Additional Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
                <div className="bg-blue-500/20 p-3 rounded-xl inline-block mb-4">
                  <FiGlobe className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-bold mb-2">Website</h4>
                <p className="text-sm text-gray-300 mb-3">Visit our platform</p>
                <a 
                  href="/" 
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Go to QuizMaster
                  <FiArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <div className="bg-green-500/20 p-3 rounded-xl inline-block mb-4">
                  <FiMessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-white font-bold mb-2">Live Chat</h4>
                <p className="text-sm text-gray-300 mb-3">Coming soon</p>
                <span className="text-green-400 font-medium">Real-time support</span>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center">
                <div className="bg-purple-500/20 p-3 rounded-xl inline-block mb-4">
                  <FiPhone className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-bold mb-2">Phone Support</h4>
                <p className="text-sm text-gray-300 mb-3">Coming soon</p>
                <span className="text-purple-400 font-medium">Direct assistance</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center pt-8 border-t border-gray-700/50">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
                <h3 className="text-white font-bold text-2xl mb-4">Ready to Get Started?</h3>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                  Have a question? Don't hesitate to reach out! Our team is here to help you succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:support@quizmaster.com" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Mail className="w-5 h-5" />
                    Email Support
                    <FiArrowRight className="w-4 h-4" />
                  </a>
                  <a 
                    href="mailto:hello@quizmaster.com" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    General Inquiry
                    <FiArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactUs;
