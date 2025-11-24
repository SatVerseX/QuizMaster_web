import { db } from '../lib/firebase'; 
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp, 
  writeBatch, 
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { generateFlashcardContent } from './geminiService'; // Ensure this path is correct

export const FlashcardService = {
  
  /**
   * 1. CREATE: Generate cards from mistakes
   */
  createFromMistakes: async (userId, mistakes, sourceTitle) => {
    if (!userId) throw new Error("User ID is required");
    if (!mistakes || mistakes.length === 0) return;

    try {
      // Generate AI content (assuming geminiService exists and works)
      // If generateFlashcardContent fails, we fall back to raw question/answer
      const aiPromises = mistakes.map(async (m) => {
        try {
          return await generateFlashcardContent(m);
        } catch (e) {
          console.warn("AI Generation failed for card, using raw data", e);
          return {
            front: m.question,
            back: m.options ? m.options[m.correctAnswer] : m.correctAnswer,
          };
        }
      });
      
      const aiResults = await Promise.all(aiPromises);

      const batch = writeBatch(db);
      const collectionRef = collection(db, 'flashcards');

      aiResults.forEach((content, index) => {
        const docRef = doc(collectionRef);
        const originalQuestion = mistakes[index];

        batch.set(docRef, {
          userId: userId,
          front: content.front || originalQuestion.question,
          back: content.back || originalQuestion.options?.[originalQuestion.correctAnswer] || "Answer not found",
          source: sourceTitle || 'Mistakes Review',
          createdAt: serverTimestamp(),
          
          // CRITICAL: Set nextReview to NOW or slightly in the past so it appears immediately
          nextReview: Timestamp.now(), 
          
          interval: 0, // Days until next review
          easeFactor: 2.5, // Standard SM-2 starting ease
          streak: 0,
          mastered: false
        });
      });

      await batch.commit();
      return true;

    } catch (error) {
      console.error("Flashcard Service Error:", error);
      if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        throw new Error("AdBlocker detected. Please disable it to save flashcards.");
      }
      throw error;
    }
  },

  /**
   * 2. READ: Get cards due for review
   * Note: This requires a Firestore Index (userId + nextReview). 
   * Check your browser console for a link to create it if queries fail.
   */
  getDueCards: async (userId) => {
    try {
      const cardsRef = collection(db, 'flashcards');
      const q = query(
        cardsRef,
        where('userId', '==', userId),
        where('nextReview', '<=', Timestamp.now())
        // orderBy('nextReview', 'asc') // Optional: requires strictly matching index
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting due cards:", error);
      return [];
    }
  },

  /**
   * 3. READ: Get ALL cards for stats (Total Cards count)
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
   * 4. UPDATE: Submit a review (Spaced Repetition Logic)
   * Quality: 0 (Forgot), 3 (Hard), 5 (Easy)
   */
  submitReview: async (cardId, quality, currentCard) => {
    try {
      const cardRef = doc(db, 'flashcards', cardId);
      
      // Calculate new values based on simplified SM-2 algorithm
      let { interval, easeFactor, streak } = currentCard;
      
      // Defaults if missing
      interval = interval || 0;
      easeFactor = easeFactor || 2.5;
      streak = streak || 0;

      if (quality < 3) {
        // Failed: Reset streak and interval
        streak = 0;
        interval = 1; // Review again tomorrow (or set to 0 for same-day loop)
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
        
        // Adjust ease factor
        // easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (quality === 3) easeFactor = Math.max(1.3, easeFactor - 0.15); // Hard -> Decrease ease
        if (quality === 5) easeFactor = easeFactor + 0.15; // Easy -> Increase ease
      }

      // Calculate next review date
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);

      await updateDoc(cardRef, {
        nextReview: Timestamp.fromDate(nextDate),
        interval,
        easeFactor,
        streak,
        lastReviewed: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error("Error submitting review:", error);
      return false;
    }
  }
};