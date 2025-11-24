import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FaLightbulb,
  FaExclamationCircle,
  FaCheck,
  FaTimes,
  FaUsers,
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaImages,
  FaShieldAlt,
  FaArrowUp,
  FaArrowDown,
  FaMoneyBillWave,
  FaChartPie
} from "react-icons/fa";
import { FiRefreshCw, FiAlertTriangle, FiFilter, FiGrid } from "react-icons/fi";

// Assume these are in the same directory or adjust paths
import ExaminationLogosManager from "./ExaminationLogosManager";
import OfferForm from "./OfferForm";

const db = getFirestore(app);

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

// --- Sub-Components ---

const StatusBadge = ({ status, isDark }) => {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    resolved: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    inactive: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const darkStyles = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    resolved: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    inactive: "bg-slate-800 text-slate-400 border-slate-700",
  };

  const normalizedStatus = status ? status.toLowerCase() : "pending";
  const className = isDark
    ? darkStyles[normalizedStatus] || darkStyles.pending
    : styles[normalizedStatus] || styles.pending;

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${className} inline-flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-current animate-pulse" : "bg-current"}`}></span>
      {status ? status : "Unknown"}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, intent = "blue", isDark, trend, trendDirection }) => {
  const themes = {
    blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-50" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50" },
    rose: { bg: "bg-rose-500", text: "text-rose-500", lightBg: "bg-rose-50" },
    amber: { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-50" },
  };

  const theme = themes[intent] || themes.blue;

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? "bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-slate-700" 
          : "bg-white border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Abstract Background Shape */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${theme.bg}`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${isDark ? "bg-slate-800 text-white" : `${theme.lightBg} ${theme.text}`}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
                trendDirection === "up" 
                ? (isDark ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-700 bg-emerald-100") 
                : (isDark ? "text-rose-400 bg-rose-500/10" : "text-rose-700 bg-rose-100")
            }`}>
                {trendDirection === "up" ? <FaArrowUp className="mr-1 w-2.5 h-2.5" /> : <FaArrowDown className="mr-1 w-2.5 h-2.5" />}
                {trend}
            </div>
        )}
      </div>
      <div className="relative z-10">
        <p className={`text-sm font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{title}</p>
        <h3 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>{value}</h3>
      </div>
    </motion.div>
  );
};

