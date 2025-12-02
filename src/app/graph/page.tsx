'use client'

import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Network, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Graph() {
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any>(null);

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: () => base44.entities.Scan.list('-created_date', 50),
  });

  useEffect(() => {
    if (selectedScanId) {
      const scan = scans.find((s: any) => s.id === selectedScanId);
      if (scan?.graph_data) {
        try {
          setGraphData(JSON.parse(scan.graph_data));
        } catch (e) {
          console.error('Error parsing graph data:', e);
        }
      }
    }
  }, [selectedScanId, scans]);

  useEffect(() => {
    if (scans.length > 0 && !selectedScanId) {
      setSelectedScanId(scans[0].id || null);
    }
  }, [scans, selectedScanId]);

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
                <Network className="w-6 h-6 text-indigo-500" />
                Graph Explorer
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Visualize SEO relationships and dependencies
              </p>
            </div>
          </div>
        </div>

        {graphData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500">Total Nodes</div>
                <div className="text-2xl font-bold text-gray-900">{graphData.nodes?.length || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500">Total Edges</div>
                <div className="text-2xl font-bold text-gray-900">{graphData.edges?.length || 0}</div>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              Graph visualization component placeholder
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No graph data</h3>
            <p className="text-gray-500 mt-1">
              {isLoading ? 'Loading scans...' : 'Select a scan to view its graph'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
