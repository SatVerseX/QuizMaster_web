import React from 'react';
import StatCard from './StatCard';
import TestCard from './TestCard';
import { 
  FiDollarSign, FiUsers, FiBookOpen, FiTarget, FiAward, FiStar,
  FiActivity, FiBarChart2, FiTrendingUp
} from 'react-icons/fi';

const OverviewTab = ({ dashboardData, mode, formatPrice, onCreateManual, onCreateAI, isAdmin, setShowEditor }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Series Performance */}
    <div className={mode(
      "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
      "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
    )}>
      <h3 className={mode("text-xl font-bold text-slate-800 mb-6 flex items-center gap-2", "text-xl font-bold text-white mb-6 flex items-center gap-2")}>
        <FiAward className={mode("w-5 h-5 text-yellow-600", "w-5 h-5 text-yellow-400")} />
        Series Performance
      </h3>
      
      <div className="space-y-4">
        <div className={mode(
          "flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200",
          "flex items-center justify-between p-4 bg-gray-900/60 rounded-lg"
        )}>
          <div>
            <div className={mode("font-semibold text-slate-800", "font-semibold text-white")}>Conversion Rate</div>
            <div className={mode("text-sm text-slate-600", "text-sm text-gray-400")}>Views to Subscribers</div>
          </div>
          <div className={mode("text-2xl font-bold text-blue-600", "text-2xl font-bold text-blue-400")}>
            {dashboardData.totalViews > 0 ? 
              ((dashboardData.totalSubscribers / dashboardData.totalViews) * 100).toFixed(1) + '%' 
              : '0%'
            }
          </div>
        </div>

        <div className={mode(
          "flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200",
          "flex items-center justify-between p-4 bg-gray-900/60 rounded-lg"
        )}>
          <div>
            <div className={mode("font-semibold text-slate-800", "font-semibold text-white")}>Average Rating</div>
            <div className={mode("text-sm text-slate-600", "text-sm text-gray-400")}>Student feedback</div>
          </div>
          <div className="flex items-center gap-1">
            <FiStar className={mode("w-5 h-5 text-yellow-600 fill-current", "w-5 h-5 text-yellow-400 fill-current")} />
            <span className={mode("text-2xl font-bold text-yellow-600", "text-2xl font-bold text-yellow-400")}>
              {dashboardData.averageRating}
            </span>
          </div>
        </div>

        <div className={mode(
          "flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200",
          "flex items-center justify-between p-4 bg-gray-900/60 rounded-lg"
        )}>
          <div>
            <div className={mode("font-semibold text-slate-800", "font-semibold text-white")}>Revenue per Subscriber</div>
            <div className={mode("text-sm text-slate-600", "text-sm text-gray-400")}>Average earnings</div>
          </div>
          <div className={mode("text-2xl font-bold text-green-600", "text-2xl font-bold text-green-400")}>
            {dashboardData.totalSubscribers > 0 ? 
              formatPrice(dashboardData.totalEarnings / dashboardData.totalSubscribers)
              : formatPrice(0)
            }
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className={mode(
      "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
      "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
    )}>
      <h3 className={mode("text-xl font-bold text-slate-800 mb-6", "text-xl font-bold text-white mb-6")}>Quick Actions</h3>
      
      <div className="space-y-3">
        <button
          onClick={onCreateManual}
          className={mode(
            "w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left border border-slate-200",
            "w-full flex items-center gap-3 p-4 bg-gray-900/60 hover:bg-gray-700 rounded-lg transition-colors text-left"
          )}
        >
          <div className="p-2 bg-blue-600 rounded-lg">
            <FiBookOpen className="w-5 h-5 text-white" />
          </div>
          <span className={mode("font-medium text-slate-800", "font-medium text-white")}>Create Manual Test</span>
        </button>

        <button
          onClick={onCreateAI}
          className={mode(
            "w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left border border-slate-200",
            "w-full flex items-center gap-3 p-4 bg-gray-900/60 hover:bg-gray-700 rounded-lg transition-colors text-left"
          )}
        >
          <div className="p-2 bg-purple-600 rounded-lg">
            <FiTarget className="w-5 h-5 text-white" />
          </div>
          <span className={mode("font-medium text-slate-800", "font-medium text-white")}>Generate AI Test</span>
        </button>

        {isAdmin && (
        <button
          onClick={() => setShowEditor(true)}
          className={mode(
            "w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left border border-slate-200",
            "w-full flex items-center gap-3 p-4 bg-gray-900/60 hover:bg-gray-700 rounded-lg transition-colors text-left"
          )}
        >
          <div className="p-2 bg-gray-600 rounded-lg">
            <FiAward className="w-5 h-5 text-white" />
          </div>
          <span className={mode("font-medium text-slate-800", "font-medium text-white")}>Edit Series Settings</span>
        </button>
        )}
      </div>
    </div>
  </div>
);

