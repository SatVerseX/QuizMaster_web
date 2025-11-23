import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  FiZap
} from "react-icons/fi";
import {
  FaBrain,
  FaGraduationCap,
  FaRocket,
  FaTrophy,
} from "react-icons/fa";

import { motion, useScroll, useTransform } from "framer-motion";

import ComplaintForm from "../feedback/ComplaintForm";
import RecommendationForm from "../feedback/RecommendationForm";
import InfiniteLogoCarousel from "../common/InfiniteLogoCarousel";

// --- UI Components ---

const FadeSlide = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.5,
      delay: delay / 1000,
      ease: [0.25, 0.1, 0.25, 1],
    }}
    viewport={{ once: true, margin: "-50px" }}
    className={className}
  >
    {children}
  </motion.div>
);

const Parallax = ({ children, offset = 50, className = "" }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -offset]);
  return <motion.div style={{ y }} className={className}>{children}</motion.div>;
};

const Badge = ({ children, color = "blue" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-300 border border-${color}-200 dark:border-${color}-800`}>
    {children}
  </span>
);

const BackgroundGrid = ({ isDark }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className={`absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] ${
      isDark 
        ? "bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]" 
        : "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"
    }`} />
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full opacity-20 blur-3xl ${
        isDark ? "bg-blue-900/50" : "bg-blue-200/60"
    }`} />
  </div>
);

// --- Data ---

const featureCards = [
  {
    icon: FaBrain,
    title: "AI-Powered Generation",
    desc: "Instantly generate quizzes from any text or topic using advanced LLMs.",
    color: "blue",
  },
  {
    icon: FiTrendingUp,
    title: "Deep Analytics",
    desc: "Track performance gaps and learning velocity with granular insights.",
    color: "violet",
  },
  {
    icon: FaTrophy,
    title: "Certification System",
    desc: "Automated certificate issuance and verification for professionals.",
    color: "emerald",
  },
];

const plans = [
  {
    id: "basic",
    name: "Starter",
    popular: false,
    priceMonthly: 299,
    priceAnnual: 2999,
    blurb: "Perfect for individuals.",
    features: ["Basic Report Cards", "Email Support", "100 AI Questions/mo", "Standard Analytics"],
  },
  {
    id: "premium",
    name: "Pro",
    popular: true,
    priceMonthly: 499,
    priceAnnual: 4999,
    blurb: "For power users & educators.",
    features: ["Everything in Starter", "Unlimited AI Generation", "Sentiment Analysis", "Custom Branding", "Priority 24/7 Support"],
  },
  {
    id: "standard",
    name: "Team",
    popular: false,
    priceMonthly: 399,
    priceAnnual: 3999,
    blurb: "Collaborate with ease.",
    features: ["Everything in Starter", "Team Dashboards", "Role-based Access", "API Access", "Slack Integration"],
  },
];

