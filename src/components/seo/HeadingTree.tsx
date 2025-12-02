import React from 'react';
import { ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeadingTree({ headings }) {
  if (!headings || headings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Heading Structure</h3>
        <div className="text-center py-8 text-gray-400">
          No headings found on this page
        </div>
      </div>
    );
  }

  // Check for issues
  const h1Count = headings.filter(h => h.level === 1).length;
  const hasSkippedLevels = headings.some((h, i) => {
    if (i === 0) return false;
    return h.level > headings[i - 1].level + 1;
  });

  const issues = [];
  if (h1Count === 0) issues.push('Missing H1 heading');
  if (h1Count > 1) issues.push('Multiple H1 headings');
  if (hasSkippedLevels) issues.push('Skipped heading levels');

  const getHeadingColor = (level) => {
    const colors = {
      1: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      2: 'bg-purple-100 text-purple-700 border-purple-200',
      3: 'bg-blue-100 text-blue-700 border-blue-200',
      4: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      5: 'bg-teal-100 text-teal-700 border-teal-200',
      6: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[level] || colors[6];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Heading Structure</h3>
        {issues.length === 0 ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            Good structure
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="w-4 h-4" />
            {issues.length} issue{issues.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {issues.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <ul className="text-sm text-amber-700 space-y-1">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {headings.map((heading, index) => {
          const prevHeading = headings[index - 1];
          const isSkipped = prevHeading && heading.level > prevHeading.level + 1;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
            >
              <div
                className={`flex items-start gap-2 p-2 rounded-lg border ${getHeadingColor(heading.level)} ${
                  isSkipped ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <span className="font-mono text-xs font-bold shrink-0 mt-0.5">
                  H{heading.level}
                </span>
                <span className="text-sm line-clamp-2">{heading.text}</span>
                {isSkipped && (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 ml-auto" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-gray-500">
            Total: <strong>{headings.length}</strong>
          </span>
          {[1, 2, 3, 4, 5, 6].map(level => {
            const count = headings.filter(h => h.level === level).length;
            if (count === 0) return null;
            return (
              <span key={level} className={`px-2 py-0.5 rounded ${getHeadingColor(level)}`}>
                H{level}: {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}