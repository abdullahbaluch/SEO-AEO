'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TechnicalScannerPage() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setError('');
    setResults(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsScanning(true);

    try {
      const response = await fetch('/api/technical-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          checkRobots: true,
          checkSitemap: true,
          checkCanonical: true,
          checkSSL: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Scan failed');
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technical Scanner</h1>
            <p className="text-gray-500 text-sm">Technical SEO health check</p>
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
                disabled={isScanning}
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
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Run Technical Scan
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
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{results.score}</div>
                  <div className="text-emerald-100 text-lg">Technical Score</div>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.summary.passed}</div>
                      <div className="text-sm text-emerald-100">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.summary.warnings}</div>
                      <div className="text-sm text-emerald-100">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.summary.failed}</div>
                      <div className="text-sm text-emerald-100">Failed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checks */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Technical Checks ({results.checks.length})</h3>
                <div className="space-y-3">
                  {results.checks.map((check: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border border-gray-100"
                    >
                      {check.status === 'pass' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : check.status === 'fail' ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{check.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{check.message}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Impact:</span> {check.impact}
                        </div>
                        {check.recommendation && (
                          <div className="text-sm text-blue-600 mt-2">
                            💡 {check.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