// --- Main Component ---

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { isDark } = useTheme();

  // State
  const [activeTab, setActiveTab] = useState("recommendations");
  const [recommendations, setRecommendations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    pendingComplaints: 0,
    totalSubscribers: 0,
    totalEarningsFromSubs: 0,
    totalLogos: 0,
    activeOffers: 0,
  });

  // Data Fetching & Handlers (Logic preserved from original)
  const fetchRecommendations = async () => {
    setLoading(true); setError("");
    try {
      const snap = await getDocs(collection(db, "recommendations"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecommendations(data);
      setStats((prev) => ({ ...prev, totalRecommendations: data.length }));
    } catch (err) { setError("Failed to fetch recommendations."); }
    setLoading(false);
  };

  const fetchComplaints = async () => {
    setLoading(true); setError("");
    try {
      const snap = await getDocs(collection(db, "complaints"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      setStats((prev) => ({ ...prev, pendingComplaints: data.filter((c) => c.status !== "resolved").length }));
    } catch (err) { setError("Failed to fetch complaints."); }
    setLoading(false);
  };

  const fetchOffers = async () => {
    setLoading(true); setError("");
    try {
      const snap = await getDocs(collection(db, "offers"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOffers(data);
      setStats((prev) => ({ ...prev, activeOffers: data.filter((o) => o.isActive !== false).length }));
    } catch (err) { setError("Failed to fetch offers."); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
        const [subsSnap, logosSnap] = await Promise.all([
            getDocs(collection(db, "test-series-subscriptions")),
            getDocs(collection(db, "examinationLogos"))
        ]);
        const allSubs = subsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const activeSubs = allSubs.filter((s) => (s.status || "active") === "active");
        const totalEarnings = activeSubs.reduce((sum, s) => sum + (Number(s.platformFee) || Number(s.price) || Number(s.amount) || 0), 0);

        setStats((prev) => ({
            ...prev,
            totalSubscribers: activeSubs.length,
            totalEarningsFromSubs: totalEarnings,
            totalLogos: logosSnap.size
        }));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    if (activeTab === "recommendations") fetchRecommendations();
    if (activeTab === "complaints") fetchComplaints();
    if (activeTab === "offers") fetchOffers();
  }, [activeTab]);

  const handleRecommendationAction = async (id, status) => {
    try {
      setRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, status } : rec));
      await updateDoc(doc(db, "recommendations", id), { status, updatedAt: new Date(), updatedBy: "admin" });
    } catch (err) { setError("Update failed"); fetchRecommendations(); }
  };

  const handleResolveComplaint = async (id) => {
    try {
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "resolved" } : c));
      await updateDoc(doc(db, "complaints", id), { status: "resolved", resolvedAt: new Date(), resolvedBy: "admin" });
      setStats(prev => ({ ...prev, pendingComplaints: prev.pendingComplaints - 1 }));
    } catch (err) { setError("Resolution failed"); fetchComplaints(); }
  };

  const handleDeleteOffer = async (id) => {
    if(!window.confirm("Are you sure you want to disable this offer?")) return;
    try {
      await updateDoc(doc(db, "offers", id), { isActive: false, deletedAt: new Date() });
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch (err) { setError("Delete failed"); }
  };

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl border text-center ${isDark ? "bg-slate-900 border-rose-900/50" : "bg-white border-rose-100 shadow-xl"}`}>
            <div className="mx-auto w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <FaShieldAlt className="text-rose-600 text-3xl" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Access Denied</h2>
            <p className={`mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Administrator privileges are required to view this secure dashboard.</p>
            <button onClick={() => window.history.back()} className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium">
                Go Back
            </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "recommendations", label: "Recommendations", icon: FaLightbulb, count: stats.totalRecommendations },
    { id: "complaints", label: "Complaints", icon: FaExclamationCircle, count: stats.pendingComplaints, alert: true },
    { id: "offers", label: "Special Offers", icon: FaTag, count: stats.activeOffers },
    { id: "examinationLogos", label: "Brand Assets", icon: FaImages, count: stats.totalLogos },
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500 selection:text-white transition-colors duration-500 ${isDark ? "bg-zinc-950 text-zinc-200" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Ambient Background Gradient */}
      <div className={`fixed inset-0 pointer-events-none z-0 opacity-40 ${isDark ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50'}`} />

      {/* Top Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? "bg-zinc-950/70 border-white/5" : "bg-white/70 border-slate-200/60"}`}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FaShieldAlt className="text-white text-lg" />
                </div>
                <div>
                    <h1 className={`text-xl font-bold tracking-tight leading-none ${isDark ? "text-white" : "text-slate-900"}`}>Admin<span className="text-slate-400 font-light">Console</span></h1>
                </div>
            </div>
            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${isDark ? "bg-zinc-900/50 border-white/5" : "bg-slate-100 border-slate-200"}`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>Live System</span>
            </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalEarningsFromSubs.toLocaleString()}`}
            icon={FaMoneyBillWave}
            intent="emerald"
            isDark={isDark}
            trend="12.5%"
            trendDirection="up"
          />
          <StatCard
            title="Active Subscribers"
            value={stats.totalSubscribers}
            icon={FaUsers}
            intent="blue"
            isDark={isDark}
          />
          <StatCard
            title="Pending Reports"
            value={stats.pendingComplaints}
            icon={FaExclamationCircle}
            intent="rose"
            isDark={isDark}
            trend={stats.pendingComplaints > 0 ? "Action Req." : "Stable"}
            trendDirection={stats.pendingComplaints > 0 ? "down" : "up"}
          />
           <StatCard
            title="Active Campaigns"
            value={stats.activeOffers}
            icon={FaTag}
            intent="amber"
            isDark={isDark}
          />
        </motion.section>

        {/* Global Error */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 p-4 rounded-xl flex items-center gap-3 border shadow-lg overflow-hidden ${
                isDark ? "bg-rose-950/20 border-rose-900/50 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              <FiAlertTriangle className="flex-shrink-0 w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError("")} className="ml-auto hover:opacity-75 p-2"><FaTimes /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-300px)] min-h-[600px]">
            
            {/* Navigation Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
                <nav className={`flex flex-row lg:flex-col gap-2 p-2 rounded-2xl lg:h-full overflow-x-auto lg:overflow-visible ${isDark ? "bg-zinc-900/30 border border-white/5" : "bg-white border border-slate-200"}`}>
                    {menuItems.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                activeTab === tab.id 
                                    ? isDark ? "text-white" : "text-blue-700" 
                                    : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute inset-0 rounded-xl ${isDark ? "bg-blue-600" : "bg-blue-50"}`}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            
                            <div className="relative flex items-center gap-3 z-10">
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "opacity-100" : "opacity-60"}`} />
                                {tab.label}
                            </div>
                            
                            {(tab.count !== undefined) && (
                                <span className={`relative z-10 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    activeTab === tab.id 
                                        ? isDark ? "bg-white/20 text-white" : "bg-blue-200 text-blue-800"
                                        : tab.alert && tab.count > 0
                                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                                            : isDark ? "bg-zinc-800 text-zinc-500" : "bg-slate-100 text-slate-500"
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                <div className={`flex-1 rounded-2xl border shadow-sm overflow-hidden flex flex-col backdrop-blur-sm transition-colors ${isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-slate-200"}`}>
                    
                    {/* Toolbar */}
                    {(activeTab !== "examinationLogos") && (
                        <div className={`p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center ${isDark ? "border-white/5" : "border-slate-100"}`}>
                            <div className="relative w-full sm:w-80 group">
                                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-zinc-500 group-focus-within:text-blue-500" : "text-slate-400 group-focus-within:text-blue-600"}`} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                                        isDark 
                                        ? "bg-zinc-950/50 border-zinc-800 text-white placeholder-zinc-600 focus:border-blue-500 focus:bg-zinc-900" 
                                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    }`}
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative">
                                    <FiFilter className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className={`pl-9 pr-8 py-2.5 text-sm font-medium rounded-xl border outline-none cursor-pointer transition-colors appearance-none relative z-0 ${
                                            isDark 
                                            ? "bg-zinc-950/50 border-zinc-800 text-zinc-300 focus:border-blue-500 hover:bg-zinc-900" 
                                            : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 hover:bg-slate-50"
                                        }`}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                
                                {activeTab === "offers" && (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setEditingOffer(null); setShowOfferForm(true); }}
                                        className="px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        <FaPlus className="w-3 h-3" /> 
                                        <span className="hidden sm:inline">Create Offer</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.95, rotate: 180 }}
                                    onClick={() => {
                                        if (activeTab === "recommendations") fetchRecommendations();
                                        if (activeTab === "complaints") fetchComplaints();
                                        if (activeTab === "offers") fetchOffers();
                                    }}
                                    className={`p-2.5 rounded-xl border transition-colors ${
                                        isDark 
                                        ? "bg-zinc-950/50 border-zinc-800 hover:bg-zinc-900 text-zinc-400" 
                                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                                    }`}
                                    title="Refresh Data"
                                >
                                    <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* Content View */}
                    <div className="flex-1 overflow-hidden relative">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm z-20">
                                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className={`text-sm font-medium tracking-wide ${isDark ? "text-zinc-500" : "text-slate-500"}`}>SYNCING DATA...</p>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTab === "recommendations" && (
                                        <DataTable 
                                            key="rec-table"
                                            data={recommendations} 
                                            filter={filterStatus} 
                                            search={searchTerm} 
                                            type="recommendation"
                                            isDark={isDark}
                                            onAction={handleRecommendationAction}
                                        />
                                    )}
                                    {activeTab === "complaints" && (
                                        <DataTable 
                                            key="comp-table"
                                            data={complaints} 
                                            filter={filterStatus} 
                                            search={searchTerm} 
                                            type="complaint"
                                            isDark={isDark}
                                            onAction={handleResolveComplaint}
                                        />
                                    )}
                                    {activeTab === "offers" && (
                                        <DataTable 
                                            key="offer-table"
                                            data={offers} 
                                            filter={filterStatus} 
                                            search={searchTerm} 
                                            type="offer"
                                            isDark={isDark}
                                            onEdit={(offer) => { setEditingOffer(offer); setShowOfferForm(true); }}
                                            onDelete={handleDeleteOffer}
                                        />
                                    )}
                                    {activeTab === "examinationLogos" && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            exit={{ opacity: 0 }}
                                            className="p-6 h-full"
                                        >
                                            <ExaminationLogosManager />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {showOfferForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
                }`}
              >
                <OfferForm
                  isOpen={true}
                  onClose={() => { setShowOfferForm(false); setEditingOffer(null); }}
                  onSave={() => { setShowOfferForm(false); setEditingOffer(null); fetchOffers(); }}
                  offer={editingOffer}
                  isDark={isDark}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Enhanced Data Table Component ---

