import React, { useState, useEffect, useRef } from 'react';
import { FiUsers, FiBookOpen, FiTarget, FiStar } from 'react-icons/fi';

const QuickStatsSection = ({ isDark }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Current display values (for animation)
  const [counts, setCounts] = useState({
    totalUsers: 0,
    testSeries: 0,
    successRate: 0,
    rating: 0
  });

  // Target values (Replace these with your Firebase data props)
  // I've added default numbers so you can see the animation immediately
  const targetCounts = {
    totalUsers: 12500,
    testSeries: 450,
    successRate: 94,
    rating: 4.8
  };

  // Configuration for distinct styling per stat
  const statConfig = {
    totalUsers: {
      icon: FiUsers,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Active Students',
      suffix: '+'
    },
    testSeries: {
      icon: FiBookOpen,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      label: 'Test Series',
      suffix: '+'
    },
    successRate: {
      icon: FiTarget,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      label: 'Success Rate',
      suffix: '%'
    },
    rating: {
      icon: FiStar,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'Avg. Rating',
      suffix: '/5'
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  // Separate effect for animation triggering
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 50;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      setCounts(prev => {
        const next = { ...prev };
        let completed = true;

        Object.keys(targetCounts).forEach(key => {
          const target = targetCounts[key];
          const current = prev[key];
          const increment = target / steps;

          if (current < target) {
            completed = false;
            const newValue = current + increment;
            // Handle decimal for rating, integers for others
            next[key] = key === 'rating' 
              ? Math.min(newValue, target) 
              : Math.min(Math.ceil(newValue), target);
          }
        });

        if (completed) clearInterval(timer);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible]);

  const formatNumber = (num, key) => {
    if (key === 'rating') return num.toFixed(1);
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
  };

  return (
    <section ref={sectionRef} className="mb-16 relative">
      {/* Decorative background blur */}
      <div className={`absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none ${
        isDark ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-r from-blue-100/50 to-purple-100/50'
      }`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Object.keys(statConfig).map((key) => {
          const config = statConfig[key];
          const IconComponent = config.icon;
          
          return (
            <div
              key={key}
              className={`relative group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                {/* Icon Bubble */}
                <div className={`p-3 rounded-xl mb-4 transition-transform group-hover:scale-110 duration-300 ${config.bg} ${config.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Number */}
                <div className={`text-3xl sm:text-4xl font-bold mb-1 tabular-nums tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {formatNumber(counts[key], key)}
                  <span className={`text-xl ml-0.5 ${config.color}`}>
                    {config.suffix}
                  </span>
                </div>

                {/* Label */}
                <div className={`text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default QuickStatsSection;