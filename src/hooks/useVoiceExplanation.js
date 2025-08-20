import { useState, useCallback } from "react";
import axios from "axios";

/**
 * useVoiceExplanation - Custom hook to generate voice explanation from text
 * @returns {Object} - { generateVoice, audioBlob, isLoading, error }
 */
const useVoiceExplanation = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * generateVoice - Generates the voice explanation by calling backend or API
   * @param {string} text - Text content for voice explanation
   * @param {Object} options - Options such as language, tone, speed, etc.
   * @returns {Promise<Blob>} - Audio Blob of generated voice
   */
  const generateVoice = useCallback(async (text, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      // Replace URL with your backend or direct cloud function endpoint
      const response = await axios.post(
        "/api/voice/explanation",
        { text, options },
        { responseType: "blob" }
      );
      setAudioBlob(response.data);
      return response.data;
    } catch (err) {
      setError("Failed to generate voice explanation");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generateVoice, audioBlob, isLoading, error };
};

export default useVoiceExplanation;
