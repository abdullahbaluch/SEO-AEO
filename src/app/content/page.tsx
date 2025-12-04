'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import ContentOptimizer from '@/components/marketing/ContentOptimizer';

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content & AEO Optimizer</h1>
          <p className="text-gray-600">Analyze and optimize your content for search engines and answer engines</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ContentOptimizer />
        </motion.div>
      </div>
    </div>
  );
}
