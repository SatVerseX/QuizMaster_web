import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { app } from '../../lib/firebase';
import { FiZap, FiSend, FiLoader, FiXCircle, FiCheckCircle } from 'react-icons/fi';

const db = getFirestore(app);

const RecommendationForm = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // --- Style Configuration ---
  const styles = {
    container: isDark 
      ? 'bg-gray-900 text-gray-100' 
      : 'bg-white text-slate-800',
    
    input: isDark 
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20 placeholder-gray-500' 
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-blue-200 placeholder-slate-400',
    
    label: isDark ? 'text-gray-400' : 'text-slate-600',
    
    button: `
      w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200
      ${loading 
        ? 'bg-gray-500 cursor-not-allowed' 
        : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/30 active:scale-[0.98]'}
    `,

    status: {
      success: isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200',
      error: isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await addDoc(collection(db, 'recommendations'), {
        title,
        description,
        status: 'pending',
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        createdAt: serverTimestamp(),
      });
      setStatus({ type: 'success', msg: 'Thanks for the idea! We appreciate your input.' });
      setTitle('');
      setDescription('');
      if (onClose) setTimeout(onClose, 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to submit recommendation.' });
    }
    setLoading(false);
  };

  return (
    <div className={`w-full max-w-md mx-auto`}>
      <div className="text-center mb-6">
        <div className={`inline-flex p-3 rounded-full mb-3 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
          <FiZap className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2 className={`text-2xl font-black ${styles.container.text}`}>Suggest a Feature</h2>
        <p className={`text-sm mt-1 ${styles.label}`}>Help us make QuizMaster better.</p>
      </div>

      {status.msg && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === 'success' ? styles.status.success : styles.status.error}`}>
          {status.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${styles.label}`}>Feature Title</label>
          <input
            type="text"
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${styles.input}`}
            placeholder="e.g., Dark Mode Toggle, Team Quizzes"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${styles.label}`}>How should it work?</label>
          <textarea
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all min-h-[120px] resize-none ${styles.input}`}
            placeholder="Describe your idea..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiSend className="w-5 h-5" />}
          {loading ? 'Sending...' : 'Submit Idea'}
        </button>
      </form>
    </div>
  );
};

export default RecommendationForm;