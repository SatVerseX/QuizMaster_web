import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  runTransaction,
  limit,
  orderBy
} from 'firebase/firestore';

const RATINGS_COLLECTION = 'test-series-ratings';
const TEST_SERIES_COLLECTION = 'test-series';
const TEST_ATTEMPTS_COLLECTION = 'test-attempts';
const QUIZ_ATTEMPTS_COLLECTION = 'quiz-attempts';

// Custom error classes for better error handling
class RatingError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'RatingError';
    this.code = code;
    this.details = details;
  }
}

// Input validation helper
function validateRatingInput({ seriesId, userId, value }) {
  const errors = {};
  
  if (!seriesId || typeof seriesId !== 'string' || seriesId.trim().length === 0) {
    errors.seriesId = 'Valid seriesId is required';
  }
  
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    errors.userId = 'Valid userId is required';
  }
  
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < 1 || numValue > 5) {
    errors.value = 'Rating value must be between 1 and 5';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new RatingError('Validation failed', 'VALIDATION_ERROR', { errors });
  }
  
  return {
    seriesId: seriesId.trim(),
    userId: userId.trim(),
    value: Math.round(numValue) // Ensure integer value
  };
}

// Improved submit rating with transaction support
export async function submitRating({ seriesId, userId, value }) {
  try {
    // Validate input
    const validatedData = validateRatingInput({ seriesId, userId, value });
    
    // Check if user can rate (with improved efficiency)
    const canRate = await canUserRate(validatedData.seriesId, validatedData.userId);
    if (!canRate) {
      throw new RatingError(
        'User is not eligible to rate this test series. Complete the test/quiz first.',
        'NOT_ELIGIBLE',
        { seriesId, userId }
      );
    }

    // First, write the user's rating document (allowed by rules)
    const ratingDocRef = doc(db, RATINGS_COLLECTION, `${validatedData.seriesId}_${validatedData.userId}`);
    await setDoc(ratingDocRef, {
      seriesId: validatedData.seriesId,
      userId: validatedData.userId,
      value: validatedData.value,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Then, poll for server-side aggregate (Cloud Function updates it). Avoid client writes.
    try {
      const maxAttempts = 5;
      const delayMs = 500;
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

      let aggregate = null;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        aggregate = await getSeriesAggregate(validatedData.seriesId);
        // If ratingsCount > 0, we likely see the updated aggregate; break early
        if (aggregate && (aggregate.ratingsCount >= 1 || aggregate.lastUpdated)) {
          break;
        }
        await sleep(delayMs);
      }
      return { success: true, ...(aggregate || {}), degraded: !aggregate };
    } catch (_) {
      // Not critical for user flow; UI can show user's rating immediately
      return { success: true, degraded: true };
    }
    
  } catch (error) {
    // Fallback: if transaction fails due to permissions, at least save the user's rating doc
    try {
      const validatedData = validateRatingInput({ seriesId, userId, value });
      const ratingDocRef = doc(db, RATINGS_COLLECTION, `${validatedData.seriesId}_${validatedData.userId}`);
      await setDoc(ratingDocRef, {
        seriesId: validatedData.seriesId,
        userId: validatedData.userId,
        value: validatedData.value,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return { success: true, averageRating: undefined, ratingsCount: undefined, isUpdate: undefined, degraded: true };
    } catch (fallbackErr) {
      if (error instanceof RatingError) {
        throw error;
      }
      throw new RatingError(
        'Failed to submit rating due to server error',
        'SERVER_ERROR',
        { originalError: error.message || String(error) }
      );
    }
  }
}

// Enhanced getUserRating with error handling
export async function getUserRating({ seriesId, userId }) {
  try {
    if (!seriesId || !userId) {
      throw new RatingError('Both seriesId and userId are required', 'MISSING_PARAMS');
    }
    
    const ratingDocRef = doc(db, RATINGS_COLLECTION, `${seriesId}_${userId}`);
    const snap = await getDoc(ratingDocRef);
    
    return snap.exists() ? { 
      ...snap.data(), 
      id: snap.id 
    } : null;
    
  } catch (error) {
    // If permission denied or not found, just return null silently
    return null;
  }
}

// Improved getSeriesAggregate with caching consideration
export async function getSeriesAggregate(seriesId) {
  try {
    if (!seriesId || typeof seriesId !== 'string') {
      throw new RatingError('Valid seriesId is required', 'INVALID_SERIES_ID');
    }
    
    const seriesRef = doc(db, TEST_SERIES_COLLECTION, seriesId);
    const snap = await getDoc(seriesRef);
    
    if (!snap.exists()) {
      throw new RatingError('Test series not found', 'SERIES_NOT_FOUND', { seriesId });
    }
    
    const data = snap.data();
    return {
      averageRating: Number(data.averageRating) || 0,
      ratingsCount: Number(data.ratingsCount) || 0,
      lastUpdated: data.ratingsUpdatedAt || null,
    };
    
  } catch (error) {
    if (error instanceof RatingError) {
      throw error;
    }
    
    console.error('Error getting series aggregate:', error);
    throw new RatingError('Failed to retrieve rating aggregate', 'FETCH_ERROR');
  }
}

// More efficient canUserRate function
export async function canUserRate(seriesId, userId) {
  try {
    if (!seriesId || !userId) {
      return false;
    }
    
    // Use Promise.allSettled to handle potential errors in individual queries
    const [testResult, quizResult] = await Promise.allSettled([
      getDocs(query(
        collection(db, TEST_ATTEMPTS_COLLECTION), 
        where('userId', '==', userId),
        where('testSeriesId', '==', seriesId),
        limit(1) // We only need to know if at least one exists
      )),
      getDocs(query(
        collection(db, QUIZ_ATTEMPTS_COLLECTION), 
        where('userId', '==', userId),
        where('testSeriesId', '==', seriesId),
        limit(1) // We only need to know if at least one exists
      ))
    ]);
    
    // Check if either query found results
    const hasTestAttempt = testResult.status === 'fulfilled' && !testResult.value.empty;
    const hasQuizAttempt = quizResult.status === 'fulfilled' && !quizResult.value.empty;
    
    return hasTestAttempt || hasQuizAttempt;
    
  } catch (error) {
    console.error('Error checking user rating eligibility:', error);
    // Return false on error to be safe
    return false;
  }
}

// Optional: Get recent ratings for a series
export async function getRecentRatings(seriesId, limitCount = 10) {
  try {
    if (!seriesId) {
      throw new RatingError('seriesId is required', 'MISSING_SERIES_ID');
    }
    
    const ratingsQuery = query(
      collection(db, RATINGS_COLLECTION),
      where('seriesId', '==', seriesId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(ratingsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error getting recent ratings:', error);
    throw new RatingError('Failed to retrieve recent ratings', 'FETCH_ERROR');
  }
}

// Optional: Batch recompute for data migration or fixing
export async function recomputeSeriesAggregate(seriesId) {
  try {
    if (!seriesId) {
      throw new RatingError('seriesId is required', 'MISSING_SERIES_ID');
    }
    
    const ratingsQuery = query(
      collection(db, RATINGS_COLLECTION), 
      where('seriesId', '==', seriesId)
    );
    
    const [ratingsSnap, seriesSnap] = await Promise.all([
      getDocs(ratingsQuery),
      getDoc(doc(db, TEST_SERIES_COLLECTION, seriesId))
    ]);
    
    if (!seriesSnap.exists()) {
      throw new RatingError('Test series not found', 'SERIES_NOT_FOUND', { seriesId });
    }
    
    const ratings = ratingsSnap.docs
      .map(d => Number(d.data().value))
      .filter(v => v >= 1 && v <= 5);
    
    const count = ratings.length;
    const average = count > 0 
      ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / count).toFixed(2))
      : 0;

    const seriesRef = doc(db, TEST_SERIES_COLLECTION, seriesId);
    await updateDoc(seriesRef, {
      averageRating: average,
      ratingsCount: count,
      ratingsUpdatedAt: serverTimestamp(),
    });

    return { averageRating: average, ratingsCount: count };
    
  } catch (error) {
    if (error instanceof RatingError) {
      throw error;
    }
    
    console.error('Error recomputing series aggregate:', error);
    throw new RatingError('Failed to recompute rating aggregate', 'RECOMPUTE_ERROR');
  }
}

// Export the error class for use in components
export { RatingError };
