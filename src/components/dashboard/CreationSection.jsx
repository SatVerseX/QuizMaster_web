import React from 'react';
import { FiEdit, FiZap, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const TestCreationCard = ({ icon, title, description, features, buttonText, onClick, colorClass, mode }) => (
  <div className={mode(
    "backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-5 flex flex-col h-full transition-all duration-300 bg-white shadow-sm hover:shadow-md",
    "backdrop-blur-sm border border-gray-700/60 rounded-lg sm:rounded-xl p-4 sm:p-5 flex flex-col h-full transition-all duration-300 bg-gray-800/60 hover:bg-gray-800/80"
  )}>
    <div className="flex items-center gap-2 sm:gap-3 mb-3">
      <div className={`p-2 sm:p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h4 className={mode("text-base sm:text-lg font-bold transition-all duration-300 text-slate-800", "text-base sm:text-lg font-bold transition-all duration-300 text-white")}>{title}</h4>
        <p className={mode("text-xs sm:text-sm transition-all duration-300 text-slate-600", "text-xs sm:text-sm transition-all duration-300 text-gray-400")}>{description}</p>
      </div>
    </div>
    
    <ul className={mode("space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-4 sm:mb-6 flex-grow transition-all duration-300 text-slate-600", "space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-4 sm:mb-6 flex-grow transition-all duration-300 text-gray-400")}>
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2">
          {typeof feature === 'object' ? feature.icon : <FiCheck className={mode("w-3 h-3 sm:w-4 sm:h-4 text-green-600", "w-3 h-3 sm:w-4 sm:h-4 text-green-400")} />}
          <span className="hidden sm:inline">{typeof feature === 'object' ? feature.text : feature}</span>
          <span className="sm:hidden">{typeof feature === 'object' ? feature.text.split(' ')[0] : feature.split(' ')[0]}</span>
        </li>
      ))}
    </ul>
    
    <button
      onClick={onClick}
      className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${colorClass} text-white hover:scale-105 text-sm sm:text-base`}
    >
      {typeof buttonText === 'object' ? (
        <>
          {buttonText.icon}
          <span className="hidden sm:inline">{buttonText.text}</span>
          <span className="sm:hidden">{buttonText.text.split(' ')[0]}</span>
        </>
      ) : (
        <span className="hidden sm:inline">{buttonText}</span>
      )}
    </button>
  </div>
);

const CreationSection = ({ onCreateManual, onCreateAI, mode, isDark, isAdmin }) => {
  if (!isAdmin) return null;

  return (
    <div className={`backdrop-blur-sm border rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/60 border-gray-700/60' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="p-2 bg-blue-600 rounded-lg">
          <FiEdit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-lg sm:text-xl font-bold transition-all duration-300 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>Add New Test</h3>
          <p className={`text-sm sm:text-base transition-all duration-300 ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>Create tests for your series using manual editor or AI assistance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <TestCreationCard
          icon={<FiEdit className="w-6 h-6 text-white" />}
          title="Manual Test Creator"
          description="Create tests with full control"
          features={[
            "Custom question creation",
            "Multiple choice options", 
            "Detailed explanations",
            "Time limit settings"
          ]}
          buttonText={{
            icon: <FiEdit className="w-5 h-5" />,
            text: "Create Manual Test"
          }}
          onClick={onCreateManual}
          colorClass="bg-blue-600 hover:bg-blue-700"
          mode={mode}
        />

        <TestCreationCard
          icon={<FaRobot className="w-6 h-6 text-white" />}
          title="AI Test Generator"
          description="Generate tests instantly with AI"
          features={[
            { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "Instant question generation" },
            { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "Topic-based content" },
            { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "Difficulty customization" },
            { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "JSON file upload support" },
            { icon: <FiAlertCircle className="w-4 h-4 text-red-400" />, text: "Negative marking support" }
          ]}
          buttonText={{
            icon: <FaRobot className="w-5 h-5" />,
            text: "Generate with AI"
          }}
          onClick={onCreateAI}
          colorClass="bg-purple-600 hover:bg-purple-700"
          mode={mode}
        />
      </div>
    </div>
  );
};

export default CreationSection;
