'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Search, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnsiteAnalyzerPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setError('');
    setResults(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          includeContent: true,
          checkImages: true,
          checkLinks: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Onsite Analyzer</h1>
            <p className="text-gray-500 text-sm">Comprehensive on-page SEO analysis</p>
          </div>
        </div>

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
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Page
                </>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Score Card */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{results.score}</div>
                  <div className="text-blue-100 text-lg">SEO Score</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Word Count</div>
                  <div className="text-2xl font-bold">{results.content.wordCount}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Reading Time</div>
                  <div className="text-2xl font-bold">{results.content.readingTime} min</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Readability</div>
                  <div className="text-2xl font-bold">{Math.round(results.content.readabilityScore)}</div>
                </div>
              </div>

              {/* Issues */}
              {results.issues.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Issues Found ({results.issues.length})</h3>
                  <div className="space-y-3">
                    {results.issues.map((issue: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
                      >
                        {issue.severity === 'critical' ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{issue.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{issue.description}</div>
                          {issue.recommendation && (
                            <div className="text-sm text-blue-600 mt-2">
                              💡 {issue.recommendation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
