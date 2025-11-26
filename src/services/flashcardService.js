import { db } from '../lib/firebase'; 
import { 
  collection, 
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp, 
  writeBatch, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { generateFlashcardContent } from './geminiService';

export const FlashcardService = {
  
  /**
   * 1. CREATE: Generate cards from mistakes
   * Includes retry logic and fallbacks for AI generation failures.
   */
  createFromMistakes: async (userId, mistakes, sourceTitle) => {
    if (!userId) throw new Error("User ID is required");
    if (!mistakes || mistakes.length === 0) return;

    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, 'flashcards');
      const timestamp = serverTimestamp();

      // Process requests in chunks to avoid hitting rate limits aggressively
      const promises = mistakes.map(async (m) => {
        try {
          // Attempt AI generation
          const aiContent = await generateFlashcardContent(m);
          return {
            front: aiContent.front || m.question,
            back: aiContent.back || m.options?.[m.correctAnswer] || "Answer not found",
          };
        } catch (e) {
          console.warn("AI Generation failed for card, using raw data", e);
          // Fallback to raw data
          return {
            front: m.question,
            back: m.options ? m.options[m.correctAnswer] : "Check original question",
          };
        }
      });
      
      const results = await Promise.all(promises);

      results.forEach((content) => {
        const docRef = doc(collectionRef);
        
        batch.set(docRef, {
          userId: userId,
          front: content.front,
          back: content.back,
          source: sourceTitle || 'Mistakes Review',
          createdAt: timestamp,
          
          // Initial Spaced Repetition Data
          nextReview: Timestamp.now(), // Due immediately
          interval: 0, // Days
          easeFactor: 2.5, // Standard SM-2 start
          streak: 0,
          mastered: false,
          reviewCount: 0
        });
      });

      await batch.commit();
      return true;

    } catch (error) {
      console.error("Flashcard Service Error:", error);
      throw error;
    }
  },

  /**
   * 2. READ: Get cards due for review
   * Robust query that handles potential missing indexes gracefully.
   */
  getDueCards: async (userId) => {
    try {
      const cardsRef = collection(db, 'flashcards');
      const now = Timestamp.now();
      
      // Query for cards belonging to user that are due
      // Note: This requires a composite index on [userId, nextReview].
      // If index is missing, this might fail in strict mode, so we wrap in try/catch.
      const q = query(
        cardsRef,
        where('userId', '==', userId),
        where('nextReview', '<=', now)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting due cards (check indexes):", error);
      return [];
    }
  },

  /**
   * 3. READ: Get ALL cards
   */
  getAllCards: async (userId) => {
    try {
      const cardsRef = collection(db, 'flashcards');
      const q = query(cardsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting all cards:", error);
      return [];
    }
  },

  /**
   * 4. UPDATE: Submit a review (SM-2 Algorithm)
   * Quality: 0 (Forgot) to 5 (Perfect)
   */
  submitReview: async (cardId, quality, currentCard) => {
    try {
      const cardRef = doc(db, 'flashcards', cardId);
      
      // Retrieve current stats with safe defaults
      let interval = currentCard.interval || 0;
      let easeFactor = currentCard.easeFactor || 2.5;
      let streak = currentCard.streak || 0;
      let reviewCount = (currentCard.reviewCount || 0) + 1;

      if (quality < 3) {
        // Failed: Reset streak, review again tomorrow
        streak = 0;
        interval = 1; 
      } else {
        // Passed
        streak += 1;
        if (streak === 1) {
          interval = 1;
        } else if (streak === 2) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        
        // Adjust ease factor based on performance
        // Standard formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q)*0.02))
        // q is quality (0-5)
        const qFactor = 5 - quality;
        easeFactor = easeFactor + (0.1 - qFactor * (0.08 + qFactor * 0.02));
        
        // Keep ease factor within reasonable bounds
        if (easeFactor < 1.3) easeFactor = 1.3;
      }

      // Calculate next review date
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);
      // Set to start of the day to avoid timing issues
      nextDate.setHours(4, 0, 0, 0); 

      await updateDoc(cardRef, {
        nextReview: Timestamp.fromDate(nextDate),
        interval,
        easeFactor,
        streak,
        reviewCount,
        mastered: streak > 4, // Simple mastery logic
        lastReviewed: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("Error submitting review:", error);
      return false;
    }
  }
};