'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Network, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LinkMapperPage() {
  const [startUrl, setStartUrl] = useState('');
  const [maxPages, setMaxPages] = useState(20);
  const [maxDepth, setMaxDepth] = useState(2);
  const [isMapping, setIsMapping] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleMap = async () => {
    setError('');
    setResults(null);

    if (!startUrl.trim()) {
      setError('Please enter a starting URL');
      return;
    }

    setIsMapping(true);

    try {
      const response = await fetch('/api/link-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrl,
          maxPages,
          maxDepth,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Mapping failed');
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Internal Link Mapper</h1>
            <p className="text-gray-500 text-sm">Map internal link structure</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Starting URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                disabled={isMapping}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Max Pages: {maxPages}
                </label>
                <Slider
                  value={maxPages}
                  onValueChange={(v) => setMaxPages(v)}
                  min={5}
                  max={50}
                  step={5}
                  disabled={isMapping}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Max Depth: {maxDepth}
                </label>
                <Slider
                  value={maxDepth}
                  onValueChange={(v) => setMaxDepth(v)}
                  min={1}
                  max={4}
                  step={1}
                  disabled={isMapping}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleMap}
              disabled={isMapping}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              size="lg"
            >
              {isMapping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mapping Links...
                </>
              ) : (
                <>
                  <Network className="w-4 h-4 mr-2" />
                  Map Internal Links
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
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Total Pages</div>
                  <div className="text-2xl font-bold">{results.stats.totalPages}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Total Links</div>
                  <div className="text-2xl font-bold">{results.stats.totalLinks}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Avg Links/Page</div>
                  <div className="text-2xl font-bold">{results.stats.avgLinksPerPage}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500 mb-1">Orphan Pages</div>
                  <div className="text-2xl font-bold text-red-600">{results.orphanPages.length}</div>
                </div>
              </div>

              {/* Pages List */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Pages ({results.nodes.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.nodes.map((node: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        node.isOrphan
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{node.title}</div>
                          <div className="text-xs text-gray-500 truncate font-mono">{node.url}</div>
                        </div>
                        <div className="ml-4 flex gap-4 text-sm text-gray-500">
                          <div>
                            <span className="text-green-600 font-medium">{node.incomingLinks}</span>
                            <span className="ml-1">in</span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">{node.outgoingLinks}</span>
                            <span className="ml-1">out</span>
                          </div>
                        </div>
                      </div>
                      {node.isOrphan && (
                        <div className="mt-2 text-xs text-red-600 font-medium">
                          ⚠️ Orphan Page - No incoming internal links
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Orphan Pages Warning */}
              {results.orphanPages.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    ⚠️ {results.orphanPages.length} Orphan Page(s) Found
                  </h3>
                  <p className="text-sm text-red-700">
                    These pages have no incoming internal links and may be difficult for users and search engines to discover.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
