import { GoogleGenerativeAI } from '@google/generative-ai';

class IndianLanguageVoiceService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Configuration for supported languages
    this.indianLanguages = {
      hindi: { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳', script: 'Devanagari' },
      bengali: { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳', script: 'Bengali' },
      telugu: { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳', script: 'Telugu' },
      marathi: { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳', script: 'Devanagari' },
      tamil: { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳', script: 'Tamil' },
      gujarati: { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳', script: 'Gujarati' },
      kannada: { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳', script: 'Kannada' },
      malayalam: { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳', script: 'Malayalam' },
      punjabi: { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', script: 'Gurmukhi' },
      english: { code: 'en-IN', name: 'Indian English', flag: '🇮🇳', script: 'Latin' }
    };
  }

  /**
   * Translates text content to the target language using Gemini Flash.
   */
  async translateContent(content, targetLanguageName) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Translate the following educational assessment summary into ${targetLanguageName}.
        Keep the tone encouraging and professional.
        Maintain technical terms in English if common (like 'Java', 'React', 'Algorithms').
        
        Content: "${content}"
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Translation Error:", error);
      return content; // Fallback to original
    }
  }

  /**
   * Generates audio blob for Indian languages.
   */
  async generateIndianVoiceExplanation(content, languageKey, options = {}) {
    try {
      // 1. Identify Language Config
      const langConfig = this.indianLanguages[languageKey] || this.indianLanguages.hindi;
      
      // 2. Use specific TTS model
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });

      // 3. Construct rich prompt for the audio model
      const prompt = `
        Speaker Instructions:
        - Language: ${langConfig.name} (${langConfig.code})
        - Context: Educational Feedback for a student.
        - Tone: ${options.tone || 'encouraging'}
        - Pace: ${options.pace || 'moderate'}
        ${options.includeTransliteration ? '- Style: Clear enunciation.' : ''}
        
        Text to speak:
        "${content}"
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const response = await result.response;

      // Return Blob if supported by SDK version
      if (typeof response.audio === 'function') {
        return await response.audio();
      }

      // Mock for development if API not enabled
      throw new Error("TTS Model endpoint unreachable or API key lacks permission.");

    } catch (error) {
      console.error("Indian Voice Generation Error:", error);
      throw error;
    }
  }
}

export default IndianLanguageVoiceService;