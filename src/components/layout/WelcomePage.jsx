import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { PaymentService } from "../../services/paymentService";
import usePopup from "../../hooks/usePopup";
import BeautifulPopup from "../common/BeautifulPopup";
import quizmasterLogo from "../../assets/quizmaster-logo.png";
import heroImage from "../../assets/hero-image.png";
import footerImage from "../../assets/footer-image.png";
import featureGlowImage from "../../assets/1.png";
import examCardImage from "../../assets/2.png";
import orbitImage from "../../assets/3.png";
import cloudImage from "../../assets/4-Photoroom.png";
import chooseQuizImage from "../../assets/5-Photoroom.png";
import answerQuestionsImage from "../../assets/6 (1).png";
import scoreClimbImage from "../../assets/7 (1).png";
import dashedArrowImage from "../../assets/8 (1).png";

import {
  FiArrowRight,
  FiTrendingUp,
  FiBriefcase,
  FiCheckCircle,
  FiZap,
  FiLoader,
  FiFileText,
  FiSearch,
  FiEdit3
} from "react-icons/fi";
import {
  FaBrain,
  FaUniversity,
  FaCrown
} from "react-icons/fa";

import { motion } from "framer-motion";

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

// --- Decorative Components ---
const DotGrid = ({ className = "", rows = 5, cols = 5, color = "bg-blue-400/40" }) => (
  <div className={`grid gap-1.5 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <div key={i} className={`w-1.5 h-1.5 rounded-full ${color}`} />
    ))}
  </div>
);

// --- Data ---

const plans = [
  {
    id: "basic",
    name: "Single Exam Pass",
    icon: FiFileText,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300",
    accentClass: "bg-blue-500",
    blobClass: "bg-blue-500/10",
    popular: false,
    priceMonthly: 299,
    priceAnnual: 2999,
    blurb: "Focus on one goal.",
    features: ["Access to 1 Exam Category", "Full Length Mock Tests", "Detailed Solutions", "Basic Analytics"],
  },
  {
    id: "premium",
    name: "All Access Pass",
    icon: FaCrown,
    iconClass: "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300",
    accentClass: "bg-amber-400",
    blobClass: "bg-violet-500/10",
    popular: true,
    priceMonthly: 499,
    priceAnnual: 4999,
    blurb: "Limitless preparation.",
    features: ["Access ALL Exams (JEE, NEET, UPSC...)", "Unlimited AI Quizzes", "AIR Prediction", "Mentor Support", "Priority Doubt Solving"],
  },
  {
    id: "pro",
    name: "Institute Plan",
    icon: FaUniversity,
    iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
    accentClass: "bg-amber-500",
    blobClass: "bg-amber-500/10",
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
  const { popupState, showError, showSuccess, hidePopup } = usePopup();

  const [billing, setBilling] = useState("monthly");
  const [showComplaint, setShowComplaint] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [savingPlan, setSavingPlan] = useState(null);

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
        image: quizmasterLogo,
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

  const mode = (light, dark) => (isDark ? dark : light);

  return (
    <div className={`min-h-screen relative font-sans overflow-hidden ${isDark ? 'bg-[#05081f]' : 'bg-white'}`}>

      {/* --- Hero Section --- */}
      <section className="relative min-h-[690px] lg:min-h-[720px] overflow-hidden bg-[#03051a] text-white">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,26,0.98)_0%,rgba(5,8,31,0.92)_24%,rgba(6,8,34,0.58)_48%,rgba(6,8,34,0.08)_100%)] lg:bg-[linear-gradient(90deg,rgba(3,5,26,0.98)_0%,rgba(5,8,31,0.9)_33%,rgba(6,8,34,0.18)_62%,rgba(6,8,34,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-[#05081f]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <nav className="flex items-center justify-between h-20">
            <button onClick={onGetStarted} className="flex items-center gap-1 leading-none">
              <img src={quizmasterLogo} alt="" className="w-12 h-12 object-contain rounded-full -ml-2" />
              <span className="text-[28px] font-black tracking-normal leading-none translate-y-[1px]">Quiz<span className="text-[#a855f7]">Master</span></span>
            </button>

          </nav>

          <div className="pt-20 lg:pt-28 max-w-[620px]">
            <h1 className="text-[52px] sm:text-[68px] lg:text-[78px] font-black leading-[1.02] tracking-normal">
              <span className="block text-white">Learn. Play.</span>
              <span className="block">
                <span className="text-[#a855f7]">Win.</span>{" "}
                <span className="text-[#facc15]">Repeat.</span>
              </span>
            </h1>

            <p className="mt-8 max-w-[520px] text-[17px] leading-8 text-white/85 font-medium">
              QuizMaster is your ultimate destination for fun, interactive quizzes. Challenge yourself, compete with others, and become a true Quiz Master!
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <button
                onClick={onGetStarted}
                className="px-9 py-4 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white font-black text-lg shadow-xl shadow-purple-950/40 flex items-center gap-3 hover:brightness-110 transition"
              >
                Start Quizzing Now <FiArrowRight />
              </button>

              {isAdmin && (
                <button
                  onClick={onCreateSeries}
                  className="px-7 py-4 rounded-2xl border border-white/15 bg-white/10 text-white font-bold backdrop-blur-md hover:bg-white/15 transition flex items-center gap-2"
                >
                  <FiBriefcase /> Manage Content
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="relative z-10 overflow-hidden bg-white py-16 px-4 sm:px-6">

        <div className="relative max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="relative min-h-[280px] rounded-2xl border border-violet-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(124,58,237,0.1)] overflow-hidden">
              <div className="w-14 h-14 rounded-xl bg-violet-100/80 text-violet-600 flex items-center justify-center text-3xl mb-10">
                <FaUniversity />
              </div>
              <img src={examCardImage} alt="" className="absolute top-12 right-5 w-36 opacity-75" />
              <h3 className="relative z-10 text-xl font-black text-slate-950 mb-3">Exam-Specific Interface</h3>
              <div className="w-10 h-1 rounded-full bg-violet-600 mb-4" />
              <p className="relative z-10 text-sm leading-6 text-slate-600 max-w-[300px]">
                Experience the real NTA/UPSC exam screens. Don’t let the UI surprise you on D-Day.
              </p>
            </div>

            <div className="relative min-h-[280px] rounded-2xl border border-violet-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(124,58,237,0.1)] overflow-hidden">
              <div className="w-14 h-14 rounded-xl bg-amber-100/80 text-amber-500 flex items-center justify-center text-3xl mb-10">
                <FiTrendingUp />
              </div>
              <div className="absolute top-10 right-10 w-44 h-28">
                <div className="absolute bottom-2 left-6 w-5 h-10 bg-amber-100 rounded-t-md" />
                <div className="absolute bottom-2 left-14 w-5 h-16 bg-amber-200 rounded-t-md" />
                <div className="absolute bottom-2 left-[5.5rem] w-5 h-20 bg-amber-300 rounded-t-md" />
                <div className="absolute bottom-2 left-32 w-5 h-28 bg-amber-400 rounded-t-md" />
                <div className="absolute right-4 top-1 w-3 h-3 rounded-full bg-amber-400" />
                <div className="absolute left-0 top-14 w-36 h-18 border-t-3 border-amber-300 rounded-[100%] rotate-[-18deg] opacity-70" />
              </div>
              <h3 className="relative z-10 text-xl font-black text-slate-950 mb-3">AIR Prediction</h3>
              <div className="w-10 h-1 rounded-full bg-amber-400 mb-4" />
              <p className="relative z-10 text-sm leading-6 text-slate-600 max-w-[300px]">
                Compete with lakhs of aspirants. Get realistic All India Rank predictions based on cutoffs.
              </p>
            </div>

            <div className="relative min-h-[280px] rounded-2xl border border-violet-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(124,58,237,0.1)] overflow-hidden">
              <div className="w-14 h-14 rounded-xl bg-pink-100/80 text-pink-500 flex items-center justify-center text-3xl mb-10">
                <FaBrain />
              </div>
              <img src={orbitImage} alt="" className="absolute top-10 right-6 w-40 opacity-75" />
              <h3 className="relative z-10 text-xl font-black text-slate-950 mb-3">AI Weakness Hunter</h3>
              <div className="w-10 h-1 rounded-full bg-pink-500 mb-4" />
              <p className="relative z-10 text-sm leading-6 text-slate-600 max-w-[300px]">
                Our AI pinpoints your weak topics and generates custom quizzes to fix them instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section className="relative overflow-hidden bg-white py-16 px-4 sm:px-6">
        {/* Shared Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black leading-none text-slate-950">How It Works</h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-1.5 w-[58px] rounded-full bg-violet-600" />
            <div className="h-2 w-2 rounded-full bg-violet-500" />
          </div>
          <p className="mt-3 text-sm sm:text-base font-medium text-slate-600">
            Simple steps to smarter practice and better results.
          </p>
        </div>

        {/* Mobile: Vertical stacked cards */}
        <div className="md:hidden flex flex-col gap-6 max-w-sm mx-auto">
          {[
            { num: "1", title: "Choose a Quiz", desc: "Pick your exam track and practice format.", icon: <FiSearch />, bg: "bg-violet-600", iconBg: "bg-violet-100", iconText: "text-violet-600", accent: "bg-violet-600" },
            { num: "2", title: "Answer Questions", desc: "Train inside a focused, realistic test flow.", icon: <FiEdit3 />, bg: "bg-amber-400", iconBg: "bg-amber-100", iconText: "text-amber-500", accent: "bg-amber-400" },
            { num: "3", title: "Score & Climb", desc: "Review ranks, streaks, accuracy, and weak topics.", icon: <FiTrendingUp />, bg: "bg-pink-500", iconBg: "bg-pink-100", iconText: "text-pink-500", accent: "bg-pink-500" },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full ${step.bg} text-base font-black text-white shadow-lg`}>{step.num}</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex-1 shadow-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.iconBg} ${step.iconText} text-2xl mb-3`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-1">{step.title}</h3>
                <div className={`w-8 h-1 rounded-full ${step.accent} mb-2`} />
                <p className="text-sm leading-6 text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Original absolute-positioned layout */}
        <div className="hidden md:block relative mx-auto aspect-[1711/919] w-full max-w-[1200px] min-h-[440px]">
          <img src={dashedArrowImage} alt="" className="absolute left-[32.1%] top-[35%] z-20 w-[5.4%] opacity-75" />
          <img src={dashedArrowImage} alt="" className="absolute left-[61.6%] top-[35%] z-20 w-[5.4%] opacity-75" />

          <div className="absolute left-[20.05%] top-[18%] z-30 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-violet-600 text-[30px] font-black text-white shadow-xl shadow-violet-500/30">1</div>
          <div className="absolute left-[7.5%] top-[18%] h-[70%] w-[25.1%] overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-[0_20px_50px_rgba(124,58,237,0.12)]">
            <div className="absolute left-[24%] top-[17%] z-20 flex h-[80px] w-[80px] items-center justify-center rounded-[20px] bg-violet-100 text-[64px] text-violet-600">
              <FiSearch />
            </div>
            <img src={chooseQuizImage} alt="" className="absolute left-[51%] top-[12%] z-10 w-[37%] opacity-62 rotate-[7deg]" />
            <h3 className="absolute inset-x-0 top-[53.4%] text-[clamp(18px,1.6vw,26px)] font-black text-slate-950">Choose a Quiz</h3>
            <div className="absolute left-1/2 top-[65.2%] h-1.5 w-[50px] -translate-x-1/2 rounded-full bg-violet-600" />
            <p className="absolute left-1/2 top-[72.5%] w-[72%] -translate-x-1/2 text-[clamp(13px,1.1vw,18px)] leading-[1.45] text-slate-600">
              Pick your exam track and practice format.
            </p>
            <img src={cloudImage} alt="" className="absolute bottom-[-5%] right-[-2%] w-[42%] opacity-95 pointer-events-none" />
          </div>

          <div className="absolute left-[49.55%] top-[18%] z-30 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-[30px] font-black text-white shadow-xl shadow-amber-400/30">2</div>
          <div className="absolute left-[37%] top-[18%] h-[70%] w-[25.1%] overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-[0_20px_50px_rgba(124,58,237,0.12)]">
            <div className="absolute left-[24%] top-[17%] z-20 flex h-[80px] w-[80px] items-center justify-center rounded-[20px] bg-amber-100 text-[64px] text-amber-500">
              <FiEdit3 />
            </div>
            <img src={answerQuestionsImage} alt="" className="absolute left-[53%] top-[8%] z-10 w-[39%] opacity-72 rotate-[7deg]" />
            <h3 className="absolute inset-x-0 top-[53.4%] text-[clamp(18px,1.6vw,26px)] font-black text-slate-950">Answer Questions</h3>
            <div className="absolute left-1/2 top-[65.2%] h-1.5 w-[50px] -translate-x-1/2 rounded-full bg-amber-400" />
            <p className="absolute left-1/2 top-[72.5%] w-[74%] -translate-x-1/2 text-[clamp(13px,1.1vw,18px)] leading-[1.45] text-slate-600">
              Train inside a focused, realistic test flow.
            </p>
            <img src={cloudImage} alt="" className="absolute bottom-[-5%] right-[-2%] w-[42%] opacity-95 pointer-events-none hue-rotate-[40deg] saturate-[0.7]" />
          </div>

          <div className="absolute left-[78.95%] top-[18%] z-30 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pink-500 text-[30px] font-black text-white shadow-xl shadow-pink-400/30">3</div>
          <div className="absolute left-[66.4%] top-[18%] h-[70%] w-[25.1%] overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-[0_20px_50px_rgba(124,58,237,0.12)]">
            <div className="absolute left-[24%] top-[17%] z-20 flex h-[80px] w-[80px] items-center justify-center rounded-[20px] bg-pink-100 text-[64px] text-pink-500">
              <FiTrendingUp />
            </div>
            <img src={scoreClimbImage} alt="" className="absolute left-[51%] top-[11%] z-10 w-[38%] opacity-70 rotate-[7deg]" />
            <h3 className="absolute inset-x-0 top-[53.4%] text-[clamp(18px,1.6vw,26px)] font-black text-slate-950">Score & Climb</h3>
            <div className="absolute left-1/2 top-[65.2%] h-1.5 w-[50px] -translate-x-1/2 rounded-full bg-pink-500" />
            <p className="absolute left-1/2 top-[72.5%] w-[78%] -translate-x-1/2 text-[clamp(13px,1.1vw,18px)] leading-[1.45] text-slate-600">
              Review ranks, streaks, accuracy, and weak topics.
            </p>
            <img src={cloudImage} alt="" className="absolute bottom-[-5%] right-[-2%] w-[42%] opacity-95 pointer-events-none hue-rotate-[75deg] saturate-[1.15]" />
          </div>
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section className={`py-16 px-4 sm:px-6 relative overflow-hidden ${mode("bg-white", "bg-[#05081f]")}`}>


        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-16">
            <h2 className={`text-2xl lg:text-4xl font-black mb-4 ${mode("text-slate-900", "text-white")}`}>
              Start Your <span className="text-violet-600">Journey</span> Today.
            </h2>
            <p className={`text-base mb-6 max-w-2xl mx-auto ${mode("text-slate-600", "text-slate-400")}`}>
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
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${billing === 'annual' ? "bg-violet-600 text-white shadow-md shadow-violet-500/30" : mode("text-slate-600 hover:text-slate-900", "text-slate-400 hover:text-white")}`}
              >
                Yearly <span className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-slate-900 text-[10px] rounded uppercase tracking-wider">Save 20%</span>
              </button>
            </div>
          </FadeSlide>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
            {plans.map((p, i) => (
              <FadeSlide key={p.id} delay={i * 150} className={`h-full`}>
                <HoverCard3D className={`relative p-7 rounded-2xl h-full flex flex-col border transition-all duration-500 group ${p.popular
                  ? `lg:scale-105 z-10 shadow-2xl overflow-visible ${isDark ? 'bg-slate-800/80 border-violet-500/50 shadow-violet-900/20 backdrop-blur-xl' : 'bg-white border-violet-200 shadow-violet-200/50'}`
                  : `scale-100 z-0 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/50 border-slate-200'}`
                  }`}>
                  {p.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-violet-500/30 tracking-widest uppercase flex items-center gap-2">
                      <FiZap className="fill-current" /> Most Popular
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-5 ${p.iconClass}`}>
                    <p.icon />
                  </div>

                  <div className="mb-5 relative">
                    <h3 className={`text-[11px] font-semibold uppercase tracking-[0.15em] mb-4 ${mode("text-slate-400", "text-slate-500")}`}>{p.name}</h3>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className={`text-3xl font-extrabold tracking-tight ${mode("text-slate-900", "text-white")}`}>
                        ₹{billing === 'monthly' ? p.priceMonthly : Math.round(p.priceAnnual / 12)}
                      </span>
                      <span className={`font-normal text-sm ${mode("text-slate-400", "text-slate-500")}`}>/mo</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-xs text-violet-500 font-medium mt-1">Billed ₹{p.priceAnnual} yearly</p>
                    )}
                    <div className={`w-8 h-[3px] rounded-full mt-4 mb-4 ${p.accentClass}`} />
                    <p className={`text-[13px] font-normal leading-[1.7] ${mode("text-slate-400", "text-slate-500")}`}>{p.blurb}</p>
                  </div>

                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.features.map((feat, k) => (
                      <li key={k} className="flex items-start gap-2.5 text-[13px]">
                        <div className={`mt-0.5 shrink-0 ${p.popular ? mode("text-violet-400", "text-violet-300") : mode("text-violet-400", "text-violet-400")}`}>
                          <FiCheckCircle size={14} />
                        </div>
                        <span className={`font-normal leading-relaxed ${mode("text-slate-500", "text-slate-400")}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePurchasePlan(p)}
                    disabled={savingPlan === p.id}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${p.popular
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/25"
                      : mode("bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100", "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700")
                      }`}
                  >
                    {savingPlan === p.id ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" /> Processing...
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

      {/* --- Footer CTA --- */}
      <section className={`px-4 sm:px-6 pb-0 ${mode("bg-white", "bg-[#05081f]")}`}>
        <div className="max-w-7xl mx-auto">
          <FadeSlide>
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 shadow-2xl shadow-violet-900/20">
              <button onClick={onGetStarted} className="block w-full h-[190px] sm:h-[220px] lg:h-[250px]">
                <img
                  src={footerImage}
                  alt="Ready to become a Quiz Master? Sign up for free."
                  className="w-full h-full object-cover object-[center_56%]"
                />
              </button>
            </div>
          </FadeSlide>
        </div>
      </section>

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
              ×
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


