import React, { useState, useEffect } from "react";
// Refined Modern Theme
const themeColors = {
  primary: "rose-600",
  primaryHover: "rose-700",
  secondary: "orange-500",
  secondaryHover: "orange-600",
  accent: "amber-500",
  gradient: "from-rose-600 via-orange-500 to-amber-500",
  bgGradient: "from-rose-500/10 to-orange-500/10"
};
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { PaymentService } from "../../services/paymentService";
import usePopup from "../../hooks/usePopup";
import BeautifulPopup from "../common/BeautifulPopup";

import {
  FiArrowRight,
  FiBook,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
  FiPlus,
  FiStar,
  FiZap,
  FiShield,
  FiCreditCard,
  FiLoader,
  FiActivity,
  FiTarget,
  FiGlobe
} from "react-icons/fi";
import {
  FaBrain,
  FaGraduationCap,
  FaRocket,
  FaTrophy,
  FaUniversity,
  FaBuilding,
  FaLandmark
} from "react-icons/fa";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import ComplaintForm from "../feedback/ComplaintForm";
import RecommendationForm from "../feedback/RecommendationForm";

// --- Anim Components ---

const FadeSlide = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.6,
      delay: delay / 1000,
      ease: [0.22, 1, 0.36, 1], // Custom easy-out
    }}
    viewport={{ once: true, margin: "-50px" }}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerText = ({ text, className = "", delay = 0 }) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay }
    })
  };

  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
    hidden: { opacity: 0, y: 20, transition: { type: "spring", damping: 12, stiffness: 100 } }
  };

  return (
    <motion.div style={{ overflow: "hidden", display: "inline-block" }} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className={className}>
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const TypingEffect = ({ items, currentIndex = 0, className = "" }) => {
  const current = items?.[currentIndex] || { text: "", gradient: "from-gray-500 to-gray-400" };

  return (
    <span className={`inline-block relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`block text-transparent bg-clip-text bg-gradient-to-r ${current.gradient}`}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const HoverCard3D = ({ children, className = "" }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2, z: 10 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
};

const backgroundColors = {
  blue: {
    light: "bg-blue-200/50", dark: "bg-blue-900/40",
    light2: "bg-blue-200/40", dark2: "bg-blue-900/30",
    gridLight: "bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)]",
    gridDark: "bg-[linear-gradient(to_right,#60a5fa20_1px,transparent_1px),linear-gradient(to_bottom,#60a5fa20_1px,transparent_1px)]",
    baseLight: "bg-blue-50", baseDark: "bg-slate-950"
  },
  emerald: {
    light: "bg-emerald-200/50", dark: "bg-emerald-900/40",
    light2: "bg-emerald-200/40", dark2: "bg-emerald-900/30",
    gridLight: "bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)]",
    gridDark: "bg-[linear-gradient(to_right,#34d39920_1px,transparent_1px),linear-gradient(to_bottom,#34d39920_1px,transparent_1px)]",
    baseLight: "bg-emerald-50", baseDark: "bg-slate-950"
  },
  amber: {
    light: "bg-amber-200/50", dark: "bg-amber-900/40",
    light2: "bg-amber-200/40", dark2: "bg-amber-900/30",
    gridLight: "bg-[linear-gradient(to_right,#f59e0b20_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b20_1px,transparent_1px)]",
    gridDark: "bg-[linear-gradient(to_right,#fbbf2420_1px,transparent_1px),linear-gradient(to_bottom,#fbbf2420_1px,transparent_1px)]",
    baseLight: "bg-amber-50", baseDark: "bg-slate-950"
  },
  violet: {
    light: "bg-violet-200/50", dark: "bg-violet-900/40",
    light2: "bg-violet-200/40", dark2: "bg-violet-900/30",
    gridLight: "bg-[linear-gradient(to_right,#8b5cf620_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf620_1px,transparent_1px)]",
    gridDark: "bg-[linear-gradient(to_right,#a78bfa20_1px,transparent_1px),linear-gradient(to_bottom,#a78bfa20_1px,transparent_1px)]",
    baseLight: "bg-violet-50", baseDark: "bg-slate-950"
  },
  rose: {
    light: "bg-rose-200/50", dark: "bg-rose-900/40",
    light2: "bg-rose-200/40", dark2: "bg-rose-900/30",
    gridLight: "bg-[linear-gradient(to_right,#f43f5e20_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e20_1px,transparent_1px)]",
    gridDark: "bg-[linear-gradient(to_right,#fb718520_1px,transparent_1px),linear-gradient(to_bottom,#fb718520_1px,transparent_1px)]",
    baseLight: "bg-rose-50", baseDark: "bg-slate-950"
  },
  orange: {
    light: "bg-orange-200/50", dark: "bg-orange-900/40",
    light2: "bg-orange-200/40", dark2: "bg-orange-900/30",
    gridLight: "bg-[linear-gradient(to_right,#f9731620_1px,transparent_1px),linear-gradient(to_bottom,#f9731620_1px,transparent_1px)]",
    gridDark: "bg-[linear-gradient(to_right,#fb923c20_1px,transparent_1px),linear-gradient(to_bottom,#fb923c20_1px,transparent_1px)]",
    baseLight: "bg-orange-50", baseDark: "bg-slate-950"
  },
};

const BackgroundGrid = ({ isDark, activeColor = "orange" }) => {
  const color = backgroundColors[activeColor] || backgroundColors.orange;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000">
      <div className={`absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] transition-all duration-1000 ${isDark ? color.gridDark : color.gridLight}`} />

      {/* Animated Orbs */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-1000 ${isDark ? color.dark : color.light}`}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, -50, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
        className={`absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? color.dark2 : color.light2}`}
      />
    </div>
  );
};

