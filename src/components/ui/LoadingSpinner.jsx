import React from 'react';
import MagicLoader from '../lightswind/magic-loader.tsx';

const LoadingSpinner = ({ 
  size = 200, 
  text = "Loading...", 
  className = "",
  showText = true,
  particleCount = 1,
  speed = 3,
  hueRange = [200, 280] // Blue to purple range
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <MagicLoader 
        size={size}
        particleCount={particleCount}
        speed={speed}
        hueRange={hueRange}
      />
      {showText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 