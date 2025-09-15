import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateTestSeriesRecommendations, analyzeUserPerformance } from './geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Service for collecting and analyzing user performance data
 * and generating AI-powered recommendations
 */

export const collectUserAnalytics = async (userId) => {
  try {
    // Collect recent test attempts
    const attemptsQuery = query(
      collection(db, 'test-attempts'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(20)
    );
    
    const attemptsSnapshot = await getDocs(attemptsQuery);
    const recentAttempts = attemptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Collect quiz attempts
    const quizAttemptsQuery = query(
      collection(db, 'quiz-attempts'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(20)
    );
    
    const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);
    const recentQuizAttempts = quizAttemptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Collect user subscriptions
    const subscriptionsQuery = query(
      collection(db, 'test-series-subscriptions'),
      where('userId', '==', userId),
      orderBy('subscribedAt', 'desc')
    );
    
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    const subscribedSeries = subscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get test series details for subscribed series
    const subscribedSeriesDetails = await Promise.all(
      subscribedSeries.map(async (sub) => {
        try {
          const seriesId = sub.seriesId || sub.testSeriesId;
          if (!seriesId || typeof seriesId !== 'string') {
            console.warn('Invalid seriesId in subscription:', sub);
            return sub;
          }
          
          const seriesDoc = await getDoc(doc(db, 'test-series', seriesId));
          return seriesDoc.exists() ? { ...sub, seriesData: seriesDoc.data() } : sub;
        } catch (error) {
          console.error('Error fetching series details:', error);
          return sub;
        }
      })
    );

    return {
      recentAttempts: [...recentAttempts, ...recentQuizAttempts],
      subscribedSeries: subscribedSeriesDetails,
      totalAttempts: recentAttempts.length + recentQuizAttempts.length,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error collecting user analytics:', error);
    return {
      recentAttempts: [],
      subscribedSeries: [],
      totalAttempts: 0,
      lastUpdated: new Date(),
      error: error.message
    };
  }
};

export const buildUserProfile = (analyticsData) => {
  if (!analyticsData || typeof analyticsData !== 'object') {
    console.warn('Invalid analytics data provided to buildUserProfile');
    return {
      averageScore: 0,
      totalAttempts: 0,
      preferredCategories: [],
      weakAreas: [],
      strongAreas: [],
      studyPatterns: {},
      recentActivity: []
    };
  }

  const { recentAttempts = [], subscribedSeries = [] } = analyticsData;
  
  // Analyze performance patterns with safety checks
  const performanceHistory = (recentAttempts || []).map(attempt => {
    if (!attempt || typeof attempt !== 'object') {
      return {
        score: 0,
        subject: 'Unknown',
        category: 'General',
        difficulty: 'medium',
        timeSpent: 0,
        completedAt: new Date()
      };
    }
    
    return {
      score: attempt.percentage || attempt.score || 0,
      subject: attempt.testTitle || attempt.quizTitle || 'Unknown',
      category: attempt.testSeriesTitle || attempt.category || 'General',
      difficulty: attempt.difficulty || 'medium',
      timeSpent: attempt.timeSpent || 0,
      completedAt: attempt.completedAt?.toDate?.() || new Date(attempt.completedAt || new Date())
    };
  });

  // Calculate overall average score
  const totalScore = performanceHistory.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = performanceHistory.length > 0 ? Math.round(totalScore / performanceHistory.length) : 0;

  // Calculate average scores by category and subject
  const categoryScores = {};
  const subjectScores = {};
  const categoryAttempts = {};
  
  performanceHistory.forEach(attempt => {
    const category = attempt.category;
    const subject = attempt.subject;
    
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, scores: [] };
      categoryAttempts[category] = 0;
    }
    if (!subjectScores[subject]) {
      subjectScores[subject] = { total: 0, count: 0, scores: [] };
    }
    
    categoryScores[category].total += attempt.score;
    categoryScores[category].count += 1;
    categoryScores[category].scores.push(attempt.score);
    categoryAttempts[category] += 1;
    
    subjectScores[subject].total += attempt.score;
    subjectScores[subject].count += 1;
    subjectScores[subject].scores.push(attempt.score);
  });

  // Calculate preferred categories based on frequency and performance
  const preferredCategories = Object.entries(categoryAttempts)
    .filter(([category, count]) => count >= 2)
    .sort((a, b) => {
      const aAvg = categoryScores[a[0]]?.count > 0 ? categoryScores[a[0]].total / categoryScores[a[0]].count : 0;
      const bAvg = categoryScores[b[0]]?.count > 0 ? categoryScores[b[0]].total / categoryScores[b[0]].count : 0;
      return (b[1] * 0.7 + bAvg * 0.3) - (a[1] * 0.7 + aAvg * 0.3);
    })
    .slice(0, 3)
    .map(([category]) => category);

  // Identify strong and weak areas
  const strongAreas = Object.entries(subjectScores)
    .filter(([_, data]) => data.count >= 2)
    .map(([subject, data]) => ({
      subject,
      averageScore: Math.round(data.total / data.count),
      consistency: calculateConsistency(data.scores)
    }))
    .filter(area => area.averageScore >= 70)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);

  const weakAreas = Object.entries(subjectScores)
    .filter(([_, data]) => data.count >= 2)
    .map(([subject, data]) => ({
      subject,
      averageScore: Math.round(data.total / data.count),
      consistency: calculateConsistency(data.scores)
    }))
    .filter(area => area.averageScore < 60)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  // Extract exam goals from subscribed series with safety checks
  const examGoals = [...new Set((subscribedSeries || [])
    .filter(sub => sub && typeof sub === 'object' && sub.seriesData)
    .map(sub => sub.seriesData?.examSubcategory)
    .filter(Boolean)
  )];

  // Calculate study time patterns with safety checks
  const studyTimePatterns = analyzeStudyTimePatterns(recentAttempts || []);

  // Get recent activity (last 5 attempts with basic info)
  const recentActivity = performanceHistory.slice(0, 5).map(attempt => ({
    subject: attempt.subject,
    score: attempt.score,
    completedAt: attempt.completedAt
  }));

  return {
    averageScore,
    totalAttempts: performanceHistory.length,
    recentAttempts: recentAttempts.slice(0, 10),
    subscribedSeries: subscribedSeries.slice(0, 5),
    performanceHistory,
    strongAreas: strongAreas.map(area => area.subject),
    weakAreas: weakAreas.map(area => area.subject),
    preferredCategories,
    examGoals,
    studyTimeAvailable: studyTimePatterns.averageDailyTime,
    categoryPerformance: categoryScores,
    subjectPerformance: subjectScores,
    recentActivity,
    lastActivity: recentAttempts[0]?.completedAt?.toDate?.() || new Date(recentAttempts[0]?.completedAt || new Date())
  };
};