// --- Data ---

const examTypes = [
  { text: "JEE & BITSAT", gradient: "from-blue-600 to-cyan-500", bg: "blue" },
  { text: "NEET Medical", gradient: "from-emerald-600 to-teal-500", bg: "emerald" },
  { text: "UPSC & PCS", gradient: "from-amber-600 to-orange-500", bg: "amber" },
  { text: "CAT & MBA", gradient: "from-violet-600 to-purple-500", bg: "violet" },
  { text: "SSC & Banking", gradient: "from-rose-600 to-pink-500", bg: "rose" }
];

const featureCards = [
  {
    icon: FaUniversity,
    title: "Exam-Specific Interface",
    desc: "Experience the real NTA/UPSC exam screens. Don't let the UI surprise you on D-Day.",
    color: "blue", // Engineering Blue
    border: "border-blue-500"
  },
  {
    icon: FiTrendingUp,
    title: "AIR Prediction",
    desc: "Compete with lakhs of aspirants. Get realistic All India Rank predictions based on cutoffs.",
    color: "amber", // Competitive Gold/Amber
    border: "border-amber-500"
  },
  {
    icon: FaBrain,
    title: "AI Weakness Hunter",
    desc: "Our AI pinpoints your weak topics and generates custom quizzes to fix them instantly.",
    color: "rose", // Urgent/Important Red
    border: "border-rose-500"
  },
];

const plans = [
  {
    id: "basic",
    name: "Single Exam Pass",
    popular: false,
    priceMonthly: 299,
    priceAnnual: 2999,
    blurb: "Focus on one goal.",
    features: ["Access to 1 Exam Category", "Full Length Mock Tests", "Detailed Solutions", "Basic Analytics"],
  },
  {
    id: "premium",
    name: "All Access Pass",
    popular: true,
    priceMonthly: 499,
    priceAnnual: 4999,
    blurb: "Limitless preparation.",
    features: ["Access ALL Exams (JEE, NEET, UPSC...)", "Unlimited AI Quizzes", "AIR Prediction", "Mentor Support", "Priority Doubt Solving"],
  },
  {
    id: "pro",
    name: "Institute Plan",
    popular: false,
    priceMonthly: 999,
    priceAnnual: 9999,
    blurb: "For coaching centers.",
    features: ["Bulk Student Access", "Custom Branding", "Performance Dashboard", "Create Custom Tests", "API Access"],
  },
];

