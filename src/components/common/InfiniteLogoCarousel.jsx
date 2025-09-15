import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const InfiniteLogoCarousel = ({ 
  logos = [], 
  className = "",
  onLogoClick = null,
  showNames = false,
  speed = 40 // animation speed in seconds
}) => {
  const { isDark } = useTheme();

  // Process logos to ensure they have the right format
  const processedLogos = logos.map(logo => ({
    id: logo.id,
    name: logo.name || logo.title || "Exam Logo",
    imageUrl: logo.imageUrl || logo.logoUrl || logo.url
  }));

  // Don't render if no logos provided
  if (processedLogos.length === 0) {
    return null;
  }
  
  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...processedLogos, ...processedLogos];

  return (
    <div className={`infinite-logo-carousel ${className}`}>
      <div className="slider">
        <div className="slide-track">
          {duplicatedLogos.map((logo, index) => (
            <div 
              key={`${logo.id}-${index}`} 
              className={`slide ${onLogoClick ? 'cursor-pointer' : ''}`}
              onClick={() => onLogoClick && onLogoClick(logo)}
            >
              <div className="slide-content">
                <img 
                  src={logo.imageUrl} 
                  height="100" 
                  width="250" 
                  alt={logo.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className={`hidden w-full h-full items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {logo.name}
                  </span>
                </div>
                {showNames && (
                  <div className={`logo-name ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {logo.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .infinite-logo-carousel {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .slider {
          background: transparent;
          box-shadow: none;
          height: 100px;
          margin: auto;
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .slider::before,
        .slider::after {
          background: linear-gradient(
            to right,
            ${isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'} 0%,
            ${isDark ? 'rgba(15, 23, 42, 0)' : 'rgba(255, 255, 255, 0)'} 100%
          );
          content: "";
          height: 100px;
          position: absolute;
          width: 200px;
          z-index: 2;
        }

        .slider::after {
          right: 0;
          top: 0;
          transform: rotateZ(180deg);
        }

        .slider::before {
          left: 0;
          top: 0;
        }

        .slide-track {
          animation: scroll ${speed}s linear infinite;
          display: flex;
          width: calc(300px * ${duplicatedLogos.length});
        }

        .slide {
          height: 100px;
          width: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 25px;
          transition: transform 0.3s ease;
        }

        .slide:hover {
          transform: scale(1.05);
        }

        .slide-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .logo-name {
          position: absolute;
          bottom: -25px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .slide:hover .logo-name {
          opacity: 1;
        }

        .slide img {
          max-height: 90px;
          max-width: 250px;
          object-fit: contain;
          filter: ${isDark ? 'brightness(1.1) contrast(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'};
          transition: all 0.3s ease;
        }

        .slide:hover img {
          transform: scale(1.05);
          filter: ${isDark ? 'brightness(1.2) contrast(1.3) drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'brightness(1.1) contrast(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.15))'};
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-300px * ${processedLogos.length}));
          }
        }

        /* Pause animation on hover */
        .slider:hover .slide-track {
          animation-play-state: paused;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .slider {
            height: 80px;
            background: transparent;
          }
          
          .slider::before,
          .slider::after {
            height: 80px;
            width: 100px;
          }
          
          .slide {
            height: 80px;
            width: 250px;
            padding: 0 20px;
          }
          
          .slide img {
            max-height: 60px;
            max-width: 180px;
          }
          
          .slide-track {
            width: calc(250px * ${duplicatedLogos.length});
          }
          
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-250px * ${processedLogos.length}));
            }
          }
        }

        @media (max-width: 480px) {
          .slider {
            height: 70px;
            background: transparent;
          }
          
          .slider::before,
          .slider::after {
            height: 70px;
            width: 80px;
          }
          
          .slide {
            height: 70px;
            width: 220px;
            padding: 0 15px;
          }
          
          .slide img {
            max-height: 50px;
            max-width: 150px;
          }
          
          .slide-track {
            width: calc(220px * ${duplicatedLogos.length});
          }
          
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-220px * ${processedLogos.length}));
            }
          }
        }
      `}</style>
    </div>
  );
};

export default InfiniteLogoCarousel;
