import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaDownload, FaMicrophone, FaSpinner, FaCog } from 'react-icons/fa';
import VoiceExplanationService from '../../services/VoiceExplanationService'; // Gemini Flash voice service
import VoiceSettings from './VoiceSettings';

const TestSeriesVoiceExplainer = ({ testSeries, testResults, reviewData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceOptions, setVoiceOptions] = useState({
    tone: 'friendly and professional',
    pace: 'moderate',
    accent: 'neutral',
    style: 'educational',
    language: 'english'
  });

  const audioRef = useRef(null);
  const voiceService = useRef(new VoiceExplanationService());

  // Prepare explanation text
  const generateExplanation = () => {
    let content = `
      Test Series: ${testSeries.title}
      Description: ${testSeries.description}

      Performance:
      - Total Questions: ${testResults.totalQuestions}
      - Correct Answers: ${testResults.correctAnswers}
      - Score: ${testResults.score}%
      - Time Taken: ${testResults.timeSpent} minutes

      Review Highlights:
      Strengths: ${reviewData?.strengths?.join(', ') || 'N/A'}
      Areas to Improve: ${reviewData?.weaknesses?.join(', ') || 'N/A'}
      Recommendations: ${reviewData?.recommendations?.join(', ') || 'N/A'}

      Let's help you improve with tailored advice!
    `;
    return content;
  };

  const handleGenerateVoice = async () => {
    setIsGenerating(true);
    try {
      const content = generateExplanation();
      const audio = await voiceService.current.generateVoiceExplanation(content.trim(), voiceOptions);

      setAudioBlob(audio);
      const url = URL.createObjectURL(audio);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    } catch (error) {
      alert('Voice generation failed. Try again.');
      console.error(error);
    }
    setIsGenerating(false);
  };

  const handlePlay = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testSeries.title}_explanation.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioBlob]);

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-slate-700/50 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-2xl font-bold">AI Voice Explanation</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-white p-2 hover:text-purple-400 transition"
          title="Voice Settings"
        >
          <FaCog />
        </button>
      </div>

      {showSettings && (
        <VoiceSettings options={voiceOptions} setOptions={setVoiceOptions} />
      )}

      {!audioBlob && (
        <button
          onClick={handleGenerateVoice}
          disabled={isGenerating}
          className="w-full text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <FaSpinner className="animate-spin" /> : <FaMicrophone />}
          {isGenerating ? 'Generating...' : 'Generate Voice Explanation'}
        </button>
      )}

      {audioBlob && (
        <div>
          <audio ref={audioRef} className="hidden" />

          <div className="flex items-center justify-center space-x-4 my-4">
            <button onClick={handleStop} className="text-white hover:text-red-400" title="Stop">
              <FaStop size={24} />
            </button>
            {isPlaying ? (
              <button onClick={handlePause} className="text-white hover:text-yellow-400" title="Pause">
                <FaPause size={24} />
              </button>
            ) : (
              <button onClick={handlePlay} className="text-white hover:text-green-400" title="Play">
                <FaPlay size={24} />
              </button>
            )}
            <button onClick={handleDownload} className="text-white hover:text-blue-400" title="Download">
              <FaDownload size={24} />
            </button>
          </div>

          <div className="flex justify-between text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSeriesVoiceExplainer;
