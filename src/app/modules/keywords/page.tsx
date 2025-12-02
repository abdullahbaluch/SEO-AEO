'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Key, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KeywordExtractorPage() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('url');

  const handleExtract = async () => {
    setError('');
    setResults(null);

    if (mode === 'url' && !url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (mode === 'text' && !text.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsExtracting(true);

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mode === 'url' ? url : undefined,
          text: mode === 'text' ? text : undefined,
          maxKeywords: 50,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Extraction failed');
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keyword Extractor</h1>
            <p className="text-gray-500 text-sm">Extract keywords and phrases from content</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={mode === 'url' ? 'default' : 'outline'}
                onClick={() => setMode('url')}
                size="sm"
              >
                From URL
              </Button>
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => setMode('text')}
                size="sm"
              >
                From Text
              </Button>
            </div>

            {mode === 'url' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isExtracting}
                  className="font-mono text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Text Content
                </label>
                <Textarea
                  placeholder="Paste your content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isExtracting}
                  rows={8}
                  className="text-sm"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Extract Keywords
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
              {/* Stats */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Total Words</div>
                  <div className="text-2xl font-bold">{results.totalWords}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Unique Words</div>
                  <div className="text-2xl font-bold">{results.uniqueWords}</div>
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Top Keywords ({results.keywords.length})</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {results.keywords.slice(0, 20).map((kw: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-lg border border-gray-100"
                    >
                      <span className="font-medium text-gray-900">{kw.word}</span>
                      <div className="text-sm text-gray-500">
                        <span className="font-mono">{kw.count}×</span>
                        <span className="ml-2">({(kw.density).toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phrases */}
              {results.phrases.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Phrases ({results.phrases.length})</h3>
                  <div className="space-y-2">
                    {results.phrases.slice(0, 15).map((phrase: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg border border-gray-100"
                      >
                        <span className="font-medium text-gray-900">{phrase.phrase}</span>
                        <span className="text-sm text-gray-500 font-mono">{phrase.count}×</span>
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
