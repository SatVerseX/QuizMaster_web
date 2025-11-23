import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiBarChart2 } from 'react-icons/fi';
import SectionPerformanceCard from './SectionPerformanceCard';
import SectionQuestionNavigator from './SectionQuestionNavigator';

const SectionWiseAnalysis = ({ questionAnalysis, attempt }) => {
  const { isDark } = useTheme();
  const [selectedSection, setSelectedSection] = useState(null);

  const sections = useMemo(() => {
    const sectionGroups = questionAnalysis.reduce((groups, question) => {
      const sectionId = question.sectionId || 'unknown';
      const sectionName = question.sectionName || 'General Section';
      
      if (!groups[sectionId]) {
        groups[sectionId] = {
          id: sectionId,
          name: sectionName,
          questions: [],
          stats: { total: 0, correct: 0, incorrect: 0, skipped: 0, accuracy: 0 }
        };
      }
      
      groups[sectionId].questions.push(question);
      groups[sectionId].stats.total++;
      
      if (question.status === 'correct') groups[sectionId].stats.correct++;
      else if (question.status === 'incorrect') groups[sectionId].stats.incorrect++;
      else groups[sectionId].stats.skipped++;
      
      return groups;
    }, {});

    return Object.values(sectionGroups).map(section => {
      const attempted = section.stats.correct + section.stats.incorrect;
      section.stats.accuracy = attempted > 0 ? (section.stats.correct / attempted) * 100 : 0;
      return section;
    });
  }, [questionAnalysis]);

  const styles = {
    wrapper: isDark 
      ? 'bg-gray-900/40 border-gray-700 backdrop-blur-md shadow-xl' 
      : 'bg-white border-slate-200 shadow-sm',
    
    headerTextMain: isDark ? 'text-white' : 'text-slate-900',
    headerTextSub: isDark ? 'text-gray-400' : 'text-slate-500',
    
    iconBox: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30',
    
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
  };

  return (
    <div className="w-full space-y-6">
      
      <div className={` p-5 transition-all duration-300 ${styles.wrapper}`}>
        
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-2.5 rounded-xl ${styles.iconBox}`}>
            <FiBarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-lg font-bold leading-tight ${styles.headerTextMain}`}>
              Section Analysis
            </h3>
            <p className={`text-sm font-medium ${styles.headerTextSub}`}>
              Performance breakdown across {sections.length} sections
            </p>
          </div>
        </div>
        
        <div className={styles.grid}>
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
      
      <div className={`transition-all duration-500 ease-in-out ${selectedSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 h-0 overflow-hidden'}`}>
        {selectedSection && (
          <SectionQuestionNavigator
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SectionWiseAnalysis;