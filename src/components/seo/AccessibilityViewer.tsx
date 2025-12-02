import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Accessibility, Globe, Navigation, SkipForward, FormInput } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccessibilityViewer({ accessibility }) {
  if (!accessibility) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Accessibility Analysis</h3>
        <div className="text-center py-8 text-gray-400">
          <Accessibility className="w-12 h-12 mx-auto mb-3 opacity-50" />
          No accessibility data available
        </div>
      </div>
    );
  }

  const checks = [
    {
      label: 'Language Attribute',
      value: accessibility.hasLang,
      detail: accessibility.lang || 'Not set',
      icon: Globe,
      description: 'HTML lang attribute helps screen readers pronounce content correctly',
      recommendation: 'Add lang="en" (or appropriate language) to your <html> element',
    },
    {
      label: 'Main Landmark',
      value: accessibility.hasMainLandmark,
      icon: Navigation,
      description: 'A <main> element helps screen readers navigate directly to main content',
      recommendation: 'Wrap your main content in a <main> element',
    },
    {
      label: 'Navigation Landmark',
      value: accessibility.hasNavLandmark,
      icon: Navigation,
      description: 'A <nav> element helps users find site navigation',
      recommendation: 'Wrap navigation links in a <nav> element',
    },
    {
      label: 'Skip Link',
      value: accessibility.hasSkipLink,
      icon: SkipForward,
      description: 'Skip links allow keyboard users to bypass navigation',
      recommendation: 'Add a skip-to-content link at the beginning of your page',
    },
  ];

  const passedCount = checks.filter(c => c.value).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Accessibility Overview</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            score >= 80 ? 'bg-emerald-100 text-emerald-700' :
            score >= 50 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {passedCount}/{checks.length} checks passed
          </div>
        </div>

        <div className="space-y-3">
          {checks.map((check, index) => (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                check.value 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {check.value ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{check.label}</h4>
                    {check.detail && check.value && (
                      <span className="text-xs bg-white/50 px-2 py-0.5 rounded">
                        {check.detail}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                  {!check.value && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      Fix: {check.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form Labels Analysis */}
      {accessibility.formsWithLabels && accessibility.formsWithLabels.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FormInput className="w-4 h-4" />
            Form Input Labels ({accessibility.formsWithLabels.length})
          </h3>
          
          <div className="space-y-2">
            {accessibility.formsWithLabels.map((input, index) => {
              const hasLabel = input.hasLabel || input.hasAriaLabel;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    hasLabel ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {hasLabel ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">
                      {input.type || 'input'} element
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {input.hasLabel && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                        has label
                      </span>
                    )}
                    {input.hasAriaLabel && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        aria-label
                      </span>
                    )}
                    {input.hasPlaceholder && !hasLabel && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        placeholder only
                      </span>
                    )}
                    {!hasLabel && !input.hasPlaceholder && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        no label
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {accessibility.formsWithLabels.some(i => !i.hasLabel && !i.hasAriaLabel) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Tip:</strong> Form inputs without labels are inaccessible to screen reader users.
                Add a <code>&lt;label&gt;</code> element with a <code>for</code> attribute matching the input's <code>id</code>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tables Analysis */}
      {accessibility.tablesWithHeaders && accessibility.tablesWithHeaders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Tables ({accessibility.tablesWithHeaders.length})
          </h3>
          
          <div className="space-y-2">
            {accessibility.tablesWithHeaders.map((table, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  table.hasHeaders ? 'bg-emerald-50' : 'bg-amber-50'
                }`}
              >
                <span className="text-sm text-gray-700">Table {index + 1}</span>
                <div className="flex items-center gap-2">
                  {table.hasHeaders ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> has headers
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> no headers
                    </span>
                  )}
                  {table.hasCaption && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      has caption
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARIA Landmarks */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          ARIA Landmarks & Roles
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-indigo-600">
            {accessibility.ariaLandmarks || 0}
          </div>
          <div className="text-sm text-gray-600">
            elements with ARIA roles found
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          ARIA landmarks help assistive technologies understand page structure.
          Common roles include: banner, navigation, main, contentinfo, complementary.
        </p>
      </div>
    </div>
  );
}