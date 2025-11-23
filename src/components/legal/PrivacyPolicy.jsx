import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiShield, FiEye, FiLock, FiUsers, FiFileText, FiMail, 
  FiCheckCircle, FiAlertTriangle, FiServer, FiGlobe 
} from 'react-icons/fi';

const PrivacyPolicy = () => {
  const { isDark } = useTheme();
  const updatedAt = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- Styles ---
  const styles = {
    page: isDark ? 'bg-gray-900' : 'bg-slate-50',
    container: isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-slate-200',
    heading: isDark ? 'text-white' : 'text-slate-900',
    body: isDark ? 'text-gray-300' : 'text-slate-600',
    
    card: (color) => `
      p-6 rounded-2xl border transition-all hover:shadow-lg
      ${isDark 
        ? `bg-gray-800/80 border-${color}-500/20 hover:border-${color}-500/40` 
        : `bg-white border-${color}-100 hover:border-${color}-300 shadow-sm`}
    `,
    
    iconBox: (color) => `
      p-3 rounded-xl mb-4 inline-block
      ${isDark ? `bg-${color}-500/10 text-${color}-400` : `bg-${color}-50 text-${color}-600`}
    `
  };

  return (
    <LegalLayout>
      <div className={`min-h-screen py-12 px-4 sm:px-6 ${styles.page}`}>
        <div className="max-w-5xl mx-auto">
          
          <header className="text-center mb-16">
            <div className="inline-block p-4 rounded-full bg-purple-500/10 mb-6">
              <FiShield className="w-12 h-12 text-purple-500" />
            </div>
            <h1 className={`text-4xl md:text-6xl font-black mb-4 ${styles.heading}`}>Privacy Policy</h1>
            <p className={styles.body}>Last Updated: {updatedAt}</p>
          </header>

          <div className={`rounded-3xl border backdrop-blur-sm p-8 md:p-12 ${styles.container}`}>
            
            <div className="prose prose-lg max-w-none mb-12">
              <p className={`text-xl leading-relaxed ${styles.body}`}>
                At <span className="font-bold text-purple-500">QuizMaster</span>, we prioritize your trust. 
                This policy outlines what data we collect, how we secure it, and your rights regarding your information.
              </p>
            </div>

            {/* 1. Data Collection Grid */}
            <section className="mb-16">
              <h2 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${styles.heading}`}>
                <FiEye className="text-purple-500" /> Data We Collect
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <DataCard 
                  icon={FiUsers} color="blue" title="Account Info" styles={styles}
                  items={['Name & Email', 'Profile Preferences', 'Learning Progress']} 
                />
                <DataCard 
                  icon={FiGlobe} color="green" title="Usage Data" styles={styles}
                  items={['Device Information', 'Browser Type', 'Interaction Logs']} 
                />
                <DataCard 
                  icon={FiLock} color="orange" title="Secure Payments" styles={styles}
                  items={['Transaction ID', 'Payment Method (We do not store card details)', 'Billing History']} 
                />
                <DataCard 
                  icon={FiMail} color="purple" title="Communications" styles={styles}
                  items={['Support Tickets', 'Feedback', 'Feature Requests']} 
                />
              </div>
            </section>

            {/* 2. Security Section */}
            <section className="mb-16">
              <h2 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${styles.heading}`}>
                <FiServer className="text-emerald-500" /> How We Protect It
              </h2>
              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                <ul className="grid md:grid-cols-2 gap-4">
                  {['End-to-end Encryption', 'Regular Security Audits', 'Secure Cloud Infrastructure', 'Strict Access Controls'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <FiCheckCircle className="text-emerald-500 flex-shrink-0" />
                      <span className={styles.body}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 3. Sharing & Disclosure */}
            <section className="mb-12">
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${styles.heading}`}>
                <FiFileText className="text-blue-500" /> Information Sharing
              </h2>
              <p className={`mb-6 ${styles.body}`}>
                We do <span className="font-bold text-red-500">not</span> sell your personal data. We only share data when:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
                  <span className={`block font-bold mb-2 ${styles.heading}`}>Legal Compliance</span>
                  <span className={`text-sm ${styles.body}`}>Required by law</span>
                </div>
                <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
                  <span className={`block font-bold mb-2 ${styles.heading}`}>Service Providers</span>
                  <span className={`text-sm ${styles.body}`}>Hosting & Payment</span>
                </div>
                <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
                  <span className={`block font-bold mb-2 ${styles.heading}`}>Protection</span>
                  <span className={`text-sm ${styles.body}`}>Preventing Fraud</span>
                </div>
              </div>
            </section>

            {/* Contact Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className={`mb-6 ${styles.body}`}>Questions about your privacy?</p>
              <a href="mailto:privacy@quizmaster.com" className="text-purple-500 font-bold hover:underline flex items-center justify-center gap-2">
                <FiMail /> privacy@quizmaster.com
              </a>
            </div>

          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

// Sub-component for Grid
const DataCard = ({ icon: Icon, color, title, items, styles }) => (
  <div className={styles.card(color)}>
    <div className={styles.iconBox(color)}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className={`text-lg font-bold mb-4 ${styles.heading}`}>{title}</h3>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className={`text-sm flex items-start gap-2 ${styles.body}`}>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 bg-${color}-400`} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default PrivacyPolicy;