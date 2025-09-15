import React, { useState, useEffect, useRef } from 'react';
import { FiUsers, FiBookOpen, FiTarget, FiStar } from 'react-icons/fi';

const QuickStatsSection = ({ isDark }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    totalUsers: 0,
    testSeries: 0,
    successRate: 0,
    rating: 0
  });
  
  const sectionRef = useRef(null);

  // These will be loaded from Firebase analytics
  const [targetCounts, setTargetCounts] = useState({
    totalUsers: 0,
    testSeries: 0,
    successRate: 0,
    rating: 0
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
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

  const animateCounters = () => {
    const duration = 1500;
    const steps = 30;
    const stepDuration = duration / steps;

    Object.keys(targetCounts).forEach((key) => {
      const target = targetCounts[key];
      if (target === 0) return; // Don't animate if no data
      
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounts(prev => ({
          ...prev,
          [key]: key === 'rating' ? Math.min(current, target).toFixed(1) : Math.floor(current)
        }));
      }, stepDuration);
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const stats = [
    { id: 'totalUsers', label: 'Active Students', value: formatNumber(counts.totalUsers), icon: FiUsers },
    { id: 'testSeries', label: 'Test Series', value: formatNumber(counts.testSeries), icon: FiBookOpen },
    { id: 'successRate', label: 'Success Rate', value: counts.successRate + '%', icon: FiTarget },
    { id: 'rating', label: 'User Rating', value: counts.rating, icon: FiStar }
  ];

  return (
    <div ref={sectionRef} className="mb-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              className={`text-center p-6 rounded-3xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-lg'
              }`}
            >
              <IconComponent className={`w-8 h-8 mx-auto mb-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickStatsSection;
