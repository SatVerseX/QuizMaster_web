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
    initial={{ opacity: 0, y: 20, scale: 0.99 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.3,
      delay: delay / 1000,
      ease: [0.22, 1, 0.36, 1],
    }}
    viewport={{ once: false, amount: 0.15 }}
    className={className}
  >
    {children}
  </motion.div>
);

const Parallax = ({ children, start = 0, end = 60 }) => {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  return <motion.div style={{ y }}>{children}</motion.div>;
};

const Stagger = ({ items, render, baseDelay = 0 }) =>
  items.map((item, i) => (
    <FadeSlide key={i} delay={baseDelay + i * 25}>
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
        "bg-gradient-to-br from-gray-900 via-blue-900/5 to-purple-900/5"
      )}
    >
      {/* Hero Section - Reduced padding and spacing */}
      <section
        className={`py-10 lg:py-12 px-3 sm:px-5 lg:px-6 relative transition-opacity duration-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 right-20 w-60 h-60 rounded-full blur-2xl animate-pulse ${mode(
              "bg-blue-400/4",
              "bg-blue-500/6"
            )}`}
          />
          <div
            className={`absolute bottom-20 left-20 w-60 h-60 rounded-full blur-2xl animate-pulse delay-1000 ${mode(
              "bg-indigo-400/3",
              "bg-purple-500/6"
            )}`}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Text Column - Reduced spacing */}
            <FadeSlide delay={100} className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold mb-5 leading-tight tracking-tight">
                <span
                  className={`text-transparent bg-clip-text ${mode(
                    "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600",
                    "bg-gradient-to-r from-white via-blue-200 to-purple-200"
                  )}`}
                >
                  Transform Learning with
                </span>
                <div className="mt-2 flex items-center justify-center lg:justify-start">
                  
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
                className={`text-base lg:text-lg mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed ${mode(
                  "text-slate-600",
                  "text-gray-300"
                )}`}
              >
                Create intelligent assessments, track progress with advanced
                analytics and deliver exceptional learning experiences with our
                AI-powered platform.
              </p>

              {/* CTA Buttons - Reduced padding and spacing */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={onGetStarted}
                  className={`flex justify-center group relative w-full sm:w-auto px-5 py-2.5 font-semibold rounded-lg shadow-md transition-all duration-200 hover:scale-103 text-sm hover:cursor-pointer ${mode(
                    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/20",
                    "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white hover:shadow-blue-500/15"
                  )}`}
                >
                  <span className="relative flex items-center gap-2">
                    Get Started
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={onCreateSeries}
                    className={`group relative w-full sm:w-auto px-5 py-2.5 font-semibold rounded-lg border-2 shadow-md transition-all duration-200 hover:scale-103 text-sm hover:cursor-pointer ${mode(
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
                <div className="relative rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
                  <img
                    src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756867651/quizmaster-advertisement-removebg-preview_mfxcyn.png"
                    alt="QuizMaster Professional Advertisement"
                    className="w-full h-auto object-contain rounded-2xl"
                    style={{ maxHeight: '500px' }}
                  />
                  
                  {/* Subtle overlay for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/3 to-transparent pointer-events-none"></div>
                </div>

                {/* Floating Elements for Visual Appeal */}
                <Parallax>
                  <div
                    className={`absolute -top-3 -right-3 p-2.5 rounded-xl border shadow-md rotate-6 backdrop-blur-sm ${mode(
                      "bg-white border-orange-200/50 shadow-orange-200/20",
                      "bg-gradient-to-br from-orange-500/8 to-red-500/8 border-orange-500/25"
                    )}`}
                  >
                    <FaGraduationCap
                      className={`w-5 h-5 ${mode(
                        "text-orange-600",
                        "text-orange-400"
                      )}`}
                    />
                  </div>
                </Parallax>
                
                <Parallax start={0} end={-60}>
                  <div
                    className={`absolute -bottom-3 -left-3 p-2.5 rounded-xl border shadow-md -rotate-6 backdrop-blur-sm ${mode(
                      "bg-white border-blue-200/50 shadow-blue-200/20",
                      "bg-gradient-to-br from-blue-500/8 to-purple-500/8 border-blue-500/25"
                    )}`}
                  >
                    <FaRocket
                      className={`w-5 h-5 ${mode(
                        "text-blue-600",
                        "text-blue-400"
                      )}`}
                    />
                  </div>
                </Parallax>

                
              </div>
            </FadeSlide>
          </div>
        </div>
      </section>

      {/* Features Section - Reduced padding */}
      <section className="py-10 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-10">
            <h2
              className={`text-2xl lg:text-3xl font-semibold mb-3 tracking-tight ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Enterprise-Grade Features
            </h2>
            <p
              className={`text-base max-w-2xl mx-auto ${mode(
                "text-slate-600",
                "text-gray-300"
              )}`}
            >
              Powerful tools for education, corporate training and professional
              development.
            </p>
          </FadeSlide>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Stagger
              items={featureCards}
              baseDelay={40}
              render={(f) => (
                <div
                  className={`group p-5 rounded-xl border transition-all duration-200 ${
                    isDark
                      ? `bg-gray-800/40 border-gray-700/40 hover:border-${f.color}-500/40 hover:shadow-${f.color}-500/15`
                      : `bg-${f.color}-500/8 border-slate-200/50 hover:border-${f.color}-300/50 hover:shadow-${f.color}-300/15`
                  }`}
                >
                  <div className="text-center">
                    <span
                      className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 mx-auto transition-colors ${
                        isDark
                          ? `bg-${f.color}-500/15 text-${f.color}-400 group-hover:bg-${f.color}-500/25`
                          : `bg-white text-${f.color}-600 group-hover:bg-${f.color}-200/50`
                      }`}
                    >
                      <f.icon className="w-6 h-6" />
                    </span>
                    <h3
                      className={`text-lg font-semibold mb-2 ${mode(
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
      <section className="py-12 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-12">
            <h2
              className={`text-2xl lg:text-3xl font-semibold mb-3 tracking-tight ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Experience Learning Excellence
            </h2>
            <p
              className={`text-base max-w-2xl mx-auto ${mode(
                "text-slate-600",
                "text-gray-300"
              )}`}
            >
              Discover how QuizMaster transforms education through interactive learning and collaborative experiences.
            </p>
          </FadeSlide>

          <div className="relative">
            {/* Professional Learning Journey Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left Column - Interactive Study Session */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: false, amount: 0.3 }}
                className="relative"
              >
                <div className="relative transition-all duration-200 hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative mb-5">
                    <img
                      src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756869452/Generated_Image_September_03__2025_-_8_34AM-removebg-preview_mhxetl.png"
                      alt="Interactive Study Session - QuizMaster Learning"
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className={`text-xl font-semibold mb-2 ${mode("text-slate-800", "text-white")}`}>
                      Interactive Learning
                    </h3>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Collaborative Learning */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: false, amount: 0.3 }}
                className="relative"
              >
                <div className="relative transition-all duration-200 hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative mb-5">
                    <img
                      src="https://res.cloudinary.com/dn9rqfdyg/image/upload/v1756869452/Generated_Image_September_03__2025_-_8_36AM-removebg-preview_mrlorc.png"
                      alt="Collaborative Learning Environment - QuizMaster"
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className={`text-xl font-semibold mb-2 ${mode("text-slate-800", "text-white")}`}>
                      Collaborative Environment
                    </h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Professional Connection Element */}
            <div className="flex justify-center mt-10">
              <div className={`relative px-6 py-3 rounded-full border backdrop-blur-sm ${mode(
                "bg-white border-emerald-200/50 shadow-md",
                "bg-gradient-to-r from-emerald-500/8 to-green-500/8 border-emerald-500/25 shadow-md"
              )}`}>
                <div className="flex items-center gap-2">
                  <FiArrowRight className={`w-4 h-4 ${mode("text-emerald-600", "text-emerald-400")}`} />
                  <span className={`font-semibold text-sm ${mode("text-emerald-700", "text-emerald-300")}`}>
                    Seamless Learning Journey
                  </span>
                  <FiArrowRight className={`w-4 h-4 ${mode("text-emerald-600", "text-emerald-400")}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Examination Logos - Infinite Carousel */}
      <section className="py-8 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-8">
            <h3
              className={`text-xl lg:text-2xl font-semibold mb-2 ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Trusted by Leading Examination Bodies
            </h3>
            <p
              className={`text-xs ${mode(
                "text-slate-600",
                "text-gray-400"
              )}`}
            >
              Join thousands of students preparing for competitive exams
            </p>
          </FadeSlide>

          {logosLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              speed={30}
            />
          )}
        </div>
      </section>

      {/* Pricing Section - More compact */}
      <section className="py-10 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeSlide className="text-center mb-10">
            <h2
              className={`text-2xl lg:text-3xl font-semibold mb-3 ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Choose Your Plan
            </h2>
          </FadeSlide>

          {/* Billing Toggle - Reduced spacing */}
          <div className="flex justify-center mb-8">
            <div
              className={`flex items-center p-1 rounded-lg border ${mode(
                "bg-white border-slate-200 shadow-md",
                "bg-gray-800 border-gray-700"
              )}`}
            >
              {["monthly", "annual"].map((b, i) => (
                <button
                  key={i}
                  onClick={() => setBilling(b)}
                  className={`px-4 py-2 rounded-md font-semibold text-xs transition-colors hover:cursor-pointer ${
                    billing === b
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <Stagger
              items={plans}
              baseDelay={40}
              render={(p) => (
                <div
                  className={`group relative p-5 rounded-xl border flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                    isDark
                      ? `bg-gray-800/40 border-gray-700/40 ${
                          p.popular
                            ? "hover:border-orange-500/40 hover:shadow-orange-500/15"
                            : "hover:border-blue-500/40 hover:shadow-blue-500/15"
                        }`
                      : `bg-white border-slate-200/50 ${
                          p.popular
                            ? "hover:border-orange-300/50 hover:shadow-orange-300/15"
                            : "hover:border-blue-300/50 hover:shadow-blue-300/15"
                        }`
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        🔥 Most popular
                      </span>
                    </div>
                  )}

                  <div className="text-center flex-1">
                    <h3
                      className={`text-lg font-semibold mb-2 ${mode(
                        "text-slate-800",
                        "text-white"
                      )}`}
                    >
                      {p.name}
                    </h3>
                    <div className="mb-4">
                      <div
                        className={`text-2xl font-semibold ${mode(
                          "text-slate-800",
                          "text-white"
                        )}`}
                      >
                        ₹
                        {billing === "monthly" ? p.priceMonthly : p.priceAnnual}
                      </div>
                      <div className={mode("text-slate-500", "text-gray-400") + " text-xs"}>
                        {billing === "monthly" ? "user/month" : "user/year"}
                      </div>
                    </div>
                    <p
                      className={
                        mode("text-slate-600", "text-gray-300") + " mb-5 text-sm"
                      }
                    >
                      {p.blurb}
                    </p>

                    <ul
                      className={`space-y-1.5 mb-5 text-left ${mode(
                        "text-slate-600",
                        "text-gray-300"
                      )}`}
                    >
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FiCheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-3">
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-103 hover:cursor-pointer ${
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
          <div className="text-center mt-6">
            <p className={mode("text-slate-500", "text-gray-400") + " text-xs"}>
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              {["No Setup Fees", "Instant Access", "Secure Payment"].map(
                (txt, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 ${mode(
                      "text-slate-500",
                      "text-gray-400"
                    )}`}
                  >
                    <FiCheckCircle className="w-3 h-3 text-blue-500" />
                    <span>{txt}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Dashboard Button - Smaller and refined */}
      {isAdmin && (
        <Parallax start={0} end={-30}>
          <div className="fixed z-50 top-3 right-5">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className={`px-4 py-2 rounded-full font-semibold text-xs shadow-md hover:scale-103 transition-all duration-200 border-2 hover:cursor-pointer ${mode(
                "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
                "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-white/60 hover:from-cyan-600 hover:to-teal-500"
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
            className={`rounded-lg shadow-lg p-5 relative w-full max-w-lg mx-4 ${mode(
              "bg-white border border-slate-200",
              "bg-gray-800 border border-gray-700"
            )}`}
          >
            <button
              onClick={() => setShowComplaint(false)}
              aria-label="Close"
              className={`absolute top-3 right-3 text-xl hover:cursor-pointer ${mode(
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
            className={`rounded-lg shadow-lg p-5 relative w-full max-w-lg mx-4 ${mode(
              "bg-white border border-slate-200",
              "bg-gray-800 border border-gray-700"
            )}`}
          >
            <button
              onClick={() => setShowRecommendation(false)}
              aria-label="Close"
              className={`absolute top-3 right-3 text-xl hover:cursor-pointer ${mode(
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
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
