'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Play, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComprehensiveReport from '@/components/seo/ComprehensiveReport';
import { downloadPDF, downloadJSON } from '@/lib/utils/pdf-generator';

export default function FullReportPage() {
  const [url, setUrl] = useState('');
  const [includeCrawl, setIncludeCrawl] = useState(true);
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
    setProgress('Starting comprehensive analysis...');

    try {
      const response = await fetch('/api/full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          includeCrawl,
          maxPages: 20,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data.data);
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
      downloadPDF(results);
    }
  };

  const handleExportJSON = () => {
    if (results) {
      downloadJSON(results);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Full SEO Report</h1>
            <p className="text-gray-500 text-sm mt-1">
              Comprehensive analysis of all SEO factors
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Included:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>✓ On-page SEO Analysis</div>
            <div>✓ Technical SEO Health Check</div>
            <div>✓ Keyword Extraction & Analysis</div>
            <div>✓ Content Quality Scoring</div>
            <div>✓ AEO & Schema Suggestions</div>
            <div>✓ Full Website Crawl (Optional)</div>
          </div>
        </div>

        {/* Analysis Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
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
              <p className="text-xs text-gray-500 mt-1">
                Enter the full URL including http:// or https://
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="crawl"
                checked={includeCrawl}
                onCheckedChange={(checked) => setIncludeCrawl(checked as boolean)}
                disabled={isAnalyzing}
              />
              <label
                htmlFor="crawl"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include full website crawl (up to 20 pages) - May take longer
              </label>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {isAnalyzing && progress && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2"
              >
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-700">{progress}</p>
              </motion.div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-gray-800 hover:from-indigo-700 hover:to-purple-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Full Analysis...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run Full SEO Report
                </>
              )}
            </Button>

            {isAnalyzing && (
              <p className="text-xs text-center text-gray-500">
                This may take 30-60 seconds depending on website size
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ComprehensiveReport
                data={results}
                onExportPDF={handleExportPDF}
                onExportJSON={handleExportJSON}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
