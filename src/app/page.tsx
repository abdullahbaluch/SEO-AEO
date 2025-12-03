'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { base44 } from '@/lib/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Code,
  Type,
  Link2,
  Image,
  Accessibility,
  Zap,
  Target,
  Network,
  Download,
  BarChart3,
  Loader2,
  Search,
  Shield,
  Key,
  Sparkles,
  Globe
} from 'lucide-react';

import ScanForm from '@/components/seo/ScanForm';
import ScoreGauge from '@/components/seo/ScoreGauge';
import ScoreCard from '@/components/seo/ScoreCard';
import IssueCard from '@/components/seo/IssueCard';
import ScanHistory from '@/components/seo/ScanHistory';
import MetadataViewer from '@/components/seo/MetadataViewer';
import SchemaViewer from '@/components/seo/SchemaViewer';
import HeadingTree from '@/components/seo/HeadingTree';
import LinkAnalysis from '@/components/seo/LinkAnalysis';
import ImageAnalysis from '@/components/seo/ImageAnalysis';
import { ScoreRadarChart, IssuePieChart, CategoryBarChart, KeywordChart, ContentMetrics } from '@/components/seo/AnalyticsCharts';
import { SEOAnalyzer } from '@/components/seo/SEOAnalyzer';
import { ReportGenerator } from '@/components/seo/ReportGenerator';
import { GraphEngine } from '@/components/seo/GraphEngine';

