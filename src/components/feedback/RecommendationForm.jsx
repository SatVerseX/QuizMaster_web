import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { app } from '../../lib/firebase';
import { FaLightbulb } from 'react-icons/fa';

const db = getFirestore(app);

const RecommendationForm = () => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await addDoc(collection(db, 'recommendations'), {
        title,
        description,
        status: 'pending',
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        createdAt: serverTimestamp(),
      });
      setSuccess('Recommendation submitted successfully!');
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to submit recommendation.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl space-y-6 mt-8 border border-blue-100">
      <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2 justify-center"><FaLightbulb className="text-yellow-400" /> Submit a Recommendation</h2>
      {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
      {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
      <div>
        <label className="block font-semibold mb-1 text-blue-900">Title</label>
        <input
          type="text"
          className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white/80"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-blue-900">Description</label>
        <textarea
          className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white/80"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full font-bold shadow-lg text-base hover:from-cyan-600 hover:to-blue-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Recommendation'}
      </button>
    </form>
  );
};

export default RecommendationForm; 