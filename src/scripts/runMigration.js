import { DatabaseMigration } from '../utils/databaseMigration';

// Run this once to migrate your database
const runMigration = async () => {
  console.log('Starting one-time database migration...');
  
  try {
    const results = await DatabaseMigration.runCompleteDatabase();
    console.log('Migration completed:', results);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Uncomment the line below to run migration
runMigration();
