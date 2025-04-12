// src/components/WelcomeSplash.tsx
import React, { useState, useEffect } from 'react';

interface WelcomeSplashProps {
  onComplete: () => void;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a1929] z-50">
      <div className="text-center animate-fade-up">
        <h1 className="text-5xl font-bold text-[#00f2fe] mb-4 animate-pulse">
          Welcome to StockVision
        </h1>
        <p className="text-xl text-[#8f9faa]">
          Your Real-Time Market Intelligence Platform
        </p>
        <div className="mt-8 space-y-2">
          <div className="w-64 h-1 bg-[rgba(0,242,254,0.2)] rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-[#00f2fe] animate-loading-bar"></div>
          </div>
          <p className="text-[#8f9faa] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSplash;