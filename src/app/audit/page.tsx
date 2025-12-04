'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ComprehensiveSEOEngine, type SEOAuditResult, type SEOCheck } from '@/lib/engines/comprehensive-seo-engine';

export default function AuditPage() {
  const [url, setUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleAudit = async () => {
    if (!url.trim()) return;

    setIsAuditing(true);
    try {
      // Fetch page HTML via proxy or direct
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }

      const { html } = await response.json();

      // Run comprehensive audit
      const engine = new ComprehensiveSEOEngine(html, url);
      const result = await engine.runFullAudit();

      setAuditResult(result);
      // Auto-expand critical and warning categories
      const newExpanded = new Set<string>();
      Object.keys(result.categories).forEach(category => {
        const hasCritical = result.categories[category].checks.some(c => c.status === 'critical');
        const hasWarnings = result.categories[category].checks.some(c => c.status === 'warning');
        if (hasCritical || hasWarnings) {
          newExpanded.add(category);
        }
      });
      setExpandedCategories(newExpanded);
    } catch (error) {
      console.error('Audit error:', error);
      alert('Failed to audit URL. Please check the URL and try again.');
    } finally {
      setIsAuditing(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Audit</h1>
          <p className="text-gray-600">Comprehensive on-page and technical SEO analysis with 250+ checks</p>
        </div>

        {/* Audit Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-8 mb-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAudit();
            }}
            className="flex gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="url"
                placeholder="Enter URL to audit (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-12 h-14 text-lg bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isAuditing}
              />
            </div>
            <Button
              type="submit"
              disabled={isAuditing || !url.trim()}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Start Audit
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Loading State */}
        {isAuditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-12 text-center"
          >
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Running Comprehensive Audit</h3>
            <p className="text-gray-600">Analyzing 250+ SEO factors...</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isAuditing && !auditResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-16 text-center"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Audit</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Enter any URL above to start a comprehensive SEO audit. We'll analyze over 250 factors including
              meta tags, content quality, technical SEO, mobile optimization, and more.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">250+</div>
                <div className="text-sm text-gray-600">SEO Checks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">PDF</div>
                <div className="text-sm text-gray-600">Export Report</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audit Results */}
        {!isAuditing && auditResult && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Overview */}
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall SEO Score</h2>
                      <a
                        href={auditResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                      >
                        {auditResult.url}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Score Gauge */}
                    <div className={`p-8 rounded-xl border-2 ${getScoreBg(auditResult.score)}`}>
                      <div className="text-center">
                        <div className={`text-7xl font-bold mb-2 ${getScoreColor(auditResult.score)}`}>
                          {auditResult.score}
                        </div>
                        <div className="text-lg font-medium text-gray-700">out of 100</div>
                        <div className="mt-4 text-sm text-gray-600">
                          {auditResult.score >= 80 && 'Excellent SEO Performance'}
                          {auditResult.score >= 60 && auditResult.score < 80 && 'Good - Room for Improvement'}
                          {auditResult.score < 60 && 'Needs Attention'}
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          <span className="font-medium text-gray-900">Passed</span>
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">{auditResult.summary.passed}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-amber-600" />
                          <span className="font-medium text-gray-900">Warnings</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600">{auditResult.summary.warnings}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-6 h-6 text-red-600" />
                          <span className="font-medium text-gray-900">Critical Issues</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{auditResult.summary.critical}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                {Object.entries(auditResult.categories).map(([category, data]) => {
                  const isExpanded = expandedCategories.has(category);
                  const criticalCount = data.checks.filter(c => c.status === 'critical').length;
                  const warningCount = data.checks.filter(c => c.status === 'warning').length;
                  const passedCount = data.checks.filter(c => c.status === 'passed').length;

                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">{data.checks.length} checks</span>
                              {criticalCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {criticalCount} critical
                                </Badge>
                              )}
                              {warningCount > 0 && (
                                <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200">
                                  {warningCount} warnings
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>{data.score}</div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                          <Progress value={data.score} className="w-32" />
                        </div>
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-6 bg-gray-50 space-y-3">
                            {data.checks.map((check) => (
                              <div
                                key={check.id}
                                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  {getCheckIcon(check.status)}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium text-gray-900">{check.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                                        {check.recommendation && (
                                          <p className="text-sm text-blue-600 mt-2 flex items-start gap-1">
                                            <span className="font-medium">→</span>
                                            {check.recommendation}
                                          </p>
                                        )}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`ml-4 ${
                                          check.impact === 'high'
                                            ? 'border-red-200 text-red-700'
                                            : check.impact === 'medium'
                                            ? 'border-amber-200 text-amber-700'
                                            : 'border-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {check.impact} impact
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
