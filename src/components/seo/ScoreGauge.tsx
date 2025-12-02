import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreGauge({ 
  score = 0, 
  label = 'Score', 
  size = 'md',
  showLabel = true 
}) {
  const sizes = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
  };

  const { width, stroke, fontSize } = sizes[size] || sizes.md;
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  const getColor = (score) => {
    if (score >= 80) return { stroke: '#10b981', bg: '#d1fae5', text: '#065f46' };
    if (score >= 60) return { stroke: '#f59e0b', bg: '#fef3c7', text: '#92400e' };
    return { stroke: '#ef4444', bg: '#fee2e2', text: '#991b1b' };
  };

  const colors = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg
          width={width}
          height={width}
          viewBox={`0 0 ${width} ${width}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`${fontSize} font-bold`}
            style={{ color: colors.text }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-2 text-sm font-medium text-gray-600">{label}</span>
      )}
    </div>
  );
}