import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <img 
        src="https://cdnb.artstation.com/p/assets/images/images/051/646/935/original/abdullah-noman-f.gif?1657810300"
        alt="Loading"
        className="w-full h-full object-cover filter brightness-110 contrast-125 saturate-110"
        style={{
          imageRendering: 'crisp-edges',
          WebkitImageRendering: 'crisp-edges',
          MozImageRendering: 'crisp-edges'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
    </div>
  );
};

export default LoadingScreen;