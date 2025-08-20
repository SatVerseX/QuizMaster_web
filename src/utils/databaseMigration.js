import { 
    collection, 
    getDocs, 
    updateDoc, 
    doc, 
    setDoc, 
    writeBatch,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../lib/firebase';
  
  export class DatabaseMigration {
    
    // Migrate all existing quizzes to add monetization fields
    static async migrateQuizzesToMonetization() {
      console.log('🚀 Starting quiz monetization migration...');
      
      try {
        const quizzesRef = collection(db, 'quizzes');
        const querySnapshot = await getDocs(quizzesRef);
        
        const batch = writeBatch(db);
        let updatedCount = 0;
        
        querySnapshot.forEach((docSnapshot) => {
          const quizData = docSnapshot.data();
          const quizRef = doc(db, 'quizzes', docSnapshot.id);
          
          // Check if already migrated
          if (quizData.hasOwnProperty('isPaid')) {
            console.log(`Quiz ${docSnapshot.id} already migrated, skipping...`);
            return;
          }
          
          // Add monetization fields
          const monetizationFields = {
            // Monetization fields
            isPaid: false, // Default to free
            price: 0,
            currency: "INR",
            creatorEarningPercentage: 70,
            totalEarnings: 0,
            totalSales: 0,
            purchasedBy: [],
            
            // Classification fields
            category: DatabaseMigration.guessCategory(quizData.title, quizData.description),
            difficulty: DatabaseMigration.guessDifficulty(quizData.questions?.length || 0),
            estimatedTime: DatabaseMigration.calculateEstimatedTime(quizData.questions?.length || 0),
            tags: DatabaseMigration.generateTags(quizData.title, quizData.description),
            
            // Metadata
            migrated: true,
            migratedAt: serverTimestamp()
          };
          
          batch.update(quizRef, monetizationFields);
          updatedCount++;
          
          console.log(`✅ Prepared migration for quiz: ${quizData.title}`);
        });
        
        // Execute batch update
        if (updatedCount > 0) {
          await batch.commit();
          console.log(`🎉 Successfully migrated ${updatedCount} quizzes!`);
        } else {
          console.log('✨ All quizzes already migrated!');
        }
        
        return { success: true, count: updatedCount };
        
      } catch (error) {
        console.error('❌ Migration failed:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Create new collections with initial data
    static async createNewCollections() {
      console.log('🏗️ Creating new collections...');
      
      try {
        // Create quiz-purchases collection with example document
        await setDoc(doc(db, 'quiz-purchases', 'example'), {
          quizId: 'example',
          buyerId: 'example',
          buyerEmail: 'example@email.com',
          creatorId: 'example',
          price: 0,
          creatorEarning: 0,
          platformFee: 0,
          purchasedAt: serverTimestamp(),
          paymentId: 'example',
          orderId: 'example',
          status: 'example',
          _isExample: true
        });
        
        // Create creator-earnings collection
        await setDoc(doc(db, 'creator-earnings', 'example'), {
          creatorId: 'example',
          totalEarnings: 0,
          totalSales: 0,
          monthlyEarnings: 0,
          lastPayoutAt: null,
          pendingAmount: 0,
          paidAmount: 0,
          bankDetails: {},
          createdAt: serverTimestamp(),
          _isExample: true
        });
        
        // Create platform-earnings collection
        await setDoc(doc(db, 'platform-earnings', 'example'), {
          totalRevenue: 0,
          totalTransactions: 0,
          monthlyRevenue: 0,
          creatorPayouts: 0,
          netProfit: 0,
          lastCalculatedAt: serverTimestamp(),
          _isExample: true
        });
        
        console.log('✅ New collections created successfully!');
        return { success: true };
        
      } catch (error) {
        console.error('❌ Failed to create collections:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Helper function to guess category based on title/description
    static guessCategory(title = '', description = '') {
      const text = (title + ' ' + description).toLowerCase();
      
      const categories = {
        'programming': ['javascript', 'python', 'java', 'code', 'programming', 'development', 'web', 'app', 'software'],
        'science': ['physics', 'chemistry', 'biology', 'science', 'mathematics', 'math', 'formula'],
        'business': ['business', 'management', 'marketing', 'finance', 'economics', 'startup'],
        'language': ['english', 'hindi', 'grammar', 'vocabulary', 'language', 'translation'],
        'competitive': ['upsc', 'ssc', 'bank', 'competitive', 'government', 'exam', 'civil services'],
        'general': ['general', 'knowledge', 'gk', 'current', 'affairs', 'history', 'geography']
      };
      
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          return category;
        }
      }
      
      return 'general'; // Default category
    }
    
    // Helper function to guess difficulty based on question count
    static guessDifficulty(questionCount) {
      if (questionCount <= 5) return 'easy';
      if (questionCount <= 15) return 'medium';
      return 'hard';
    }
    
    // Helper function to calculate estimated time
    static calculateEstimatedTime(questionCount) {
      // Assume 1.5 minutes per question
      return Math.max(5, Math.ceil(questionCount * 1.5));
    }
    
    // Helper function to generate tags
    static generateTags(title = '', description = '') {
      const text = (title + ' ' + description).toLowerCase();
      const possibleTags = [
        'javascript', 'python', 'java', 'react', 'node',
        'web-development', 'programming', 'coding', 'software',
        'science', 'physics', 'chemistry', 'biology', 'math',
        'business', 'marketing', 'finance', 'management',
        'english', 'grammar', 'language', 'vocabulary',
        'competitive', 'upsc', 'ssc', 'government', 'exam',
        'general-knowledge', 'current-affairs', 'history', 'geography'
      ];
      
      const foundTags = possibleTags.filter(tag => text.includes(tag));
      return foundTags.slice(0, 5); // Max 5 tags
    }
    
    // Run complete migration
    static async runCompletemigration() {
      console.log('🚀 Starting complete database migration...');
      
      const results = {
        collectionsCreated: false,
        quizzesMigrated: 0,
        errors: []
      };
      
      try {
        // Step 1: Create new collections
        const collectionsResult = await this.createNewCollections();
        results.collectionsCreated = collectionsResult.success;
        
        if (!collectionsResult.success) {
          results.errors.push(`Collections creation failed: ${collectionsResult.error}`);
        }
        
        // Step 2: Migrate existing quizzes
        const migrationResult = await this.migrateQuizzesToMonetization();
        results.quizzesMigrated = migrationResult.count || 0;
        
        if (!migrationResult.success) {
          results.errors.push(`Quiz migration failed: ${migrationResult.error}`);
        }
        
        console.log('🎉 Complete migration finished!', results);
        return results;
        
      } catch (error) {
        console.error('❌ Complete migration failed:', error);
        results.errors.push(`Complete migration failed: ${error.message}`);
        return results;
      }
    }
  }
  