const TestsTab = ({ dashboardData, mode, onTake, onEdit, onView, onDelete, getStatusIcon, formatDate, onCreateManual, onCreateAI }) => (
  <div className={mode(
    "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
    "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
  )}>
    <h3 className={mode(
      "text-xl font-bold text-slate-800 flex items-center gap-2 mb-6",
      "text-xl font-bold text-white flex items-center gap-2 mb-6" 
    )}>
      <FiBookOpen className="w-5 h-5 text-purple-400" />
      Tests in Series ({dashboardData.quizzes.length})
    </h3>
    
    {dashboardData.quizzes.length > 0 ? (
      <div className={mode("divide-y divide-slate-200", "divide-y divide-gray-700")}>
        {dashboardData.quizzes.map(quiz => (
          <TestCard
            key={quiz.id}
            quiz={quiz}
            mode={mode}
            onTake={onTake}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
          />
        ))}
      </div>
    ) : (
      <div className={mode(
        "text-center py-16 bg-slate-50 rounded-xl border border-slate-200",
        "text-center py-16 bg-gray-900/40 rounded-xl"
      )}>
        <FiBookOpen className={mode("w-12 h-12 text-slate-400 mx-auto mb-4", "w-12 h-12 text-gray-500 mx-auto mb-4")} />
        <h3 className={mode("text-xl font-semibold text-slate-800 mb-2", "text-xl font-semibold text-white mb-2")}>
          No tests created yet
        </h3>
        <p className={mode("text-slate-600 mb-6", "text-gray-400 mb-6")}>
          Start creating tests for your series to help students practice
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCreateManual}
            className={mode(
              "bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors",
              "bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
            )}
          >
            Create Manual Test
          </button>
          <button
            onClick={onCreateAI}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
          >
            Generate with AI
          </button>
        </div>
      </div>
    )}
  </div>
);

