import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * useLanguageTranslation hook
 * @param {string} text - Original text to translate
 * @param {string} targetLanguage - Target language code (e.g. 'hi', 'bn', 'ta')
 * @param {boolean} autoTranslate - Whether to autostart translation on dependencies change
 */
const useLanguageTranslation = (text, targetLanguage, autoTranslate = true) => {
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Translation function (replace API_URL with your translation API endpoint)
  const translateText = async (input, target) => {
    try {
      setLoading(true);
      setError(null);
      // Example using Google Translate API or your custom backend
      const response = await axios.post('/api/translate', {
        text: input,
        targetLanguage: target
      });
      if (response.data && response.data.translatedText) {
        setTranslatedText(response.data.translatedText);
      } else {
        setTranslatedText(input); // fallback: original text
      }
    } catch (err) {
      setError('Translation failed');
      setTranslatedText(input); // fallback on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoTranslate) return;
    if (!text || !targetLanguage) {
      setTranslatedText(text);
      return;
    }
    translateText(text, targetLanguage);
  }, [text, targetLanguage, autoTranslate]);

  return {
    translatedText,
    loading,
    error,
    translateText // manual trigger if needed
  };
};

export default useLanguageTranslation;
