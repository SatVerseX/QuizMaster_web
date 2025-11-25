import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiSend, 
  FiMessageSquare, 
  FiAlertCircle, 
  FiUser, 
  FiMoreHorizontal,
  FiCornerDownRight 
} from 'react-icons/fi';

// --- SECURITY UTILITIES ---

const validateComment = (text) => {
  if (typeof text !== 'string') return { valid: false, error: 'Invalid input type.' };
  const trimmed = text.trim();
  if (trimmed.length < 2) return { valid: false, error: 'Message is too short.' };
  if (trimmed.length > 500) return { valid: false, error: 'Message exceeds 500 characters.' };
  
  // Basic XSS pattern check
  const dangerousPatterns = /<script|javascript:|onload=|onclick=/i;
  if (dangerousPatterns.test(trimmed)) return { valid: false, error: 'Illegal characters detected.' };

  return { valid: true, data: trimmed };
};

// --- DATE FORMATTER ---
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const QuestionDiscussion = ({ questionId }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!questionId) return;

    const q = query(
      collection(db, 'question-discussions'),
      where('questionId', '==', questionId),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(data);
    }, (err) => {
      console.error("Secure fetch failed:", err);
      setError("Unable to load discussion thread.");
    });

    return () => unsubscribe();
  }, [questionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please login to participate.');
      return;
    }

    const validation = validateComment(newComment);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'question-discussions'), {
        questionId,
        text: validation.data,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous Student',
        userAvatar: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        isEdited: false,
        upvotes: 0
      });
      setNewComment('');
    } catch (err) {
      console.error("Write denied:", err);
      setError("Failed to send. You may be posting too fast.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODERN STYLES ---
  const containerClass = isDark 
    ? 'bg-gray-900 border-gray-800' 
    : 'bg-white border-slate-200 shadow-sm';

  const inputAreaClass = isDark
    ? 'bg-gray-800 border-t border-gray-700'
    : 'bg-gray-50 border-t border-slate-100';

  const inputClass = isDark
    ? 'bg-gray-700 text-white placeholder-gray-400 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden mt-8 ${containerClass}`} style={{ height: '500px' }}>
      
      {/* 1. Modern Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-gray-800/50 border-gray-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <FiMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Discussion
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                {comments.length} comments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chat Area */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar ${isDark ? 'bg-gray-900' : 'bg-slate-50/50'}`}>
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-60">
            <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-slate-200'}`}>
              <FiCornerDownRight className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-slate-400'}`} />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Start the conversation!
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              Ask a doubt or share a tip.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = currentUser && comment.userId === currentUser.uid;
            
            return (
              <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-white bg-slate-200 shadow-sm'}`}>
                  {comment.userAvatar ? (
                    <img src={comment.userAvatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      {isMe ? 'You' : comment.userName}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>

                  <div className={`
                    relative px-4 py-2.5 text-sm rounded-2xl shadow-sm leading-relaxed break-words
                    ${isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : (isDark ? 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200')
                    }
                  `}>
                    {comment.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Modern Input Area */}
      <div className={`p-4 shrink-0 ${inputAreaClass}`}>
        {error && (
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-red-500 bg-red-500/10 px-3 py-2 rounded-lg animate-pulse">
            <FiAlertCircle /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your question or answer..."
              className={`w-full pl-4 pr-4 py-3 rounded-xl border outline-none transition-all text-sm min-h-[50px] max-h-[120px] resize-none custom-scrollbar ${inputClass}`}
              disabled={loading}
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className={`absolute bottom-2 right-3 text-[10px] font-medium transition-opacity duration-200 ${newComment.length > 0 ? 'opacity-100' : 'opacity-0'} ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              {newComment.length}/500
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className={`
              p-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md
              ${!newComment.trim() 
                ? (isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
              }
            `}
          >
            <FiSend className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDiscussion;