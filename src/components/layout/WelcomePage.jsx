import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

import {
  FiArrowRight,
  FiBook,
  FiCpu,
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

const FadeSlide = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.6,
      delay: delay / 1000,
      ease: [0.22, 1, 0.36, 1],
    }}
    viewport={{ once: false, amount: 0.15 }}
    className={className}
  >
    {children}
  </motion.div>
);

const Parallax = ({ children, start = 0, end = 120 }) => {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  return <motion.div style={{ y }}>{children}</motion.div>;
};

const Stagger = ({ items, render, baseDelay = 0 }) =>
  items.map((item, i) => (
    <FadeSlide key={i} delay={baseDelay + i * 40}>
      {render(item, i)}
    </FadeSlide>
  ));

const featureCards = [
  {
    icon: FaBrain,
    title: "AI-Powered Assessment Generation",
    desc: "Adapts questions to learning objectives and skill levels.",
    color: "blue",
  },
  {
    icon: FiTrendingUp,
    title: "Advanced Analytics Dashboard",
    desc: "Deep performance insights and predictive analytics.",
    color: "purple",
  },
  {
    icon: FaTrophy,
    title: "Enterprise Certification System",
    desc: "Blockchain-verified certificates and badges.",
    color: "emerald",
  },
];

const trustMetrics = [
  { icon: FiUsers, value: "50 000+", label: "Active Learners", color: "blue" },
  { icon: FiBook, value: "10 000+", label: "Assessments", color: "purple" },
  { icon: FiBriefcase, value: "1 500+", label: "Educators", color: "green" },
  {
    icon: FiCheckCircle,
    value: "2.5 M+",
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

  useEffect(() => setMounted(true), []);

  const mode = (light, dark) => (isDark ? dark : light);

  return (
    <div
      className={mode(
        "bg-white",
        "bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10"
      )}
    >
      <section
        className={`section-padding relative transition-opacity duration-[1200ms] ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${mode(
              "bg-blue-400/8",
              "bg-blue-500/10"
            )}`}
          />
          <div
            className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${mode(
              "bg-indigo-400/6",
              "bg-purple-500/10"
            )}`}
          />
          <div
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${mode(
              "bg-blue-300/5",
              "bg-orange-500/10"
            )}`}
          />
        </div>

        <div className="container-responsive relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* ------------- text column ------------- */}
            <FadeSlide delay={200} className="flex-1 text-center lg:text-left">
              

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight">
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
                    className={`p-3 mr-4 rounded-xl shadow-lg ${mode(
                      "bg-gradient-to-br from-orange-500 to-red-600",
                      "bg-gradient-to-br from-orange-500 to-red-600"
                    )}`}
                  >
                    <FaPuzzlePiece className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
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
                className={`text-lg lg:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium ${mode(
                  "text-slate-600",
                  "text-gray-300"
                )}`}
              >
                Create intelligent assessments, track progress with advanced
                analytics and deliver exceptional learning experiences with our
                AI-powered platform.
              </p>

              {/* call to action */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={onGetStarted}
                  className={`group relative w-full sm:w-auto px-8 py-4 font-semibold rounded-xl shadow-lg transition-transform hover:scale-105 text-lg ${mode(
                    "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30",
                    "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white hover:shadow-blue-500/25"
                  )}`}
                >
                  <span className="relative flex items-center gap-3">
                    Get Started{" "}
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-[4px]" />
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={onCreateSeries}
                    className={`group relative w-full sm:w-auto px-8 py-4 font-semibold rounded-xl border-2 shadow-lg transition-transform hover:scale-105 text-lg ${mode(
                      "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
                      "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white border-emerald-500/40"
                    )}`}
                  >
                    <span className="relative flex items-center gap-3">
                      <FiPlus className="w-5 h-5" />
                      Create Series
                    </span>
                  </button>
                )}
              </div>

              
            </FadeSlide>

            {/* ------------- visual card ------------- */}
            <FadeSlide delay={400} className="flex-1 relative">
              <div
                className={`relative p-6 sm:p-8 rounded-2xl border backdrop-blur-sm ${mode(
                  "bg-white border-slate-200/60 hover:shadow-slate-300/20",
                  "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 hover:shadow-blue-500/10"
                )}`}
              >
                {/* quiz preview */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-xl border ${mode(
                        "bg-white border-blue-200/60 shadow-sm",
                        "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30"
                      )}`}
                    >
                      <FaBrain
                        className={`w-6 h-6 ${mode(
                          "text-blue-600",
                          "text-blue-400"
                        )}`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold ${mode(
                        "text-slate-800",
                        "text-white"
                      )}`}
                    >
                      Advanced Physics Assessment
                    </h3>
                  </div>

                  <div
                    className={`rounded-xl p-6 border ${mode(
                      "bg-white border-slate-200/60 shadow-sm",
                      "bg-gray-800/60 border-gray-700/50"
                    )}`}
                  >
                    <p
                      className={`mb-4 font-medium ${mode(
                        "text-slate-700",
                        "text-gray-300"
                      )}`}
                    >
                      What is the fundamental unit of force in the International
                      System of Units?
                    </p>
                    <div className="space-y-3">
                      {[
                        "A. Newton (N)",
                        "B. Joule (J)",
                        "C. Watt (W)",
                        "D. Pascal (Pa)",
                      ].map((opt, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border cursor-pointer transition-transform hover:scale-[1.02] ${
                            idx === 0
                              ? mode(
                                  "bg-blue-50 border-blue-300/60 text-blue-700",
                                  "bg-blue-600/30 border-blue-500/50 text-blue-200"
                                )
                              : mode(
                                  "bg-white border-slate-200/60 hover:border-blue-300/60 text-slate-700",
                                  "bg-gray-700/70 border-gray-600/50 hover:border-blue-500/50 text-gray-200"
                                )
                          }`}
                        >
                          <span className="text-sm font-medium">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex justify-between mb-2 text-sm font-medium">
                      <span className={mode("text-slate-500", "text-gray-400")}>
                        Question 1 of 25
                      </span>
                      <span className={mode("text-blue-600", "text-blue-400")}>
                        4 %
                      </span>
                    </div>
                    <div
                      className={
                        mode("bg-slate-200", "bg-gray-700") +
                        " w-full h-2 rounded-full"
                      }
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-[4%]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {[1, 2, 3, "…", 25].map((n, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium ${
                            i === 0
                              ? mode(
                                  "bg-blue-100 border-blue-400/60 text-blue-700",
                                  "bg-blue-600/30 border-blue-500/50 text-blue-300"
                                )
                              : i === 1
                              ? mode(
                                  "bg-blue-50 border-blue-300/50 text-blue-600",
                                  "bg-blue-600/20 border-blue-500/40 text-blue-400"
                                )
                              : mode(
                                  "bg-white border-slate-300/60 text-slate-500",
                                  "bg-gray-700 border-gray-600 text-gray-400"
                                )
                          }`}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                    <button
                      className={`px-6 py-2 rounded-lg font-semibold ${mode(
                        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
                        "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                      )}`}
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: FiBook, val: "25", lab: "Questions", c: "blue" },
                    { icon: FiCpu, val: "45", lab: "Minutes", c: "indigo" },
                    { icon: FiAward, val: "100", lab: "Points", c: "emerald" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 border hover:scale-105 transition-transform ${
                        isDark
                          ? `bg-${s.c}-500/10 border-${s.c}-500/20`
                          : `bg-white border-${s.c}-200/60 shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <s.icon
                          className={`w-5 h-5 ${
                            isDark ? `text-${s.c}-400` : `text-${s.c}-600`
                          }`}
                        />
                        <div>
                          <div
                            className={`font-bold ${
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

                {/* progress footer */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className={mode("text-blue-600", "text-blue-400")}>
                      Assessment Progress
                    </span>
                    <span className={mode("text-blue-600", "text-blue-400")}>
                      4 %
                    </span>
                  </div>
                  <div
                    className={
                      mode("bg-slate-200", "bg-gray-700") +
                      " w-full h-2 rounded-full"
                    }
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-[4%]" />
                  </div>
                </div>

                {/* floating icons */}
                <Parallax>
                  <div
                    className={`absolute -top-8 -right-8 p-4 rounded-2xl border shadow-lg rotate-6 backdrop-blur-sm ${mode(
                      "bg-white border-orange-200/60 shadow-orange-200/30",
                      "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30"
                    )}`}
                  >
                    <FaGraduationCap
                      className={`w-8 h-8 ${mode(
                        "text-orange-600",
                        "text-orange-400"
                      )}`}
                    />
                  </div>
                </Parallax>
                <Parallax start={0} end={-120}>
                  <div
                    className={`absolute -bottom-8 -left-8 p-4 rounded-2xl border shadow-lg -rotate-6 backdrop-blur-sm ${mode(
                      "bg-white border-blue-200/60 shadow-blue-200/30",
                      "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30"
                    )}`}
                  >
                    <FaRocket
                      className={`w-8 h-8 ${mode(
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

      <section className="section-padding">
        <div className="container-responsive">
          <FadeSlide className="text-center mb-16">
            <h2
              className={`text-4xl lg:text-5xl font-bold mb-6 ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Enterprise-Grade Features
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${mode(
                "text-slate-600",
                "text-gray-300"
              )}`}
            >
              Powerful tools for education, corporate training and professional
              development.
            </p>
          </FadeSlide>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Stagger
              items={featureCards}
              baseDelay={100}
              render={(f) => (
                <div
                  className={`group p-8 rounded-2xl border hover:scale-105 hover:shadow-xl transition-shadow ${
                    isDark
                      ? `bg-gray-800/50 border-gray-700/50 hover:border-${f.color}-500/50 hover:shadow-${f.color}-500/20`
                      : `bg-white border-slate-200/60 hover:border-${f.color}-300/60 hover:shadow-${f.color}-300/20`
                  }`}
                >
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-6 ${
                      isDark
                        ? `bg-${f.color}-500/20 text-${f.color}-400 group-hover:bg-${f.color}-500/30`
                        : `bg-${f.color}-50 text-${f.color}-600 group-hover:bg-${f.color}-100`
                    }`}
                  >
                    <f.icon className="w-8 h-8" />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-4 ${mode(
                      "text-slate-800",
                      "text-white"
                    )}`}
                  >
                    {f.title}
                  </h3>
                  <p className={mode("text-slate-600", "text-gray-300")}>
                    {f.desc}
                  </p>
                </div>
              )}
            />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-responsive">
          <div
            className={`mt-16 pt-10 border-t ${mode(
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
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                        isDark
                          ? `bg-${m.color}-500/10 border-${m.color}-500/30`
                          : `bg-white border-${m.color}-200/60 shadow-sm`
                      }`}
                    >
                      <m.icon
                        className={`w-8 h-8 ${
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
                    <div className={mode("text-slate-600", "text-gray-400")}>
                      {m.label}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-responsive">
          <FadeSlide className="text-center mb-16">
            <h2
              className={`text-4xl lg:text-5xl font-bold mb-6 ${mode(
                "text-slate-800",
                "text-white"
              )}`}
            >
              Discover the incredible value we offer!
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${mode(
                "text-slate-600",
                "text-gray-300"
              )}`}
            >
              Unlock amazing benefits tailored just for you!
            </p>
          </FadeSlide>

          {/* billing toggle */}
          <div className="flex justify-center mb-12">
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
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
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

          {/* plan cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Stagger
              items={plans}
              baseDelay={100}
              render={(p) => (
                <div
                  className={`group relative p-8 rounded-2xl border flex flex-col hover:scale-105 hover:shadow-xl transition-shadow ${
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
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                        🔥 Most popular
                      </span>
                    </div>
                  )}

                  <div className="text-center flex-1">
                    <h3
                      className={`text-2xl font-bold mb-4 ${mode(
                        "text-slate-800",
                        "text-white"
                      )}`}
                    >
                      {p.name}
                    </h3>
                    <div className="mb-6">
                      <div
                        className={`text-4xl font-bold ${mode(
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
                        mode("text-slate-600", "text-gray-300") + " mb-8"
                      }
                    >
                      {p.blurb}
                    </p>

                    <ul
                      className={`space-y-3 mb-8 ${mode(
                        "text-slate-600",
                        "text-gray-300"
                      )}`}
                    >
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6">
                    <button
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-transform hover:scale-105 ${
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

          {/* pricing footnote */}
          <div className="text-center mt-12">
            <p className={mode("text-slate-500", "text-gray-400") + " text-sm"}>
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
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

      <section className="section-padding">
        <div className="container-responsive">
          <FadeSlide delay={400}>
            <div
              className={`p-8 rounded-2xl border ${mode(
                "bg-white border-slate-200/60 shadow-sm",
                "bg-gray-800/50 border-gray-700/50"
              )}`}
            >
              <div className="text-center mb-8">
                <h3
                  className={`text-2xl font-bold mb-4 ${mode(
                    "text-slate-800",
                    "text-white"
                  )}`}
                >
                  Help Us Improve
                </h3>
                <p className={mode("text-slate-600", "text-gray-300")}>
                  Your feedback drives our continuous innovation.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <button
                  onClick={() => setShowComplaint(true)}
                  className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105 border ${mode(
                    "bg-white text-red-600 border-red-200/60 hover:bg-red-50 hover:border-red-300/60",
                    "bg-gradient-to-r from-red-600 to-pink-500 text-white border-red-400/30"
                  )}`}
                >
                  <FiCheckCircle className="w-5 h-5" />
                  Report Issue
                </button>
                <button
                  onClick={() => setShowRecommendation(true)}
                  className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105 border ${mode(
                    "bg-white text-blue-600 border-blue-200/60 hover:bg-blue-50 hover:border-blue-300/60",
                    "bg-gradient-to-r from-cyan-600 to-blue-500 text-white border-cyan-400/30"
                  )}`}
                >
                  <FiPlus className="w-5 h-5" />
                  Suggest Feature
                </button>
              </div>
            </div>
          </FadeSlide>
        </div>
      </section>

      {isAdmin && (
        <Parallax start={0} end={-60}>
          <div className="fixed z-50 top-6 right-8">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className={`px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform border-2 ${mode(
                "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
                "bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-white/70 hover:from-cyan-600 hover:to-teal-500"
              )}`}
            >
              Admin Dashboard
            </button>
          </div>
        </Parallax>
      )}

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
    </div>
  );
};

export default WelcomePage;
