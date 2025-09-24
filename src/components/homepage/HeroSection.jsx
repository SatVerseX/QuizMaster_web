import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBookOpen, FiUsers, FiTarget, FiStar } from 'react-icons/fi';
import { FaRocket } from 'react-icons/fa';

const HeroSection = ({ isDark, currentUser, onViewAllSeries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results
      onViewAllSeries(searchTerm);
    }
  };

  return (
    <div className="py-6 mb-6">
      <div className="text-center max-w-4xl mx-auto">
        {/* Simplified CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/test-series')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <FaRocket className="w-4 h-4" />
            Explore Test Series
          </button>
          
          
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
