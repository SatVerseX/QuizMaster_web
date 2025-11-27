import { GoogleGenerativeAI } from '@google/generative-ai';

class LiveVoiceAssistant {
  constructor(apiKey) {
    if (!apiKey) throw new Error("API Key is required for LiveVoiceAssistant");
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using the specialized model for low-latency audio interaction
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
    });
    
    this.session = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  /**
   * Initializes the chat session with system instructions.
   */
  async startSession(systemPrompt) {
    try {
      this.session = await this.model.startChat({
        systemInstruction: systemPrompt || "You are a helpful tutor assisting a student with quiz questions.",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500, // Keep responses concise for voice
        }
      });
      return this.session;
    } catch (error) {
      console.error('Failed to start live session:', error);
      throw new Error("Could not initialize AI session. Check API Key.");
    }
  }

  /**
   * Requests microphone access and begins recording.
   */
  async startListening() {
    try {
      this.audioChunks = [];
      
      // Browser permissions check
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error("Microphone Access Error:", error);
      throw new Error("Microphone access denied. Please enable permissions.");
    }
  }

  /**
   * Stops recording and returns the audio Blob.
   * @returns {Promise<Blob>}
   */
  async stopListening() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup(); // Release stream
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Sends audio data to the model and gets a response.
   * @param {Blob} audioBlob 
   */
  async sendAudioInput(audioBlob) {
    if (!this.session) throw new Error('Session not initialized');
    
    try {
      // Convert Blob to Base64 as Gemini API currently expects inline data parts
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Prepare the multimodal part
      const audioPart = {
        inlineData: {
          data: base64Audio,
          mimeType: 'audio/webm'
        }
      };

      const result = await this.session.sendMessage([audioPart]);
      const response = await result.response;
      
      // The response might text, or if configured, audio data.
      // For this implementation, we return the text, which the UI can then TTS if needed.
      return response.text();

    } catch (error) {
      console.error('Error sending audio message:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert Blob to Base64 string (stripping header)
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Cleanup media streams to turn off the microphone light.
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default LiveVoiceAssistant;