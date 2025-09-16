import React, { useState, useEffect, useMemo } from "react";
import { FiClock, FiTag, FiArrowRight } from "react-icons/fi";
import { FaFire, FaCrown } from "react-icons/fa";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

const FeaturedOffers = ({
  isDark,
  onSubscribeSeries,
  onViewTests,
  onViewSeries,
  offers = [],
}) => {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [dbOffers, setDbOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Keep all existing useEffect hooks for data fetching, countdown, etc.
  // [Previous useEffect hooks remain the same]
  
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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const offerStartDate = new Date(offer.startDate);
            offerStartDate.setHours(0, 0, 0, 0);
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

  // Memoize featuredOffers
  const featuredOffers = useMemo(() => {
    const allOffers = [];

    // Process offers array
    if (offers.length > 0) {
      const processedOffers = offers.map((offer) => {
        const isFreeSeries =
          offer.originalPrice === 0 ||
          offer.discountedPrice === 0 ||
          offer.price === 0 ||
          (offer.testSeriesId && offer.isPaid === false);

        return {
          id: offer.id,
          title: offer.title,
          originalPrice: isFreeSeries
            ? 0
            : offer.originalPrice || offer.price || 0,
          discountedPrice: isFreeSeries
            ? 0
            : offer.discountedPrice || offer.price || 0,
          discount: isFreeSeries
            ? 100
            : offer.discount ||
              Math.round(
                (((offer.originalPrice || offer.price || 0) -
                  (offer.discountedPrice || offer.price || 0)) /
                  (offer.originalPrice || offer.price || 1)) *
                  100
              ),
          expiryDate:
            offer.expiryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          description: offer.description || "Complete preparation package",
          image: offer.image || offer.imageUrl || "",
          badge: isFreeSeries ? "Free Series" : offer.badge || "Special Offer",
          category: offer.category || "Test Series",
          isFree: isFreeSeries,
          testSeriesId: offer.testSeriesId || offer.id,
          price: isFreeSeries ? 0 : offer.discountedPrice || offer.price || 0,
          isPaid: !isFreeSeries,
        };
      });
      allOffers.push(...processedOffers);
    }

    // Process dbOffers array
    if (dbOffers.length > 0) {
      const processedDbOffers = dbOffers.map((offer) => {
        const isFreeSeries =
          offer.originalPrice === 0 || offer.discountedPrice === 0;

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
          testSeriesId: offer.testSeriesId || offer.id,
          price: isFreeSeries ? 0 : offer.discountedPrice,
          isPaid: !isFreeSeries,
        };
      });
      allOffers.push(...processedDbOffers);
    }

    // Remove duplicates based on ID
    const uniqueOffers = allOffers.filter(
      (offer, index, self) => index === self.findIndex((o) => o.id === offer.id)
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

  const currentOfferData = featuredOffers[currentOffer] || {};
  const currentTimeLeft = timeLeft[currentOffer] || {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  // Handle offer click
  const handleOfferClick = () => {
    console.log("Offer clicked:", currentOfferData);
    
    // Check if offer is expired
    if (
      currentTimeLeft.days === 0 &&
      currentTimeLeft.hours === 0 &&
      currentTimeLeft.minutes === 0 &&
      currentTimeLeft.seconds === 0
    ) {
      return; // Don't do anything if expired
    }

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
        console.warn("Navigation prop for viewing tests/series not provided");
      }
      return;
    }

    if (onSubscribeSeries) {
      const minimalSeries = {
        id: currentOfferData.testSeriesId || currentOfferData.id,
        isPaid: true,
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
              timestamp: Date.now(),
            })
          );
        }
      } catch (_) {}
      onSubscribeSeries(minimalSeries);
    } else {
      console.warn("onSubscribeSeries prop not provided");
    }
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
    <section
      className={`py-4 sm:py-8 ${isDark ? "bg-gray-900/50" : "bg-white/50"}`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaFire className="text-orange-500 text-lg sm:text-xl" />
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Limited Time Offers
            </h2>
            <FaFire className="text-orange-500 text-lg sm:text-xl" />
          </div>
          <p
            className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Don't miss out on these exclusive deals!
          </p>
        </div>

        <div className="max-w-sm sm:max-w-6xl mx-auto">
          <div className="relative">
            {/* Clickable Offer Card */}
            <div 
              onClick={handleOfferClick}
              className={`relative rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                currentTimeLeft.days === 0 &&
                currentTimeLeft.hours === 0 &&
                currentTimeLeft.minutes === 0 &&
                currentTimeLeft.seconds === 0
                  ? "cursor-not-allowed opacity-70"
                  : "hover:shadow-3xl"
              }`}
            >
              {/* Image Container with Click Feedback */}
              <div className="relative h-[280px] sm:h-[400px] lg:h-[500px]">
                {currentOfferData.image ? (
                  <img
                    src={currentOfferData.image}
                    alt={currentOfferData.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                
                {/* Fallback Background */}
                <div
                  className={`${
                    currentOfferData.image ? "hidden" : "flex"
                  } absolute inset-0 items-center justify-center ${
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

                {/* Enhanced Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 sm:bg-black/20"></div>

                {/* Click Indication Overlay */}
                <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors duration-300 pointer-events-none"></div>

                {/* Top Bar */}
                <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex justify-between items-start z-20">
                  {/* Badge */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 shadow-lg">
                    <FaCrown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{currentOfferData.badge || "Special"}</span>
                    <span className="xs:hidden">Offer</span>
                  </div>

                  {/* Discount Badge */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg">
                    <div className="text-center">
                      <div className="text-xs  sm:text-4xl font-bold leading-none">
                        {currentOfferData.discount}%
                      </div>
                      <div className="text-xs sm:text-sm font-medium">OFF</div>
                    </div>
                  </div>
                </div>

                

                {/* Bottom Section - No Button, Just Info */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-20">
                  {/* Mobile: Stack elements vertically */}
                  <div className="sm:hidden space-y-3">
                    {/* Timer */}
                    <div className={`p-1 sm:p-3 rounded-lg backdrop-blur-md ${
                      isDark ? "bg-slate-800" : "bg-white/90"
                    } shadow-lg`}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FiClock className="text-red-500 w-3 sm:w-4 h-3 sm:h-4" />
                        <span className={`text-xs sm:text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          Ends In:
                        </span>
                      </div>
                      <div className="flex justify-center gap-2">
                        {[
                          { label: "Days", value: currentTimeLeft.days },
                          { label: "Hrs", value: currentTimeLeft.hours },
                          { label: "Min", value: currentTimeLeft.minutes },
                          { label: "Sec", value: currentTimeLeft.seconds },
                        ].map((item, index) => (
                          <div key={index} className="text-center flex-1">
                            <div className={`text-xs sm:text-lg font-bold  sm:py-2 rounded ${
                              isDark
                                ? "bg-red-500/20 text-red-400"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {item.value.toString().padStart(2, "0")}
                            </div>
                            <div className={`text-xs mt-1 ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}>
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Only */}
                    <div className={`p-1 sm:p-3 rounded-lg ml-auto mr-auto backdrop-blur-md w-1/2 sm:w-full ${
                      isDark ? "bg-slate-800" : "bg-white/90"
                    } shadow-lg text-center`}>
                      {currentOfferData.isFree ? (
                        <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          FREE
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <div className={`text-xs sm:text-xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            ₹{(currentOfferData.discountedPrice || 0).toLocaleString()}
                          </div>
                          <div className={`text-xs sm:text-sm line-through ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}>
                            ₹{(currentOfferData.originalPrice || 0).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Side by side layout */}
                  <div className="hidden sm:flex justify-between items-end gap-4">
                    {/* Timer */}
                    <div className={`p-4 rounded-xl backdrop-blur-md ${
                      isDark ? "bg-slate-800" : "bg-white/80"
                    } shadow-lg`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FiClock className="text-red-500 w-4 h-4" />
                        <span className={`text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          Ends In:
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { label: "D", value: currentTimeLeft.days },
                          { label: "H", value: currentTimeLeft.hours },
                          { label: "M", value: currentTimeLeft.minutes },
                          { label: "S", value: currentTimeLeft.seconds },
                        ].map((item, index) => (
                          <div key={index} className="text-center">
                            <div className={`text-lg font-bold px-2 py-1 rounded ${
                              isDark
                                ? "bg-red-500/20 text-red-400"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {item.value.toString().padStart(2, "0")}
                            </div>
                            <div className={`text-xs mt-1 ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}>
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Only */}
                    <div className={`p-4 rounded-xl backdrop-blur-md ${
                      isDark ? "bg-slate-800" : "bg-white/80"
                    } shadow-lg text-right`}>
                      {currentOfferData.isFree ? (
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          FREE
                        </div>
                      ) : (
                        <div>
                          <div className={`text-2xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            ₹{(currentOfferData.discountedPrice || 0).toLocaleString()}
                          </div>
                          <div className={`text-sm line-through ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}>
                            ₹{(currentOfferData.originalPrice || 0).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tap Indicator for Mobile */}
                <div className="absolute bottom-8 right-8 sm:hidden">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FiArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            {featuredOffers.length > 1 && (
              <div className="flex justify-center mt-4 sm:mt-6 gap-2">
                {featuredOffers.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentOffer(index);
                    }}
                    className={`sm:w-3 sm:h-3 rounded-full transition-all duration-300 scale-50 sm:scale-100 ${
                      index === currentOffer
                        ? "bg-orange-500 sm:scale-125"
                        : isDark
                        ? "bg-white/30 hover:bg-white/50"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 475px) {
          .xs\\:hidden {
            display: none;
          }
        }
        @media (min-width: 475px) {
          .xs\\:inline {
            display: inline;
          }
        }
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
};

export default FeaturedOffers;