const WelcomePage = ({ onGetStarted, onCreateSeries }) => {
  const { isAdmin, currentUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { popupState, showError, showSuccess, hidePopup, showInfo } = usePopup();

  const [billing, setBilling] = useState("monthly");
  const [showComplaint, setShowComplaint] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [examinationLogos, setExaminationLogos] = useState([]);
  const [logosLoading, setLogosLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(null);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const q = await getDocs(collection(db, "examinationLogos"));
        setExaminationLogos(q.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLogosLoading(false);
      }
    };
    fetchLogos();
  }, []);

  const [activeExamIndex, setActiveExamIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveExamIndex((prev) => (prev + 1) % examTypes.length);
    }, 3000); // Cycle every 3 seconds
    return () => clearInterval(timer);
  }, []);

  const handlePurchasePlan = async (plan) => {
    // 1. Authentication Check
    if (!currentUser) {
      // Redirect to login with return path
      navigate('/login', { state: { redirectTo: '/welcome' } });
      return;
    }

    setSavingPlan(plan.id);

    try {
      // 2. Load Payment SDK
      const scriptLoaded = await PaymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Secure payment gateway failed to load. Please check your connection.");
      }

      // 3. Create Order
      const orderData = await PaymentService.createRazorpayOrder(
        plan.id,
        currentUser.email,
        currentUser.displayName || 'Valued Customer'
      );

      // 4. Configure Razorpay Options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'QuizMaster',
        description: `${plan.name} Subscription`,
        image: "https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756867651/quizmaster-advertisement-removebg-preview_mfxcyn.png",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 5. Verify Payment on Backend
            const verification = await PaymentService.verifyRazorpayPayment({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planType: plan.id,
              userId: currentUser.uid,
              userEmail: currentUser.email
            });

            if (verification.success) {
              showSuccess(`Welcome to ${plan.name}! Redirecting to dashboard...`, "Payment Successful");
              // 6. Navigate to Dashboard upon success
              setTimeout(() => navigate('/test-series'), 1500);
            } else {
              showError("Payment verification failed. Please contact support.", "Verification Error");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            showError("An error occurred during verification.", "System Error");
          } finally {
            setSavingPlan(null);
          }
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: currentUser.phoneNumber || ''
        },
        theme: {
          color: isDark ? '#3B82F6' : '#2563EB'
        },
        modal: {
          ondismiss: () => setSavingPlan(null)
        }
      };

      // 7. Open Payment Modal
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showError(`Payment Failed: ${response.error.description}`, "Transaction Declined");
        setSavingPlan(null);
      });
      rzp.open();

    } catch (e) {
      console.error('Purchase initiation failed', e);
      // Fallback / Error Handling
      if (e.message && (e.message.includes("Network") || e.message.includes("failed to load"))) {
        showError("Network error. Please check your internet connection.", "Connectivity Issue");
      } else {
        // If backend is unavailable, offer a graceful degradation or info
        showError(e.message || "Could not initiate payment.", "System Error");
      }
      setSavingPlan(null);
    }
  };

  const activeTheme = backgroundColors[examTypes[activeExamIndex].bg];

  const mode = (light, dark) => (isDark ? dark : light);

  return (
    <div className={`min-h-screen relative transition-colors duration-1000 font-sans ${isDark ? activeTheme.baseDark : activeTheme.baseLight}`}>

      <BackgroundGrid isDark={isDark} activeColor={examTypes[activeExamIndex].bg} />

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-20 lg:pt-36 lg:pb-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left z-10 w-full">

              <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1] ${mode("text-slate-900", "text-white")}`}>
                Crack <TypingEffect items={examTypes} currentIndex={activeExamIndex} /> <br />
                <span className={mode("text-slate-900", "text-white")}>
                  With Confidence.
                </span>
              </h1>

              <FadeSlide delay={100}>
                <p className={`text-lg lg:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium ${mode("text-slate-700", "text-slate-400")}`}>
                  One platform for <strong>Engineering, Medical, Civil Services, Banking, & SSC</strong>. Practice with real exam screens, get All India Ranks, and master your weak areas with AI.
                </p>
              </FadeSlide>

              <FadeSlide delay={200}>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGetStarted}
                    className="group relative w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-rose-500/30 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      Start Free Mock Test <FiArrowRight />
                    </span>
                  </motion.button>

                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onCreateSeries}
                      className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg border transition-all ${mode(
                        "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm",
                        "bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
                      )}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <FiPlus /> Manage Content
                      </span>
                    </motion.button>
                  )}
                </div>
              </FadeSlide>

            </div>

            {/* Hero Visual */}
            <FadeSlide delay={400} className="flex-1 relative w-full max-w-lg lg:max-w-none perspective-1000">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className={`relative rounded-3xl p-3 ${mode("bg-white shadow-2xl shadow-rose-500/10 border border-slate-100", "bg-slate-800/50 border border-slate-700 shadow-2xl shadow-black/50")}`}
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                  <img
                    src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756867651/quizmaster-advertisement-removebg-preview_mfxcyn.png"
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating Cards */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className={`absolute bottom-6 right-6 p-4 rounded-xl shadow-lg backdrop-blur-md border ${mode("bg-white/90 border-white", "bg-slate-900/80 border-slate-700")}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-rose-600"><FiActivity /></div>
                      <div>
                        <p className={`text-xs font-bold ${mode("text-slate-800", "text-white")}`}>Weakness Detected</p>
                        <p className="text-[10px] text-slate-500 font-medium">Topic: Thermodynamics</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </FadeSlide>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center max-w-3xl mx-auto mb-20">
            <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-4 ${mode("text-rose-600", "text-rose-400")}`}>
              <FiZap /> Why Choose Us?
            </div>
            <h2 className={`text-3xl lg:text-5xl font-black mb-6 ${mode("text-slate-900", "text-white")}`}>
              Better Preparation. <br /> <span className="text-rose-600">Better Results.</span>
            </h2>
            <p className={`text-xl ${mode("text-slate-700", "text-slate-400")}`}>
              We've built the most comprehensive testing engine that adapts to your exam pattern perfectly.
            </p>
          </FadeSlide>

          <div className="grid md:grid-cols-3 gap-8">
            {featureCards.map((f, i) => (
              <FadeSlide key={i} delay={i * 150}>
                <HoverCard3D className={`h-full p-8 rounded-3xl border-t-4 ${f.border} ${mode("bg-white border-slate-100 shadow-xl shadow-slate-200/50", "bg-slate-800 border-slate-700 shadow-2xl")}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${mode(`bg-${f.color}-50 text-${f.color}-600`, `bg-${f.color}-900/30 text-${f.color}-400`)}`}>
                    <f.icon />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${mode("text-slate-900", "text-white")}`}>{f.title}</h3>
                  <p className={`text-base leading-relaxed ${mode("text-slate-700", "text-slate-400")}`}>{f.desc}</p>

                  {/* Decorative Gradient Blob */}
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${f.color}-500/10 rounded-full blur-2xl group-hover:bg-${f.color}-500/20 transition-colors duration-500`} />
                </HoverCard3D>
              </FadeSlide>
            ))}
          </div>
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-[100px] -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-16">
            <h2 className={`text-3xl lg:text-5xl font-black mb-6 ${mode("text-slate-900", "text-white")}`}>
              Start Your Journey Today.
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${mode("text-slate-600", "text-slate-400")}`}>
              Choose the plan that fits your ambition. Unlock unlimited potential with our AI-driven platform.
            </p>

            {/* Toggle Billing */}
            <div className={`inline-flex p-1.5 rounded-full border ${mode("bg-white border-slate-200 shadow-sm", "bg-slate-900/50 border-slate-800")}`}>
              <button
                onClick={() => setBilling('monthly')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${billing === 'monthly' ? "bg-slate-900 text-white shadow-md dark:bg-slate-700" : mode("text-slate-600 hover:text-slate-900", "text-slate-400 hover:text-white")}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${billing === 'annual' ? "bg-rose-600 text-white shadow-md shadow-rose-500/30" : mode("text-slate-600 hover:text-slate-900", "text-slate-400 hover:text-white")}`}
              >
                Yearly <span className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-slate-900 text-[10px] rounded uppercase tracking-wider">Save 20%</span>
              </button>
            </div>
          </FadeSlide>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {plans.map((p, i) => (
              <FadeSlide key={p.id} delay={i * 150} className={`h-full`}>
                <HoverCard3D className={`relative p-8 rounded-[2rem] h-full flex flex-col border transition-all duration-500 group ${p.popular
                  ? `lg:scale-105 z-10 shadow-2xl ${isDark ? 'bg-slate-800/80 border-rose-500/50 shadow-rose-900/20 backdrop-blur-xl' : 'bg-white border-rose-200 shadow-rose-200/50'}`
                  : `scale-100 z-0 hover:border-slate-300 dark:hover:border-slate-600 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/50 border-slate-200'}`
                  }`}>
                  {p.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-600 to-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-widest uppercase flex items-center gap-2">
                      <FiZap className="fill-current" /> Most Popular
                    </div>
                  )}

                  <div className="mb-8 text-center relative">
                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${mode("text-slate-500", "text-slate-400")}`}>{p.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className={`text-6xl font-black tracking-tight ${mode("text-slate-900", "text-white")}`}>
                        ₹{billing === 'monthly' ? p.priceMonthly : Math.round(p.priceAnnual / 12)}
                      </span>
                      <span className={`font-medium text-lg ${mode("text-slate-500", "text-slate-400")}`}>/mo</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-xs text-rose-500 font-bold animate-pulse">Billed ₹{p.priceAnnual} yearly</p>
                    )}
                    <p className={`text-sm mt-6 font-medium leading-relaxed ${mode("text-slate-600", "text-slate-300")}`}>{p.blurb}</p>
                  </div>

                  <div className={`h-px w-full mb-8 ${mode("bg-slate-100", "bg-slate-700/50")}`} />

                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map((feat, k) => (
                      <li key={k} className="flex items-start gap-3 text-sm font-medium">
                        <div className={`mt-0.5 shrink-0 ${p.popular ? mode("text-rose-500", "text-rose-400") : mode("text-emerald-500", "text-emerald-400")}`}>
                          <FiCheckCircle size={16} />
                        </div>
                        <span className={mode("text-slate-700", "text-slate-300")}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePurchasePlan(p)}
                    disabled={savingPlan === p.id}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${p.popular
                      ? "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-rose-500/30"
                      : mode("bg-white border-2 border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50", "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700")
                      }`}
                  >
                    {savingPlan === p.id ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Get Started Now"
                    )}
                  </motion.button>
                </HoverCard3D>
              </FadeSlide>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className={`py-12 border-t ${mode("bg-white border-slate-200", "bg-slate-950 border-slate-900")}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-70">
          <p className={`font-bold text-xl ${mode("text-slate-900", "text-white")}`}>QuizMaster<span className="text-rose-600">.</span></p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-rose-600 transition-colors">Exam Categories</a>
            <a href="#" className="hover:text-rose-600 transition-colors">Study Material</a>
            <a href="#" className="hover:text-rose-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-rose-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* --- Modals --- */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full shadow-xl hover:scale-105 transition-transform font-medium border border-slate-700"
          >
            <FiBriefcase /> Admin View
          </button>
        </div>
      )}

      {(showComplaint || showRecommendation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${mode("bg-white", "bg-slate-900 border border-slate-800")}`}>
            <button
              onClick={() => { setShowComplaint(false); setShowRecommendation(false); }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
            <div className="p-6">
              {showComplaint && <ComplaintForm />}
              {showRecommendation && <RecommendationForm />}
            </div>
          </div>
        </div>
      )}

      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default WelcomePage;