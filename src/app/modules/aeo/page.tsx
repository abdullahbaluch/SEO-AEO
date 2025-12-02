'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Sparkles, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AEOAssistantPage() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('url');

  const handleAnalyze = async () => {
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

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/aeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mode === 'url' ? url : undefined,
          text: mode === 'text' ? text : undefined,
          suggestSchema: true,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AEO Assistant</h1>
            <p className="text-gray-500 text-sm">Answer Engine Optimization analysis</p>
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
                  disabled={isAnalyzing}
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
                  disabled={isAnalyzing}
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
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-pink-600 hover:bg-pink-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze for AEO
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
              {/* Answerability Score */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{results.answerability.score}</div>
                  <div className="text-pink-100 text-lg">Answerability Score</div>
                </div>
              </div>

              {/* Factors & Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">✅ Strengths</h3>
                  <ul className="space-y-2">
                    {results.answerability.factors.map((factor: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">💡 Improvements</h3>
                  <ul className="space-y-2">
                    {results.answerability.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Entities */}
              {results.entities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Entities Detected ({results.entities.length})</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {results.entities.slice(0, 10).map((entity: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border border-gray-100 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{entity.text}</div>
                          <div className="text-xs text-gray-500 capitalize">{entity.type}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {entity.mentions}× · {Math.round(entity.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {results.topics.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Topics ({results.topics.length})</h3>
                  <div className="space-y-2">
                    {results.topics.slice(0, 5).map((topic: any, index: number) => (
                      <div key={index} className="p-3 rounded-lg border border-gray-100">
                        <div className="font-medium text-gray-900 mb-1">{topic.name}</div>
                        <div className="flex flex-wrap gap-2">
                          {topic.keywords.slice(0, 5).map((kw: string, kIndex: number) => (
                            <span
                              key={kIndex}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schema Suggestions */}
              {results.schemas.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Schema Suggestions ({results.schemas.length})</h3>
                  <div className="space-y-4">
                    {results.schemas.slice(0, 3).map((schema: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{schema.type}</div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {Math.round(schema.confidence * 100)}% match
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">{schema.reason}</div>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                          {schema.jsonld}
                        </pre>
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