const TabContent = ({ 
  activeTab, 
  dashboardData, 
  mode, 
  formatPrice, 
  formatDate, 
  formatDateTime,
  getScoreColor,
  getScoreBg,
  getStatusIcon,
  onTake, 
  onEdit, 
  onView, 
  onDelete,
  onCreateManual,
  onCreateAI,
  isAdmin,
  setShowEditor
}) => {
  switch(activeTab) {
    case 'overview':
      return (
        <OverviewTab
          dashboardData={dashboardData}
          mode={mode}
          formatPrice={formatPrice}
          onCreateManual={onCreateManual}
          onCreateAI={onCreateAI}
          isAdmin={isAdmin}
          setShowEditor={setShowEditor}
        />
      );
    
    case 'tests':
      return (
        <TestsTab
          dashboardData={dashboardData}
          mode={mode}
          onTake={onTake}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          getStatusIcon={getStatusIcon}
          formatDate={formatDate}
          onCreateManual={onCreateManual}
          onCreateAI={onCreateAI}
        />
      );
      
    case 'attempts':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Attempts */}
            <div className={mode(
              "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
              "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
            )}>
              <h3 className={mode(
                "text-xl font-bold text-slate-800 mb-6 flex items-center gap-2",
                "text-xl font-bold text-white mb-6 flex items-center gap-2"
              )}>
                <FiActivity className="w-5 h-5 text-blue-400" />
                Recent Attempts ({dashboardData.recentAttempts.length})
              </h3>

              {dashboardData.recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentAttempts.slice(0, 5).map(attempt => (
                    <div key={attempt.id} className={mode(
                      "flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200",
                      "flex items-center justify-between p-3 bg-gray-900/40 rounded-lg"
                    )}>
                      <div>
                        <div className={mode(
                          "font-medium text-slate-800 text-sm",
                          "font-medium text-white text-sm"
                        )}>
                          {attempt.testTitle}
                        </div>
                        <div className={mode(
                          "text-xs text-slate-600",
                          "text-xs text-gray-400"
                        )}>
                          {attempt.userName || attempt.userEmail} • {formatDateTime(attempt.completedAt)}
                        </div>
                      </div>
                      <div className={`text-right px-3 py-1 rounded-lg border ${getScoreBg(attempt.percentage)}`}>
                        <div className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                          {attempt.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiActivity className={mode("w-8 h-8 text-slate-400 mx-auto mb-3", "w-8 h-8 text-gray-500 mx-auto mb-3")} />
                  <p className={mode("text-slate-600", "text-gray-400")}>No test attempts yet</p>
                </div>
              )}
            </div>

            {/* Top Performers */}
            <div className={mode(
              "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
              "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
            )}>
              <h3 className={mode(
                "text-xl font-bold text-slate-800 mb-6 flex items-center gap-2",
                "text-xl font-bold text-white mb-6 flex items-center gap-2"
              )}>
                <FiAward className="w-5 h-5 text-yellow-400" />
                Top Performers
              </h3>

              {dashboardData.topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topPerformers.map((attempt, index) => (
                    <div key={attempt.id} className={mode(
                      "flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200",
                      "flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg"
                    )}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-600 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className={mode("font-medium text-slate-800 text-sm", "font-medium text-white text-sm")}>
                          {attempt.userName || attempt.userEmail}
                        </div>
                        <div className={mode("text-xs text-slate-600", "text-xs text-gray-400")}>
                          {attempt.testTitle}
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">
                        {attempt.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiAward className={mode("w-8 h-8 text-slate-400 mx-auto mb-3", "w-8 h-8 text-gray-500 mx-auto mb-3")} />
                  <p className={mode("text-slate-600", "text-gray-400")}>No attempts to rank yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    
    case 'subscribers':
      return (
        <div className={mode(
          "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
          "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
        )}>
          <h3 className={mode(
            "text-xl font-bold text-slate-800 mb-6 flex items-center gap-2",
            "text-xl font-bold text-white mb-6 flex items-center gap-2"
          )}>
            <FiUsers className="w-5 h-5 text-blue-400" />
            Recent Subscriptions ({dashboardData.totalSubscribers})
          </h3>

          {dashboardData.recentSubscriptions.length > 0 ? (
            <div className={mode("divide-y divide-slate-200", "divide-y divide-gray-700")}>
              {dashboardData.recentSubscriptions.map(subscription => (
                <div key={subscription.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className={mode(
                      "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg",
                      "w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-300 font-bold text-lg"
                    )}>
                      {subscription.userEmail?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className={mode("font-semibold text-slate-800", "font-semibold text-white")}>
                        {subscription.userEmail || 'Unknown User'}
                      </div>
                      <div className={mode("text-sm text-slate-600", "text-sm text-gray-400")}>
                        Subscribed on {formatDate(subscription.subscribedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={mode("font-bold text-green-600", "font-bold text-green-400")}>
                      {formatPrice(subscription.creatorEarning || 0)}
                    </div>
                    <div className={mode("text-xs text-slate-500", "text-xs text-gray-500")}>
                      your earning
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={mode(
              "text-center py-16 bg-slate-50 rounded-xl border border-slate-200",
              "text-center py-16 bg-gray-900/40 rounded-xl"
            )}>
              <FiUsers className={mode("w-12 h-12 text-slate-400 mx-auto mb-4", "w-12 h-12 text-gray-500 mx-auto mb-4")} />
              <h3 className={mode("text-xl font-semibold text-slate-800 mb-2", "text-xl font-semibold text-white mb-2")}>
                No subscribers yet
              </h3>
              <p className={mode("text-slate-600", "text-gray-400")}>
                Share your test series to attract students
              </p>
            </div>
          )}
        </div>
      );
      
    case 'analytics':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={mode(
            "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
            "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
          )}>
            <h3 className={mode("text-xl font-bold text-slate-800 mb-6", "text-xl font-bold text-white mb-6")}>
              Performance Metrics
            </h3>
            <div className={mode(
              "text-center py-16 bg-slate-50 rounded-xl border border-slate-200",
              "text-center py-16 bg-gray-900/40 rounded-xl"
            )}>
              <FiBarChart2 className={mode("w-12 h-12 text-slate-400 mx-auto mb-4", "w-12 h-12 text-gray-500 mx-auto mb-4")} />
              <p className={mode("text-slate-600", "text-gray-400")}>
                Advanced analytics coming soon!
              </p>
            </div>
          </div>

          <div className={mode(
            "bg-white backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-sm",
            "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6"
          )}>
            <h3 className={mode("text-xl font-bold text-slate-800 mb-6", "text-xl font-bold text-white mb-6")}>
              Revenue Trends
            </h3>
            <div className={mode(
              "text-center py-16 bg-slate-50 rounded-xl border border-slate-200",
              "text-center py-16 bg-gray-900/40 rounded-xl"
            )}>
              <FiTrendingUp className={mode("w-12 h-12 text-slate-400 mx-auto mb-4", "w-12 h-12 text-gray-500 mx-auto mb-4")} />
              <p className={mode("text-slate-600", "text-gray-400")}>
                Revenue charts coming soon!
              </p>
            </div>
          </div>
        </div>
      );
      
    default:
      return <div>Tab content not available</div>;
  }
};

export default TabContent;
