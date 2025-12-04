'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import KeywordTracker from '@/components/marketing/KeywordTracker';

export default function KeywordsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keyword Tracker</h1>
          <p className="text-gray-600">Track keyword rankings, search volume, and competition over time</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <KeywordTracker domain="example.com" />
        </motion.div>
      </div>
    </div>
  );
}
