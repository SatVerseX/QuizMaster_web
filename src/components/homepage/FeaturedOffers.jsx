import React, { useState, useEffect, useMemo } from "react";
import { FiClock, FiTag, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { FaFire, FaCrown } from "react-icons/fa";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

const FeaturedOffers = ({ isDark, onSubscribeSeries, onViewTests, onViewSeries, offers = [] }) => {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [dbOffers, setDbOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch offers from Firebase
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
            // More lenient start date check - allow offers that start today or have already started
            // If start date is today or earlier, consider it started
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            const offerStartDate = new Date(offer.startDate);
            offerStartDate.setHours(0, 0, 0, 0); // Start of offer start date
            const hasStarted = offerStartDate <= today;
            const hasNotEnded = offer.endDate >= now;
            
            
            return isActive && hasStarted && hasNotEnded;
          })
          .sort((a, b) => {
            const aDate = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(0);
            const bDate = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(0);
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

  // Memoize featuredOffers - Combine both offers and dbOffers
  const featuredOffers = useMemo(() => {
    const allOffers = [];
    
    // Process offers array
    if (offers.length > 0) {
      const processedOffers = offers.map((offer) => {
        // Check if this is a free series (price is 0 or series is marked as free)
        const isFreeSeries = (offer.originalPrice === 0 || offer.discountedPrice === 0 || offer.price === 0) || 
                            (offer.testSeriesId && offer.isPaid === false);
        
        return {
          id: offer.id,
          title: offer.title,
          originalPrice: isFreeSeries ? 0 : (offer.originalPrice || offer.price || 0),
          discountedPrice: isFreeSeries ? 0 : (offer.discountedPrice || offer.price || 0),
          discount: isFreeSeries ? 100 : (
            offer.discount ||
            Math.round(
              (((offer.originalPrice || offer.price || 0) -
                (offer.discountedPrice || offer.price || 0)) /
                (offer.originalPrice || offer.price || 1)) *
                100
            )
          ),
          expiryDate:
            offer.expiryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          description: offer.description || "Complete preparation package",
          image: offer.image || offer.imageUrl || "",
          badge: isFreeSeries ? "Free Series" : (offer.badge || "Special Offer"),
          category: offer.category || "Test Series",
          isFree: isFreeSeries,
          // Ensure we have the testSeriesId for subscription flow
          testSeriesId: offer.testSeriesId || offer.id,
          price: isFreeSeries ? 0 : (offer.discountedPrice || offer.price || 0),
          isPaid: !isFreeSeries,
        };
      });
      allOffers.push(...processedOffers);
    }
    
    // Process dbOffers array
    if (dbOffers.length > 0) {
      const processedDbOffers = dbOffers.map((offer) => {
        // Check if this is a free series
        const isFreeSeries = (offer.originalPrice === 0 || offer.discountedPrice === 0);
        
        return {
          id: offer.id,
          title: offer.title,
          originalPrice: isFreeSeries ? 0 : offer.originalPrice,
          discountedPrice: isFreeSeries ? 0 : offer.discountedPrice,
          discount: isFreeSeries ? 100 : offer.discountPercentage,
          expiryDate: offer.endDate,
          description: offer.description,
          image: offer.imageUrl || "",
          badge: isFreeSeries ? "Free Series" : offer.badge,
          category: "Test Series",
          isFree: isFreeSeries,
          // Ensure we have the testSeriesId for subscription flow
          testSeriesId: offer.testSeriesId || offer.id,
          price: isFreeSeries ? 0 : offer.discountedPrice,
          isPaid: !isFreeSeries,
        };
      });
      allOffers.push(...processedDbOffers);
    }
    
    // Remove duplicates based on ID
    const uniqueOffers = allOffers.filter((offer, index, self) => 
      index === self.findIndex(o => o.id === offer.id)
    );
    
    return uniqueOffers;
  }, [offers, dbOffers]);

  // Reset current offer when featuredOffers changes
  useEffect(() => {
    if (currentOffer >= featuredOffers.length) {
      setCurrentOffer(0);
    }
  }, [featuredOffers.length, currentOffer]);

  // Countdown timer effect
  useEffect(() => {
    if (featuredOffers.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft = {};

      featuredOffers.forEach((offer, index) => {
        const distance = offer.expiryDate.getTime() - now;

        if (distance > 0) {
          newTimeLeft[index] = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          };
        } else {
          newTimeLeft[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [featuredOffers]);

  // Auto-rotate offers
  useEffect(() => {
    if (featuredOffers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % featuredOffers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredOffers.length]);

  const nextOffer = () => {
    setCurrentOffer((prev) => (prev + 1) % featuredOffers.length);
  };

  const prevOffer = () => {
    setCurrentOffer(
      (prev) => (prev - 1 + featuredOffers.length) % featuredOffers.length
    );
  };

  const currentOfferData = featuredOffers[currentOffer] || {};
  const currentTimeLeft = timeLeft[currentOffer] || {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  // Show loading state
  if (loading) {
    return (
      <section className={`py-8 ${isDark ? "bg-gray-800/50" : "bg-white/50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className={`mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Loading offers...
            </p>
          </div>
        </div>
      </section>
    );
  }


  // Don't show section if no real offers available
  if (featuredOffers.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${isDark ? "bg-gray-900/50" : "bg-white/50"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaFire className="text-orange-500 text-xl" />
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Limited Time Offers
            </h2>
            <FaFire className="text-orange-500 text-xl" />
          </div>
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Don't miss out on these exclusive deals! Limited time only.
          </p>
        </div>

        <div className="max-w-6xl mx-auto ">
          <div className="relative ">
           

            {/* Main Offer Card */}
            <div
              className={`relative rounded-3xl overflow-hidden backdrop-blur-xl   ${
                isDark
                  ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30"
                  : "bg-gradient-to-br from-orange-100 to-red-100 border-orange-200"
              }`}
            >
              {/* Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 ">
                  <FaCrown className="w-2 h-2 sm:w-4 sm:h-4" />
                  {currentOfferData.badge || "Special Offer"}
                </div>
              </div>

              {/* Discount Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-4 py-0.5 sm:py-2 rounded-full text-sm sm:text-lg font-bold ">
                  {currentOfferData.discount}% OFF
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-2  sm:p-6 lg:p-8">
                {/* Right Side - Image */}
                <div className="relative order-1 lg:order-2 ">
                  <div
                    className={`h-[30vh]  sm:h-full rounded-xl sm:rounded-2xl overflow-hidden ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    {currentOfferData.image ? (
                      <img
                        src={currentOfferData.image}
                        alt={currentOfferData.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    {/* Fallback display */}
                    <div
                      className={`${
                        currentOfferData.image ? "hidden" : "flex"
                      } w-full h-full items-center justify-center ${
                        isDark
                          ? "bg-gradient-to-br from-gray-700 to-gray-800"
                          : "bg-gradient-to-br from-gray-200 to-gray-300"
                      }`}
                    >
                      <div className="text-center p-4">
                        <FaCrown
                          className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={`text-sm sm:text-lg font-semibold ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {currentOfferData.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Side - Content */}
                <div className="flex flex-col justify-center order-2 lg:order-1 pt-14 lg:pt-14">
                  
                  <h3
                    className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {currentOfferData.title}
                  </h3>

                  <p
                    className={`text-sm sm:text-base mb-4 sm:mb-5 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {currentOfferData.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-4 sm:mb-5">
                    {currentOfferData.isFree ? (
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span
                          className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent`}
                        >
                          FREE
                        </span>
                        <div
                          className={`text-xs sm:text-sm px-3 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold`}
                        >
                          100% OFF
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span
                            className={`text-2xl sm:text-3xl font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            ₹{(currentOfferData.discountedPrice || 0).toLocaleString()}
                          </span>
                          <span
                            className={`text-lg sm:text-xl line-through ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            ₹{(currentOfferData.originalPrice || 0).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                            isDark
                              ? "bg-green-500/20 text-green-400"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          Save ₹
                          {(
                            (currentOfferData.originalPrice || 0) -
                            (currentOfferData.discountedPrice || 0)
                          ).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Countdown Timer */}
                  <div
                    className={`mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl ${
                      isDark ? "bg-black/20" : "bg-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <FiClock className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Offer Ends In:
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      {[
                        { label: "Days", value: currentTimeLeft.days },
                        { label: "Hours", value: currentTimeLeft.hours },
                        { label: "Minutes", value: currentTimeLeft.minutes },
                        { label: "Seconds", value: currentTimeLeft.seconds },
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <div
                            className={`text-lg sm:text-xl font-bold p-2 sm:p-3 rounded ${
                              isDark
                                ? "bg-red-500/20 text-red-400"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {item.value.toString().padStart(2, "0")}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      console.log('Claim Offer button clicked:', currentOfferData);
                      // If free, navigate to tests or series directly
                      if (currentOfferData?.isFree) {
                        const minimalSeries = {
                          id: currentOfferData.testSeriesId || currentOfferData.id,
                          isPaid: false,
                        };
                        if (onViewTests) {
                          onViewTests(minimalSeries);
                        } else if (onViewSeries) {
                          onViewSeries(minimalSeries);
                        } else {
                          console.warn('Navigation prop for viewing tests/series not provided');
                        }
                        return;
                      }

                      // Otherwise go to subscription flow
                      if (onSubscribeSeries) {
                        const minimalSeries = {
                          id: currentOfferData.testSeriesId || currentOfferData.id,
                          isPaid: true,
                          // Pass pricing context so subscription can honor discount
                          priceOverride: currentOfferData.discountedPrice,
                          discountedPrice: currentOfferData.discountedPrice,
                          originalPrice: currentOfferData.originalPrice,
                          discountPercentage: currentOfferData.discount,
                          appliedOfferId: currentOfferData.id,
                          isFromOffer: true,
                        };
                        try {
                          const sid = minimalSeries.id;
                          if (sid) {
                            sessionStorage.setItem(
                              `offer-${sid}`,
                              JSON.stringify({
                                discountedPrice: minimalSeries.discountedPrice,
                                originalPrice: minimalSeries.originalPrice,
                                discountPercentage: minimalSeries.discountPercentage,
                                appliedOfferId: minimalSeries.appliedOfferId,
                                timestamp: Date.now()
                              })
                            );
                          }
                        } catch (_) {}
                        onSubscribeSeries(minimalSeries);
                      } else {
                        console.warn('onSubscribeSeries prop not provided');
                      }
                    }}
                    disabled={currentTimeLeft.days === 0 && currentTimeLeft.hours === 0 && currentTimeLeft.minutes === 0 && currentTimeLeft.seconds === 0}
                    className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-xl sm:shadow-2xl ${
                      (currentTimeLeft.days === 0 && currentTimeLeft.hours === 0 && currentTimeLeft.minutes === 0 && currentTimeLeft.seconds === 0)
                        ? "bg-gray-500 cursor-not-allowed opacity-50"
                        : currentOfferData.isFree 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/25" 
                          : "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/25"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      {(currentTimeLeft.days === 0 && currentTimeLeft.hours === 0 && currentTimeLeft.minutes === 0 && currentTimeLeft.seconds === 0) ? (
                        <>
                          <FiTag className="w-4 h-4 sm:w-5 sm:h-5" />
                          Offer Expired
                        </>
                      ) : currentOfferData.isFree ? (
                        <>
                          <FiTag className="w-4 h-4 sm:w-5 sm:h-5" />
                          Start Free Now
                          <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          <FiTag className="w-4 h-4 sm:w-5 sm:h-5" />
                          Claim This Offer
                          <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-2">
              {featuredOffers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentOffer(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentOffer
                      ? "bg-orange-500 scale-20 sm:scale-50"
                      : isDark
                      ? "scale-20 sm:scale-50 bg-white/30 hover:bg-white/50"
                      : "scale-20 sm:scale-50 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedOffers;
