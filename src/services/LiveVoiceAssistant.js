import { GoogleGenerativeAI } from '@google/generative-ai';

class LiveVoiceAssistant {
  constructor(apiKey) {
    if (!apiKey) throw new Error("API Key is required");
    
    // Use standard 1.5 Flash model
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.chat = null;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
  }

  async startSession(systemPrompt) {
    // Start a standard chat session
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `System Instruction: ${systemPrompt}` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to help the student as a tutor." }],
        },
      ],
    });
  }

  /**
   * Starts listening using browser SpeechRecognition
   */
  startListening() {
    return new Promise((resolve, reject) => {
      // Browser compatibility check
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error("Browser does not support Speech Recognition"));
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Sends text to Gemini and speaks the response
   */
  async sendInput(text) {
    if (!this.chat) throw new Error("Session not initialized");

    try {
      // 1. Get text response from Gemini
      const result = await this.chat.sendMessage(text);
      const responseText = result.response.text();

      // 2. Speak response using Web Speech API
      this.speak(responseText);

      return responseText;
    } catch (error) {
      console.error("AI Error:", error);
      throw error;
    }
  }

  speak(text) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    this.synthesis.speak(utterance);
  }
}

export default LiveVoiceAssistant;