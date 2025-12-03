'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';

export default function Header() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsAnalyzing(true);

    // Navigate to home page with URL parameter to trigger full analysis
    const encodedUrl = encodeURIComponent(url);
    router.push(`/?url=${encodedUrl}&analyze=full`);

    // Reset after navigation
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 2xl:px-10">
        <div className="flex items-center gap-6 py-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SEO Toolkit</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete SEO Analysis</p>
            </div>
          </Link>

          {/* Main URL Search Bar */}
          <form onSubmit={handleAnalyze} className="flex-1 max-w-3xl">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to analyze (e.g., https://example.com)"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </form>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !url.trim()}
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">Analyze</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Links - Secondary Navigation */}
        <div className="hidden md:flex items-center gap-4 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick Access:</span>
          <Link href="/marketing" className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Marketing Tools
          </Link>
          <Link href="/crawler" className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Site Crawler
          </Link>
          <Link href="/analytics" className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Analytics
          </Link>
          <Link href="/graph" className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Graph View
          </Link>
          <Link href="/report" className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Reports
          </Link>
        </div>
      </div>
    </header>
  );
}
