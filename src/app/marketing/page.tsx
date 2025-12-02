import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import {
  ArrowLeft,
  Target,
  Link2,
  FileText,
  TrendingUp,
  Globe,
  Users
} from 'lucide-react';

import KeywordTracker from '@/components/marketing/KeywordTracker';
import BacklinkMonitor from '@/components/marketing/BacklinkMonitor';
import ContentOptimizer from '@/components/marketing/ContentOptimizer';
import CompetitorAnalysis from '@/components/marketing/CompetitorAnalysis';

export default function Marketing() {
  const [domain, setDomain] = useState('');
  const [activeDomain, setActiveDomain] = useState('');
  const [activeTab, setActiveTab] = useState('keywords');

  const handleSetDomain = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      // Clean domain
      let cleanDomain = domain.trim().toLowerCase();
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      setActiveDomain(cleanDomain);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                <TrendingUp className="w-6 h-6 text-indigo-500" />
                Marketing Tools
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Keyword tracking, backlinks, and content optimization
              </p>
            </div>
          </div>
        </div>

        {/* Domain Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSetDomain} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your Domain
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Globe className="w-4 h-4 mr-2" />
                  Set Domain
                </Button>
              </div>
            </div>
            {activeDomain && (
              <div className="flex items-end">
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                  Tracking: {activeDomain}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger 
              value="keywords" 
              className="gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4" />
              Keyword Tracker
            </TabsTrigger>
            <TabsTrigger 
              value="backlinks"
              className="gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Link2 className="w-4 h-4" />
              Backlinks
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4" />
              Content Optimizer
            </TabsTrigger>
            <TabsTrigger 
              value="competitors"
              className="gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Competitors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords">
            {!activeDomain ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
 