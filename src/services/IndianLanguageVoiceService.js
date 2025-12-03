import { GoogleGenerativeAI } from '@google/generative-ai';

class IndianLanguageVoiceService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Configuration for supported languages with BCP-47 codes for Web Speech API
    this.indianLanguages = {
      hindi: { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
      bengali: { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' },
      telugu: { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
      marathi: { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
      tamil: { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
      gujarati: { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' },
      kannada: { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
      malayalam: { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳' },
      punjabi: { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
      english: { code: 'en-IN', name: 'Indian English', flag: '🇮🇳' }
    };
  }

  /**
   * Translates text content to the target language using Gemini Flash.
   */
  async translateContent(content, languageKey) {
    try {
      const langConfig = this.indianLanguages[languageKey] || this.indianLanguages.hindi;
      // Use standard 1.5 model which is stable
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Translate the following educational feedback into ${langConfig.name}.
        Keep the tone encouraging and professional.
        Do NOT translate technical terms (e.g., React, Algebra, Java).
        Return ONLY the translated text.
        
        Original: "${content}"
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Translation Error:", error);
      return content; // Fallback to original text
    }
  }

  /**
   * Generates audio using Browser Speech Synthesis (Fallback for missing TTS API)
   * Returns a promise that resolves when speech starts (simulating blob readiness)
   */
  async generateIndianVoiceExplanation(content, languageKey) {
    return new Promise((resolve, reject) => {
      try {
        // 1. Translate first
        this.translateContent(content, languageKey).then((translatedText) => {
          
          // 2. Check browser support
          if (!window.speechSynthesis) {
            reject(new Error("Browser does not support Speech Synthesis"));
            return;
          }

          // 3. Create Utterance
          const utterance = new SpeechSynthesisUtterance(translatedText);
          const langCode = this.indianLanguages[languageKey]?.code || 'hi-IN';
          
          utterance.lang = langCode;
          utterance.rate = 0.9; // Slightly slower for clarity
          utterance.pitch = 1;

          // 4. Try to find a matching voice
          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.includes(langCode.split('-')[0]));
          if (matchingVoice) utterance.voice = matchingVoice;

          // Return the object needed by the UI to "play" it
          // Since we can't easily return a Blob from Web Speech API without recording it,
          // we return a controller object that the UI component will use.
          resolve({
            type: 'web_speech',
            text: translatedText,
            utterance: utterance,
            language: langCode
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default IndianLanguageVoiceService;