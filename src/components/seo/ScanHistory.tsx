import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  ExternalLink, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanHistory({ scans, onSelect, onDelete, onCompare, selectedId }) {
  if (!scans || scans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Scan History</h3>
        <div className="text-center py-8 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No scans yet</p>
          <p className="text-sm">Run your first scan to see results here</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (current, previous) => {
    if (!previous) return null;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Scan History</h3>
        <span className="text-xs text-gray-500">{scans.length} scans</span>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
        {scans.map((scan, index) => {
          const previousScan = scans[index + 1];
          const isSelected = selectedId === scan.id;
          
          return (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Score badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${getScoreBg(scan.seo_score)} ${getScoreColor(scan.seo_score)}`}>
                  {scan.seo_score || 0}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate max-w-[200px]" title={scan.title || scan.url}>
                      {scan.title || scan.url}
                    </h4>
                    {previousScan && getTrendIcon(scan.seo_score, previousScan.seo_score)}
                  </div>
                  
                  <a 
                    href={scan.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 truncate max-w-[250px]"
                  >
                    {scan.url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(scan.created_date)}
                    </span>
                    
                    {scan.issues_count > 0 && (
                      <span className={`text-xs ${scan.critical_count > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {scan.issues_count} issues
                        {scan.critical_count > 0 && ` (${scan.critical_count} critical)`}
                      </span>
                    )}
                  </div>

                  {/* Score pills */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreBg(scan.seo_score)} ${getScoreColor(scan.seo_score)}`}>
                      SEO: {scan.seo_score || 0}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreBg(scan.aeo_score)} ${getScoreColor(scan.aeo_score)}`}>
                      AEO: {scan.aeo_score || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect?.(scan)}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {previousScan && onCompare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCompare?.(scan, previousScan)}
                      title="Compare with previous"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(scan.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}