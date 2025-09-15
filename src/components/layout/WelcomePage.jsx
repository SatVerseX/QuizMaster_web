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
} from "react-icons/fi";
import {
  FaBrain,
  FaGraduationCap,
  FaRocket,
  FaPuzzlePiece,
  FaTrophy,
} from "react-icons/fa";

import { motion, useScroll, useTransform } from "framer-motion";

import ComplaintForm from "../feedback/ComplaintForm";
import RecommendationForm from "../feedback/RecommendationForm";
import InfiniteLogoCarousel from "../common/InfiniteLogoCarousel";

const FadeSlide = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.4,
      delay: delay / 1000,
      ease: [0.22, 1, 0.36, 1],
    }}
    viewport={{ once: false, amount: 0.15 }}
    className={className}
  >
    {children}
  </motion.div>
);

const Parallax = ({ children, start = 0, end = 80 }) => {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  return <motion.div style={{ y }}>{children}</motion.div>;
};

const Stagger = ({ items, render, baseDelay = 0 }) =>
  items.map((item, i) => (
    <FadeSlide key={i} delay={baseDelay + i * 30}>
      {render(item, i)}
    </FadeSlide>
  ));

const featureCards = [
  {
    icon: FaBrain,
    title: "AI-Powered Assessment Generation",
    desc: "",
    color: "blue",
  },
  {
    icon: FiTrendingUp,
    title: "Advanced Analytics Dashboard",
    desc: "",
    color: "purple",
  },
  {
    icon: FaTrophy,
    title: "Enterprise Certification System",
    desc: "",
    color: "emerald",
  },
];

const trustMetrics = [
  { icon: FiUsers, value: "50,000+", label: "Active Learners", color: "blue" },
  { icon: FiBook, value: "10,000+", label: "Assessments", color: "purple" },
  { icon: FiBriefcase, value: "1,500+", label: "Educators", color: "green" },
  {
    icon: FiCheckCircle,
    value: "2.5M+",
    label: "Tests Completed",
    color: "yellow",
  },
];

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    popular: false,
    priceMonthly: 299,
    priceAnnual: 2999,
    blurb: "Essential tools to hit your goals.",
    features: [
      "Essential support ticket management",
      "Access to basic analytics & reports",
      "Email and chat support",
      "Core CRM integration",
      "24/5 customer support",
      "User-friendly onboarding",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    popular: true,
    priceMonthly: 499,
    priceAnnual: 4999,
    blurb: "Our most popular, full-power experience.",
    features: [
      "Everything in Standard, plus:",
      "AI-driven insights and recommendations",
      "Dedicated account manager",
      "Real-time sentiment analysis",
      "Customisable dashboards & reports",
      "24/7 customer support",
    ],
  },
  {
    id: "standard",
    name: "Standard Plan",
    popular: false,
    priceMonthly: 399,
    priceAnnual: 3999,
    blurb: "Grow faster with advanced capabilities.",
    features: [
      "Everything in Basic, plus:",
      "Advanced analytics & reporting",
      "Multi-channel support",
      "Customisable automation workflows",
      "Priority response times",
      "24/7 customer support",
    ],
  },
];