export default function Dashboard() {
  const [currentScan, setCurrentScan] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [hasAutoScanned, setHasAutoScanned] = useState(false);

  // Fetch scan history
  const { data: scans = [], isLoading: loadingScans } = useQuery({
    queryKey: ['scans'],
    queryFn: () => base44.entities.Scan.list('-created_date', 50),
  });

  // Create scan mutation
  const createScanMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Scan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  // Delete scan mutation
  const deleteScanMutation = useMutation({
    mutationFn: (scanId: string) => base44.entities.Scan.delete(scanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  // Handle delete
  const handleDeleteScan = (scanId: string) => {
    if (currentScan?.id === scanId) {
      setCurrentScan(null);
    }
    deleteScanMutation.mutate(scanId);
  };

  // Handle scan
  const handleScan = async ({ url, html }: { url: string; html?: string }) => {
    setIsScanning(true);
    try {
      let htmlContent = html;

      // If no HTML provided, fetch it from the URL
      if (!htmlContent) {
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
        htmlContent = fetchData.html;
        url = fetchData.url; // Use final URL after redirects
      }

      const results = await SEOAnalyzer.analyze(url, htmlContent as any);

      // Save to database
      const scores = results.scores as any;
      const scanRecord = {
        url: results.url,
        title: results.metadata?.title || 'Untitled',
        status: 'completed',
        seo_score: scores?.seo || 0,
        aeo_score: scores?.aeo || 0,
        metadata_score: scores?.metadata || 0,
        schema_score: scores?.schema || 0,
        content_score: scores?.content || 0,
        keyword_score: scores?.keywords || 0,
        link_score: scores?.links || 0,
        accessibility_score: scores?.accessibility || 0,
        performance_score: scores?.performance || 0,
        image_score: scores?.images || 0,
        issues_count: results.issues?.length || 0,
        critical_count: results.issues?.filter((i: any) => i.severity === 'critical').length || 0,
        warnings_count: results.issues?.filter((i: any) => i.severity === 'warning').length || 0,
        scan_data: JSON.stringify(results),
        graph_data: JSON.stringify((results as any).graph || {}),
      };

      const savedScan = await createScanMutation.mutateAsync(scanRecord);
      setCurrentScan({ ...results, id: savedScan.id });
    } catch (error) {
      console.error('Scan error:', error);
      alert(`Failed to analyze URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Load scan from history
  const handleSelectScan = (scan: any) => {
    try {
      const scanData = JSON.parse(scan.scan_data);
      setCurrentScan({ ...scanData, id: scan.id });
    } catch (e) {
      console.error('Error loading scan:', e);
    }
  };

  // Auto-trigger scan from URL parameters
  useEffect(() => {
    const url = searchParams.get('url');
    const analyze = searchParams.get('analyze');

    if (url && analyze === 'full' && !hasAutoScanned && !isScanning) {
      setHasAutoScanned(true);
      handleScan({ url: decodeURIComponent(url) });
    }
  }, [searchParams, hasAutoScanned, isScanning]);

  // Export handlers
  const handleExportJSON = () => {
    if (currentScan) {
      ReportGenerator.exportJSON(currentScan);
    }
  };

  const handleExportHTML = () => {
    if (currentScan) {
      ReportGenerator.exportHTML(currentScan);
    }
  };

  const handleExportGraph = (format: string) => {
    if (currentScan?.graph) {
      const content = format === 'json' 
        ? GraphEngine.graphToJSON(currentScan.graph)
        : format === 'gexf'
        ? GraphEngine.exportToGEXF(currentScan.graph)
        : GraphEngine.exportToGraphML(currentScan.graph);
      
      const ext = format === 'json' ? 'json' : format === 'gexf' ? 'gexf' : 'graphml';
      ReportGenerator.downloadFile(content, `seo-graph.${ext}`, 'text/xml');
    }
  };

  const summary = currentScan ? SEOAnalyzer.getSummary(currentScan) : null;

  // Categorize issues by severity
  const categorizedIssues = currentScan?.issues ? {
    errors: currentScan.issues.filter((i: any) => i.severity === 'critical'),
    warnings: currentScan.issues.filter((i: any) => i.severity === 'warning'),
    notices: currentScan.issues.filter((i: any) => i.severity === 'info' || i.severity === 'opportunity'),
  } : { errors: [], warnings: [], notices: [] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* URL Search Bar - Main Entry Point */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Comprehensive SEO Analysis
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                Enter any URL to get a complete SEO audit with actionable insights
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const url = formData.get('url') as string;
                if (url.trim()) {
                  handleScan({ url: url.trim() });
                }
              }} className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="url"
                    placeholder="Enter URL to analyze (e.g., https://example.com)"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                    disabled={isScanning}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="hidden sm:inline">Analyze</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-indigo-500 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyzing Your Website</h2>
              <p className="text-gray-500 dark:text-gray-400">Running comprehensive SEO audit...</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isScanning && !currentScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="text-center max-w-2xl">
              <Globe className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Comprehensive SEO Analysis
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                Enter any URL in the search bar above to generate a complete SEO audit report
              </p>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8">
                <ScanHistory
                  scans={scans}
                  onSelect={handleSelectScan}
                  onDelete={handleDeleteScan}
                  onCompare={() => {}}
                  selectedId={currentScan?.id}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Comprehensive Dashboard - Semrush Style */}
        {!isScanning && currentScan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Health Score Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <ScoreGauge score={currentScan.scores?.overall || 0} label="Health Score" size="xl" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentScan.metadata?.title || 'Untitled Page'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 break-all">
                      {currentScan.url}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                        summary?.status === 'good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        summary?.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {summary?.message}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currentScan.contentMetrics?.wordCount || 0} words • {currentScan.contentMetrics?.readingTime || 0} min read
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={handleExportJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportHTML}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${
                    (currentScan.scores?.metadata || 0) >= 80 ? 'text-emerald-600' :
                    (currentScan.scores?.metadata || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScan.scores?.metadata || 0}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Metadata</div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <Code className="w-5 h-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${
                    (currentScan.scores?.schema || 0) >= 80 ? 'text-emerald-600' :
                    (currentScan.scores?.schema || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScan.scores?.schema || 0}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Schema</div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <Type className="w-5 h-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${
                    (currentScan.scores?.content || 0) >= 80 ? 'text-emerald-600' :
                    (currentScan.scores?.content || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScan.scores?.content || 0}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Content</div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <Link2 className="w-5 h-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${
                    (currentScan.scores?.links || 0) >= 80 ? 'text-emerald-600' :
                    (currentScan.scores?.links || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScan.scores?.links || 0}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Links</div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <Image className="w-5 h-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${
                    (currentScan.scores?.images || 0) >= 80 ? 'text-emerald-600' :
                    (currentScan.scores?.images || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScan.scores?.images || 0}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Images</div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <span className={`text-2xl font-bold ${
                    (currentScan.scores?.performance || 0) >= 80 ? 'text-emerald-600' :
                    (currentScan.scores?.performance || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {currentScan.scores?.performance || 0}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Performance</div>
              </div>
            </div>

            {/* Issues Summary - Semrush Style Color-Coded */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card-modern p-6">
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
              <div className="card-modern p-6">
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
              <div className="card-modern p-6">
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

            {/* All Analysis Sections - Comprehensive View */}
            {/* Errors - Red Priority */}
            {categorizedIssues.errors.length > 0 && (
              <div className="card-modern p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Errors ({categorizedIssues.errors.length})
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Critical issues requiring immediate attention</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {categorizedIssues.errors.map((issue: any, index: number) => (
                    <IssueCard key={index} issue={issue} />
                  ))}
                </div>
              </div>
            )}

            {/* Warnings - Yellow Priority */}
            {categorizedIssues.warnings.length > 0 && (
              <div className="card-modern p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Warnings ({categorizedIssues.warnings.length})
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Issues that should be fixed soon</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {categorizedIssues.warnings.map((issue: any, index: number) => (
                    <IssueCard key={index} issue={issue} />
                  ))}
                </div>
              </div>
            )}

            {/* Notices - Blue Priority */}
            {categorizedIssues.notices.length > 0 && (
              <div className="card-modern p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Notices ({categorizedIssues.notices.length})
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recommendations and opportunities</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {categorizedIssues.notices.map((issue: any, index: number) => (
                    <IssueCard key={index} issue={issue} />
                  ))}
                </div>
              </div>
            )}

            {/* Charts Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h3>
                <ScoreRadarChart scores={currentScan.scores || {}} />
              </div>
              <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issues Distribution</h3>
                <IssuePieChart issues={currentScan.issues || []} />
              </div>
            </div>

            {/* Metadata Analysis */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Metadata Analysis</h2>
              </div>
              <MetadataViewer
                metadata={currentScan.metadata}
                og={currentScan.og}
                twitter={currentScan.twitter}
                url={currentScan.url}
              />
            </div>

            {/* Schema Markup */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schema Markup</h2>
              </div>
              <SchemaViewer
                schemas={currentScan.schemas}
                suggestions={currentScan.schemaSuggestions}
                metadata={currentScan.metadata}
                headings={currentScan.headings}
              />
            </div>

            {/* Content Analysis */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-3 mb-6">
                <Type className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Content Analysis</h2>
              </div>
              <div className="space-y-6">
                <ContentMetrics metrics={currentScan.contentMetrics} />
                <div className="grid md:grid-cols-2 gap-6">
                  <HeadingTree headings={currentScan.headings} />
                  <KeywordChart keywords={currentScan.keywords} />
                </div>
              </div>
            </div>

            {/* Links Analysis */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-3 mb-6">
                <Link2 className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Links Analysis</h2>
              </div>
              <LinkAnalysis links={currentScan.links} />
            </div>

            {/* Images Analysis */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-3 mb-6">
                <Image className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Images Analysis</h2>
              </div>
              <ImageAnalysis images={currentScan.images} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}