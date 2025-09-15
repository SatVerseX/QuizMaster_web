import React from 'react';
import InfiniteLogoCarousel from './InfiniteLogoCarousel';

const LogoCarouselDemo = () => {
  const sampleLogos = [
    {
      id: 1,
      name: "UPSC",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/1.png",
      websiteUrl: "https://upsc.gov.in"
    },
    {
      id: 2,
      name: "JEE",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/2.png",
      websiteUrl: "https://jeemain.nta.nic.in"
    },
    {
      id: 3,
      name: "NEET",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/3.png",
      websiteUrl: "https://neet.nta.nic.in"
    },
    {
      id: 4,
      name: "SSC",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/4.png",
      websiteUrl: "https://ssc.nic.in"
    },
    {
      id: 5,
      name: "Banking",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/5.png",
      websiteUrl: "https://ibps.in"
    },
    {
      id: 6,
      name: "Railway",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/6.png",
      websiteUrl: "https://indianrailways.gov.in"
    },
    {
      id: 7,
      name: "Defense",
      imageUrl: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/7.png",
      websiteUrl: "https://joinindianarmy.nic.in"
    }
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Logo Carousel Examples</h2>
      
      {/* Example 1: Basic carousel */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Basic Carousel</h3>
        <InfiniteLogoCarousel 
          logos={sampleLogos}
          speed={30}
        />
      </div>

      {/* Example 2: With names and click handlers */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">With Names & Click Handlers</h3>
        <InfiniteLogoCarousel 
          logos={sampleLogos}
          showNames={true}
          onLogoClick={(logo) => {
            console.log('Clicked logo:', logo);
            if (logo.websiteUrl) {
              window.open(logo.websiteUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          speed={25}
        />
      </div>

      {/* Example 3: Fast speed */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Fast Speed</h3>
        <InfiniteLogoCarousel 
          logos={sampleLogos}
          speed={15}
        />
      </div>

      {/* Example 4: Slow speed */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Slow Speed</h3>
        <InfiniteLogoCarousel 
          logos={sampleLogos}
          speed={60}
        />
      </div>
    </div>
  );
};

export default LogoCarouselDemo;