const calculateConsistency = (scores) => {
  if (scores.length < 2) return 'low';
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((acc, score) => {
    return acc + Math.pow(score - mean, 2);
  }, 0) / scores.length;
  
  const standardDeviation = Math.sqrt(variance);
  if (standardDeviation < 10) return 'high';
  if (standardDeviation < 20) return 'medium';
  return 'low';
};

const analyzeStudyTimePatterns = (attempts) => {
  const dailyTime = {};
  
  if (!Array.isArray(attempts)) {
    return {
      averageDailyTime: '0h',
      mostActiveDay: 'Monday',
      totalStudyTime: 0
    };
  }
  
  attempts.forEach(attempt => {
    if (!attempt || typeof attempt !== 'object') return;
    
    try {
      const date = attempt.completedAt?.toDate?.() || new Date(attempt.completedAt || new Date());
      const dayKey = date.toISOString().split('T')[0];
      
      if (!dailyTime[dayKey]) {
        dailyTime[dayKey] = 0;
      }
      dailyTime[dayKey] += attempt.timeSpent || 0;
    } catch (error) {
      console.warn('Error processing attempt for study time analysis:', error);
    }
  });

  const dailyTimes = Object.values(dailyTime);
  const averageDailyTime = dailyTimes.length > 0 
    ? Math.round(dailyTimes.reduce((sum, time) => sum + time, 0) / dailyTimes.length / 60)
    : 0;

  return {
    averageDailyTime: `${averageDailyTime}h`,
    studyDays: dailyTimes.length,
    totalStudyTime: Math.round(dailyTimes.reduce((sum, time) => sum + time, 0) / 60)
  };
};

