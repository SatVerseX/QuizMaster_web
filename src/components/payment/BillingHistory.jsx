import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FiDownload, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { PaymentService } from '../../services/paymentService';

const BillingHistory = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (currentUser) fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('buyerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (transactionId, txnInternalId) => {
    setDownloadingId(txnInternalId);
    try {
      // Assuming you added the downloadInvoice method to PaymentService
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/invoice/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      captured: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    const style = colors[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${style} capitalize`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-8 text-center">Loading billing history...</div>;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Billing History</h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download invoices and view past transactions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className={isDark ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}>
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {transactions.map((txn) => (
              <tr key={txn.id} className={`group ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {txn.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {txn.testSeriesTitle || txn.quizTitle || txn.planName || 'Unknown Item'}
                  <div className="text-xs text-gray-500 font-normal">{txn.transactionId}</div>
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  ₹{txn.amount?.total || txn.amount}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={txn.paymentDetails?.status || 'captured'} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => downloadInvoice(txn.transactionId, txn.id)}
                    disabled={downloadingId === txn.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDark 
                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {downloadingId === txn.id ? (
                      <span className="animate-spin">⌛</span>
                    ) : (
                      <FiDownload />
                    )}
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">No transactions found.</div>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;