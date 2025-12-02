'use client'

import React, { useState } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const [selectedUrl, setSelectedUrl] = useState<string>('all');

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: () => base44.entities.Scan.list('-created_date', 100),
  });

  const urls = Array.from(new Set(scans.map((scan: any) => scan.url)));
  const filteredScans = selectedUrl === 'all'
    ? scans
    : scans.filter((scan: any) => scan.url === selectedUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
                Analytics & Trends
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Track SEO performance over time
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="animate-pulse">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Loading analytics data...</p>
            </div>
          </div>
        ) : filteredScans.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Score History</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Total Scans</div>
                  <div className="text-2xl font-bold text-gray-900">{filteredScans.length}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Avg SEO Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(filteredScans.reduce((sum: number, s: any) => sum + (s.seo_score || 0), 0) / filteredScans.length)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Avg AEO Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(filteredScans.reduce((sum: number, s: any) => sum + (s.aeo_score || 0), 0) / filteredScans.length)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Total Issues</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredScans.reduce((sum: number, s: any) => sum + (s.issues_count || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center py-12 text-gray-500">
                Analytics charts placeholder
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No analytics data</h3>
            <p className="text-gray-500 mt-1">
              Run some scans to see analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
