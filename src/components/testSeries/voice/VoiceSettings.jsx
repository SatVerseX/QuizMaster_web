import React from 'react';

const VoiceSettings = ({ options, setOptions }) => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-white">
      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Tone</label>
        <select
          value={options.tone}
          onChange={(e) => setOptions(prev => ({ ...prev, tone: e.target.value }))}
          className="w-full p-2 rounded border border-gray-700 bg-slate-700"
        >
          <option value="friendly and professional">Friendly & Professional</option>
          <option value="enthusiastic and encouraging">Enthusiastic & Encouraging</option>
          <option value="calm and reassuring">Calm & Reassuring</option>
          <option value="authoritative and confident">Authoritative & Confident</option>
        </select>
      </div>

      {/* Pace Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Pace</label>
        <select
          value={options.pace}
          onChange={(e) => setOptions(prev => ({ ...prev, pace: e.target.value }))}
          className="w-full p-2 rounded border border-gray-700 bg-slate-700"
        >
          <option value="slow">Slow</option>
          <option value="moderate">Moderate</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      {/* Accent Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Accent</label>
        <select
          value={options.accent}
          onChange={(e) => setOptions(prev => ({ ...prev, accent: e.target.value }))}
          className="w-full p-2 rounded border border-gray-700 bg-slate-700"
        >
          <option value="neutral">Neutral</option>
          <option value="american">American</option>
          <option value="british">British</option>
          <option value="indian">Indian</option>
        </select>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Style</label>
        <select
          value={options.style}
          onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value }))}
          className="w-full p-2 rounded border border-gray-700 bg-slate-700"
        >
          <option value="educational">Educational</option>
          <option value="conversational">Conversational</option>
          <option value="formal">Formal</option>
          <option value="friendly">Friendly</option>
        </select>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Language</label>
        <select
          value={options.language}
          onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
          className="w-full p-2 rounded border border-gray-700 bg-slate-700"
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="kannada">Kannada</option>
          <option value="marathi">Marathi</option>
          <option value="telugu">Telugu</option>
          <option value="tamil">Tamil</option>
          <option value="urdu">Urdu</option>
          <option value="bengali">Bengali</option>
          {/* Expand as needed */}
        </select>
      </div>
    </div>
  );
};

export default VoiceSettings;
