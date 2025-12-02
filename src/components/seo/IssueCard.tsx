import React from 'react';
import { AlertCircle, AlertTriangle, Info, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IssueCard({ issue, defaultExpanded = false }) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      badge: 'bg-red-100 text-red-700',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-700',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-700',
    },
    opportunity: {
      icon: Lightbulb,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700',
    },
  };

  const config = severityConfig[issue.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left"
      >
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-900">{issue.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
              {issue.severity}
            </span>
            {issue.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {issue.category}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
            {issue.description}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-200/50 pt-3 ml-8">
              {issue.description && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Details
                  </h5>
                  <p className="text-sm text-gray-700">{issue.description}</p>
                </div>
              )}

              {issue.current && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Current Value
                  </h5>
                  <code className="text-sm bg-white/50 px-2 py-1 rounded text-gray-700 block overflow-x-auto">
                    {issue.current}
                  </code>
                </div>
              )}

              {issue.element && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Element
                  </h5>
                  <code className="text-sm bg-white/50 px-2 py-1 rounded text-gray-700 block overflow-x-auto">
                    {issue.element}
                  </code>
                </div>
              )}

              {issue.impact && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Impact
                  </h5>
                  <p className="text-sm text-gray-700">{issue.impact}</p>
                </div>
              )}

              {issue.fix && (
                <div className="bg-white/70 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    How to Fix
                  </h5>
                  <p className="text-sm text-gray-700">{issue.fix}</p>
                </div>
              )}

              {issue.recommended && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Recommended
                  </h5>
                  <code className="text-sm bg-emerald-50 px-2 py-1 rounded text-emerald-700 block">
                    {issue.recommended}
                  </code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}