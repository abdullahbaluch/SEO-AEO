'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  Globe,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Network,
  FileText,
  Link2,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SiteCrawler, type CrawlResult, type CrawlProgress } from '@/lib/engines/site-crawler';

export default function CrawlerPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState('3');
  const [maxPages, setMaxPages] = useState('50');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [progress, setProgress] = useState<CrawlProgress>({
    current: 0,
    total: 0,
    currentUrl: '',
    status: 'idle',
  });
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const handleCrawl = async () => {
    if (!url.trim()) return;

    setIsCrawling(true);
    setCrawlResult(null);

    try {
      const crawler = new SiteCrawler(
        url,
        parseInt(maxDepth) || 3,
        parseInt(maxPages) || 50,
        (progress) => {
          setProgress(progress);
        }
      );

      const result = await crawler.crawl();
      setCrawlResult(result);
    } catch (error) {
      console.error('Crawl error:', error);
      alert('Failed to crawl website. Please check the URL and try again.');
    } finally {
      setIsCrawling(false);
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-emerald-600';
    if (statusCode >= 300 && statusCode < 400) return 'text-amber-600';
    return 'text-red-600';
  };

  const getDepthColor = (depth: number) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-orange-100 text-orange-700',
    ];
    return colors[depth % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Crawler</h1>
          <p className="text-gray-600">Crawl your website to discover pages, analyze structure, and identify issues</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-8 mb-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCrawl();
            }}
          >
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-12 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isCrawling}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Depth
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200"
                  disabled={isCrawling}
                />
                <p className="text-xs text-gray-500 mt-1">How many levels deep to crawl (1-5)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Pages
                </label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200"
                  disabled={isCrawling}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum pages to crawl (1-500)</p>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isCrawling || !url.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {isCrawling ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Crawling...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Start Crawl
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>

        {isCrawling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-8 mb-8"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Crawling in Progress</h3>
                  <span className="text-sm font-medium text-blue-600">
                    {progress.current} / {progress.total} pages
                  </span>
                </div>
                <Progress
                  value={(progress.current / progress.total) * 100}
                  className="h-3 mb-3"
                />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="truncate">{progress.currentUrl || 'Initializing...'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{progress.current}</div>
                  <div className="text-sm text-gray-600">Pages Discovered</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{maxDepth}</div>
                  <div className="text-sm text-gray-600">Max Depth</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{maxPages}</div>
                  <div className="text-sm text-gray-600">Target Pages</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!isCrawling && !crawlResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-16 text-center"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Network className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Crawl</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Enter a starting URL above to begin crawling. We'll discover pages, analyze structure,
              and identify SEO issues automatically.
            </p>
            <div className="grid grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <div className="text-sm text-gray-600">Page Analysis</div>
              </div>
              <div className="text-center">
                <Link2 className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <div className="text-sm text-gray-600">Link Mapping</div>
              </div>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <div className="text-sm text-gray-600">Issue Detection</div>
              </div>
              <div className="text-center">
                <Network className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <div className="text-sm text-gray-600">Site Graph</div>
              </div>
            </div>
          </motion.div>
        )}

        {!isCrawling && crawlResult && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Crawl Summary</h2>
                      <a
                        href={crawlResult.startUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                      >
                        {crawlResult.startUrl}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push('/graph')}
                      >
                        <Network className="w-4 h-4" />
                        View Graph
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {crawlResult.totalPages}
                      </div>
                      <div className="text-sm text-gray-600">Pages Crawled</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {crawlResult.totalLinks}
                      </div>
                      <div className="text-sm text-gray-600">Total Links</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        {crawlResult.sitemapFound ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        )}
                        <span className="text-xl font-bold text-gray-900">Sitemap</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {crawlResult.sitemapFound ? 'Found' : 'Not Found'}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        {crawlResult.robotsFound ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        )}
                        <span className="text-xl font-bold text-gray-900">Robots.txt</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {crawlResult.robotsFound ? 'Found' : 'Not Found'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Crawled Pages</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-4">Page</th>
                        <th className="text-center text-xs font-semibold text-gray-500 px-4 py-4">Depth</th>
                        <th className="text-center text-xs font-semibold text-gray-500 px-4 py-4">Status</th>
                        <th className="text-center text-xs font-semibold text-gray-500 px-4 py-4">Links</th>
                        <th className="text-center text-xs font-semibold text-gray-500 px-4 py-4">Images</th>
                        <th className="text-center text-xs font-semibold text-gray-500 px-4 py-4">Issues</th>
                        <th className="text-right text-xs font-semibold text-gray-500 px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {crawlResult.pages.map((page, index) => {
                        const isExpanded = expandedPage === page.url;
                        return (
                          <React.Fragment key={index}>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="max-w-md">
                                  <div className="font-medium text-gray-900 truncate mb-1">{page.title}</div>
                                  <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                                  >
                                    {page.url}
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <Badge className={getDepthColor(page.depth)}>Level {page.depth}</Badge>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`font-semibold ${getStatusColor(page.statusCode)}`}>
                                  {page.statusCode}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="text-sm text-gray-900 font-medium">
                                  {page.internalLinks + page.externalLinks}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {page.internalLinks}i / {page.externalLinks}e
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm text-gray-900">{page.images}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {page.issues.length > 0 ? (
                                  <Badge variant="destructive">{page.issues.length}</Badge>
                                ) : (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setExpandedPage(isExpanded ? null : page.url)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                  <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Meta Description</h4>
                                        <p className="text-sm text-gray-600">
                                          {page.metaDescription || 'No meta description'}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Stats</h4>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                          <div>
                                            <span className="text-gray-500">Words:</span>{' '}
                                            <span className="font-medium">{page.wordCount}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">H1:</span>{' '}
                                            <span className="font-medium">{page.h1Count}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Images:</span>{' '}
                                            <span className="font-medium">{page.images}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {page.issues.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Issues Found</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {page.issues.map((issue, i) => (
                                            <Badge key={i} variant="destructive" className="text-xs">{issue}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