const WelcomePage = ({ onGetStarted, onCreateSeries }) => {
  const { isAdmin, currentUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

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

  const handleStartTrial = async (planId) => {
    try {
      if (!currentUser) {
        if (typeof onGetStarted === 'function') onGetStarted();
        else navigate('/');
        return;
      }
      setSavingPlan(planId);
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await (await import('firebase/firestore')).setDoc(
        (await import('firebase/firestore')).doc(db, 'subscriptions', currentUser.uid),
        {
          userId: currentUser.uid,
          planType: planId,
          status: 'active',
          startedAt: new Date(),
          expiresAt: expires,
          source: 'free-trial',
        },
        { merge: true }
      );
      navigate('/series');
    } catch (e) {
      console.error('Start trial failed', e);
      alert('Could not start free trial. Please try again.');
    } finally {
      setSavingPlan(null);
    }
  };

  const mode = (light, dark) => (isDark ? dark : light);

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${mode("bg-slate-50", "bg-slate-950")}`}>
      
      <BackgroundGrid isDark={isDark} />

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <FadeSlide className="flex-1 text-center lg:text-left z-10">
              

              <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] ${mode("text-slate-900", "text-white")}`}>
                Master Any Skill with <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-gradient-x">
                  Intelligent Quizzes
                </span>
              </h1>

              <p className={`text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${mode("text-slate-600", "text-slate-400")}`}>
                Create, share, and analyze assessments in seconds. The all-in-one platform for educators, teams, and lifelong learners.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={onGetStarted}
                  className="group relative w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-yellow-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start For Free <FiArrowRight />
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={onCreateSeries}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold border transition-all hover:-translate-y-1 ${mode(
                      "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm",
                      "bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
                    )}`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FiPlus /> Create Series
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                 <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> No credit card</span>
                 <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> 14-day trial</span>
              </div>
            </FadeSlide>

            {/* Hero Image / Visuals */}
            <FadeSlide delay={200} className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className={`relative rounded-3xl p-2 ${mode("bg-gradient-to-b from-white to-slate-100 shadow-2xl border border-slate-100", "bg-slate-800/50 border border-slate-700/50 shadow-2xl shadow-black/50")}`}>
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                   {/* Abstract UI representation or Image */}
                   <img 
                     src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756867651/quizmaster-advertisement-removebg-preview_mfxcyn.png"
                     alt="Dashboard Preview"
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                   
                   {/* Floating Cards */}
                   <Parallax offset={30} className="absolute top-6 right-6 z-20">
                      <div className={`p-3 rounded-xl shadow-lg backdrop-blur-md border ${mode("bg-white/90 border-white", "bg-slate-900/80 border-slate-700")}`}>
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600"><FiTrendingUp /></div>
                           <div>
                             <p className={`text-xs font-bold ${mode("text-slate-800", "text-white")}`}>Performance</p>
                             <p className="text-[10px] text-emerald-500 font-semibold">+24% vs last week</p>
                           </div>
                        </div>
                      </div>
                   </Parallax>

                   <Parallax offset={-40} className="absolute bottom-6 left-6 z-20">
                      <div className={`p-3 rounded-xl shadow-lg backdrop-blur-md border ${mode("bg-white/90 border-white", "bg-slate-900/80 border-slate-700")}`}>
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600"><FaBrain /></div>
                           <div>
                             <p className={`text-xs font-bold ${mode("text-slate-800", "text-white")}`}>AI Generated</p>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400">Generating questions...</p>
                           </div>
                        </div>
                      </div>
                   </Parallax>
                </div>
              </div>
              
              {/* Decorative glow behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-3xl -z-10 rounded-full" />
            </FadeSlide>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className={`py-20 px-4 sm:px-6 border-y ${mode("bg-white border-slate-100", "bg-slate-900/50 border-slate-800")}`}>
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${mode("text-slate-900", "text-white")}`}>
              Everything you need to <span className="text-blue-600">scale learning</span>
            </h2>
            <p className={`text-lg ${mode("text-slate-600", "text-slate-400")}`}>
              From automated grading to deep analytics, we handle the boring stuff so you can focus on growth.
            </p>
          </FadeSlide>

          <div className="grid md:grid-cols-3 gap-8">
            {featureCards.map((f, i) => (
              <FadeSlide key={i} delay={i * 100}>
                <div className={`h-full p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
                  isDark 
                    ? "bg-slate-800/30 border-slate-700 hover:bg-slate-800 hover:border-blue-500/50" 
                    : "bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-200"
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-colors ${
                    isDark 
                      ? `bg-slate-800 text-${f.color}-400 group-hover:bg-${f.color}-900/30` 
                      : `bg-white text-${f.color}-600 shadow-sm group-hover:bg-${f.color}-50`
                  }`}>
                    <f.icon />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${mode("text-slate-900", "text-white")}`}>{f.title}</h3>
                  <p className={`leading-relaxed ${mode("text-slate-600", "text-slate-400")}`}>{f.desc}</p>
                </div>
              </FadeSlide>
            ))}
          </div>
        </div>
      </section>

      {/* --- Experience / Showcase --- */}
      <section className="py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1">
                <div className="relative">
                   {/* Connected Cards UI */}
                   <motion.div 
                     initial={{ x: -50, opacity: 0 }}
                     whileInView={{ x: 0, opacity: 1 }}
                     transition={{ duration: 0.7 }}
                     className="relative z-10"
                   >
                      <img 
                         src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756869452/Generated_Image_September_03__2025_-_8_34AM-removebg-preview_mhxetl.png"
                         alt="Interactive Learning" 
                         className="w-full max-w-md rounded-2xl shadow-2xl" 
                      />
                   </motion.div>
                   <motion.div 
                     initial={{ x: 50, opacity: 0 }}
                     whileInView={{ x: 0, opacity: 1 }}
                     transition={{ duration: 0.7, delay: 0.2 }}
                     className="relative z-0 -mt-20 ml-20 lg:ml-32"
                   >
                      <img 
                         src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756869452/Generated_Image_September_03__2025_-_8_36AM-removebg-preview_mrlorc.png"
                         alt="Collaborative Learning" 
                         className={`w-full max-w-md rounded-2xl shadow-xl border-4 ${mode("border-white", "border-slate-900")}`} 
                      />
                   </motion.div>
                </div>
             </div>

             <div className="order-1 lg:order-2">
                <FadeSlide>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100  text-purple-700 dark:text-purple-300 text-xs font-bold mb-6 uppercase tracking-wider">
                    <FiStar className="mb-0.5" /> Experience Excellence
                  </div>
                  <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${mode("text-slate-900", "text-white")}`}>
                    Interactive. <br/>Collaborative. <br/><span className="text-purple-600">Unforgettable.</span>
                  </h2>
                  <p className={`text-lg mb-8 leading-relaxed ${mode("text-slate-600", "text-slate-400")}`}>
                    Gone are the days of static PDFs. Engage your audience with real-time feedback loops, multiplayer challenges, and adaptive learning paths that evolve with the user.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "Real-time leaderboard & gamification",
                      "Instant doubt resolution with AI tutors",
                      "Seamless mobile & tablet experience"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                          <FiCheckCircle size={14} />
                        </div>
                        <span className={mode("text-slate-700", "text-slate-300")}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </FadeSlide>
             </div>
          </div>
        </div>
      </section>

      {/* --- Trusted By --- */}
      <section className={`py-16 border-y ${mode("bg-slate-50 border-slate-100", "bg-slate-900/30 border-slate-800")}`}>
        <div className="max-w-7xl mx-auto px-4">
          <p className={`text-center text-sm font-semibold uppercase tracking-widest mb-8 ${mode("text-slate-500", "text-slate-500")}`}>
            Trusted by world-class organizations
          </p>
          {logosLoading ? (
             <div className="h-12 flex items-center justify-center opacity-50">Loading partners...</div>
          ) : (
            <InfiniteLogoCarousel 
              logos={examinationLogos} 
              className="w-full opacity-70 hover:opacity-100 transition-opacity" 
              speed={40} 
            />
          )}
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section className="py-24 px-4 sm:px-6 relative">
        {/* Background glow for pricing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-blue-500/10 blur-[100px] -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-12">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${mode("text-slate-900", "text-white")}`}>
              Simple, transparent pricing
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className={`text-sm font-medium ${billing === 'monthly' ? mode('text-slate-900','text-white') : mode('text-slate-500','text-slate-400')}`}>Monthly</span>
              <button 
                onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ${billing === 'annual' ? 'bg-blue-600' : mode('bg-slate-200', 'bg-slate-700')}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${billing === 'annual' ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium ${billing === 'annual' ? mode('text-slate-900','text-white') : mode('text-slate-500','text-slate-400')}`}>
                Yearly <span className="text-emerald-500 text-xs ml-1 font-bold">-20%</span>
              </span>
            </div>
          </FadeSlide>

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-center">
            {plans.map((p, i) => (
              <FadeSlide key={p.id} delay={i * 100} className={`h-full`}>
                <div className={`relative p-8 rounded-3xl h-full flex flex-col border transition-all duration-300 ${
                  p.popular 
                    ? `lg:scale-105 z-10 shadow-2xl ${isDark ? 'bg-slate-800 border-blue-500/50 shadow-blue-900/20' : 'bg-white border-blue-200 shadow-blue-100'}`
                    : `scale-100 z-0 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`
                }`}>
                  {p.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${mode("text-slate-900", "text-white")}`}>{p.name}</h3>
                    <p className={`text-sm mt-1 ${mode("text-slate-500", "text-slate-400")}`}>{p.blurb}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className={`text-4xl font-bold ${mode("text-slate-900", "text-white")}`}>
                      ₹{billing === 'monthly' ? p.priceMonthly : Math.round(p.priceAnnual / 12)}
                    </span>
                    <span className={mode("text-slate-500", "text-slate-400")}>/mo</span>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {p.features.map((feat, k) => (
                      <li key={k} className="flex items-start gap-3 text-sm">
                        <FiCheckCircle className={`mt-0.5 flex-shrink-0 ${p.popular ? "text-blue-500" : mode("text-slate-400", "text-slate-600")}`} />
                        <span className={mode("text-slate-700", "text-slate-300")}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleStartTrial(p.id)}
                    disabled={savingPlan === p.id}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      p.popular 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5" 
                        : mode("bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50", "bg-slate-800 border-slate-700 text-white hover:bg-slate-700")
                    }`}
                  >
                    {savingPlan === p.id ? 'Processing...' : 'Choose Plan'}
                  </button>
                </div>
              </FadeSlide>
            ))}
          </div>
        </div>
      </section>

      {/* --- Modals & Floaters --- */}
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
    </div>
  );
};

export default WelcomePage;