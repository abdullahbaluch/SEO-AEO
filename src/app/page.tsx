'use client'

import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

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
      const results = await SEOAnalyzer.analyze(url, html as any);
      
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
    } finally {
      setIsScanning(false);
    }
  };

  // Load scan from history
  const handleSelectScan = (scan: any) => {
    try {
      const scanData = JSON.parse(scan.scan_data);
      setCurrentScan({ ...scanData, id: scan.id });
      setActiveTab('overview');
    } catch (e) {
      console.error('Error loading scan:', e);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              SEO Toolkit
            </h1>
            <p className="text-gray-500 mt-1">
              Comprehensive on-page SEO & AEO analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={createPageUrl('Graph')}>
              <Button variant="outline" className="gap-2">
                <Network className="w-4 h-4" />
                Graph View
              </Button>
            </Link>
            <Link href={createPageUrl('Analytics')}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Full Report CTA */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Generate Complete SEO Report</h2>
              <p className="text-indigo-100 text-sm">
                Run comprehensive analysis across all SEO factors • Get professional PDF report •
                Includes on-page, technical, content, keywords, AEO, and full site crawl
              </p>
            </div>
            <Link href="/report">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-8 whitespace-nowrap"
              >
                <Target className="w-5 h-5 mr-2" />
                Run Full Report
              </Button>
            </Link>
          </div>
        </div>

        {/* SEO Modules Grid */}
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual SEO Modules</h2>
          <p className="text-sm text-gray-500 mb-4">Or analyze specific aspects individually</p>
          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Link href="/modules/onsite">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <Search className="w-6 h-6 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Onsite</div>
                <div className="text-xs text-gray-500 mt-1">Page Analysis</div>
              </div>
            </Link>
            <Link href="/modules/technical">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                <Shield className="w-6 h-6 text-emerald-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-600">Technical</div>
                <div className="text-xs text-gray-500 mt-1">SEO Health</div>
              </div>
            </Link>
            <Link href="/modules/keywords">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group">
                <Key className="w-6 h-6 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-purple-600">Keywords</div>
                <div className="text-xs text-gray-500 mt-1">Extraction</div>
              </div>
            </Link>
            <Link href="/modules/linkmap">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all cursor-pointer group">
                <Network className="w-6 h-6 text-cyan-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-cyan-600">Link Map</div>
                <div className="text-xs text-gray-500 mt-1">Internal Links</div>
              </div>
            </Link>
            <Link href="/modules/serp">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                <Target className="w-6 h-6 text-indigo-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">SERP</div>
                <div className="text-xs text-gray-500 mt-1">Simulator</div>
              </div>
            </Link>
            <Link href="/modules/aeo">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer group">
                <Sparkles className="w-6 h-6 text-pink-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-pink-600">AEO</div>
                <div className="text-xs text-gray-500 mt-1">Assistant</div>
              </div>
            </Link>
            <Link href="/modules/content">
              <div className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer group">
                <FileText className="w-6 h-6 text-orange-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 group-hover:text-orange-600">Content</div>
                <div className="text-xs text-gray-500 mt-1">Scorer</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Scan Form & History */}
          <div className="space-y-6">
            <ScanForm onScan={handleScan} isScanning={isScanning} />
            <ScanHistory
              scans={scans}
              onSelect={handleSelectScan}
              onDelete={handleDeleteScan}
              onCompare={() => {}}
              selectedId={currentScan?.id}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
              >
                <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900">Analyzing page...</h3>
                <p className="text-gray-500 mt-1">This usually takes a few seconds</p>
              </motion.div>
            ) : !currentScan ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
              >
                <LayoutDashboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No scan selected</h3>
                <p className="text-gray-500 mt-1">
                  Start a new scan or select one from history
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScan.id || 'current'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Score Overview */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-8">
                        <ScoreGauge 
                          score={currentScan.scores?.overall || 0} 
                          label="Overall Score" 
                          size="lg" 
                        />
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                            {currentScan.metadata?.title || currentScan.url}
                          </h2>
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {currentScan.url}
                          </p>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            summary?.status === 'good' ? 'bg-emerald-100 text-emerald-700' :
                            summary?.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {summary?.message}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={handleExportJSON}>
                          <Download className="w-4 h-4 mr-1" />
                          JSON
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportHTML}>
                          <Download className="w-4 h-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Score Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ScoreCard 
                      title="SEO Score" 
                      score={currentScan.scores?.seo || 0}
                      icon={Target}
                    />
                    <ScoreCard 
                      title="AEO Score" 
                      score={currentScan.scores?.aeo || 0}
                      icon={Zap}
                    />
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Issues Found</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentScan.issues?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentScan.issues?.filter((i: any) => i.severity === 'critical').length || 0} critical
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Word Count</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentScan.contentMetrics?.wordCount || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ~{currentScan.contentMetrics?.readingTime || 0} min read
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-gray-200 p-1 rounded-xl flex-wrap h-auto">
                      <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                        <LayoutDashboard className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="metadata" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                        <FileText className="w-4 h-4" />
                        Metadata
                      </TabsTrigger>
                      <TabsTrigger value="schema" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                        <Code className="w-4 h-4" />
                        Schema
                      </TabsTrigger>
                      <TabsTrigger value="content" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                        <Type className="w-4 h-4" />
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="links" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                        <Link2 className="w-4 h-4" />
                        Links
                      </TabsTrigger>
                      <TabsTrigger value="images" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                        <Image className="w-4 h-4" />
                        Images
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <ScoreRadarChart scores={currentScan.scores || {}} />
                        <IssuePieChart issues={currentScan.issues || []} />
                      </div>
                      
                      {/* Category Scores */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <ScoreCard title="Metadata" score={currentScan.scores?.metadata || 0} icon={FileText} />
                        <ScoreCard title="Schema" score={currentScan.scores?.schema || 0} icon={Code} />
                        <ScoreCard title="Content" score={currentScan.scores?.content || 0} icon={Type} />
                        <ScoreCard title="Links" score={currentScan.scores?.links || 0} icon={Link2} />
                        <ScoreCard title="Images" score={currentScan.scores?.images || 0} icon={Image} />
                        <ScoreCard title="Accessibility" score={currentScan.scores?.accessibility || 0} icon={Accessibility} />
                        <ScoreCard title="Performance" score={currentScan.scores?.performance || 0} icon={Zap} />
                        <ScoreCard title="AEO" score={currentScan.scores?.aeo || 0} icon={Target} />
                      </div>

                      {/* Issues */}
                      {currentScan.issues && currentScan.issues.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Issues ({currentScan.issues.length})
                          </h3>
                          <div className="space-y-3">
                            {currentScan.issues
                              .sort((a: any, b: any) => {
                                const order: { [key: string]: number } = { critical: 0, warning: 1, info: 2, opportunity: 3 };
                                return (order[a.severity] || 4) - (order[b.severity] || 4);
                              })
                              .slice(0, 10)
                              .map((issue: any, index: number) => (
                                <IssueCard key={index} issue={issue} />
                              ))}
                          </div>
                          {currentScan.issues.length > 10 && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                              And {currentScan.issues.length - 10} more issues...
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="metadata" className="mt-6">
                      <MetadataViewer 
                        metadata={currentScan.metadata}
                        og={currentScan.og}
                        twitter={currentScan.twitter}
                        url={currentScan.url}
                      />
                    </TabsContent>

                    <TabsContent value="schema" className="mt-6">
                      <SchemaViewer 
                        schemas={currentScan.schemas}
                        suggestions={currentScan.schemaSuggestions}
                        metadata={currentScan.metadata}
                        headings={currentScan.headings}
                      />
                    </TabsContent>

                    <TabsContent value="content" className="mt-6 space-y-6">
                      <ContentMetrics metrics={currentScan.contentMetrics} />
                      <div className="grid md:grid-cols-2 gap-6">
                        <HeadingTree headings={currentScan.headings} />
                        <KeywordChart keywords={currentScan.keywords} />
                      </div>
                    </TabsContent>

                    <TabsContent value="links" className="mt-6">
                      <LinkAnalysis links={currentScan.links} />
                    </TabsContent>

                    <TabsContent value="images" className="mt-6">
                      <ImageAnalysis images={currentScan.images} />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}