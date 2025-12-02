import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ScoreCard({ 
  title, 
  score, 
  icon: Icon, 
  change = null,
  description = null,
  onClick = null 
}) {
  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500' };
    return { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' };
  };

  const colors = getScoreColor(score);

  const getTrendIcon = () => {
    if (change === null) return null;
    if (change > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          {Icon && <Icon className={`w-5 h-5 ${colors.text}`} />}
        </div>
        {change !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-sm text-gray-400">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors.bar}`}
        />
      </div>

      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </motion.div>
  );
}