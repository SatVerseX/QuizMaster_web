import React, { useState } from 'react';
import { DatabaseMigration } from '../../utils/databaseMigration';
import { useAuth } from '../../contexts/AuthContext';
import { FiDatabase, FiPlay, FiCheck, FiX, FiLoader, FiAlertTriangle } from 'react-icons/fi';

const DatabaseMigrationComponent = () => {
  const { currentUser } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState({
    running: false,
    completed: false,
    results: null,
    error: null
  });

  // Only allow admin users (you can set your email as admin)
  const isAdmin = currentUser?.email === 'your-admin-email@gmail.com';

  const runMigration = async () => {
    setMigrationStatus({ running: true, completed: false, results: null, error: null });
    
    try {
      const results = await DatabaseMigration.runCompleteDatabase();
      
      setMigrationStatus({
        running: false,
        completed: true,
        results,
        error: null
      });
      
    } catch (error) {
      setMigrationStatus({
        running: false,
        completed: false,
        results: null,
        error: error.message
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center">
          <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can access database migration tools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500 rounded-full">
            <FiDatabase className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Database Migration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Migrate existing quizzes to support monetization features
            </p>
          </div>
        </div>

        {/* Migration Steps */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Migration Process:
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Create new collections (quiz-purchases, creator-earnings, platform-earnings)
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Add monetization fields to existing quizzes
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Auto-categorize quizzes based on title/content
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Generate tags and set default values
              </span>
            </div>
          </div>
        </div>

        {/* New Fields Preview */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Fields to be Added:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Monetization:</strong>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                <li>isPaid: false (default)</li>
                <li>price: 0</li>
                <li>currency: "INR"</li>
                <li>creatorEarningPercentage: 70</li>
                <li>totalEarnings: 0</li>
                <li>totalSales: 0</li>
                <li>purchasedBy: []</li>
              </ul>
            </div>
            
            <div>
              <strong>Classification:</strong>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                <li>category: (auto-detected)</li>
                <li>difficulty: (based on questions)</li>
                <li>estimatedTime: (calculated)</li>
                <li>tags: (auto-generated)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Migration Status */}
        {migrationStatus.running && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <FiLoader className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Migration in progress... Please wait.
              </span>
            </div>
          </div>
        )}

        {/* Migration Results */}
        {migrationStatus.completed && migrationStatus.results && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FiCheck className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                Migration Completed Successfully!
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Collections Created:</span>
                <span className="font-bold text-green-800 dark:text-green-200">
                  {migrationStatus.results.collectionsCreated ? '✅' : '❌'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Quizzes Migrated:</span>
                <span className="font-bold text-green-800 dark:text-green-200">
                  {migrationStatus.results.quizzesMigrated}
                </span>
              </div>
              
              {migrationStatus.results.errors?.length > 0 && (
                <div className="mt-4">
                  <strong className="text-red-600">Errors:</strong>
                  <ul className="list-disc list-inside text-red-600 text-sm mt-1">
                    {migrationStatus.results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Migration Error */}
        {migrationStatus.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <FiX className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                  Migration Failed
                </h3>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {migrationStatus.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={runMigration}
            disabled={migrationStatus.running}
            className="btn-primary flex items-center gap-2 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {migrationStatus.running ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Running Migration...
              </>
            ) : (
              <>
                <FiPlay className="w-5 h-5" />
                Start Migration
              </>
            )}
          </button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-yellow-800 dark:text-yellow-200">Warning:</strong>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                This migration will modify all existing quiz documents in your Firestore database. 
                Make sure you have a backup before proceeding. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMigrationComponent;
