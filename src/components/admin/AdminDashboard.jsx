import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaLightbulb, 
  FaExclamationCircle,
  FaCheck,
  FaTimes,
  FaEye,
  FaClock,
  FaUsers,
  FaChartLine,
  FaFilter,
  FaSearch,
  FaDownload,
  FaBell,
  FaShieldAlt
} from 'react-icons/fa';
import { FiRefreshCw, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';

const db = getFirestore(app);

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [recommendations, setRecommendations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    pendingComplaints: 0,
    totalPayouts: 0,
    activeUsers: 0,
    totalSubscribers: 0,
    monthlySubscriberGrowth: 0,
    totalEarningsFromSubs: 0
  });

  // Enhanced fetch recommendations with error handling
  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const querySnapshot = await getDocs(collection(db, 'recommendations'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecommendations(data);
      
      setStats(prev => ({
        ...prev,
        totalRecommendations: data.length
      }));
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommendations. Please try again.');
    }
    setLoading(false);
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const querySnapshot = await getDocs(collection(db, 'complaints'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      
      const pending = data.filter(comp => comp.status !== 'resolved').length;
      setStats(prev => ({
        ...prev,
        pendingComplaints: pending
      }));
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch complaints. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'recommendations') fetchRecommendations();
    if (activeTab === 'complaints') fetchComplaints();
    // Always refresh subscriber/earnings KPIs on tab change
    fetchSubscriberAndEarningsStats();
  }, [activeTab]);

  const fetchSubscriberAndEarningsStats = async () => {
    try {
      // Subscriptions
      const subsSnap = await getDocs(collection(db, 'test-series-subscriptions'));
      const allSubs = subsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const activeSubs = allSubs.filter(s => (s.status || 'active') === 'active');

      // Monthly growth (last 30 days)
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const newInLast30 = activeSubs.filter(s => {
        const t = s.subscribedAt?.toDate ? s.subscribedAt.toDate().getTime() : (s.subscribedAt?.getTime?.() || 0);
        return t && (now - t <= THIRTY_DAYS);
      }).length;

      // Earnings from subscriptions (platform only)
      const totalEarnings = activeSubs.reduce((sum, s) => {
        if (typeof s.platformFee === 'number') return sum + s.platformFee;
        if (typeof s.price === 'number') return sum + s.price;
        if (typeof s.amount === 'number') return sum + s.amount;
        return sum;
      }, 0);

      setStats(prev => ({
        ...prev,
        totalSubscribers: activeSubs.length,
        monthlySubscriberGrowth: newInLast30,
        totalEarningsFromSubs: totalEarnings
      }));
    } catch (err) {
      console.error('Failed to fetch subscriber/earnings stats:', err);
    }
  };

  const handleRecommendationAction = async (id, status) => {
    try {
      setRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status } : rec)
      );

      await updateDoc(doc(db, 'recommendations', id), { 
        status,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
    } catch (err) {
      console.error('Error updating recommendation:', err);
      setError('Failed to update recommendation');
      fetchRecommendations();
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      setComplaints(prev => 
        prev.map(comp => comp.id === id ? { ...comp, status: 'resolved' } : comp)
      );

      await updateDoc(doc(db, 'complaints', id), { 
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: 'admin'
      });

      setStats(prev => ({
        ...prev,
        pendingComplaints: prev.pendingComplaints - 1
      }));
    } catch (err) {
      console.error('Error resolving complaint:', err);
      setError('Failed to resolve complaint');
      fetchComplaints();
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || rec.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredComplaints = complaints.filter(comp => {
    const matchesSearch = comp.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || comp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md w-full border border-red-500/30">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShieldAlt className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-300 mb-4">Access Denied</h2>
          <p className="text-red-400 mb-6">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      {/* Background pattern similar to image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-indigo-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with QuizMaster branding style */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25">
              <span className="text-white font-bold text-2xl">Q</span>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-1">
                Admin
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent ml-4">
                  Dashboard
                </span>
              </h1>
              <p className="text-slate-300 text-lg">Manage platform operations with intelligence</p>
            </div>
          </div>
        </div>

        {/* Top stats cards removed */}

        {/* Subscriber & Earnings KPIs (compact, centered) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatsCard 
            title="Active Subscribers"
            value={stats.totalSubscribers}
            icon={FaUsers}
            color="from-indigo-500 to-blue-500"
            trend={`+${stats.monthlySubscriberGrowth} last 30d`}
          />
          <StatsCard 
            title="Earnings from Subscriptions"
            value={`$${stats.totalEarningsFromSubs.toLocaleString()}`}
            icon={FaChartLine}
            color="from-emerald-500 to-green-600"
            trend={'+growth'}
          />
        </div>

        {/* Navigation Tabs with image-like button styling */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
          {[
            { id: 'recommendations', label: 'Recommendations', icon: FaLightbulb },
            { id: 'complaints', label: 'Complaints', icon: FaExclamationCircle }
          ].map(tab => (
            <button
              key={tab.id}
              className={`group flex items-center gap-3 sm:gap-4 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30 scale-105' 
                  : 'bg-slate-800/60 backdrop-blur-sm text-slate-300 hover:bg-slate-700/60 border border-slate-600/50 hover:text-white hover:border-blue-500/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className={`w-6 h-6 transition-all duration-300 ${
                activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
              }`} />
              <span className="text-base sm:text-lg">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <FiAlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-bold text-red-300">Error</h3>
                <p className="text-red-400">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {activeTab === 'recommendations' && (
            <div className="p-8">
              <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar rounded-2xl">
                <RecommendationsSection 
                  recommendations={filteredRecommendations}
                  loading={loading}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onAction={handleRecommendationAction}
                  onRefresh={fetchRecommendations}
                />
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="p-8">
              <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar rounded-2xl">
                <ComplaintsSection 
                  complaints={filteredComplaints}
                  loading={loading}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onResolve={handleResolveComplaint}
                  onRefresh={fetchComplaints}
                />
              </div>
            </div>
          )}
        </div>
        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE 10+ */
          }
          .custom-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
      </div>
    </div>
  );
};

// Stats Card Component with image-like styling
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="group bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex items-center gap-1 text-sm">
        <FiTrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-green-400 font-semibold">{trend}</span>
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
      <p className="text-slate-400 font-medium">{title}</p>
    </div>
  </div>
);

// Recommendations Section Component
const RecommendationsSection = ({ 
  recommendations, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  onAction, 
  onRefresh 
}) => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
          <FaLightbulb className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Recommendations</h2>
          <p className="text-slate-400 text-lg">Review and manage user suggestions</p>
        </div>
      </div>
      <button 
        onClick={onRefresh}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl"
        disabled={loading}
      >
        <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>

    {/* Search and Filter */}
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search recommendations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-slate-500 text-lg"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-6 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white text-lg"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    {/* Content */}
    {loading ? (
      <LoadingSkeleton count={3} />
    ) : recommendations.length === 0 ? (
      <EmptyState 
        icon={FaLightbulb}
        title="No Recommendations Found"
        description="No recommendations match your search criteria."
      />
    ) : (
      <div className="space-y-6">
        {recommendations.map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} onAction={onAction} />
        ))}
      </div>
    )}
  </div>
);

// Complaints Section Component
const ComplaintsSection = ({ 
  complaints, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  onResolve, 
  onRefresh 
}) => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
          <FaExclamationCircle className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Complaints</h2>
          <p className="text-slate-400 text-lg">Address user issues and concerns</p>
        </div>
      </div>
      <button 
        onClick={onRefresh}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl"
        disabled={loading}
      >
        <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>

    {/* Search and Filter */}
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-slate-500 text-lg"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-6 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white text-lg"
      >
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>

    {/* Content */}
    {loading ? (
      <LoadingSkeleton count={3} />
    ) : complaints.length === 0 ? (
      <EmptyState 
        icon={FaExclamationCircle}
        title="No Complaints Found"
        description="No complaints match your search criteria."
      />
    ) : (
      <div className="space-y-6">
        {complaints.map(complaint => (
          <ComplaintCard key={complaint.id} complaint={complaint} onResolve={onResolve} />
        ))}
      </div>
    )}
  </div>
);

// Recommendation Card Component
const RecommendationCard = ({ recommendation, onAction }) => (
  <div className="group bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-[1.01]">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FaLightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-3">{recommendation.title || 'No Title'}</h3>
            <p className="text-slate-400 leading-relaxed text-lg">{recommendation.description || 'No description provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <StatusBadge status={recommendation.status} />
          <span className="text-slate-500">
            <FaClock className="w-4 h-4 inline mr-1" />
            {recommendation.createdAt ? new Date(recommendation.createdAt.toDate()).toLocaleDateString() : 'Unknown date'}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          className="group/btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={recommendation.status === 'approved'}
          onClick={() => onAction(recommendation.id, 'approved')}
        >
          <FaCheck className="w-4 h-4" />
          Approve
        </button>
        <button
          className="group/btn bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={recommendation.status === 'rejected'}
          onClick={() => onAction(recommendation.id, 'rejected')}
        >
          <FaTimes className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  </div>
);

// Complaint Card Component
const ComplaintCard = ({ complaint, onResolve }) => (
  <div className="group bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-[1.01]">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FaExclamationCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-3">{complaint.subject || 'No Subject'}</h3>
            <p className="text-slate-400 leading-relaxed text-lg">{complaint.message || 'No message provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <StatusBadge status={complaint.status || 'open'} />
          <span className="text-slate-500">
            <FaClock className="w-4 h-4 inline mr-1" />
            {complaint.createdAt ? new Date(complaint.createdAt.toDate()).toLocaleDateString() : 'Unknown date'}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          className="group/btn bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={complaint.status === 'resolved'}
          onClick={() => onResolve(complaint.id)}
        >
          <FaCheck className="w-4 h-4" />
          Mark Resolved
        </button>
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'from-orange-500 to-red-500', text: 'Pending' },
    approved: { color: 'from-green-500 to-emerald-500', text: 'Approved' },
    rejected: { color: 'from-red-500 to-pink-500', text: 'Rejected' },
    open: { color: 'from-orange-500 to-red-500', text: 'Open' },
    resolved: { color: 'from-green-500 to-emerald-500', text: 'Resolved' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${config.color} shadow-lg`}>
      {config.text}
    </span>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-slate-800/60 rounded-2xl p-8 animate-pulse border border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-6 bg-slate-700 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded mb-4 w-full"></div>
            <div className="flex gap-4">
              <div className="h-6 bg-slate-700 rounded w-20"></div>
              <div className="h-6 bg-slate-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
      <Icon className="w-12 h-12 text-slate-500" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 max-w-md mx-auto text-lg">{description}</p>
  </div>
);

export default AdminDashboard;
