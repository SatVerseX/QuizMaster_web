// IndianLanguageVoiceService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class IndianLanguageVoiceService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    this.ttsModel = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-tts" 
    });
    
    // Indian language configurations
    this.indianLanguages = {
      hindi: {
        code: 'hi-IN',
        name: 'हिन्दी',
        flag: '🇮🇳',
        voice: 'hi-IN-Wavenet-A',
        script: 'देवनागरी'
      },
      bengali: {
        code: 'bn-IN',
        name: 'বাংলা',
        flag: '🟡🔴',
        voice: 'bn-IN-Wavenet-A',
        script: 'বাংলা'
      },
      telugu: {
        code: 'te-IN',
        name: 'తెలుగు',
        flag: '🔵🟡',
        voice: 'te-IN-Wavenet-A',
        script: 'తెలుగు'
      },
      marathi: {
        code: 'mr-IN',
        name: 'मराठी',
        flag: '🟠🔵',
        voice: 'mr-IN-Wavenet-A',
        script: 'देवनागरी'
      },
      tamil: {
        code: 'ta-IN',
        name: 'தமிழ்',
        flag: '🔴🟡',
        voice: 'ta-IN-Wavenet-A',
        script: 'தமிழ்'
      },
      gujarati: {
        code: 'gu-IN',
        name: 'ગુજરાતી',
        flag: '🟠⚪',
        voice: 'gu-IN-Wavenet-A',
        script: 'ગુજરાતી'
      },
      kannada: {
        code: 'kn-IN',
        name: 'ಕನ್ನಡ',
        flag: '🟡🔴',
        voice: 'kn-IN-Wavenet-A',
        script: 'ಕನ್ನಡ'
      },
      malayalam: {
        code: 'ml-IN',
        name: 'മലയാളം',
        flag: '🟡🔴',
        voice: 'ml-IN-Wavenet-A',
        script: 'മലയാളം'
      },
      punjabi: {
        code: 'pa-IN',
        name: 'ਪੰਜਾਬੀ',
        flag: '🟠🔵',
        voice: 'pa-IN-Wavenet-A',
        script: 'ਗੁਰਮੁਖੀ'
      },
      odia: {
        code: 'or-IN',
        name: 'ଓଡ଼ିଆ',
        flag: '🔴🟡',
        voice: 'or-IN-Wavenet-A',
        script: 'ଓଡ଼ିଆ'
      },
      assamese: {
        code: 'as-IN',
        name: 'অসমীয়া',
        flag: '🟢⚪',
        voice: 'as-IN-Wavenet-A',
        script: 'অসমীয়া'
      },
      english: {
        code: 'en-IN',
        name: 'English (Indian)',
        flag: '🇮🇳🇺🇸',
        voice: 'en-IN-Wavenet-A',
        script: 'Latin'
      },
      hinglish: {
        code: 'hi-en-IN',
        name: 'Hinglish',
        flag: '🇮🇳🌐',
        voice: 'mixed',
        script: 'Mixed'
      }
    };
  }

  // Generate voice explanation in specified Indian language
  async generateIndianVoiceExplanation(content, language, voiceOptions = {}) {
    try {
      const langConfig = this.indianLanguages[language];
      if (!langConfig) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const prompt = this.createIndianLanguagePrompt(content, language, langConfig, voiceOptions);
      
      const result = await this.ttsModel.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16000,
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      return result.response.audio();
    } catch (error) {
      console.error('Indian voice generation error:', error);
      throw error;
    }
  }

  // Create language-specific prompts
  createIndianLanguagePrompt(content, language, langConfig, options = {}) {
    const {
      tone = 'encouraging and supportive',
      pace = 'moderate',
      style = 'educational',
      includeTransliteration = false
    } = options;

    const languageInstructions = this.getLanguageSpecificInstructions(language);
    
    return `Please explain the following test series content in ${langConfig.name} (${language}) with a ${tone} tone and ${pace} pace. Use an ${style} style that's culturally appropriate and easy to understand for Indian students.

Content to explain:
${content}

Language: ${langConfig.name} (${langConfig.code})
Script: ${langConfig.script}
Voice Model: ${langConfig.voice}

${languageInstructions}

Additional Instructions:
- Use culturally relevant examples and metaphors
- Maintain appropriate respect and encouragement
- Explain technical terms in simple language
- Use proper pronunciation for Indian names and terms
- Include motivational elements typical in Indian education
${includeTransliteration ? '- Provide transliteration for complex terms' : ''}
- Keep the explanation structured and student-friendly`;
  }

  // Language-specific instructions
  getLanguageSpecificInstructions(language) {
    const instructions = {
      hindi: '- उचित हिंदी शब्दावली का प्रयोग करें\n- देवनागरी लिपि में स्पष्ट उच्चारण\n- भारतीय शिक्षा पद्धति के अनुकूल भाषा\n- प्रेरणादायक और सकारात्मक टोन',
      bengali: '- শুদ্ধ বাংলা ভাষা ব্যবহার করুন\n- বাংলা সংস্কৃতির সাথে সামঞ্জস্যপূর্ণ\n- শিক্ষার্থীদের উৎসাহিত করার মতো ভাষা',
      telugu: '- తెలుగు భాషలో స్పష్టమైన ఉచ్చారణ\n- విద్యార్థులకు అర్థమయ్యే సరళమైన భాষ\n- ప్రేరణాత్మక మరియు మద్దతుగా',
      marathi: '- शुद्ध मराठी भाषेचा वापर\n- महाराष्ट्रीय संस्कृतीनुसार भाषा\n- विद्यार्थ्यांना प्रेरणा देणारी भाषा',
      tamil: '- தூய தமிழ் மொழியில் விளக்கம்\n- தமிழ் கலாச்சாரத்திற்கு ஏற்ற மொழி\n- மாணவர்களை ஊக்குவிக்கும் தொனி',
      gujarati: '- શુદ્ધ ગુજરાતી ભાષાનો ઉપયોગ\n- ગુજરાતી સંસ્કૃતિ અનુકૂળ\n- વિદ્યાર્થીઓને પ્રેરણા આપતી ભાષા',
      kannada: '- ಶುದ್ಧ ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ವಿವರಣೆ\n- ಕರ್ನಾಟಕ ಸಂಸ್ಕೃತಿಗೆ ಸೂಕ್ತವಾದ ಭಾಷೆ\n- ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಪ್ರೇರೇಪಿಸುವ ಭಾಷೆ',
      malayalam: '- ശുദ്ധമലയാളത്തിൽ വിശദീകരണം\n- കേരള സംസ്കാരത്തിന് അനുയോജ്യമായ ഭാഷ\n- വിദ്യാർത്ഥികളെ പ്രോത്സാഹിപ്പിക്കുന്ന ഭാഷ',
      punjabi: '- ਸ਼ੁੱਧ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਦਾ ਪ੍ਰਯੋਗ\n- ਪੰਜਾਬੀ ਸੱਭਿਆਚਾਰ ਅਨੁਕੂਲ\n- ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਪ੍ਰੇਰਨਾ ਦੇਣ ਵਾਲੀ ਭਾਸ਼ਾ',
      odia: '- ଶୁଦ୍ଧ ଓଡ଼ିଆ ଭାଷାରେ ବ୍ୟାଖ୍ୟା\n- ଓଡ଼ିଶା ସଂସ୍କୃତି ଅନୁକୂଳ\n- ଛାତ୍ରଛାତ୍ରୀଙ୍କୁ ଉତ୍ସାହିତ କରୁଥିବା ଭାଷା',
      assamese: '- শুদ্ধ অসমীয়া ভাষাত ব্যাখ্যা\n- অসমীয়া সংস্কৃতিৰ লগত খাপ খোৱা\n- ছাত্ৰ-ছাত্ৰীক উৎসাহিত কৰা ভাষা',
      english: '- Use Indian English pronunciation and vocabulary\n- Include Indian cultural context\n- Use familiar Indian educational terms',
      hinglish: '- Mix Hindi and English naturally\n- Use common Hinglish expressions\n- Maintain cultural authenticity'
    };

    return instructions[language] || instructions.english;
  }

  // Translate content for better voice generation
  async translateContent(content, targetLanguage) {
    try {
      const translateModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Translate the following educational content to ${targetLanguage}, maintaining the educational context and making it culturally appropriate for Indian students:

${content}

Requirements:
- Maintain technical accuracy
- Use appropriate educational terminology
- Keep the encouraging and supportive tone
- Make it culturally relevant for Indian students`;

      const result = await translateModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Translation error:', error);
      return content; // Fallback to original content
    }
  }
}

export default IndianLanguageVoiceService;
