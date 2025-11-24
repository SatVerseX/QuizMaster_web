import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FiCopy, FiZap, FiCheck, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const ChallengeModal = ({ quizId, quizTitle, score, percentage, onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [challengeLink, setChallengeLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    // HACK: If no user, mock one for UI testing
    const challengerName = currentUser?.displayName || 'Mystery Challenger';
    const challengerId = currentUser?.uid || 'anon_123';

    const createChallenge = async () => {
        setLoading(true);
        try {
            setError(null);
            // 1. Create Challenge Document
            const docRef = await addDoc(collection(db, 'challenges'), {
                quizId,
                quizTitle,
                challengerId,
                challengerName,
                challengerScore: score,
                challengerPercentage: percentage,
                createdAt: serverTimestamp(),
                status: 'active'
            });

            // 2. Generate Link
            const link = `${window.location.origin}/challenge/${docRef.id}`;
            setChallengeLink(link);
        } catch (error) {
            console.error("Error creating challenge:", error);
            setChallengeLink(null);
            setError("Couldn't create a challenge link. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (!challengeLink) return;
        navigator.clipboard.writeText(challengeLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        if (!challengeLink) return;
        // SOLUTION: Build emojis at runtime using Code Points.
        // This bypasses file encoding issues entirely.
        
        const swords = String.fromCodePoint(0x2694, 0xFE0F); // ⚔️
        const trophy = String.fromCodePoint(0x1F3C6);        // 🏆
        const books = String.fromCodePoint(0x1F4DA);         // 📚
        const skull = String.fromCodePoint(0x1F480);         // 💀
        const finger = String.fromCodePoint(0x1F447);        // 👇

        // Construct the string in normal JavaScript
        const message = [
            `${swords} *VS BATTLE INVITE*`,
            ``,
            `${trophy} Score to Beat: *${percentage}%*`,
            `${books} Quiz: *${quizTitle}*`,
            ``,
            `${skull} _Think you can beat me?_`,
            `${finger} *Tap here to fight:*`,
            challengeLink
        ].join('\n');

        // Encode the entire string once
        const encodedMessage = encodeURIComponent(message);

        // Use the direct API endpoint, not the wa.me redirector
        const url = `https://api.whatsapp.com/send?text=${encodedMessage}`;
        
        window.open(url, '_blank');
    };

    // Initial Create Trigger
    useEffect(() => {
        if (!challengeLink && !loading) {
            createChallenge();
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-yellow-300/90 backdrop-blur-sm animate-in fade-in duration-200">
            
            {/* Main Card: Neo-Brutalist Style */}
            <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-red-500 hover:text-white transition-colors border-2 border-transparent hover:border-black cursor-pointer"
                >
                    <FiX className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-purple-400 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <FiZap className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
                        VS MODE
                    </h2>
                    <p className="mt-2 font-bold text-black">
                        SCORE TO BEAT: <span className="bg-black text-white px-2 py-1">{percentage}%</span>
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-mono font-bold text-sm">FORGING LINK...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && (
                            <div className="p-3 border-4 border-black bg-red-100 text-red-700 font-bold text-sm uppercase">
                                {error}
                            </div>
                        )}
                        {/* Link Input Group */}
                        <div className="space-y-2">
                            <label className="font-black text-xs uppercase tracking-widest">Challenge Link</label>
                            <div className="flex gap-0">
                                <div className="flex-1 bg-gray-100 border-4 border-black border-r-0 p-3 flex items-center overflow-hidden">
                                    <input
                                        readOnly
                                        value={challengeLink || 'No link generated'}
                                        className="w-full bg-transparent text-sm font-mono outline-none text-gray-600 truncate"
                                    />
                                </div>
                                <button
                                    onClick={copyLink}
                                    className={`px-4 border-4 border-black flex items-center justify-center transition-all active:translate-y-1 cursor-pointer ${
                                        copied ? 'bg-green-400' : 'bg-cyan-400 hover:bg-cyan-300'
                                    }`}
                                    disabled={!challengeLink}
                                >
                                    {copied ? <FiCheck className="w-5 h-5 text-black" /> : <FiCopy className="w-5 h-5 text-black" />}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={shareWhatsApp}
                                className="w-full py-4 border-4 border-black font-black text-lg uppercase tracking-wide bg-[#25D366] text-white flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] cursor-pointer"
                                disabled={!challengeLink}
                            >
                                <FaWhatsapp className="w-6 h-6" /> WhatsApp Duel
                            </button>

                            <button
                                onClick={createChallenge}
                                className="w-full py-3 border-4 border-black font-black text-sm uppercase tracking-wide bg-yellow-300 hover:bg-yellow-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Retry Link Generation
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-3 font-bold text-black uppercase hover:underline decoration-4 decoration-pink-500 cursor-pointer"
                            >
                                Skip Battle
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeModal;