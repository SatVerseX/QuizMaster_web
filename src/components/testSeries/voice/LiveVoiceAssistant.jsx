import { GoogleGenerativeAI } from '@google/generative-ai';

class LiveVoiceAssistant {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
    });
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async startSession(systemPrompt) {
    try {
      this.session = await this.model.startChat({
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8000,
        }
      });
      return this.session;
    } catch (error) {
      console.error('Failed to start live session:', error);
      throw error;
    }
  }

  async startListening() {
    if (this.isListening) return;
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (e) => {
      this.audioChunks.push(e.data);
    };

    this.mediaRecorder.start();
    this.isListening = true;
  }

  async stopListening() {
    if (!this.mediaRecorder || !this.isListening) return null;

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.isListening = false;
        resolve(audioBlob);
      };
      this.mediaRecorder.stop();
    });
  }

  async sendAudioInput(audioBlob) {
    if (!this.session) throw new Error('Session not initialized');
    try {
      await this.session.sendAudioMessage(audioBlob);
      const response = await this.session.receiveResponse();
      return response;
    } catch (error) {
      console.error('Error sending audio message:', error);
      throw error;
    }
  }
}

export default LiveVoiceAssistant;
