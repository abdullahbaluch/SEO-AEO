'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, FileText, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContentScorerPage() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('url');

  const handleScore = async () => {
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

    setIsScoring(true);

    try {
      const response = await fetch('/api/content-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mode === 'url' ? url : undefined,
          text: mode === 'text' ? text : undefined,
          targetKeyword: targetKeyword || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Scoring failed');
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Score Engine</h1>
            <p className="text-gray-500 text-sm">Analyze and improve your content quality</p>
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
                  disabled={isScoring}
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
                  disabled={isScoring}
                  rows={8}
                  className="text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Target Keyword (Optional)
              </label>
              <Input
                type="text"
                placeholder="your target keyword"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                disabled={isScoring}
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
              onClick={handleScore}
              disabled={isScoring}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              {isScoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Score Content
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
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{results.overallScore}</div>
                  <div className="text-orange-100 text-lg">Content Quality Score</div>
                </div>
              </div>

              {/* Individual Scores */}
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Clarity</div>
                  <div className="text-2xl font-bold">{results.scores.clarity}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Structure</div>
                  <div className="text-2xl font-bold">{results.scores.structure}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Keyword</div>
                  <div className="text-2xl font-bold">{results.scores.keywordOptimization}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Engagement</div>
                  <div className="text-2xl font-bold">{results.scores.engagement}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Readability</div>
                  <div className="text-2xl font-bold">{results.scores.readability}</div>
                </div>
              </div>

              {/* Recommendations */}
              {results.recommendations.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {results.recommendations.map((rec: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          rec.priority === 'high'
                            ? 'border-red-200 bg-red-50'
                            : rec.priority === 'medium'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{rec.message}</div>
                            <div className="text-sm text-gray-600 mt-1">{rec.actionable}</div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              rec.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : rec.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Content Metrics</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Word Count:</span>
                    <span className="font-medium">{results.metrics.wordCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sentence Count:</span>
                    <span className="font-medium">{results.metrics.sentenceCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paragraph Count:</span>
                    <span className="font-medium">{results.metrics.paragraphCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Words/Sentence:</span>
                    <span className="font-medium">{results.metrics.avgWordsPerSentence.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