const DataTable = ({ data, filter, search, type, isDark, onAction, onEdit, onDelete }) => {
    const filtered = data.filter((item) => {
        const searchContent = JSON.stringify(Object.values(item)).toLowerCase();
        const matchesSearch = searchContent.includes(search.toLowerCase());
        
        let matchesFilter = true;
        if (filter !== "all") {
            if (type === "offer") {
                matchesFilter = filter === "active" ? item.isActive : !item.isActive;
            } else {
                matchesFilter = item.status === filter;
            }
        }
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        return (
            <motion.div 
                variants={fadeIn}
                initial="hidden"
                animate="show"
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8"
            >
                <div className={`p-6 rounded-full mb-4 ${isDark ? "bg-zinc-800/50" : "bg-slate-50"}`}>
                    <FiGrid className={`w-10 h-10 ${isDark ? "text-zinc-600" : "text-slate-300"}`} />
                </div>
                <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>No records found</h3>
                <p className={`text-sm mt-2 max-w-xs mx-auto ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                    We couldn't find any items matching your current filters.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="overflow-x-auto pb-6">
            <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 backdrop-blur-md ${isDark ? "bg-zinc-900/90" : "bg-white/90"}`}>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                        isDark ? "border-white/5 text-zinc-500" : "border-slate-100 text-slate-400"
                    }`}>
                        <th className="px-6 py-5 w-1/3">Details</th>
                        <th className="px-6 py-5">Meta</th>
                        <th className="px-6 py-5">Status</th>
                        {type === "offer" && <th className="px-6 py-5">Pricing</th>}
                        <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <motion.tbody 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}
                >
                    {filtered.map((item) => (
                        <motion.tr 
                            key={item.id} 
                            variants={itemVariants}
                            className={`group transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                        >
                            <td className="px-6 py-4">
                                <div className={`font-semibold text-sm mb-1 ${isDark ? "text-zinc-200" : "text-slate-900"}`}>
                                    {item.title || item.subject || "Untitled"}
                                </div>
                                <div className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                    {item.description || item.content || item.message || "No description provided."}
                                </div>
                                {item.senderEmail && (
                                     <div className={`flex items-center gap-1.5 text-[10px] mt-2 font-mono p-1 rounded w-fit ${isDark ? "bg-white/5 text-zinc-500" : "bg-slate-100 text-slate-500"}`}>
                                        @{item.senderEmail.split('@')[0]}
                                     </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
                                    {item.submittedAt?.toDate?.()?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) || "—"}
                                </span>
                                <div className={`text-[10px] ${isDark ? "text-zinc-600" : "text-slate-400"}`}>
                                    {item.submittedAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ""}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={item.status || (item.isActive ? 'active' : 'inactive')} isDark={isDark} />
                            </td>
                            {type === "offer" && (
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className={`font-bold font-mono ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                            ₹{item.discountedPrice}
                                        </span>
                                        {item.originalPrice && (
                                            <span className="text-xs line-through opacity-50">₹{item.originalPrice}</span>
                                        )}
                                    </div>
                                </td>
                            )}
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    {type === "recommendation" && item.status === "pending" && (
                                        <>
                                            <button 
                                                onClick={() => onAction(item.id, "approved")} 
                                                className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors" 
                                                title="Approve"
                                            >
                                                <FaCheck className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => onAction(item.id, "rejected")} 
                                                className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors" 
                                                title="Reject"
                                            >
                                                <FaTimes className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                    {type === "complaint" && item.status !== "resolved" && (
                                        <button 
                                            onClick={() => onAction(item.id)} 
                                            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                    {type === "offer" && (
                                        <>
                                            <button onClick={() => onEdit(item)} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-blue-500/20 text-blue-400" : "hover:bg-blue-50 text-blue-600"}`}>
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDelete(item.id)} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-rose-500/20 text-rose-400" : "hover:bg-rose-50 text-rose-600"}`}>
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </motion.tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;