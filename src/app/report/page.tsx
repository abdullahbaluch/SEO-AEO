'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Play, Loader2, XCircle, Download, FileText, Code, Type, Link2, Image, Zap, Shield, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOAnalyzer } from '@/components/seo/SEOAnalyzer';
import { ReportGenerator } from '@/components/seo/ReportGenerator';
import ScoreGauge from '@/components/seo/ScoreGauge';
import IssueCard from '@/components/seo/IssueCard';
import MetadataViewer from '@/components/seo/MetadataViewer';
import SchemaViewer from '@/components/seo/SchemaViewer';
import HeadingTree from '@/components/seo/HeadingTree';
import LinkAnalysis from '@/components/seo/LinkAnalysis';
import ImageAnalysis from '@/components/seo/ImageAnalysis';
import { ScoreRadarChart, IssuePieChart, KeywordChart, ContentMetrics } from '@/components/seo/AnalyticsCharts';

export default function FullReportPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setError('');
    setResults(null);
    setProgress('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsAnalyzing(true);
    setProgress('Fetching website content...');

    try {
      // Fetch HTML content
      const fetchResponse = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || 'Failed to fetch URL');
      }

      const fetchData = await fetchResponse.json();
      const htmlContent = fetchData.html;
      const finalUrl = fetchData.url;

      setProgress('Analyzing SEO factors...');

      // Use the same SEOAnalyzer as homepage
      const analysisResults = await SEOAnalyzer.analyze(finalUrl, htmlContent);

      setResults(analysisResults);
      setProgress('Analysis complete!');

    } catch (err: any) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    if (results) {
      ReportGenerator.exportHTML(results);
    }
  };

  const handleExportJSON = () => {
    if (results) {
      ReportGenerator.exportJSON(results);
    }
  };

  const summary = results ? SEOAnalyzer.getSummary(results) : null;

  const categorizedIssues = results?.issues ? {
    errors: results.issues.filter((i: any) => i.severity === 'critical'),
    warnings: results.issues.filter((i: any) => i.severity === 'warning'),
    notices: results.issues.filter((i: any) => i.severity === 'info' || i.severity === 'opportunity'),
  } : { errors: [], warnings: [], notices: [] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Full SEO Report</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Comprehensive analysis with export options
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">What's Included:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <div>✓ On-page SEO Analysis</div>
            <div>✓ Content & Metadata Review</div>
            <div>✓ Keyword Extraction & Analysis</div>
            <div>✓ Schema Markup Validation</div>
            <div>✓ Image & Link Analysis</div>
            <div>✓ Export to HTML & JSON</div>
          </div>
        </div>

        {/* Analysis Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Website URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAnalyzing}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the full URL including http:// or https://
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
              >
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            {isAnalyzing && progress && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2"
              >
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{progress}</p>
              </motion.div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-[rgb(70,95,255)] hover:bg-[rgb(60,85,245)]"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Full Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run Full SEO Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Health Score Header with Export Buttons */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <ScoreGauge score={results.scores?.overall || 0} label="Health Score" size="xl" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {results.metadata?.title || 'Untitled Page'}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 break-all">
                        {results.url}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          summary?.status === 'good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          summary?.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {summary?.message}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={handleExportJSON}>
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Export HTML Report
                    </Button>
                  </div>
                </div>
              </div>

              {/* Key Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="stats-card">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className={`text-xl font-bold ${
                      (results.scores?.metadata || 0) >= 80 ? 'text-emerald-600' :
                      (results.scores?.metadata || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {results.scores?.metadata || 0}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Metadata</div>
                </div>
                <div className="stats-card">
                  <div className="flex items-center justify-between mb-2">
                    <Code className="w-5 h-5 text-gray-400" />
                    <span className={`text-xl font-bold ${
                      (results.scores?.schema || 0) >= 80 ? 'text-emerald-600' :
                      (results.scores?.schema || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {results.scores?.schema || 0}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Schema</div>
                </div>
                <div className="stats-card">
                  <div className="flex items-center justify-between mb-2">
                    <Type className="w-5 h-5 text-gray-400" />
                    <span className={`text-xl font-bold ${
                      (results.scores?.content || 0) >= 80 ? 'text-emerald-600' :
                      (results.scores?.content || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {results.scores?.content || 0}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Content</div>
                </div>
                <div className="stats-card">
                  <div className="flex items-center justify-between mb-2">
                    <Link2 className="w-5 h-5 text-gray-400" />
                    <span className={`text-xl font-bold ${
                      (results.scores?.links || 0) >= 80 ? 'text-emerald-600' :
                      (results.scores?.links || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {results.scores?.links || 0}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Links</div>
                </div>
                <div className="stats-card">
                  <div className="flex items-center justify-between mb-2">
                    <Image className="w-5 h-5 text-gray-400" />
                    <span className={`text-xl font-bold ${
                      (results.scores?.images || 0) >= 80 ? 'text-emerald-600' :
                      (results.scores?.images || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {results.scores?.images || 0}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Images</div>
                </div>
                <div className="stats-card">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-gray-400" />
                    <span className={`text-xl font-bold ${
                      (results.scores?.performance || 0) >= 80 ? 'text-emerald-600' :
                      (results.scores?.performance || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {results.scores?.performance || 0}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Performance</div>
                </div>
              </div>

              {/* Issues Summary */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{categorizedIssues.errors.length}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Errors</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Critical issues that need immediate attention</p>
                </div>
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{categorizedIssues.warnings.length}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Warnings</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Issues that should be fixed soon</p>
                </div>
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{categorizedIssues.notices.length}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Notices</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recommendations for optimization</p>
                </div>
              </div>

              {/* Issues */}
              {categorizedIssues.errors.length > 0 && (
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Errors ({categorizedIssues.errors.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {categorizedIssues.errors.map((issue: any, index: number) => (
                      <IssueCard key={index} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {categorizedIssues.warnings.length > 0 && (
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Warnings ({categorizedIssues.warnings.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {categorizedIssues.warnings.map((issue: any, index: number) => (
                      <IssueCard key={index} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {categorizedIssues.notices.length > 0 && (
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notices ({categorizedIssues.notices.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {categorizedIssues.notices.map((issue: any, index: number) => (
                      <IssueCard key={index} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h3>
                  <ScoreRadarChart scores={results.scores || {}} />
                </div>
                <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issues Distribution</h3>
                  <IssuePieChart issues={results.issues || []} />
                </div>
              </div>

              {/* Detailed Analysis Sections */}
              <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <FileText className="w-6 h-6 text-[rgb(70,95,255)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Metadata Analysis</h2>
                </div>
                <MetadataViewer
                  metadata={results.metadata}
                  og={results.og}
                  twitter={results.twitter}
                  url={results.url}
                />
              </div>

              <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <Code className="w-6 h-6 text-[rgb(70,95,255)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schema Markup</h2>
                </div>
                <SchemaViewer
                  schemas={results.schemas}
                  suggestions={results.schemaSuggestions}
                  metadata={results.metadata}
                  headings={results.headings}
                />
              </div>

              <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <Type className="w-6 h-6 text-[rgb(70,95,255)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Content Analysis</h2>
                </div>
                <div className="space-y-6">
                  <ContentMetrics metrics={results.contentMetrics} />
                  <div className="grid md:grid-cols-2 gap-3">
                    <HeadingTree headings={results.headings} />
                    <KeywordChart keywords={results.keywords} />
                  </div>
                </div>
              </div>

              <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <Link2 className="w-6 h-6 text-[rgb(70,95,255)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Links Analysis</h2>
                </div>
                <LinkAnalysis links={results.links} />
              </div>

              <div className="card-modern p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <Image className="w-6 h-6 text-[rgb(70,95,255)]" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Images Analysis</h2>
                </div>
                <ImageAnalysis images={results.images} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
