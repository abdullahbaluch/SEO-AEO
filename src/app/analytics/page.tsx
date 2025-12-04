'use client'

import React, { useState, useMemo } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  // Prepare time-series data for charts
  const timeSeriesData = useMemo(() => {
    return [...filteredScans]
      .reverse()
      .map((scan: any) => ({
        date: new Date(scan.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        seo: scan.seo_score || 0,
        aeo: scan.aeo_score || 0,
        overall: Math.round(((scan.seo_score || 0) + (scan.aeo_score || 0)) / 2),
        issues: scan.issues_count || 0,
      }));
  }, [filteredScans]);

  // Prepare average scores by category
  const categoryData = useMemo(() => {
    if (filteredScans.length === 0) return [];

    const avgScores = filteredScans.reduce((acc: any, scan: any) => ({
      metadata: acc.metadata + (scan.metadata_score || 0),
      schema: acc.schema + (scan.schema_score || 0),
      content: acc.content + (scan.content_score || 0),
      links: acc.links + (scan.link_score || 0),
      images: acc.images + (scan.image_score || 0),
      accessibility: acc.accessibility + (scan.accessibility_score || 0),
      performance: acc.performance + (scan.performance_score || 0),
    }), {
      metadata: 0,
      schema: 0,
      content: 0,
      links: 0,
      images: 0,
      accessibility: 0,
      performance: 0,
    });

    return Object.entries(avgScores).map(([key, value]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      score: Math.round((value as number) / filteredScans.length),
    }));
  }, [filteredScans]);

  // Prepare issue distribution
  const issueData = useMemo(() => {
    if (filteredScans.length === 0) return [];

    const total = {
      critical: filteredScans.reduce((sum: number, s: any) => sum + (s.critical_count || 0), 0),
      warnings: filteredScans.reduce((sum: number, s: any) => sum + (s.warnings_count || 0), 0),
      info: filteredScans.reduce((sum: number, s: any) => sum + ((s.issues_count || 0) - (s.critical_count || 0) - (s.warnings_count || 0)), 0),
    };

    return [
      { name: 'Critical', value: total.critical, color: '#ef4444' },
      { name: 'Warnings', value: total.warnings, color: '#f59e0b' },
      { name: 'Info', value: total.info, color: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [filteredScans]);

  // Calculate trends
  const trends = useMemo(() => {
    if (filteredScans.length < 2) return { seo: 0, aeo: 0, issues: 0 };

    const latest = filteredScans[0];
    const previous = filteredScans[1];

    return {
      seo: (latest.seo_score || 0) - (previous.seo_score || 0),
      aeo: (latest.aeo_score || 0) - (previous.aeo_score || 0),
      issues: (latest.issues_count || 0) - (previous.issues_count || 0),
    };
  }, [filteredScans]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
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
          <Link href="/">
            <Button className="bg-[rgb(70,95,255)] hover:bg-[rgb(60,85,245)]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Run New Scan
            </Button>
          </Link>
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
            {/* URL Filter */}
            {urls.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by URL</label>
                <select
                  value={selectedUrl}
                  onChange={(e) => setSelectedUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All URLs ({scans.length} scans)</option>
                  {urls.map((url: string) => (
                    <option key={url} value={url}>
                      {url} ({scans.filter((s: any) => s.url === url).length} scans)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Summary Stats with Trends */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Total Scans</div>
                <div className="text-3xl font-bold text-gray-900">{filteredScans.length}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Avg SEO Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(filteredScans.reduce((sum: number, s: any) => sum + (s.seo_score || 0), 0) / filteredScans.length)}
                  </div>
                  {trends.seo !== 0 && (
                    <div className={`flex items-center text-sm font-medium ${trends.seo > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trends.seo > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(trends.seo)}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Avg AEO Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(filteredScans.reduce((sum: number, s: any) => sum + (s.aeo_score || 0), 0) / filteredScans.length)}
                  </div>
                  {trends.aeo !== 0 && (
                    <div className={`flex items-center text-sm font-medium ${trends.aeo > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trends.aeo > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(trends.aeo)}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Total Issues</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {filteredScans.reduce((sum: number, s: any) => sum + (s.issues_count || 0), 0)}
                  </div>
                  {trends.issues !== 0 && (
                    <div className={`flex items-center text-sm font-medium ${trends.issues < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trends.issues < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      {Math.abs(trends.issues)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Score Trends Over Time */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-6">Score Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="seo" stroke="#6366f1" strokeWidth={2} name="SEO Score" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="aeo" stroke="#ec4899" strokeWidth={2} name="AEO Score" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={2} name="Overall" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown and Issues */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Average Scores by Category */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-6">Average Scores by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px',
                      }}
                    />
                    <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Issue Distribution */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-6">Issue Distribution</h3>
                {issueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={issueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {issueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No issues found
                  </div>
                )}
              </div>
            </div>

            {/* Issues Over Time */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-6">Issues Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} name="Total Issues" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-500 mb-6">
              Run some SEO scans from the homepage to see analytics and trends
            </p>
            <Link href="/">
              <Button className="bg-[rgb(70,95,255)] hover:bg-[rgb(60,85,245)]">
                <BarChart3 className="w-4 h-4 mr-2" />
                Go to Homepage & Scan
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
