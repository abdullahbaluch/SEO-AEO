'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Search, Globe } from 'lucide-react';
import SiteCrawler from '@/components/seo/SiteCrawler';

export default function CrawlerPage() {
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
                <Globe className="w-6 h-6 text-indigo-500" />
                Website Crawler
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Analyze entire websites for SEO, broken links, and site health
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Search className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Full Website Analysis</h3>
              <p className="text-sm text-blue-700">
                Enter any website URL to start crawling. The crawler will:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Discover all pages by following internal links</li>
                <li>Check for broken links (404s, timeouts, errors)</li>
                <li>Detect redirects and redirect chains</li>
                <li>Measure page load times</li>
                <li>Count internal and external links</li>
                <li>Build a complete site map</li>
              </ul>
            </div>
          </div>
        </div>

        <SiteCrawler />
      </div>
    </div>
  );
}
