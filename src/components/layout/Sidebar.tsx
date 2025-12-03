'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Search,
  Link2,
  FileText,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('seo-tools');

  const menuItems = [
    {
      id: 'seo-tools',
      label: 'SEO Tools',
      icon: Search,
      submenu: [
        { label: 'Quick Scan', href: '/' },
        { label: 'Comprehensive Analysis', href: '/comprehensive' },
        { label: 'Keyword Tracker', href: '/keywords' },
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: TrendingUp,
      submenu: [
        { label: 'Backlink Monitor', href: '/backlinks' },
        { label: 'Competitor Analysis', href: '/competitors' },
        { label: 'Content Optimizer', href: '/content' },
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      href: '/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings'
    }
  ];

  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen ${sidebarOpen ? 'w-72' : 'w-20'} flex flex-col overflow-y-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-all duration-300`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        {sidebarOpen ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">SEO Toolkit</span>
          </Link>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => setActiveMenu(activeMenu === item.id ? '' : item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      activeMenu === item.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {sidebarOpen && activeMenu === item.id && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {subitem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mx-4 mb-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        {sidebarOpen ? '← Collapse' : '→'}
      </button>
    </aside>
  );
}
