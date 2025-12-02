'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Search, Loader2, XCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SERPSimulatorPage() {
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setResults(null);

    if (!keyword.trim()) {
      setError('Please enter a keyword');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/serp-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          device: 'desktop',
          features: ['paa', 'featured-snippet'],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SERP Simulator</h1>
            <p className="text-gray-500 text-sm">Preview search engine results</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search Keyword
              </label>
              <Input
                type="text"
                placeholder="Enter your target keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isGenerating}
                className="text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Generate SERP Preview
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
              {/* SERP Metadata */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="text-sm text-gray-500">
                  {results.metadata.totalResults} ({results.metadata.searchTime})
                </div>
              </div>

              {/* SERP Features */}
              {results.features.map((feature: any, index: number) => (
                <div key={index} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="font-semibold text-blue-900 mb-2">{feature.title}</div>
                  {feature.type === 'paa' && (
                    <div className="space-y-2">
                      {feature.content.map((question: string, qIndex: number) => (
                        <div
                          key={qIndex}
                          className="bg-white p-3 rounded-lg text-sm text-gray-700 border border-blue-100"
                        >
                          {question}
                        </div>
                      ))}
                    </div>
                  )}
                  {feature.type === 'featured-snippet' && (
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-700 mb-2">{feature.content.text}</div>
                      <div className="text-xs text-gray-500">{feature.content.source}</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Organic Results */}
              <div className="space-y-4">
                {results.results.map((result: any, index: number) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">{result.breadcrumb}</div>
                        <h3 className="text-lg font-medium text-blue-600 mb-1 hover:underline cursor-pointer">
                          {result.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                        {result.sitelinks && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {result.sitelinks.map((link: any, lIndex: number) => (
                              <div key={lIndex} className="text-sm">
                                <a
                                  href={link.url}
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  {link.title}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-sm text-gray-500">#{result.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
