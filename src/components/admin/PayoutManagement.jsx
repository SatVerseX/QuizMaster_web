import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaMoneyCheckAlt } from 'react-icons/fa';

const PayoutManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/payouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setPayouts(data.payouts);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (payoutId, status, notes = '') => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPayouts(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating payout:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
          <FaMoneyCheckAlt className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 drop-shadow-lg">Payout Management</h1>
          <p className="text-gray-300 text-sm font-medium">Handle creator payments and withdrawals</p>
        </div>
      </div>
      {/* Payout requests table */}
      <div className="bg-gradient-to-br from-slate-800/80 via-gray-900/80 to-slate-900/90 rounded-2xl shadow-2xl border border-gray-700/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gradient-to-r from-slate-900/80 to-gray-800/80 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-white">{payout.creatorName}</div>
                      <div className="text-xs text-gray-400">{payout.creatorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-emerald-300">₹{payout.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-cyan-200 capitalize">{payout.paymentMethod.replace('_', ' ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      payout.status === 'completed' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-400/30' :
                      payout.status === 'processing' ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-400/30' :
                      payout.status === 'failed' ? 'bg-red-600/20 text-red-300 border border-red-400/30' :
                      'bg-gray-700/40 text-gray-300 border border-gray-500/30'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                    {new Date(payout.requestedAt.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-200">
                    {/* Payment Details */}
                    {payout.paymentMethod === 'upi' && payout.paymentDetails?.upiId && (
                      <div>
                        <span className="font-semibold text-cyan-300">UPI:</span> {payout.paymentDetails.upiId}
                      </div>
                    )}
                    {payout.paymentMethod === 'bank_transfer' && payout.paymentDetails?.accountNumber && (
                      <div className="space-y-1">
                        <div><span className="font-semibold text-cyan-300">A/C:</span> {payout.paymentDetails.accountNumber}</div>
                        <div><span className="font-semibold text-cyan-300">IFSC:</span> {payout.paymentDetails.ifscCode}</div>
                        <div><span className="font-semibold text-cyan-300">Name:</span> {payout.paymentDetails.accountHolderName}</div>
                        <div><span className="font-semibold text-cyan-300">Bank:</span> {payout.paymentDetails.bankName}</div>
                      </div>
                    )}
                    {payout.paymentMethod !== 'upi' && payout.paymentMethod !== 'bank_transfer' && (
                      <div className="text-gray-400 italic">{JSON.stringify(payout.paymentDetails)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payout.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePayoutStatus(payout.id, 'processing')}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg font-semibold shadow hover:scale-105 transition-all text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updatePayoutStatus(payout.id, 'failed', 'Rejected by admin')}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-lg font-semibold shadow hover:scale-105 transition-all text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {payout.status === 'processing' && (
                      <button
                        onClick={() => updatePayoutStatus(payout.id, 'completed')}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-lg font-semibold shadow hover:scale-105 transition-all text-xs"
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default PayoutManagement;
