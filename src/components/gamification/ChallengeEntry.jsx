import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FiZap, FiTarget, FiUser, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';

const ChallengeEntry = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [challengeData, setChallengeData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                if (id === 'demo-id-123') {
                    // Mock data for testing your UI without Firebase
                    setChallengeData({
                        challengerName: "The QuizMaster",
                        quizTitle: "Chemistry Class 10",
                        challengerPercentage: 90,
                        quizId: "demo_quiz"
                    });
                } else {
                    const docRef = doc(db, 'challenges', id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setChallengeData(docSnap.data());
                    } else {
                        setError("This challenge link has expired or is invalid.");
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load battle data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [id]);

    const handleAccept = () => {
        // Navigate to the quiz, passing state that this is a challenge
        // You need to handle this state in your Quiz component!
        navigate(`/quiz/${challengeData.quizId}`, {
            state: {
                mode: 'challenge',
                targetScore: challengeData.challengerPercentage,
                challengerName: challengeData.challengerName,
                challengeId: id
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-yellow-300 flex items-center justify-center">
            <div className="w-16 h-16 border-8 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-red-500 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                <FiAlertTriangle className="w-16 h-16 text-black mx-auto mb-4" />
                <h1 className="text-3xl font-black uppercase mb-2">Error</h1>
                <p className="font-mono text-lg">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 w-full py-3 bg-black text-white font-bold uppercase hover:bg-gray-800"
                >
                    Go Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Noise */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />

            <div className="relative w-full max-w-lg">
                {/* Floating Badge */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 border-4 border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 rotate-[-2deg]">
                    <span className="font-black text-xl uppercase tracking-widest">Incoming Battle</span>
                </div>

                {/* Main Card */}
                <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] p-8 pt-12 relative">

                    {/* VS Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-red-500 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                            <span className="font-black text-4xl text-white italic mr-1">VS</span>
                        </div>
                    </div>

                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-xl font-bold text-gray-500 uppercase tracking-wide">
                            Challenger
                        </h2>
                        <h1 className="text-4xl font-black text-black uppercase leading-tight">
                            {challengeData.challengerName}
                        </h1>
                        <div className="inline-block bg-black text-white px-3 py-1 font-mono text-sm mt-2 transform -rotate-1">
                            wants to destroy you
                        </div>
                    </div>

                    {/* Stats Box */}
                    <div className="bg-gray-100 border-4 border-black p-6 mb-8 relative">
                        {/* Corner decorative squares */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-black" />
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black" />

                        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-dashed border-gray-400">
                            <div className="flex items-center gap-3">
                                <FiTarget className="w-6 h-6" />
                                <span className="font-bold uppercase">Target Score</span>
                            </div>
                            <span className="font-black text-2xl text-red-600">{challengeData.challengerPercentage}%</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FiUser className="w-6 h-6" />
                                <span className="font-bold uppercase">Quiz</span>
                            </div>
                            <span className="font-bold text-right truncate max-w-[150px]">{challengeData.quizTitle}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleAccept}
                        className="group w-full py-5 bg-[#25D366] border-4 border-black font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-2 active:translate-y-2"
                    >
                        Accept Challenge <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>

                    <p className="mt-4 text-center text-gray-500 text-xs font-mono uppercase">
                        Do you have what it takes?
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChallengeEntry;