'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Globe,
  Shield,
  Key,
  FileText,
  Sparkles,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComprehensiveReportProps {
  data: any;
  onExportPDF: () => void;
  onExportJSON: () => void;
}

export default function ComprehensiveReport({ data, onExportPDF, onExportJSON }: ComprehensiveReportProps) {
  if (!data) return null;

  const { onsite, technical, keywords, content, aeo, crawl, overallScore, allIssues } = data;

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-7xl font-bold mb-2">{overallScore}</div>
            <div className="text-xl text-white/90">Overall SEO Score</div>
            <div className="text-sm text-white/70 mt-1">
              Analyzed {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onExportPDF}
              variant="secondary"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={onExportJSON}
              variant="secondary"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="w-5 h-5 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Module Scores Grid */}
      <div className="grid md:grid-cols-5 gap-4">
        {onsite && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-medium text-gray-600">Onsite</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{onsite.score}</div>
          </div>
        )}

        {technical && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <div className="text-sm font-medium text-gray-600">Technical</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{technical.score}</div>
          </div>
        )}

        {keywords && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-purple-600" />
              <div className="text-sm font-medium text-gray-600">Keywords</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{keywords.keywords.length}</div>
            <div className="text-xs text-gray-500 mt-1">Found</div>
          </div>
        )}

        {content && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <div className="text-sm font-medium text-gray-600">Content</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{content.overallScore}</div>
          </div>
        )}

        {aeo && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <div className="text-sm font-medium text-gray-600">AEO</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{aeo.answerability.score}</div>
          </div>
        )}
      </div>

      {/* Critical Issues */}
      {allIssues && allIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Issues Found ({allIssues.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allIssues.map((issue: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  issue.severity === 'critical'
                    ? 'border-red-200 bg-red-50'
                    : issue.severity === 'warning'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {issue.severity === 'critical' ? (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{issue.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                        {issue.module}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                    {issue.recommendation && (
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600">💡</span>
                        {issue.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Results - Expandable Sections */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Onsite Results */}
        {onsite && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Onsite Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Word Count:</span>
                <span className="font-medium">{onsite.content.wordCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reading Time:</span>
                <span className="font-medium">{onsite.content.readingTime} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Readability:</span>
                <span className="font-medium">{Math.round(onsite.content.readabilityScore)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Images:</span>
                <span className="font-medium">{onsite.images.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Alt Coverage:</span>
                <span className="font-medium">{Math.round(onsite.images.altCoverage)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Technical Results */}
        {technical && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Technical SEO
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Passed Checks:</span>
                <span className="font-medium text-emerald-600">{technical.summary.passed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Warnings:</span>
                <span className="font-medium text-amber-600">{technical.summary.warnings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{technical.summary.failed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywords && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              Top Keywords
            </h3>
            <div className="space-y-2">
              {keywords.keywords.slice(0, 5).map((kw: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">{kw.word}</span>
                  <span className="text-gray-500 font-mono">{kw.count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Quality */}
        {content && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Content Quality
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clarity:</span>
                <span className="font-medium">{content.scores.clarity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Structure:</span>
                <span className="font-medium">{content.scores.structure}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Engagement:</span>
                <span className="font-medium">{content.scores.engagement}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Readability:</span>
                <span className="font-medium">{content.scores.readability}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crawl Results */}
      {crawl && crawl.summary && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            Website Crawl Summary
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{crawl.summary.totalPages}</div>
              <div className="text-sm text-gray-500">Total Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{crawl.summary.successfulPages}</div>
              <div className="text-sm text-gray-500">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{crawl.summary.totalBrokenLinks}</div>
              <div className="text-sm text-gray-500">Broken Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(crawl.summary.avgLoadTime)}ms</div>
              <div className="text-sm text-gray-500">Avg Load Time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
