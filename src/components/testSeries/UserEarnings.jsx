import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FiTrendingUp, FiDollarSign, FiClock, FiSettings } from 'react-icons/fi';
import { FaRupeeSign, FaChartLine, FaGift, FaHistory } from 'react-icons/fa';
import UserPaymentSettings from './UserPaymentSettings';

const UserEarnings = () => {
  const { currentUser } = useAuth();
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pendingAmount: 0,
    totalWithdrawn: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to user earnings
    const earningsQuery = query(
      collection(db, 'user-earnings'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(earningsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const earningsData = snapshot.docs[0].data();
        // With revenue share removed, show zeros
        setEarnings({
          totalEarned: 0,
          availableBalance: 0,
          pendingAmount: 0,
          totalWithdrawn: 0,
          ...earningsData // preserve any other fields for UI compatibility
        });
      }
      setLoading(false);
    });

    // Listen to user transactions
    const transactionsQuery = query(
      collection(db, 'user-transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const transactionsUnsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionsData);
    });

    return () => {
      unsubscribe();
      transactionsUnsubscribe();
    };
  }, [currentUser]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-white">Loading Earnings...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-emerald-200 mb-2">
              My Earnings
            </h1>
            <p className="text-xl text-gray-400">Track your rewards from test series participation</p>
          </div>
          
          <button
            onClick={() => setShowPaymentSettings(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-3"
          >
            <FiSettings className="w-5 h-5" />
            Payment Settings
          </button>
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-700/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <FaRupeeSign className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-300">
                  {formatCurrency(earnings.totalEarned)}
                </div>
                <div className="text-green-200 text-sm">Total Earned</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <FaGift className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-300">
                  {formatCurrency(earnings.availableBalance)}
                </div>
                <div className="text-blue-200 text-sm">Available Balance</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-700/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <FiClock className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-yellow-300">
                  {formatCurrency(earnings.pendingAmount)}
                </div>
                <div className="text-yellow-200 text-sm">Pending</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-700/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <FiTrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-300">
                  {formatCurrency(earnings.totalWithdrawn)}
                </div>
                <div className="text-purple-200 text-sm">Total Withdrawn</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaHistory className="w-6 h-6 text-blue-400" />
            Recent Transactions
          </h2>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'earning' 
                        ? 'bg-green-500/20 text-green-400'
                        : transaction.type === 'withdrawal'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {transaction.type === 'earning' && <FaRupeeSign className="w-6 h-6" />}
                      {transaction.type === 'withdrawal' && <FiTrendingUp className="w-6 h-6" />}
                      {transaction.type === 'bonus' && <FaGift className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {transaction.type === 'earning' && 'Test Series Reward'}
                        {transaction.type === 'withdrawal' && 'Withdrawal'}
                        {transaction.type === 'bonus' && 'Bonus Reward'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {transaction.description || formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaChartLine className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
              <p className="text-gray-400">Start participating in test series to earn rewards!</p>
            </div>
          )}
        </div>

        {/* How to Earn */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaGift className="w-6 h-6 text-indigo-400" />
            How to Earn More
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRupeeSign className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Complete Tests</h3>
              <p className="text-gray-400">Earn rewards for completing test series with good scores</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance Bonus</h3>
              <p className="text-gray-400">Get extra rewards for top performances and achievements</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGift className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Referral Bonus</h3>
              <p className="text-gray-400">Invite friends and earn bonus rewards for each referral</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings Modal */}
      {showPaymentSettings && (
        <UserPaymentSettings 
          showModal={true}
          onClose={() => setShowPaymentSettings(false)}
        />
      )}
    </div>
  );
};

export default UserEarnings;
