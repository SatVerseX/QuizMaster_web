import React from 'react';
import { FiEdit, FiZap, FiAlertCircle, FiCheck, FiCpu, FiLayers } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

// Reusable Badge Component
const Badge = ({ text, colorClass }) => (
  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${colorClass}`}>
    {text}
  </span>
);

const TestCreationCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features, 
  buttonText, 
  onClick, 
  theme = 'blue', 
  isDark,
  badge 
}) => {
  // Theme configurations for clean SaaS look
  const themes = {
    blue: {
      iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-50',
      iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
      button: isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700',
      hoverBorder: isDark ? 'group-hover:border-blue-500/50' : 'group-hover:border-blue-200',
      checkColor: isDark ? 'text-blue-400' : 'text-blue-600',
    },
    purple: {
      iconBg: isDark ? 'bg-indigo-500/20' : 'bg-indigo-50',
      iconColor: isDark ? 'text-indigo-400' : 'text-indigo-600',
      button: isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700',
      hoverBorder: isDark ? 'group-hover:border-indigo-500/50' : 'group-hover:border-indigo-200',
      checkColor: isDark ? 'text-indigo-400' : 'text-indigo-600',
    }
  };

  const currentTheme = themes[theme];
  const cardBg = isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-slate-200';
  const textColor = isDark ? 'text-gray-100' : 'text-slate-800';
  const subTextColor = isDark ? 'text-gray-400' : 'text-slate-500';

  return (
    <div 
      className={`
        group relative flex flex-col h-full p-6 rounded-2xl border transition-all duration-300
        ${cardBg} ${currentTheme.hoverBorder}
      `}
    >
      {/* Optional Badge (e.g., for AI) */}
      {badge && (
        <div className="absolute top-4 right-4">
          <Badge text={badge} colorClass={theme === 'purple' ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700') : ''} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-xl transition-colors duration-300 ${currentTheme.iconBg}`}>
          <Icon className={`w-6 h-6 ${currentTheme.iconColor}`} />
        </div>
        <div>
          <h4 className={`text-lg font-bold ${textColor}`}>{title}</h4>
          <p className={`text-sm mt-1 leading-relaxed ${subTextColor}`}>{description}</p>
        </div>
      </div>
      
      {/* Features List */}
      <div className={`flex-grow space-y-3 mb-8 ${isDark ? 'border-t border-gray-700' : 'border-t border-slate-100'} pt-6`}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 text-sm">
            <div className={`mt-0.5 shrink-0 ${currentTheme.checkColor}`}>
              {typeof feature === 'object' ? feature.icon : <FiCheck className="w-4 h-4" />}
            </div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              {typeof feature === 'object' ? feature.text : feature}
            </span>
          </div>
        ))}
      </div>
      
      {/* Action Button */}
      <button
        onClick={onClick}
        className={`
          w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm 
          transition-all duration-200 flex items-center justify-center gap-2
          active:scale-[0.98] ${currentTheme.button}
        `}
      >
        {typeof buttonText === 'object' ? (
          <>
            {buttonText.icon}
            <span>{buttonText.text}</span>
          </>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>
    </div>
  );
};

const CreationSection = ({ onCreateManual, onCreateAI, isDark, isAdmin }) => {
  if (!isAdmin) return null;

  return (
    <section className={`
      rounded-3xl p-6 sm:p-8 mb-8 transition-all duration-300 border
      ${isDark ? 'bg-gray-900/50 border-gray-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}
    `}>
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
            <FiLayers className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Create Assessment
            </h3>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Choose how you want to build your next test series
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {/* Manual Card */}
        <TestCreationCard
          isDark={isDark}
          theme="blue"
          icon={FiEdit}
          title="Manual Builder"
          description="Build precise assessments with our granular control editor."
          features={[
            "Rich text editor support",
            "Custom scoring & negative marking",
            "Detailed solution explanations",
            "Time limit configuration"
          ]}
          buttonText={{
            icon: <FiEdit className="w-4 h-4 " />,
            text: "Create Manually"
          }}
          onClick={onCreateManual}
        />

        {/* AI Card */}
        <TestCreationCard
          isDark={isDark}
          theme="purple"
          icon={FaRobot}
          badge="Recommended"
          title="AI Generator"
          description="Leverage AI to generate comprehensive tests in seconds."
          features={[
            { icon: <FiZap className="w-4 h-4" />, text: "Instant question generation" },
            { icon: <FiCpu className="w-4 h-4" />, text: "Context-aware from topics" },
            { icon: <FiAlertCircle className="w-4 h-4" />, text: "Difficulty balancing" },
            { icon: <FiLayers className="w-4 h-4" />, text: "JSON / PDF Import" }
          ]}
          buttonText={{
            icon: <FaRobot className="w-4 h-4" />,
            text: "Generate with AI"
          }}
          onClick={onCreateAI}
        />
      </div>
    </section>
  );
};

export default CreationSection;