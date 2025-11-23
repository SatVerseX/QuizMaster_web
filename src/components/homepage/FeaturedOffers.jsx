import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, 
  Tag, 
  ArrowRight, 
  ShoppingBag, 
  Activity, 
  Flame, 
  Crown, 
  Timer, 
  Sparkles 
} from 'lucide-react';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

const FeaturedOffers = ({
  isDark = false,
  onSubscribeSeries,
  onViewTests,
  onViewSeries,
  offers = [],
}) => {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [dbOffers, setDbOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // --- REAL DATA FETCHING ---
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const now = new Date();

        const q = query(collection(db, "offers"));
        const querySnapshot = await getDocs(q);

        const allOffers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate
              ? data.startDate.toDate()
              : new Date(data.startDate || now),
            endDate: data.endDate?.toDate
              ? data.endDate.toDate()
              : new Date(data.endDate || now),
          };
        });

        const offersData = allOffers
          .filter((offer) => {
            const isActive = offer.isActive === true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const offerStartDate = new Date(offer.startDate);
            offerStartDate.setHours(0, 0, 0, 0);
            const hasStarted = offerStartDate <= today;
            const hasNotEnded = offer.endDate >= now;

            return isActive && hasStarted && hasNotEnded;
          })
          .sort((a, b) => {
            const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return bDate - aDate;
          });

        setDbOffers(offersData);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setDbOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // --- DATA PROCESSING ---
  const featuredOffers = useMemo(() => {
    const allOffers = [];

    // Helper to process offer data structure
    const processOffer = (offer, isDb = false) => {
       const isFreeSeries =
          offer.originalPrice === 0 ||
          offer.discountedPrice === 0 ||
          offer.price === 0 ||
          (offer.testSeriesId && offer.isPaid === false);

        const originalPrice = isFreeSeries ? 0 : (isDb ? offer.originalPrice : (offer.originalPrice || offer.price || 0));
        const discountedPrice = isFreeSeries ? 0 : (isDb ? offer.discountedPrice : (offer.discountedPrice || offer.price || 0));
        
        // Calculate discount safely
        let discount = 0;
        if (isFreeSeries) {
            discount = 100;
        } else if (isDb) {
            discount = offer.discountPercentage || 0;
        } else {
            discount = offer.discount || 
              (originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0);
        }

        return {
          id: offer.id,
          title: offer.title,
          originalPrice,
          discountedPrice,
          discountPercentage: discount,
          endDate: offer.endDate || offer.expiryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          description: offer.description || "Complete preparation package",
          image: offer.image || offer.imageUrl || "",
          badge: isFreeSeries ? "Free Series" : offer.badge || "Special Offer",
          category: offer.category || "Test Series",
          isFree: isFreeSeries,
          testSeriesId: offer.testSeriesId || offer.id,
          isPaid: !isFreeSeries,
        };
    };

    // Merge props offers and db offers
    if (offers.length > 0) {
      allOffers.push(...offers.map(o => processOffer(o, false)));
    }
    if (dbOffers.length > 0) {
      allOffers.push(...dbOffers.map(o => processOffer(o, true)));
    }

    // Deduplicate based on ID
    return allOffers.filter(
      (offer, index, self) => index === self.findIndex((o) => o.id === offer.id)
    );
  }, [offers, dbOffers]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (featuredOffers.length === 0) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const newTimeLeft = {};
      
      featuredOffers.forEach((offer, index) => {
        const endDate = offer.endDate instanceof Date ? offer.endDate : new Date(offer.endDate);
        const distance = endDate.getTime() - now;
        
        if (distance > 0) {
          newTimeLeft[index] = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          };
        } else {
          newTimeLeft[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });
      setTimeLeft(newTimeLeft);
    };

    updateTimer(); // Immediate run
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [featuredOffers]);

  // --- AUTO ROTATION ---
  useEffect(() => {
    if (featuredOffers.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % featuredOffers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredOffers.length, isHovered]);

  // --- HANDLERS ---
  const currentOfferData = featuredOffers[currentOffer] || {};
  const ct = timeLeft[currentOffer] || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const handleOfferClick = () => {
    if (currentOfferData?.isFree) {
      const minimalSeries = { id: currentOfferData.testSeriesId || currentOfferData.id, isPaid: false };
      if (onViewTests) onViewTests(minimalSeries);
      else if (onViewSeries) onViewSeries(minimalSeries);
    } else if (onSubscribeSeries) {
      const minimalSeries = {
        id: currentOfferData.testSeriesId || currentOfferData.id,
        isPaid: true,
        priceOverride: currentOfferData.discountedPrice,
        discountedPrice: currentOfferData.discountedPrice,
        originalPrice: currentOfferData.originalPrice,
        discountPercentage: currentOfferData.discountPercentage,
        appliedOfferId: currentOfferData.id,
        isFromOffer: true,
      };
      onSubscribeSeries(minimalSeries);
    }
  };

  if (loading) {
    return (
      <div className={`w-full h-96 flex items-center justify-center rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (featuredOffers.length === 0) return null;

  return (
    <section className="w-full py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"} shadow-sm`}>
             <Flame size={20} className="animate-pulse-slow" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Flash Deals
            </h2>
            <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Limited time exclusive offers
            </p>
          </div>
        </div>
        
        {/* Pagination Dots */}
        {featuredOffers.length > 1 && (
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
            {featuredOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentOffer(index)}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  index === currentOffer
                    ? "w-8 bg-indigo-600 shadow-sm"
                    : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Card */}
      <div 
        className="perspective-1000 group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          onClick={handleOfferClick}
          className={`
            relative w-full overflow-hidden rounded-3xl shadow-2xl 
            bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
            transition-all duration-500 ease-out transform
            ${isHovered ? " shadow-indigo-500/20" : "scale-100"}
            cursor-pointer
          `}
          style={{ minHeight: '420px' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[420px]">
            
            {/* LEFT: Visuals */}
            <div className="relative h-64 lg:h-full overflow-hidden">
              {currentOfferData.image ? (
                <img
                  src={currentOfferData.image}
                  alt={currentOfferData.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 "
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? "from-gray-700 to-gray-900" : "from-gray-100 to-gray-200"} flex items-center justify-center`}>
                   <Crown size={64} className="text-gray-400 opacity-50" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-transparent' : 'from-gray-900/60 via-transparent'} opacity-90 lg:opacity-40`} />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                 {currentOfferData.badge && (
                   <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 w-fit transform transition-transform group-hover:translate-x-1">
                      <Crown size={12} fill="currentColor" />
                      {currentOfferData.badge}
                   </div>
                 )}
                 {(currentOfferData.discountPercentage > 0 || currentOfferData.isFree) && (
                    <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg w-fit flex items-center gap-1.5 animate-bounce-slow">
                      <Sparkles size={12} fill="currentColor" />
                      {currentOfferData.isFree ? '100% OFF' : `${currentOfferData.discountPercentage}% OFF`}
                    </div>
                 )}
              </div>
            </div>

            {/* RIGHT: Content */}
            <div className={`
              relative flex flex-col justify-center p-6 md:p-10 lg:p-12
              bg-gradient-to-br ${isDark ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'}
            `}>
              
              {/* Timer */}
              <div className={`
                mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-xl border w-fit
                ${isDark 
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" 
                  : "bg-indigo-50 border-indigo-100 text-indigo-700"}
              `}>
                <Timer size={16} className="animate-pulse" />
                <div className="flex items-center gap-1 font-mono text-sm font-bold">
                   <span className="bg-indigo-600 text-white rounded px-1.5 py-0.5">{ct.days}d</span>
                   <span>:</span>
                   <span className="bg-gray-700 text-white rounded px-1.5 py-0.5">{ct.hours.toString().padStart(2,'0')}</span>
                   <span>:</span>
                   <span className="bg-gray-700 text-white rounded px-1.5 py-0.5">{ct.minutes.toString().padStart(2,'0')}</span>
                   <span>:</span>
                   <span className="bg-red-500 text-white rounded px-1.5 py-0.5 min-w-[28px] text-center">{ct.seconds.toString().padStart(2,'0')}</span>
                </div>
              </div>

              {/* Details */}
              <div className="mb-auto relative z-10">
                <h3 className={`text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {currentOfferData.title}
                </h3>
                <p className={`text-sm md:text-base leading-relaxed line-clamp-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {currentOfferData.description}
                </p>
              </div>

              {/* Pricing & CTA */}
              <div className="mt-10 flex flex-wrap items-end justify-between gap-6 relative z-10">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Special Price
                  </p>
                  <div className="flex items-baseline gap-3">
                     {currentOfferData.isFree ? (
                       <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                         FREE
                       </span>
                     ) : (
                       <>
                         <span className={`text-4xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                           ₹{currentOfferData.discountedPrice?.toLocaleString()}
                         </span>
                         {currentOfferData.originalPrice > 0 && (
                           <span className="text-lg text-gray-400 line-through decoration-red-500/40 decoration-2">
                             ₹{currentOfferData.originalPrice?.toLocaleString()}
                           </span>
                         )}
                       </>
                     )}
                  </div>
                </div>

                <button className={`
                  group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1
                  ${isDark 
                    ? "bg-white text-gray-900 hover:bg-gray-100 shadow-white/5" 
                    : "bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20"}
                `}>
                  <span>{currentOfferData.isFree ? "Start Learning" : "Grab Deal"}</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              
              {/* Decorative Background Elements */}
              <div className={`absolute right-0 bottom-0 opacity-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                 <ShoppingBag size={200} strokeWidth={0.5} />
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for custom animations */}
      <style>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </section>
  );
};

export default FeaturedOffers;