const WelcomePage = ({ onGetStarted, onCreateSeries }) => {
  const { isAdmin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [billing, setBilling] = useState("monthly");
  const [showComplaint, setShowComplaint] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [examinationLogos, setExaminationLogos] = useState([]);
  const [logosLoading, setLogosLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchExaminationLogos();
  }, []);

  const fetchExaminationLogos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "examinationLogos"));
      const logosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExaminationLogos(logosData);
    } catch (error) {
      console.error("Error fetching examination logos:", error);
      setExaminationLogos([]);
    } finally {
      setLogosLoading(false);
    }
  };

  const mode = (light, dark) => (isDark ? dark : light);

  return (
    <div
      className={mode(
        "bg-white",
        "bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10"
      )}
    >
      {/* Hero Section - Reduced padding and spacing */}
      <section
        className={`py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative transition-opacity duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl animate-pulse ${mode(
              "bg-blue-400/6",
              "bg-blue-500/8"
            )}`}
          />
          <div
            className={`absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse delay-1000 ${mode(
              "bg-indigo-400/4",
              "bg-purple-500/8"
            )}`}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Column - Reduced spacing */}
            <FadeSlide delay={100} className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight tracking-tight">
                <span
                  className={`text-transparent bg-clip-text ${mode(
                    "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600",
                    "bg-gradient-to-r from-white via-blue-200 to-purple-200"
                  )}`}
                >
                  Transform Learning with
                </span>
                <div className="mt-2 flex items-center justify-center lg:justify-start">
                  <div
                    className={`p-2.5 mr-3 rounded-xl shadow-lg ${mode(
                      "bg-gradient-to-br from-orange-500 to-red-600",
                      "bg-gradient-to-br from-orange-500 to-red-600"
                    )}`}
                  >
                    <FaPuzzlePiece className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <span
                    className={`text-transparent bg-clip-text ${mode(
                      "bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500",
                      "bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500"
                    )}`}
                  >
                    QuizMaster
                  </span>
                </div>
              </h1>

              <p
                className={`text-lg lg:text-xl mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed ${mode(
                  "text-slate-600",
                  "text-gray-300"
                )}`}
              >
                Create intelligent assessments, track progress with advanced
                analytics and deliver exceptional learning experiences with our
                AI-powered platform.
              </p>

              {/* CTA Buttons - Reduced padding and spacing */}
              <div className="flex  flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={onGetStarted}
                  className={`flex justify-center group relative w-full sm:w-auto px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 text-base  ${mode(
                    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25",
                    "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white hover:shadow-blue-500/20"
                  )}`}
                >
                  <span className="relative flex  items-center gap-2">
                    Get Started
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={onCreateSeries}
                    className={`group relative w-full sm:w-auto px-6 py-3 font-semibold rounded-xl border-2 shadow-lg transition-all duration-200 hover:scale-105 text-base ${mode(
                      "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
                      "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white border-emerald-500/40"
                    )}`}
                  >
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Create Series
                    </span>
                  </button>
                )}
              </div>
            </FadeSlide>

            {/* Professional QuizMaster Advertisement Image */}
            <FadeSlide delay={200} className="flex-1 relative">
              <div className="relative">
                {/* Main Advertisement Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756867651/quizmaster-advertisement-removebg-preview_mfxcyn.png"
                    alt="QuizMaster Professional Advertisement"
                    className="w-full h-auto object-contain rounded-3xl"
                    style={{ maxHeight: '600px' }}
                  />
                  
                  {/* Subtle overlay for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                </div>

                {/* Floating Elements for Visual Appeal */}
                <Parallax>
                  <div
                    className={`absolute -top-4 -right-4 p-3 rounded-2xl border shadow-lg rotate-6 backdrop-blur-sm ${mode(
                      "bg-white border-orange-200/60 shadow-orange-200/30",
                      "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30"
                    )}`}
                  >
                    <FaGraduationCap
                      className={`w-6 h-6 ${mode(
                        "text-orange-600",
                        "text-orange-400"
                      )}`}
                    />
                  </div>
                </Parallax>
                
                <Parallax start={0} end={-80}>
                  <div
                    className={`absolute -bottom-4 -left-4 p-3 rounded-2xl border shadow-lg -rotate-6 backdrop-blur-sm ${mode(
                      "bg-white border-blue-200/60 shadow-blue-200/30",
                      "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30"
                    )}`}
                  >
                    <FaRocket
                      className={`w-6 h-6 ${mode(
                        "text-blue-600",
                        "text-blue-400"
                      )}`}
                    />
                  </div>
                </Parallax>

                {/* Trust Indicators */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { icon: FiUsers, val: "50K+", lab: "Active Users", c: "blue" },
                    { icon: FiBook, val: "10K+", lab: "Assessments", c: "purple" },
                    { icon: FiAward, val: "4.9★", lab: "Rating", c: "yellow" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 border transition-transform hover:scale-105 ${
                        isDark
                          ? `bg-gray-800/50 border-gray-700/50`
                          : `bg-white border-slate-200/60 shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <s.icon
                          className={`w-4 h-4 ${
                            isDark ? `text-${s.c}-400` : `text-${s.c}-600`
                          }`}
                        />
                        <div>
                          <div
                            className={`font-bold text-sm ${
                              isDark ? `text-${s.c}-300` : `text-${s.c}-700`
                            }`}
                          >
                            {s.val}
                          </div>
                          <div
                            className={`text-xs ${
                              isDark ? `text-${s.c}-200` : `text-${s.c}-600`
                            }`}
                          >
                            {s.lab}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSlide>
          </div>
        </div>
      </section>

      {/* Features Section - Reduced padding */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    <FadeSlide className="text-center mb-12">
      <h2
        className={`text-3xl lg:text-4xl font-bold mb-4 tracking-tight ${mode(
          "text-slate-800",
          "text-white"
        )}`}
      >
        Enterprise-Grade Features
      </h2>
      <p
        className={`text-lg max-w-2xl mx-auto ${mode(
          "text-slate-600",
          "text-gray-300"
        )}`}
      >
        Powerful tools for education, corporate training and professional
        development.
      </p>
    </FadeSlide>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Stagger
        items={featureCards}
        baseDelay={50}
        render={(f) => (
          <div
            className={`group p-6 rounded-2xl border transition-all duration-300 ${
              isDark
                ? `bg-gray-800/50 border-gray-700/50 hover:border-${f.color}-500/50 hover:shadow-${f.color}-500/20`
                : `bg-${f.color}-500/10 border-slate-200/60 hover:border-${f.color}-300/60 hover:shadow-${f.color}-300/20`
            }`}
          >
            <div className="text-center">
              <span
                className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-5 mx-auto transition-colors ${
                  isDark
                    ? `bg-${f.color}-500/20 text-${f.color}-400 group-hover:bg-${f.color}-500/30`
                    : `bg-white text-${f.color}-600 group-hover:bg-${f.color}-200/60`
                }`}
              >
                <f.icon className="w-7 h-7" />
              </span>
              <h3
                className={`text-xl font-bold mb-3 ${mode(
                  `text-${f.color}-700`,
                  "text-white"
                )}`}
              >
                {f.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${mode(
                  "text-slate-600",
                  "text-gray-300"
                )}`}
              >
                {f.description}
              </p>
            </div>
          </div>
        )}
      />
    </div>
  </div>
</section>


      {/* Professional Learning Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-16">
            <h2
              className={`text-3xl lg:text-4xl font-bold mb-4 tracking-tight ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Experience Learning Excellence
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${mode(
                "text-slate-600",
                "text-gray-300"
              )}`}
            >
              Discover how QuizMaster transforms education through interactive learning and collaborative experiences.
            </p>
          </FadeSlide>

          <div className="relative">
            {/* Professional Learning Journey Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Interactive Study Session */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, amount: 0.3 }}
                className="relative"
              >
                <div className="relative transition-all duration-300 hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative mb-6">
                    <img
                      src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756869452/Generated_Image_September_03__2025_-_8_34AM-removebg-preview_mhxetl.png"
                      alt="Interactive Study Session - QuizMaster Learning"
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '350px' }}
                    />
                    

                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className={`text-2xl font-bold mb-3 ${mode("text-slate-800", "text-white")}`}>
                      Interactive Learning
                    </h3>
                    
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Collaborative Learning */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: false, amount: 0.3 }}
                className="relative"
              >
                <div className="relative transition-all duration-300 hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative mb-6">
                    <img
                      src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756869452/Generated_Image_September_03__2025_-_8_36AM-removebg-preview_mrlorc.png"
                      alt="Collaborative Learning Environment - QuizMaster"
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '350px' }}
                    />
                    

                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className={`text-2xl font-bold mb-3 ${mode("text-slate-800", "text-white")}`}>
                      Collaborative Environment
                    </h3>
                    
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Professional Connection Element */}
            <div className="flex justify-center mt-12">
              <div className={`relative px-8 py-4 rounded-full border backdrop-blur-sm ${mode(
                "bg-white border-emerald-200/60 shadow-lg",
                "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30 shadow-lg"
              )}`}>
                <div className="flex items-center gap-3">
                  <FiArrowRight className={`w-5 h-5 ${mode("text-emerald-600", "text-emerald-400")}`} />
                  <span className={`font-semibold ${mode("text-emerald-700", "text-emerald-300")}`}>
                    Seamless Learning Journey
                  </span>
                  <FiArrowRight className={`w-5 h-5 ${mode("text-emerald-600", "text-emerald-400")}`} />
                </div>
              </div>
            </div>






          </div>
        </div>
      </section>

      {/* Trust Metrics - More compact layout */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className={`py-8 border-t ${mode(
              "border-slate-200",
              "border-gray-800"
            )}`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <Stagger
                items={trustMetrics}
                render={(m) => (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border transition-colors ${
                        isDark
                          ? `bg-${m.color}-500/10 border-${m.color}-500/30`
                          : `bg-white border-${m.color}-200/60 shadow-sm`
                      }`}
                    >
                      <m.icon
                        className={`w-7 h-7 ${
                          isDark ? `text-${m.color}-400` : `text-${m.color}-600`
                        }`}
                      />
                    </div>
                    <div
                      className={`text-2xl font-bold ${mode(
                        "text-slate-800",
                        "text-white"
                      )}`}
                    >
                      {m.value}
                    </div>
                    <div
                      className={`text-sm ${mode(
                        "text-slate-600",
                        "text-gray-400"
                      )}`}
                    >
                      {m.label}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Examination Logos - Infinite Carousel */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-10">
            <h3
              className={`text-2xl lg:text-3xl font-bold mb-3 ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Trusted by Leading Examination Bodies
            </h3>
            <p
              className={`text-sm ${mode(
                "text-slate-600",
                "text-gray-400"
              )}`}
            >
              Join thousands of students preparing for competitive exams
            </p>
          </FadeSlide>

          {logosLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <InfiniteLogoCarousel 
              logos={examinationLogos.length > 0 ? examinationLogos : []}
              className="w-full"
              onLogoClick={(logo) => {
                if (logo.websiteUrl) {
                  window.open(logo.websiteUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              showNames={true}
              speed={35}
            />
          )}
        </div>
      </section>

      {/* Pricing Section - More compact */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-12">
            <h2
              className={`text-3xl lg:text-4xl font-bold mb-4 ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Choose Your Plan
            </h2>
            
          </FadeSlide>

          {/* Billing Toggle - Reduced spacing */}
          <div className="flex justify-center mb-10">
            <div
              className={`flex items-center p-1 rounded-xl border ${mode(
                "bg-white border-slate-200 shadow-lg",
                "bg-gray-800 border-gray-700"
              )}`}
            >
              {["monthly", "annual"].map((b, i) => (
                <button
                  key={i}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    billing === b
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : mode(
                          "text-slate-600 hover:text-slate-800",
                          "text-gray-400 hover:text-white"
                        )
                  }`}
                >
                  {b === "monthly" ? "Monthly billing" : "Annual billing"}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards - Reduced padding and spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Stagger
              items={plans}
              baseDelay={50}
              render={(p) => (
                <div
                  className={`group relative p-6 rounded-2xl border flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    isDark
                      ? `bg-gray-800/50 border-gray-700/50 ${
                          p.popular
                            ? "hover:border-orange-500/50 hover:shadow-orange-500/20"
                            : "hover:border-blue-500/50 hover:shadow-blue-500/20"
                        }`
                      : `bg-white border-slate-200/60 ${
                          p.popular
                            ? "hover:border-orange-300/60 hover:shadow-orange-300/20"
                            : "hover:border-blue-300/60 hover:shadow-blue-300/20"
                        }`
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        🔥 Most popular
                      </span>
                    </div>
                  )}

                  <div className="text-center flex-1">
                    <h3
                      className={`text-xl font-bold mb-3 ${mode(
                        "text-slate-800",
                        "text-white"
                      )}`}
                    >
                      {p.name}
                    </h3>
                    <div className="mb-5">
                      <div
                        className={`text-3xl font-bold ${mode(
                          "text-slate-800",
                          "text-white"
                        )}`}
                      >
                        ₹
                        {billing === "monthly" ? p.priceMonthly : p.priceAnnual}
                      </div>
                      <div className={mode("text-slate-500", "text-gray-400")}>
                        {billing === "monthly" ? "user/month" : "user/year"}
                      </div>
                    </div>
                    <p
                      className={
                        mode("text-slate-600", "text-gray-300") + " mb-6"
                      }
                    >
                      {p.blurb}
                    </p>

                    <ul
                      className={`space-y-2 mb-6 text-left ${mode(
                        "text-slate-600",
                        "text-gray-300"
                      )}`}
                    >
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FiCheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      className={`w-full py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                        p.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : mode(
                              "bg-white border-2 border-blue-300 text-blue-600 hover:bg-blue-50",
                              "bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                            )
                      }`}
                    >
                      Start Free Trial
                    </button>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Pricing Footnote - Reduced spacing */}
          <div className="text-center mt-8">
            <p className={mode("text-slate-500", "text-gray-400") + " text-sm"}>
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-6 mt-3 text-sm">
              {["No Setup Fees", "Instant Access", "Secure Payment"].map(
                (txt, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 ${mode(
                      "text-slate-500",
                      "text-gray-400"
                    )}`}
                  >
                    <FiCheckCircle className="w-4 h-4 text-blue-500" />
                    <span>{txt}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section moved to Footer */}

      {/* Admin Dashboard Button - Smaller and refined */}
      {isAdmin && (
        <Parallax start={0} end={-40}>
          <div className="fixed z-50 top-4 right-6">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:scale-105 transition-all duration-200 border-2 ${mode(
                "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
                "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-white/70 hover:from-cyan-600 hover:to-teal-500"
              )}`}
            >
              Admin Dashboard
            </button>
          </div>
        </Parallax>
      )}

      {/* Modal Components - Unchanged */}
      {showComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`rounded-xl shadow-2xl p-6 relative w-full max-w-lg mx-4 ${mode(
              "bg-white border border-slate-200",
              "bg-gray-800 border border-gray-700"
            )}`}
          >
            <button
              onClick={() => setShowComplaint(false)}
              aria-label="Close"
              className={`absolute top-4 right-4 text-2xl ${mode(
                "text-gray-500 hover:text-gray-800",
                "text-gray-400 hover:text-white"
              )}`}
            >
              ×
            </button>
            <ComplaintForm />
          </div>
        </div>
      )}
      {showRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`rounded-xl shadow-2xl p-6 relative w-full max-w-lg mx-4 ${mode(
              "bg-white border border-slate-200",
              "bg-gray-800 border border-gray-700"
            )}`}
          >
            <button
              onClick={() => setShowRecommendation(false)}
              aria-label="Close"
              className={`absolute top-4 right-4 text-2xl ${mode(
                "text-gray-500 hover:text-gray-800",
                "text-gray-400 hover:text-white"
              )}`}
            >
              ×
            </button>
            <RecommendationForm />
          </div>
        </div>
      )}

      {/* CSS Animations - Optimized timing */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

      `}</style>
    </div>
  );
};

export default WelcomePage;
