'use client'

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import {
  LayoutDashboard,
  Network,
  BarChart3,
  Search,
  Menu,
  X,
  TrendingUp,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Full Report', page: '/report', icon: FileText, highlight: true },
    { name: 'Crawler', page: 'Crawler', icon: Search },
    { name: 'Marketing', page: 'Marketing', icon: TrendingUp },
    { name: 'Graph', page: 'Graph', icon: Network },
    { name: 'Analytics', page: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                SEO Toolkit
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = currentPageName === item.page;
                const href = item.page.startsWith('/') ? item.page : createPageUrl(item.page);
                return (
                  <Link
                    key={item.name}
                    href={href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.highlight
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                        : isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4" />
              <span>SEO Toolkit - On-page SEO & AEO Analysis</span>
            </div>
            <div className="text-sm text-gray-400">
              All analysis runs locally in your browser
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
