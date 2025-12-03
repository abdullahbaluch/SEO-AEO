'use client'

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 2xl:px-10">
        <div className="flex items-center py-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SEO Toolkit</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete SEO Analysis</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
