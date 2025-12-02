'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Globe,
  Loader2,
  Play,
  StopCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Link2Off
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteCrawlerProps {
  onCrawlComplete?: (data: any) => void;
  onPageScanned?: (page: any) => void;
}

export default function SiteCrawler({ onCrawlComplete, onPageScanned }: SiteCrawlerProps) {
  const [startUrl, setStartUrl] = useState('');
  const [maxPages, setMaxPages] = useState(20);
  const [maxDepth, setMaxDepth] = useState(3);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState({ current: 0, total: 0 });
  const [crawlResults, setCrawlResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleStartCrawl = async () => {
    setError('');
    setCrawlResults(null);

    if (!startUrl.trim()) {
      setError('Please enter a starting URL');
      return;
    }

    // Validate URL format
    try {
      new URL(startUrl);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsCrawling(true);
    setCrawlProgress({ current: 0, total: maxPages });

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrl,
          maxPages,
          maxDepth,
          checkExternal: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Crawl failed');
      }

      const data = await response.json();
      setCrawlResults(data);
      setCrawlProgress({ current: data.pages.length, total: data.pages.length });

      if (onCrawlComplete) {
        onCrawlComplete(data);
      }

    } catch (err: any) {
      setError(`Crawl failed: ${err.message}`);
      console.error('Crawl error:', err);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleStop = () => {
    setIsCrawling(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Full Website Crawler</h2>
            <p className="text-sm text-gray-500">
              Analyze entire website for SEO, broken links, and more
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Website URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              disabled={isCrawling}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the homepage or any starting URL of the website to crawl
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Pages: {maxPages}
              </label>
              <Slider
                value={[maxPages]}
                onValueChange={(v) => setMaxPages(v[0])}
                min={5}
                max={100}
                step={5}
                disabled={isCrawling}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum pages to crawl</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Depth: {maxDepth}
              </label>
              <Slider
                value={[maxDepth]}
                onValueChange={(v) => setMaxDepth(v[0])}
                min={1}
                max={5}
                step={1}
                disabled={isCrawling}
              />
              <p className="text-xs text-gray-500 mt-1">How deep to follow links</p>
            </div>
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

          {isCrawling && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  Crawling website...
                </span>
                <span className="text-gray-500 font-mono">
                  {crawlProgress.current}/{crawlProgress.total}
                </span>
              </div>
              <Progress value={(crawlProgress.current / crawlProgress.total) * 100} />
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            {!isCrawling ? (
              <Button
                onClick={handleStartCrawl}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Full Website Crawl
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleStop}
                className="flex-1"
                size="lg"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Crawl
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Crawl Results */}
      <AnimatePresence>
        {crawlResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <div className="text-sm text-gray-500">Total Pages</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {crawlResults.summary.totalPages}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <div className="text-sm text-gray-500">Successful</div>
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {crawlResults.summary.successfulPages}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link2Off className="w-4 h-4 text-red-500" />
                  <div className="text-sm text-gray-500">Broken Links</div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {crawlResults.summary.totalBrokenLinks}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div className="text-sm text-gray-500">Redirects</div>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {crawlResults.summary.redirectedPages}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Website Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Load Time:</span>
                    <span className="font-medium">{Math.round(crawlResults.summary.avgLoadTime)}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Failed Pages:</span>
                    <span className="font-medium text-red-600">{crawlResults.summary.failedPages}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Internal Links Found:</span>
                    <span className="font-medium">{crawlResults.summary.totalInternalLinks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">External Links Found:</span>
                    <span className="font-medium">{crawlResults.summary.totalExternalLinks}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pages List */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Crawled Pages ({crawlResults.pages.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {crawlResults.pages.map((page: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {page.status >= 200 && page.status < 300 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : page.status >= 300 && page.status < 400 ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {page.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          page.status >= 200 && page.status < 300
                            ? 'bg-emerald-100 text-emerald-700'
                            : page.status >= 300 && page.status < 400
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {page.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="truncate font-mono">{page.url}</span>
                        <span>•</span>
                        <span>{page.loadTime}ms</span>
                        {page.brokenLinks.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-600 font-medium">
                              {page.brokenLinks.length} broken link{page.brokenLinks.length > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
