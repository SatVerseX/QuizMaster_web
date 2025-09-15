import { DatabaseMigration } from '../utils/databaseMigration';

// Run this once to migrate your database
const runMigration = async () => {
  console.log('Starting one-time database migration...');
  
  try {
    // Fix quiz counts first
    console.log('Step 1: Fixing test series quiz counts...');
    const quizCountResults = await DatabaseMigration.fixTestSeriesQuizCounts();
    console.log('Quiz count fix completed:', quizCountResults);
    
    // Run other migrations
    console.log('Step 2: Running other migrations...');
    const results = await DatabaseMigration.runCompleteDatabase();
    console.log('Migration completed:', results);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Uncomment the line below to run migration
runMigration();
