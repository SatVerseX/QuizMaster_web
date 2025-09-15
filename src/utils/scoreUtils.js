// utils/scoreUtils.js
import { FaCrown, FaTrophy, FaMedal, FaGem, FaFire } from 'react-icons/fa';

export const getScoreColor = (percentage) => {
  if (percentage >= 90) return 'from-emerald-500 to-green-500';
  if (percentage >= 80) return 'from-blue-500 to-cyan-500';
  if (percentage >= 70) return 'from-purple-500 to-violet-500';
  if (percentage >= 60) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
};

export const getScoreTextColor = (percentage) => {
  if (percentage >= 90) return 'text-emerald-300';
  if (percentage >= 80) return 'text-blue-300';
  if (percentage >= 70) return 'text-purple-300';
  if (percentage >= 60) return 'text-yellow-300';
  return 'text-red-300';
};

export const getScoreBg = (percentage) => {
  if (percentage >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
  if (percentage >= 80) return 'bg-blue-500/20 border-blue-500/30';
  if (percentage >= 70) return 'bg-purple-500/20 border-purple-500/30';
  if (percentage >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
  return 'bg-red-500/20 border-red-500/30';
};

export const getPerformanceIcon = (percentage) => {
  if (percentage >= 90) return { Icon: FaCrown, className: "w-5 h-5 text-yellow-400" };
  if (percentage >= 80) return { Icon: FaTrophy, className: "w-5 h-5 text-blue-400" };
  if (percentage >= 70) return { Icon: FaMedal, className: "w-5 h-5 text-purple-400" };
  if (percentage >= 60) return { Icon: FaGem, className: "w-5 h-5 text-yellow-400" };
  return { Icon: FaFire, className: "w-5 h-5 text-orange-400" };
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = timestamp.toDate();
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};
