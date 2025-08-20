// EnhancedIndianVoiceExplainer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaVolume,
  FaMicrophone,
  FaDownload,
  FaCog,
  FaLanguage,
  FaSpinner,
  FaGlobe,
  FaFlag
} from 'react-icons/fa';
import { FiSettings, FiMapPin } from 'react-icons/fi';
import IndianLanguageVoiceService from '../services/IndianLanguageVoiceService';

const EnhancedIndianVoiceExplainer = ({ testSeries, testResults, reviewData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    tone: 'encouraging and supportive',
    pace: 'moderate',
    style: 'educational',
    includeTransliteration: false
  });

  const audioRef = useRef(null);
  const voiceService = useRef(new IndianLanguageVoiceService());

  // Available Indian languages
  const indianLanguages = voiceService.current.indianLanguages;

  const generateExplanationContent = () => {
    return `
टेस्ट सीरीज़: ${testSeries.title}

विवरण: ${testSeries.description}

प्रदर्शन सारांश:
- कुल प्रश्न: ${testResults?.totalQuestions || 'जानकारी उपलब्ध नहीं'}
- सही उत्तर: ${testResults?.correctAnswers || 'जानकारी उपलब्ध नहीं'}
- स्कोर: ${testResults?.score || 'जानकारी उपलब्ध नहीं'}%
- समय लिया गया: ${testResults?.timeSpent || 'जानकारी उपलब्ध नहीं'} मिनट

विस्तृत समीक्षा:
${reviewData?.strengths ? `मजबूत बिंदु: ${reviewData.strengths.join(', ')}` : ''}
${reviewData?.weaknesses ? `सुधार के क्षेत्र: ${reviewData.weaknesses.join(', ')}` : ''}
${reviewData?.recommendations ? `सुझाव: ${reviewData.recommendations.join(', ')}` : ''}

मुख्य विषय:
${testSeries.topics?.map(topic => `- ${topic}`).join('\n') || 'इस टेस्ट सीरीज़ में विभिन्न विषयों को शामिल किया गया है'}

आगे के कदम:
आपके प्रदर्शन के आधार पर, यहाँ सुधार और निरंतर सीखने के लिए कुछ सुझाव हैं।
    `.trim();
  };

  const handleLanguageChange = async (language) => {
    setSelectedLanguage(language);
    
    // Auto-translate content when language changes
    if (language !== 'hindi' && language !== 'english') {
      setIsTranslating(true);
      try {
        const content = generateExplanationContent();
        const translated = await voiceService.current.translateContent(
          content, 
          indianLanguages[language].name
        );
        setTranslatedContent(translated);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleGenerateVoice = async () => {
    setIsGenerating(true);
    try {
      const content = translatedContent || generateExplanationContent();
      const audioBlob = await voiceService.current.generateIndianVoiceExplanation(
        content, 
        selectedLanguage,
        voiceSettings
      );
      
      setAudioBlob(audioBlob);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
    } catch (error) {
      console.error('Error generating Indian voice explanation:', error);
      alert(`Failed to generate voice explanation in ${indianLanguages[selectedLanguage].name}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${testSeries.title}-explanation-${selectedLanguage}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioBlob]);

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaGlobe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">भारतीय भाषा AI Voice व्याख्या</h3>
              <p className="text-orange-100">Gemini Flash द्वारा संचालित - 13 भारतीय भाषाओं में</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl px-3 py-2">
              <span className="text-white text-sm font-medium">
                {indianLanguages[selectedLanguage].flag} {indianLanguages[selectedLanguage].name}
              </span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all duration-300"
            >
              <FiSettings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="p-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-b border-slate-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaLanguage className="w-5 h-5 text-orange-400" />
          भाषा चुनें / Choose Language
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(indianLanguages).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => handleLanguageChange(key)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedLanguage === key
                  ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 scale-105'
                  : 'border-slate-600/50 bg-slate-800/40 hover:border-orange-400/50 hover:bg-slate-700/60'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{lang.flag}</div>
                <h5 className={`font-bold text-sm ${
                  selectedLanguage === key ? 'text-orange-300' : 'text-white'
                }`}>
                  {lang.name}
                </h5>
                <p className={`text-xs mt-1 ${
                  selectedLanguage === key ? 'text-orange-400' : 'text-slate-400'
                }`}>
                  {lang.script}
                </p>
              </div>
              {selectedLanguage === key && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <FaFlag className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Settings */}
      {showSettings && (
        <div className="p-6 bg-slate-900/60 border-b border-slate-700/50">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCog className="w-5 h-5" />
            आवाज़ सेटिंग्स / Voice Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">टोन / Tone</label>
              <select
                value={voiceSettings.tone}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="encouraging and supportive">प्रेरणादायक और सहयोगी</option>
                <option value="enthusiastic and motivational">उत्साहजनक और प्रेरक</option>
                <option value="calm and reassuring">शांत और आश्वासनजनक</option>
                <option value="authoritative and knowledgeable">आधिकारिक और जानकार</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">गति / Pace</label>
              <select
                value={voiceSettings.pace}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, pace: e.target.value }))}
                className="w-full p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="slow">धीमी / Slow</option>
                <option value="moderate">मध्यम / Moderate</option>
                <option value="fast">तेज़ / Fast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">शैली / Style</label>
              <select
                value={voiceSettings.style}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, style: e.target.value }))}
                className="w-full p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="educational">शैक्षणिक</option>
                <option value="conversational">बातचीत</option>
                <option value="formal">औपचारिक</option>
                <option value="friendly">मित्रवत</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={voiceSettings.includeTransliteration}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, includeTransliteration: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                लिप्यंतरण शामिल करें
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Translation Status */}
      {isTranslating && (
        <div className="p-4 bg-blue-900/20 border-b border-slate-700/50">
          <div className="flex items-center gap-3 text-blue-300">
            <FaSpinner className="w-5 h-5 animate-spin" />
            <span>Translating content to {indianLanguages[selectedLanguage].name}...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Generate Button */}
        {!audioBlob && (
          <div className="text-center">
            <button
              onClick={handleGenerateVoice}
              disabled={isGenerating || isTranslating}
              className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl disabled:opacity-50 flex items-center gap-3 mx-auto"
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="w-6 h-6 animate-spin" />
                  <span className="text-lg">
                    {selectedLanguage === 'hindi' ? 'आवाज़ तैयार कर रहे हैं...' : 'Generating Voice...'}
                  </span>
                </>
              ) : (
                <>
                  <FaMicrophone className="w-6 h-6" />
                  <span className="text-lg">
                    {selectedLanguage === 'hindi' 
                      ? 'AI आवाज़ व्याख्या बनाएं' 
                      : `Generate AI Voice in ${indianLanguages[selectedLanguage].name}`
                    }
                  </span>
                </>
              )}
            </button>
            <p className="text-slate-400 mt-4 text-sm">
              {selectedLanguage === 'hindi' 
                ? 'अपने टेस्ट परिणामों की व्यक्तिगत आवाज़ व्याख्या प्राप्त करने के लिए क्लिक करें'
                : 'Click to generate personalized voice explanation in your preferred Indian language'
              }
            </p>
          </div>
        )}

        {/* Audio Player */}
        {audioBlob && (
          <div className="space-y-4">
            <audio ref={audioRef} className="hidden" />

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleStop}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300"
                title="Stop"
              >
                <FaStop className="w-5 h-5" />
              </button>

              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <FaPause className="w-6 h-6" />
                ) : (
                  <FaPlay className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={handleDownload}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300"
                title="Download"
              >
                <FaDownload className="w-5 h-5" />
              </button>
            </div>

            {/* Language Info */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Playing in {indianLanguages[selectedLanguage].flag} {indianLanguages[selectedLanguage].name} ({indianLanguages[selectedLanguage].script})
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/40 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaGlobe className="w-5 h-5 text-orange-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">13 भारतीय भाषाएं</h4>
            <p className="text-slate-400 text-sm">Multiple Indian languages support</p>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaCog className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Cultural Context</h4>
            <p className="text-slate-400 text-sm">Indian education system aligned</p>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaPlay className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Native Pronunciation</h4>
            <p className="text-slate-400 text-sm">Natural regional accents</p>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaDownload className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Offline Access</h4>
            <p className="text-slate-400 text-sm">Download for later listening</p>
          </div>
        </div>

        {/* Supported Languages Grid */}
        <div className="bg-slate-900/40 rounded-xl p-6 mt-6">
          <h4 className="text-lg font-bold text-white mb-4 text-center">समर्थित भाषाएं / Supported Languages</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            {Object.entries(indianLanguages).map(([key, lang]) => (
              <div key={key} className="text-xs text-slate-400">
                <div className="text-lg mb-1">{lang.flag}</div>
                <div className="font-medium">{lang.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedIndianVoiceExplainer;
