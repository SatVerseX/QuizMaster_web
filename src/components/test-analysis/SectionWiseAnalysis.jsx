import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiBarChart2, FiTarget, FiClock, FiCheckCircle, FiXCircle, FiMinus } from 'react-icons/fi';
import SectionPerformanceCard from './SectionPerformanceCard';
import SectionQuestionNavigator from './SectionQuestionNavigator';

const SectionWiseAnalysis = ({ questionAnalysis, attempt }) => {
  const { isDark } = useTheme();
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Group questions by section
  const sectionGroups = questionAnalysis.reduce((groups, question) => {
    const sectionId = question.sectionId || 'unknown';
    const sectionName = question.sectionName || 'Unknown Section';
    
    if (!groups[sectionId]) {
      groups[sectionId] = {
        id: sectionId,
        name: sectionName,
        questions: [],
        stats: {
          total: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          accuracy: 0,
          timeSpent: 0
        }
      };
    }
    
    groups[sectionId].questions.push(question);
    groups[sectionId].stats.total++;
    
    if (question.status === 'correct') groups[sectionId].stats.correct++;
    else if (question.status === 'incorrect') groups[sectionId].stats.incorrect++;
    else groups[sectionId].stats.skipped++;
    
    return groups;
  }, {});
  
  // Calculate accuracy for each section
  Object.values(sectionGroups).forEach(section => {
    const attempted = section.stats.correct + section.stats.incorrect;
    section.stats.accuracy = attempted > 0 ? (section.stats.correct / attempted) * 100 : 0;
  });
  
  const sections = Object.values(sectionGroups);
  
  return (
    <div className="space-y-3 w-[100%]">
      {/* Section-wise Overview */}
      <div className={`backdrop-blur-xl border rounded-xl p-3 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40' 
          : 'bg-white/90 border-slate-200/60 shadow-slate-200/40'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-purple-600 rounded-md">
            <FiBarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Performance
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Detailed analysis across {sections.length} sections
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {sections.map((section) => (
            <SectionPerformanceCard
              key={section.id}
              section={section}
              onClick={() => setSelectedSection(section)}
              isSelected={selectedSection?.id === section.id}
            />
          ))}
        </div>
      </div>
      
      {/* Selected Section Detail */}
      {selectedSection && (
        <SectionQuestionNavigator
          section={selectedSection}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </div>
  );
};

export default SectionWiseAnalysis;
