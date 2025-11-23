import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiFileText, FiShield, FiCreditCard, FiUsers, FiAlertTriangle, 
  FiCheckCircle, FiLock 
} from 'react-icons/fi';

const TermsAndConditions = () => {
  const { isDark } = useTheme();
  const updatedAt = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- Styles ---
  const styles = {
    bg: isDark ? 'bg-gray-900' : 'bg-slate-50',
    container: isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-slate-200',
    headerText: isDark ? 'text-white' : 'text-slate-900',
    bodyText: isDark ? 'text-gray-300' : 'text-slate-600',
    
    sectionTitle: `text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`,
    
    card: `p-6 rounded-2xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`,
    
    list: `space-y-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`
  };

  return (
    <LegalLayout>
      <div className={`min-h-screen py-12 px-4 ${styles.bg}`}>
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 rounded-2xl bg-indigo-600 text-white mb-6 shadow-lg shadow-indigo-500/30">
              <FiFileText className="w-8 h-8" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-black mb-4 ${styles.headerText}`}>Terms of Service</h1>
            <p className={styles.bodyText}>Effective Date: {updatedAt}</p>
          </div>

          {/* Main Document */}
          <div className={`rounded-3xl border p-8 md:p-12 ${styles.container}`}>
            
            {/* Intro */}
            <div className="mb-10">
              <p className={`text-lg leading-relaxed ${styles.bodyText}`}>
                Welcome to <span className="font-bold text-indigo-500">QuizMaster</span>. By accessing our website, 
                you agree to be bound by these terms. Please read them carefully before using our services.
              </p>
            </div>

            {/* 1. Accounts */}
            <section className="mb-10">
              <h2 className={styles.sectionTitle}>
                <FiUsers className="text-indigo-500" /> 1. Account Terms
              </h2>
              <div className={styles.card}>
                <ul className={styles.list}>
                  <ListItem text="You must provide accurate and complete registration information." />
                  <ListItem text="You are responsible for maintaining the security of your password." />
                  <ListItem text="One account per user; account sharing is strictly prohibited." />
                </ul>
              </div>
            </section>

            {/* 2. Payments */}
            <section className="mb-10">
              <h2 className={styles.sectionTitle}>
                <FiCreditCard className="text-purple-500" /> 2. Payments & Subscriptions
              </h2>
              <div className={styles.card}>
                <p className={`mb-4 ${styles.bodyText}`}>
                  Services are billed on a subscription basis. You agree to pay all fees associated with your plan.
                </p>
                <ul className={styles.list}>
                  <ListItem text="Payments are processed securely via Razorpay." />
                  <ListItem text="Subscriptions auto-renew unless cancelled 24h before the period ends." />
                  <ListItem text="Refunds are governed by our Refund Policy." />
                </ul>
              </div>
            </section>

            {/* 3. Acceptable Use */}
            <section className="mb-10">
              <h2 className={styles.sectionTitle}>
                <FiShield className="text-emerald-500" /> 3. Acceptable Use
              </h2>
              <div className={styles.card}>
                <p className={`mb-4 font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  You agree NOT to:
                </p>
                <ul className={styles.list}>
                  <ListItem icon={FiAlertTriangle} color="text-red-500" text="Copy, distribute, or disclose any part of the service." />
                  <ListItem icon={FiAlertTriangle} color="text-red-500" text="Use automated systems (bots) to access the service." />
                  <ListItem icon={FiAlertTriangle} color="text-red-500" text="Attempt to decipher, decompile, or reverse engineer the platform." />
                </ul>
              </div>
            </section>

            {/* 4. Termination */}
            <section className="mb-10">
              <h2 className={styles.sectionTitle}>
                <FiLock className="text-orange-500" /> 4. Termination
              </h2>
              <p className={`leading-relaxed ${styles.bodyText}`}>
                We may terminate or suspend access to our Service immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            {/* Footer */}
            <div className="border-t pt-8 border-gray-200 dark:border-gray-700 text-center">
              <p className={`text-sm ${styles.bodyText}`}>
                For legal inquiries, please contact <a href="mailto:legal@quizmaster.com" className="text-indigo-500 font-bold hover:underline">legal@quizmaster.com</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

// Helper for list items
const ListItem = ({ text, icon: Icon = FiCheckCircle, color = "text-indigo-500" }) => (
  <li className="flex items-start gap-3">
    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
    <span>{text}</span>
  </li>
);

export default TermsAndConditions;