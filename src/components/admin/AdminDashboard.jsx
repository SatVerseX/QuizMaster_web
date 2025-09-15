import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
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
  FaShieldAlt,
  FaImages,
  FaPuzzlePiece,
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFire,
} from "react-icons/fa";
import { FiRefreshCw, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";
import ExaminationLogosManager from "./ExaminationLogosManager";
import OfferForm from "./OfferForm";

const db = getFirestore(app);

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { isDark } = useTheme();

  const mode = (light, dark) => (isDark ? dark : light);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [recommendations, setRecommendations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [offers, setOffers] = useState([]);
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    pendingComplaints: 0,
    totalPayouts: 0,
    activeUsers: 0,
    totalSubscribers: 0,
    monthlySubscriberGrowth: 0,
    totalEarningsFromSubs: 0,
    totalLogos: 0,
    totalOffers: 0,
    activeOffers: 0,
  });

  // Enhanced fetch recommendations with error handling
  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const querySnapshot = await getDocs(collection(db, "recommendations"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecommendations(data);

      setStats((prev) => ({
        ...prev,
        totalRecommendations: data.length,
      }));
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations. Please try again.");
    }
    setLoading(false);
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const querySnapshot = await getDocs(collection(db, "complaints"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(data);

      const pending = data.filter((comp) => comp.status !== "resolved").length;
      setStats((prev) => ({
        ...prev,
        pendingComplaints: pending,
      }));
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to fetch complaints. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "recommendations") fetchRecommendations();
    if (activeTab === "complaints") fetchComplaints();
    if (activeTab === "examinationLogos") fetchExaminationLogosStats();
    if (activeTab === "offers") {
      fetchOffers();
      fetchTestSeries();
    }
    // Always refresh subscriber/earnings KPIs on tab change
    fetchSubscriberAndEarningsStats();
  }, [activeTab]);

  // Initial load of stats
  useEffect(() => {
    fetchExaminationLogosStats();
    fetchSubscriberAndEarningsStats();
  }, []);

  const fetchSubscriberAndEarningsStats = async () => {
    try {
      // Subscriptions
      const subsSnap = await getDocs(
        collection(db, "test-series-subscriptions")
      );
      const allSubs = subsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const activeSubs = allSubs.filter(
        (s) => (s.status || "active") === "active"
      );

      // Monthly growth (last 30 days)
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const newInLast30 = activeSubs.filter((s) => {
        const t = s.subscribedAt?.toDate
          ? s.subscribedAt.toDate().getTime()
          : s.subscribedAt?.getTime?.() || 0;
        return t && now - t <= THIRTY_DAYS;
      }).length;

      // Earnings from subscriptions (platform only)
      const totalEarnings = activeSubs.reduce((sum, s) => {
        if (typeof s.platformFee === "number") return sum + s.platformFee;
        if (typeof s.price === "number") return sum + s.price;
        if (typeof s.amount === "number") return sum + s.amount;
        return sum;
      }, 0);

      setStats((prev) => ({
        ...prev,
        totalSubscribers: activeSubs.length,
        monthlySubscriberGrowth: newInLast30,
        totalEarningsFromSubs: totalEarnings,
      }));
    } catch (err) {
      console.error("Failed to fetch subscriber/earnings stats:", err);
    }
  };

  const fetchExaminationLogosStats = async () => {
    try {
      const logosSnap = await getDocs(collection(db, "examinationLogos"));
      const totalLogos = logosSnap.docs.length;

      setStats((prev) => ({
        ...prev,
        totalLogos: totalLogos,
      }));
    } catch (err) {
      console.error("Failed to fetch examination logos stats:", err);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    setError("");
    try {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOffers(data);

      // Simplified logic: count all offers that are not explicitly inactive
      // This matches what the UI is showing (both offers show as "Active")
      const activeOffers = data.filter(offer => {
        // Only exclude if explicitly marked as inactive
        return offer.isActive !== false;
      }).length;

      setStats((prev) => ({
        ...prev,
        totalOffers: data.length,
        activeOffers: activeOffers,
      }));
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers. Please try again.");
    }
    setLoading(false);
  };

  const fetchTestSeries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "test-series"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestSeries(data);
    } catch (err) {
      console.error("Error fetching test series:", err);
    }
  };

  const handleRecommendationAction = async (id, status) => {
    try {
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, status } : rec))
      );

      await updateDoc(doc(db, "recommendations", id), {
        status,
        updatedAt: new Date(),
        updatedBy: "admin",
      });
    } catch (err) {
      console.error("Error updating recommendation:", err);
      setError("Failed to update recommendation");
      fetchRecommendations();
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      setComplaints((prev) =>
        prev.map((comp) =>
          comp.id === id ? { ...comp, status: "resolved" } : comp
        )
      );

      await updateDoc(doc(db, "complaints", id), {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy: "admin",
      });

      setStats((prev) => ({
        ...prev,
        pendingComplaints: prev.pendingComplaints - 1,
      }));
    } catch (err) {
      console.error("Error resolving complaint:", err);
      setError("Failed to resolve complaint");
      fetchComplaints();
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await updateDoc(doc(db, "offers", id), {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: "admin",
      });
      
      setOffers((prev) => prev.filter(offer => offer.id !== id));
      fetchOffers(); // Refresh to update stats
    } catch (err) {
      console.error("Error deleting offer:", err);
      setError("Failed to delete offer");
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || rec.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch =
      comp.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || comp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${mode(
          "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
          "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
        )}`}
      >
        <div
          className={`${mode(
            "bg-white/90 backdrop-blur-xl border border-red-200",
            "bg-slate-800/90 backdrop-blur-xl border border-red-500/30"
          )} rounded-3xl shadow-2xl p-12 text-center max-w-md w-full`}
        >
          <div
            className={`w-20 h-20 ${mode(
              "bg-red-100",
              "bg-red-500/20"
            )} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <FaShieldAlt
              className={`w-10 h-10 ${mode("text-red-600", "text-red-400")}`}
            />
          </div>
          <h2
            className={`text-2xl font-bold mb-4 ${mode(
              "text-red-700",
              "text-red-300"
            )}`}
          >
            Access Denied
          </h2>
          <p className={`mb-6 ${mode("text-red-600", "text-red-400")}`}>
            You don't have permission to access the admin dashboard.
          </p>
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
    <div className={`min-h-screen p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Simplified Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${isDark ? "bg-orange-600" : "bg-orange-500"}`}>
              <FaPuzzlePiece className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Admin Dashboard
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Manage platform operations
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Recommendations"
            value={stats.totalRecommendations}
            icon={FaLightbulb}
            color="blue"
            isDark={isDark}
          />
          <StatCard
            title="Complaints"
            value={stats.pendingComplaints}
            icon={FaExclamationCircle}
            color="red"
            isDark={isDark}
          />
          <StatCard
            title="Subscribers"
            value={stats.totalSubscribers}
            icon={FaUsers}
            color="green"
            isDark={isDark}
          />
          <StatCard
            title="Offers"
            value={stats.activeOffers}
            icon={FaTag}
            color="purple"
            isDark={isDark}
          />
        </div>

        {/* Mobile-First Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "recommendations", label: "Recommendations", icon: FaLightbulb },
              { id: "complaints", label: "Complaints", icon: FaExclamationCircle },
              { id: "examinationLogos", label: "Logos", icon: FaImages },
              { id: "offers", label: "Offers", icon: FaTag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.id
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${
            isDark ? "bg-red-900/50 border-red-700" : "bg-red-50 border-red-200"
          } border`}>
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`rounded-lg border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          {activeTab === "recommendations" && (
            <RecommendationsSection
              recommendations={filteredRecommendations}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onAction={handleRecommendationAction}
              onRefresh={fetchRecommendations}
              isDark={isDark}
            />
          )}

          {activeTab === "complaints" && (
            <ComplaintsSection
              complaints={filteredComplaints}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onResolve={handleResolveComplaint}
              onRefresh={fetchComplaints}
              isDark={isDark}
            />
          )}

          {activeTab === "examinationLogos" && (
            <div className="p-4">
              <ExaminationLogosManager />
            </div>
          )}

          {activeTab === "offers" && (
            <OffersManager
              offers={offers}
              testSeries={testSeries}
              loading={loading}
              onRefresh={fetchOffers}
              onEdit={setEditingOffer}
              onDelete={handleDeleteOffer}
              onCreate={() => setShowOfferForm(true)}
              isDark={isDark}
            />
          )}
        </div>

        {/* Offer Form Modal */}
        {showOfferForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <OfferForm
                isOpen={true}
                onClose={() => {
                  setShowOfferForm(false);
                  setEditingOffer(null);
                }}
                onSave={() => {
                  setShowOfferForm(false);
                  setEditingOffer(null);
                  fetchOffers();
                }}
                offer={editingOffer}
                isDark={isDark}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Optimized StatCard Component
const StatCard = ({ title, value, icon: Icon, color, isDark }) => {
  const colorClasses = {
    blue: isDark ? "bg-blue-600" : "bg-blue-500",
    red: isDark ? "bg-red-600" : "bg-red-500",
    green: isDark ? "bg-green-600" : "bg-green-500",
    purple: isDark ? "bg-purple-600" : "bg-purple-500",
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} border ${
      isDark ? "border-gray-700" : "border-gray-200"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

// Optimized Recommendations Section
const RecommendationsSection = ({
  recommendations,
  loading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onAction,
  onRefresh,
  isDark,
}) => {
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium ${
            isDark
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading recommendations...
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <FaLightbulb className={`w-12 h-12 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`} />
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No recommendations found
            </p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {rec.title}
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : rec.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {rec.status}
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      {rec.submittedAt?.toDate?.()?.toLocaleDateString() || "Unknown date"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {rec.status === "pending" && (
                    <>
                      <button
                        onClick={() => onAction(rec.id, "approved")}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        <FaCheck className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onAction(rec.id, "rejected")}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Optimized Complaints Section
const ComplaintsSection = ({
  complaints,
  loading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onResolve,
  onRefresh,
  isDark,
}) => {
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium ${
            isDark
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading complaints...
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8">
            <FaExclamationCircle className={`w-12 h-12 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`} />
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No complaints found
            </p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div
              key={complaint.id}
              className={`p-4 rounded-lg border ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {complaint.subject}
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {complaint.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      complaint.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {complaint.status}
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      {complaint.submittedAt?.toDate?.()?.toLocaleDateString() || "Unknown date"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {complaint.status !== "resolved" && (
                    <button
                      onClick={() => onResolve(complaint.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Optimized Offers Manager
const OffersManager = ({
  offers,
  testSeries,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onCreate,
  isDark,
}) => {
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          Offers Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading offers...
            </p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8">
            <FaTag className={`w-12 h-12 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`} />
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No offers found
            </p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 rounded-lg border ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {offer.title}
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      offer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      ₹{offer.discountedPrice} (was ₹{offer.originalPrice})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(offer)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    <FaEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(offer.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


export default AdminDashboard;
