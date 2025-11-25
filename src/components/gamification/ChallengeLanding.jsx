import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Trophy, 
  Swords, 
  AlertTriangle, 
  Target, 
  User, 
  Clock, 
  Zap, 
  ArrowRight,
  Flame
} from 'lucide-react';

const ChallengeLanding = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const redirectPath = `${location.pathname}${location.search || ''}`;

  useEffect(() => {
    if (currentUser) return;
    navigate('/login', {
      replace: true,
      state: { redirectTo: redirectPath }
    });
  }, [currentUser, navigate, redirectPath]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchChallenge = async () => {
      try {
        await new Promise(r => setTimeout(r, 600));

        if (!challengeId) throw new Error("Invalid Link");

        if (challengeId === 'demo-id-123') {
            setChallenge({
                id: 'demo-id-123',
                challengerName: 'QuizMaster_99',
                challengerPercentage: 85,
                quizTitle: 'Advanced Chemistry: Periodic Table',
                quizId: 'demo_quiz',
                timeLimit: 15,
            });
            return;
        }

        const docRef = doc(db, 'challenges', challengeId);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          setChallenge({ id: snap.id, ...snap.data() });
        } else {
          setError("Challenge expired or invalid.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load challenge.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [challengeId, currentUser]);

  const handleAccept = () => {
    if (!challenge) return;
    navigate(`/test/${challenge.quizId}/take`, {
      state: { 
        challengeMode: true,
        targetScore: challenge.challengerScore || challenge.challengerPercentage,
        challengerName: challenge.challengerName
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-20 h-20 border-8 border-black bg-white animate-spin shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8" />
      <h2 className="text-3xl font-black uppercase tracking-widest bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        Initializing...
      </h2>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-red-600 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-black text-white p-4 rounded-none transform rotate-3">
                <AlertTriangle size={48} />
            </div>
        </div>
        <h2 className="text-4xl font-black uppercase mb-4 leading-none">Fatal Error</h2>
        <div className="bg-red-100 border-2 border-black p-4 mb-8 font-mono font-bold text-left">
           {error}
        </div>
        <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-black text-white font-black uppercase hover:bg-gray-800 transition-colors border-2 border-transparent"
        >
            Abort Mission
        </button>
      </div>
    </div>
  );

  return (
    // UPDATED CONTAINER: Added overflow-y-auto and py-12 to handle height issues
    <div className="min-h-screen bg-violet-600 flex items-center justify-center p-4 py-16 overflow-y-auto relative font-sans">
      
      {/* Background Texture - Fixed Position so it doesn't scroll */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      {/* Main Content Wrapper - Added margin top to ensure badge has space */}
      <div className="relative w-full max-w-lg z-10 mt-8 mb-8">
        
        {/* Floating "Duel Request" Badge - Positioned absolutely relative to the Wrapper */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
            <div className="bg-yellow-400 border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                <div className="flex items-center gap-2 font-black text-lg uppercase tracking-wider whitespace-nowrap">
                    <Zap className="fill-black" size={20} /> 
                    <span>Duel Request</span>
                    <Zap className="fill-black" size={20} />
                </div>
            </div>
        </div>

        {/* Card Body */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
            
            {/* Top Section: Challenger Identity */}
            <div className="bg-pink-500 border-b-4 border-black p-8 pt-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white border-4 border-black mb-4 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <User size={48} strokeWidth={2.5} />
                    </div>
                    
                    <div className="bg-black text-white px-3 py-1 font-mono text-xs font-bold uppercase mb-2 transform -rotate-1">
                        Challenger
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-none tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] break-words max-w-full">
                        {challenge.challengerName}
                    </h1>
                </div>
            </div>

            {/* VS Badge (Overlapping) */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-16 h-16 bg-white border-4 border-black rotate-45 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Swords className="w-8 h-8 -rotate-45 text-black" strokeWidth={3} />
                </div>
            </div>

            {/* Bottom Section: Details */}
            <div className="p-6 pt-12 md:p-8 md:pt-14">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-cyan-100 border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <Target size={16} />
                            <span className="font-mono font-bold text-xs uppercase">Target</span>
                        </div>
                        <span className="text-3xl md:text-4xl font-black">{challenge.challengerPercentage}%</span>
                    </div>

                    <div className="bg-lime-200 border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} />
                            <span className="font-mono font-bold text-xs uppercase">Time</span>
                        </div>
                        <span className="text-3xl md:text-4xl font-black">{challenge.timeLimit || '20'}m</span>
                    </div>
                </div>

                {/* Quiz Info */}
                <div className="border-4 border-black p-4 mb-8 bg-gray-50 flex items-start gap-4">
                    <div className="bg-black text-white p-2 shrink-0">
                        <Trophy size={20} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0"> {/* min-w-0 helps text truncation */}
                        <h4 className="font-black text-base md:text-lg uppercase leading-tight break-words">
                            {challenge.quizTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <p className="font-mono text-xs text-gray-600 font-bold uppercase">Active Battle</p>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button 
                    onClick={handleAccept}
                    className="group relative w-full focus:outline-none"
                >
                    {/* Shadow Layer */}
                    <div className="absolute inset-0 bg-black translate-y-2 translate-x-2" />
                    
                    {/* Button Layer */}
                    <div className="relative bg-yellow-400 border-4 border-black py-4 px-6 flex items-center justify-center gap-3 transition-transform active:translate-y-2 active:translate-x-2 active:bg-yellow-500">
                        <Flame className="w-6 h-6 fill-black" />
                        <span className="font-black text-lg md:text-xl uppercase tracking-wider text-black">Accept Challenge</span>
                        <ArrowRight className="w-6 h-6 stroke-[3px] group-hover:translate-x-2 transition-transform" />
                    </div>
                </button>

                <p className="text-center mt-6 font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Glory awaits the victor
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeLanding;