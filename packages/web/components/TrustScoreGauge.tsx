import React from 'react';

interface TrustScoreGaugeProps {
  score: number;
  size: 'sm' | 'md';
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({ score, size }) => {
  const sizeClasses = size === 'md' ? 'w-16 h-16' : 'w-12 h-12';
  const textSize = size === 'md' ? 'text-lg' : 'text-sm';

  return (
    <div className={`relative ${sizeClasses}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
          strokeWidth="2"
          strokeDasharray={`${score}, 100`}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold text-gray-700`}>
        {score}
      </div>
    </div>
  );
};
