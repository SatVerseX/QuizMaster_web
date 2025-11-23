import React from 'react';
import LegalLayout from '../layout/LegalLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiRefreshCw, FiClock, FiCreditCard, FiAlertTriangle, 
  FiMail, FiCheckCircle, FiXCircle, FiArrowRight, 
  FiShield, FiDollarSign 
} from 'react-icons/fi';

const RefundPolicy = () => {
  const { isDark } = useTheme();
  const updatedAt = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- Style Configuration ---
  const styles = {
    pageBackground: isDark 
      ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' 
      : 'bg-gradient-to-br from-slate-50 via-white to-slate-50',
    
    card: isDark 
      ? 'bg-gray-900/60 border-gray-700/50 backdrop-blur-xl shadow-2xl' 
      : 'bg-white/80 border-slate-200/60 backdrop-blur-xl shadow-2xl',

    text: {
      primary: isDark ? 'text-white' : 'text-slate-800',
      secondary: isDark ? 'text-gray-300' : 'text-slate-600',
      muted: isDark ? 'text-gray-400' : 'text-slate-500'
    },

    // Dynamic Color Variants for Sections/Cards
    variant: (color) => {
      const themes = {
        blue: isDark ? { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', iconBg: 'bg-blue-500/20' } 
                     : { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
        green: isDark ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' }
                      : { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        red: isDark ? { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', iconBg: 'bg-rose-500/20' }
                    : { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-100' },
        orange: isDark ? { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-500/20' }
                       : { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100' },
      };
      return themes[color] || themes.blue;
    }
  };

  return (
    <LegalLayout>
      <div className={`min-h-screen py-12 lg:py-16 px-4 sm:px-6 transition-all duration-500 ${styles.pageBackground}`}>
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <header className="mb-16 text-center relative">
            <div className={`absolute inset-0 blur-3xl opacity-30 rounded-full mx-auto w-2/3 h-32 ${isDark ? 'bg-blue-600' : 'bg-blue-300'}`}></div>
            <h1 className="relative text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Cancellations & Refunds
            </h1>
            <p className={`relative text-lg ${styles.text.muted}`}>
              Last updated: <span className="font-semibold">{updatedAt}</span>
            </p>
          </header>

          {/* Main Content */}
          <div className={`rounded-3xl border p-8 md:p-12 ${styles.card}`}>
            
            {/* Guarantee Banner */}
            <div className={`rounded-2xl p-8 mb-12 border ${styles.variant('green').bg} ${styles.variant('green').border}`}>
              <div className="flex gap-6 items-start">
                <div className={`p-3 rounded-xl ${styles.variant('green').iconBg}`}>
                  <FiCheckCircle className={`w-8 h-8 ${styles.variant('green').text}`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${styles.text.primary}`}>Satisfaction Guarantee</h3>
                  <p className={`text-lg leading-relaxed ${styles.text.secondary}`}>
                    We want you to be satisfied with your purchase. If you're not happy with your subscription, 
                    we offer refunds under specific conditions outlined below.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Eligibility Section */}
            <Section title="Refund Eligibility" icon={FiCheckCircle} color="green" styles={styles}>
              <div className="grid md:grid-cols-2 gap-6">
                <InfoCard 
                  title="7-Day Window" 
                  desc="Request a full refund within 7 days of purchase. No questions asked for valid requests."
                  icon={FiClock} color="green" styles={styles}
                />
                <InfoCard 
                  title="Usage Limit" 
                  desc="Refunds are void if more than 50% of content is consumed or downloaded."
                  icon={FiAlertTriangle} color="orange" styles={styles}
                />
              </div>
            </Section>

            {/* 2. Process Section */}
            <Section title="How to Request" icon={FiRefreshCw} color="blue" styles={styles}>
              <div className={`rounded-2xl p-6 border ${styles.variant('blue').bg} ${styles.variant('blue').border}`}>
                <div className="space-y-4">
                  <ProcessStep number="1" text="Email support@quizmaster.com with your order details." styles={styles} />
                  <ProcessStep number="2" text="State your reason for the refund request." styles={styles} />
                  <ProcessStep number="3" text="We will review within 24-48 hours." styles={styles} />
                  <ProcessStep number="4" text="Approved refunds are credited in 3-5 business days." styles={styles} />
                </div>
              </div>
            </Section>

            {/* 3. Exceptions */}
            <Section title="Exceptions" icon={FiShield} color="red" styles={styles}>
              <div className="grid md:grid-cols-1 gap-4">
                <InfoCard 
                  title="Non-Refundable Items" 
                  desc="Account sharing, abuse of platform, or violation of terms voids all refund rights immediately."
                  icon={FiXCircle} color="red" styles={styles}
                />
              </div>
            </Section>

            {/* Contact */}
            <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700 text-center">
              <h3 className={`text-2xl font-bold mb-4 ${styles.text.primary}`}>Need Assistance?</h3>
              <a 
                href="mailto:support@quizmaster.com" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-transform hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                <FiMail className="w-5 h-5" /> Contact Support
              </a>
            </div>

          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

// --- Sub Components ---

const Section = ({ title, icon: Icon, color, children, styles }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg ${styles.variant(color).iconBg}`}>
        <Icon className={`w-6 h-6 ${styles.variant(color).text}`} />
      </div>
      <h2 className={`text-2xl font-bold ${styles.text.primary}`}>{title}</h2>
    </div>
    {children}
  </section>
);

const InfoCard = ({ title, desc, icon: Icon, color, styles }) => (
  <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${styles.variant(color).bg} ${styles.variant(color).border}`}>
    <div className="flex gap-4">
      <div className={`p-2 rounded-lg h-fit ${isDark(styles) ? 'bg-black/20' : 'bg-white/60'}`}>
        <Icon className={`w-5 h-5 ${styles.variant(color).text}`} />
      </div>
      <div>
        <h4 className={`font-bold mb-2 ${styles.text.primary}`}>{title}</h4>
        <p className={`text-sm leading-relaxed ${styles.text.secondary}`}>{desc}</p>
      </div>
    </div>
  </div>
);

const ProcessStep = ({ number, text, styles }) => (
  <div className="flex items-center gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <p className={styles.text.secondary}>{text}</p>
  </div>
);

// Helper to detect dark mode from style prop for sub-components
const isDark = (s) => s.text.primary === 'text-white';

export default RefundPolicy;