// Check if user has already received recommendations today
export const hasUserReceivedRecommendationsToday = async (userId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const userRecDoc = await getDoc(doc(db, 'user-recommendations', userId));
    
    if (!userRecDoc.exists()) {
      return false;
    }
    
    const userRecData = userRecDoc.data();
    const lastGenerated = userRecData.lastGenerated?.toDate();
    
    if (!lastGenerated) {
      return false;
    }
    
    // Check if last generation was today
    return lastGenerated >= startOfDay;
  } catch (error) {
    console.error('Error checking daily recommendations:', error);
    return false; // Allow generation if check fails
  }
};

// Get cached recommendations for today
export const getCachedRecommendations = async (userId) => {
  try {
    const userRecDoc = await getDoc(doc(db, 'user-recommendations', userId));
    
    if (!userRecDoc.exists()) {
      return null;
    }
    
    const userRecData = userRecDoc.data();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastGenerated = userRecData.lastGenerated?.toDate();
    
    // Return cached recommendations if generated today
    if (lastGenerated && lastGenerated >= startOfDay) {
      return userRecData.recommendations || [];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached recommendations:', error);
    return null;
  }
};

export const generatePersonalizedRecommendations = async (userId) => {
  try {
    // Check if user already received recommendations today
    const hasReceivedToday = await hasUserReceivedRecommendationsToday(userId);
    
    if (hasReceivedToday) {
      // Return cached recommendations
      const cachedRecommendations = await getCachedRecommendations(userId);
      if (cachedRecommendations && cachedRecommendations.length > 0) {
        return {
          success: true,
          data: cachedRecommendations,
          cached: true,
          message: 'Using cached recommendations from today'
        };
      }
    }

    // Collect user analytics
    const analyticsData = await collectUserAnalytics(userId);
    
    if (analyticsData.totalAttempts === 0) {
      return {
        success: true,
        data: [],
        message: 'No attempts found. Complete some tests to get personalized recommendations.'
      };
    }

    // Build user profile
    const userProfile = buildUserProfile(analyticsData);

    // Fetch existing test series from database
    const existingTestSeries = await fetchExistingTestSeries();
    
    if (existingTestSeries.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No test series available for recommendations.'
      };
    }

    // Use AI to rank and recommend existing test series
    const recommendations = await generateRecommendationsFromExistingSeries(userProfile, existingTestSeries);

    if (!recommendations.success) {
      console.error('Failed to generate recommendations:', recommendations.error);
      return {
        success: false,
        data: [],
        error: recommendations.error
      };
    }

    // Save recommendations to user analytics with timestamp
    await saveUserRecommendations(userId, recommendations.data, userProfile);

    return {
      success: true,
      data: recommendations.data,
      userProfile,
      cached: false
    };
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export const saveUserRecommendations = async (userId, recommendations, userProfile) => {
  try {
    // Save to user-recommendations collection with timestamp for daily tracking
    const userRecDoc = doc(db, 'user-recommendations', userId);
    
    const userRecData = {
      recommendations,
      userProfile,
      lastGenerated: serverTimestamp(),
      recommendationCount: recommendations.length,
      userId: userId
    };

    await setDoc(userRecDoc, userRecData, { merge: true });
    
    // Also save to user-analytics for backward compatibility
    const analyticsDoc = doc(db, 'user-analytics', userId);
    
    const analyticsData = {
      recommendations,
      userProfile,
      lastUpdated: serverTimestamp(),
      recommendationCount: recommendations.length
    };

    await setDoc(analyticsDoc, analyticsData, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user recommendations:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRecommendations = async (userId) => {
  try {
    const analyticsDoc = doc(db, 'user-analytics', userId);
    const docSnap = await getDoc(analyticsDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        data: data.recommendations || [],
        userProfile: data.userProfile || {},
        lastUpdated: data.lastUpdated?.toDate?.() || null
      };
    }
    
    return {
      success: true,
      data: [],
      userProfile: {},
      lastUpdated: null
    };
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export const updateUserRecommendations = async (userId, recommendationId, action) => {
  try {
    // Track user interaction with recommendations
    const interactionData = {
      recommendationId,
      action, // 'viewed', 'clicked', 'subscribed', 'dismissed'
      timestamp: serverTimestamp(),
      userId
    };

    await setDoc(doc(db, 'user-recommendation-interactions', `${userId}_${recommendationId}_${Date.now()}`), interactionData);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating recommendation interaction:', error);
    return { success: false, error: error.message };
  }
};

// Fetch existing test series from database
const fetchExistingTestSeries = async () => {
  try {
    const testSeriesRef = collection(db, 'test-series');
    const snapshot = await getDocs(testSeriesRef);
    const testSeries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter only published series
    return testSeries.filter(series => series.isPublished === true);
  } catch (error) {
    console.error('Error fetching existing test series:', error);
    return [];
  }
};

// Debug function removed for production

// Extract recommendations from text when JSON parsing fails
const extractRecommendationsFromText = (responseText, existingTestSeries) => {
  try {
    const recommendations = [];
    
    // Look for ID patterns in the response
    const idMatches = responseText.match(/"id":\s*"([^"]+)"/g);
    if (idMatches) {
      idMatches.forEach(match => {
        const id = match.match(/"id":\s*"([^"]+)"/)[1];
        const series = existingTestSeries.find(s => s.id === id);
        
        if (series) {
          // Extract title if available
          const titleMatch = responseText.match(new RegExp(`"id":\\s*"${id}"[^}]*"title":\\s*"([^"]+)"`));
          const title = titleMatch ? titleMatch[1] : series.title;
          
          recommendations.push({
            id: series.id,
            title: title,
            description: series.description || 'Recommended based on your learning profile',
            category: series.examCategory || 'General',
            difficulty: series.difficulty || 'Medium',
            estimatedDuration: '30 days',
            price: series.price || 0,
            discount: 0,
            reason: 'AI recommended based on your profile',
            tags: [series.examCategory, series.difficulty].filter(Boolean),
            matchScore: 75
          });
        }
      });
    }
    
    return recommendations.slice(0, 3); // Return max 3 recommendations
  } catch (error) {
    console.error('Error extracting recommendations from text:', error);
    return [];
  }
};

// Generate recommendations from existing test series using AI
const generateRecommendationsFromExistingSeries = async (userProfile, existingTestSeries) => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback recommendations');
      const fallbackRecommendations = generateFallbackRecommendationsFromExisting(userProfile, existingTestSeries);
      return {
        success: true,
        data: fallbackRecommendations
      };
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

     // Ultra-concise prompt to avoid truncation
     const prompt = `Recommend 3 test series for user with ${userProfile.averageScore}% avg score, weak areas: ${userProfile.weakAreas.join(', ') || 'None'}.

Available series:
${existingTestSeries.slice(0, 8).map(series => `${series.id}|${series.title}|${series.examCategory || 'General'}|${series.difficulty || 'Medium'}|${series.price || 0}`).join('\n')}

Return JSON:
{"recommendations":[{"id":"series_id","title":"Title","description":"Reason","category":"Category","difficulty":"Medium","price":0,"reason":"Why","matchScore":80}]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

     // Debug logging removed for production

     // Validate response
     if (!responseText || responseText.trim() === '') {
       // Silent fallback to algorithmic recommendations
       const fallbackRecommendations = generateFallbackRecommendationsFromExisting(userProfile, existingTestSeries);
       return {
         success: true,
         data: fallbackRecommendations
       };
     }

     // Parse JSON with error handling and recovery
     let recommendationData;
     try {
       // Try to fix common JSON issues
       let cleanedResponse = responseText.trim();
       
       // If response is truncated, try to complete it
       if (!cleanedResponse.endsWith('}') && !cleanedResponse.endsWith(']')) {
         // Find the last complete object
         const lastCompleteBrace = cleanedResponse.lastIndexOf('}');
         if (lastCompleteBrace > 0) {
           cleanedResponse = cleanedResponse.substring(0, lastCompleteBrace + 1);
         }
       }
       
       // Try to fix unterminated strings
       cleanedResponse = cleanedResponse.replace(/"description":\s*"[^"]*$/gm, '"description": "Recommended based on your learning profile"');
       
       recommendationData = JSON.parse(cleanedResponse);
     } catch (parseError) {
       // Try to extract recommendations manually from the response
       const manualRecommendations = extractRecommendationsFromText(responseText, existingTestSeries);
       if (manualRecommendations.length > 0) {
         return {
           success: true,
           data: manualRecommendations
         };
       }
       
       const fallbackRecommendations = generateFallbackRecommendationsFromExisting(userProfile, existingTestSeries);
       return {
         success: true,
         data: fallbackRecommendations
       };
     }

    // Validate data structure
    if (!recommendationData || !recommendationData.recommendations || !Array.isArray(recommendationData.recommendations)) {
      const fallbackRecommendations = generateFallbackRecommendationsFromExisting(userProfile, existingTestSeries);
      return {
        success: true,
        data: fallbackRecommendations
      };
    }

    // Validate each recommendation has required fields
    const validRecommendations = recommendationData.recommendations.filter(rec => 
      rec && rec.id && rec.title && rec.reason
    );

    if (validRecommendations.length === 0) {
      const fallbackRecommendations = generateFallbackRecommendationsFromExisting(userProfile, existingTestSeries);
      return {
        success: true,
        data: fallbackRecommendations
      };
    }
    
    return {
      success: true,
      data: validRecommendations
    };
  } catch (error) {
    // Always fall back to local recommendations
    const fallbackRecommendations = generateFallbackRecommendationsFromExisting(userProfile, existingTestSeries);
    
    return {
      success: true,
      data: fallbackRecommendations
    };
  }
};

// Enhanced fallback recommendations when AI fails
const generateFallbackRecommendationsFromExisting = (userProfile, existingTestSeries) => {
  if (!existingTestSeries || existingTestSeries.length === 0) {
    return [];
  }

  // Sort series by relevance to user profile
  const scoredSeries = existingTestSeries.map(series => {
    let score = 0;
    
    // Match by category (30 points)
    if (userProfile.preferredCategories && userProfile.preferredCategories.includes(series.examCategory)) {
      score += 30;
    }
    
    // Match by difficulty based on user performance (25 points)
    const avgScore = userProfile.averageScore || 0;
    if (avgScore > 80 && series.difficulty === 'Hard') {
      score += 25;
    } else if (avgScore > 60 && series.difficulty === 'Medium') {
      score += 25;
    } else if (avgScore < 60 && series.difficulty === 'Easy') {
      score += 25;
    }
    
    // Boost score for series addressing weak areas (20 points)
    if (userProfile.weakAreas && userProfile.weakAreas.length > 0) {
      const weakAreaMatch = userProfile.weakAreas.some(area => 
        series.title.toLowerCase().includes(area.toLowerCase()) ||
        series.description?.toLowerCase().includes(area.toLowerCase())
      );
      if (weakAreaMatch) {
        score += 20;
      }
    }
    
    // Boost score for popular series (15 points)
    if (series.totalSubscribers > 100) {
      score += 15;
    } else if (series.totalSubscribers > 50) {
      score += 10;
    } else if (series.totalSubscribers > 10) {
      score += 5;
    }
    
    // Boost score for highly rated series (10 points)
    if (series.rating > 4) {
      score += 10;
    } else if (series.rating > 3.5) {
      score += 5;
    }
    
    // Prefer reasonably priced series (5 points)
    if (series.price <= 3000) {
      score += 5;
    }
    
    return { ...series, matchScore: score };
  });
  
  // Sort by score and return top 5
  const topRecommendations = scoredSeries
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return topRecommendations.map(series => {
    // Determine recommendation reason based on match factors
    let reason = 'Recommended for comprehensive preparation';
    
    if (userProfile.weakAreas && userProfile.weakAreas.length > 0) {
      const weakAreaMatch = userProfile.weakAreas.some(area => 
        series.title.toLowerCase().includes(area.toLowerCase())
      );
      if (weakAreaMatch) {
        reason = `Helps improve your weak areas: ${userProfile.weakAreas.join(', ')}`;
      }
    }
    
    if (userProfile.preferredCategories && userProfile.preferredCategories.includes(series.examCategory)) {
      reason = `Matches your preferred category: ${series.examCategory}`;
    }
    
    if (series.totalSubscribers > 100) {
      reason += ' (Popular choice among students)';
    }

    return {
      id: series.id,
      title: series.title,
      description: series.description || 'Comprehensive test series for exam preparation',
      category: series.examCategory || 'General',
      difficulty: series.difficulty || 'Medium',
      estimatedDuration: '30 days',
      price: series.price || 0,
      discount: 0,
      reason,
      tags: [series.examCategory, series.difficulty].filter(Boolean),
      matchScore: series.matchScore
    };
  });
};

// Enhanced analytics function for better insights
export const getDetailedUserAnalytics = async (userId) => {
  try {
    const analyticsData = await collectUserAnalytics(userId);
    const userProfile = buildUserProfile(analyticsData);
    
    // Calculate additional insights
    const insights = {
      studyStreak: calculateStudyStreak(analyticsData.recentAttempts),
      improvementTrend: calculateImprovementTrend(userProfile.performanceHistory),
      categoryDistribution: calculateCategoryDistribution(userProfile.performanceHistory),
      timeManagement: analyzeTimeManagement(userProfile.performanceHistory),
      goalProgress: analyzeGoalProgress(userProfile)
    };
    
    return {
      success: true,
      userProfile,
      insights,
      rawData: analyticsData
    };
  } catch (error) {
    console.error('Error getting detailed user analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper functions for enhanced analytics
const calculateStudyStreak = (attempts) => {
  if (!attempts || attempts.length === 0) return 0;
  
  const sortedAttempts = attempts
    .map(attempt => attempt.completedAt?.toDate?.() || new Date(attempt.completedAt))
    .sort((a, b) => b - a);
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const attemptDate of sortedAttempts) {
    const daysDiff = Math.floor((currentDate - attemptDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      streak++;
      currentDate = attemptDate;
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateImprovementTrend = (performanceHistory) => {
  if (!performanceHistory || performanceHistory.length < 3) return 'insufficient_data';
  
  const recentScores = performanceHistory.slice(0, 5).map(p => p.score);
  const olderScores = performanceHistory.slice(-5).map(p => p.score);
  
  const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
  
  const improvement = recentAvg - olderAvg;
  
  if (improvement > 10) return 'improving';
  if (improvement < -10) return 'declining';
  return 'stable';
};

const calculateCategoryDistribution = (performanceHistory) => {
  if (!performanceHistory || performanceHistory.length === 0) return {};
  
  const categoryStats = {};
  
  performanceHistory.forEach(attempt => {
    const category = attempt.category;
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        totalScore: 0,
        averageScore: 0
      };
    }
    
    categoryStats[category].count++;
    categoryStats[category].totalScore += attempt.score;
    categoryStats[category].averageScore = Math.round(
      categoryStats[category].totalScore / categoryStats[category].count
    );
  });
  
  return categoryStats;
};

const analyzeTimeManagement = (performanceHistory) => {
  if (!performanceHistory || performanceHistory.length === 0) {
    return {
      averageTimePerAttempt: 0,
      efficiency: 'unknown',
      recommendation: 'Complete more tests to analyze time management'
    };
  }
  
  const totalTime = performanceHistory.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
  const averageTime = Math.round(totalTime / performanceHistory.length / 60); // Convert to minutes
  
  let efficiency = 'good';
  if (averageTime > 90) efficiency = 'slow';
  if (averageTime < 30) efficiency = 'fast';
  
  return {
    averageTimePerAttempt: `${averageTime} minutes`,
    efficiency,
    recommendation: efficiency === 'slow' 
      ? 'Focus on time management and quick decision making'
      : efficiency === 'fast'
      ? 'Take more time to read questions carefully'
      : 'Your pacing is good, maintain this rhythm'
  };
};

const analyzeGoalProgress = (userProfile) => {
  const goals = userProfile.examGoals || [];
  
  if (goals.length === 0) {
    return {
      status: 'no_goals_set',
      recommendation: 'Set specific exam goals to track your progress'
    };
  }
  
  const progress = Math.min(100, Math.max(0, userProfile.averageScore));
  
  return {
    status: progress > 75 ? 'on_track' : progress > 50 ? 'needs_improvement' : 'requires_focus',
    progress: `${progress}%`,
    goals,
    recommendation: progress > 75 
      ? 'Excellent progress! Continue with advanced practice'
      : progress > 50
      ? 'Good foundation, focus on weak areas for improvement'
      : 'Strengthen fundamentals before attempting advanced topics'
  };
};
