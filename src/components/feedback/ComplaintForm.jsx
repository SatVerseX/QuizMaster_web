import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { app } from '../../lib/firebase';
import { FaExclamationCircle } from 'react-icons/fa';

const db = getFirestore(app);

const ComplaintForm = () => {
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await addDoc(collection(db, 'complaints'), {
        subject,
        message,
        status: 'open',
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        createdAt: serverTimestamp(),
      });
      setSuccess('Complaint submitted successfully!');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError('Failed to submit complaint.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-2xl space-y-6 mt-8 border border-red-100">
      <h2 className="text-2xl font-bold mb-2 text-red-700 flex items-center gap-2 justify-center"><FaExclamationCircle className="text-red-400" /> Submit a Complaint</h2>
      {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
      {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
      <div>
        <label className="block font-semibold mb-1 text-red-900">Subject</label>
        <input
          type="text"
          className="w-full border border-red-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-300 focus:outline-none bg-white/80"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-red-900">Message</label>
        <textarea
          className="w-full border border-red-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-300 focus:outline-none bg-white/80"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={4}
        />
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-red-600 to-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-lg text-base hover:from-pink-600 hover:to-red-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 w-full"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  );
};

export default ComplaintForm; 