import React from 'react';
import { Zap, FileCode, Image, AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function PerformanceViewer({ scripts, images, htmlSize, issues }) {
  const performanceIssues = issues?.filter(i => i.category === 'performance') || [];

  // Calculate metrics
  const totalScripts = scripts?.length || 0;
  const inlineScripts = scripts?.filter(s => s.isInline).length || 0;
  const asyncScripts = scripts?.filter(s => s.async || s.defer).length || 0;
  const blockingScripts = scripts?.filter(s => !s.isInline && !s.async && !s.defer).length || 0;
  const totalInlineSize = scripts?.filter(s => s.isInline).reduce((sum, s) => sum + (s.size || 0), 0) || 0;

  const totalImages = images?.length || 0;
  const lazyImages = images?.filter(i => i.loading === 'lazy').length || 0;
  const imagesWithDimensions = images?.filter(i => i.width && i.height).length || 0;

  const htmlSizeKB = htmlSize ? Math.round(htmlSize / 1024) : 0;

  const scriptData = [
    { name: 'Inline', count: inlineScripts, fill: '#f59e0b' },
    { name: 'Async/Defer', count: asyncScripts, fill: '#10b981' },
    { name: 'Blocking', count: blockingScripts, fill: '#ef4444' },
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">Total Scripts</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{totalScripts}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600">Async/Defer</span>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{asyncScripts}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">Blocking</span>
          </div>
          <span className="text-2xl font-bold text-red-600">{blockingScripts}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">HTML Size</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{htmlSizeKB} KB</span>
        </div>
      </div>

      {/* Script Distribution */}
      {scriptData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Script Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scriptData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Script Analysis */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Script Analysis</h3>
        
        <div className="space-y-4">
          {/* Render-blocking check */}
          <div className={`p-4 rounded-xl border ${
            blockingScripts === 0 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {blockingScripts === 0 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Render-blocking Scripts</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {blockingScripts === 0 
                    ? 'No render-blocking scripts detected. Great job!'
                    : `${blockingScripts} scripts are blocking page render. Add async or defer attributes.`}
                </p>
              </div>
            </div>
          </div>

          {/* Inline scripts check */}
          {totalInlineSize > 10000 && (
            <div className="p-4 rounded-xl border bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Large Inline Scripts</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Total inline script size is {Math.round(totalInlineSize / 1024)} KB.
                    Consider moving large scripts to external files.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Optimization */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Image Optimization</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalImages}</div>
            <div className="text-xs text-gray-500">Total Images</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{lazyImages}</div>
            <div className="text-xs text-emerald-600">Lazy Loaded</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{imagesWithDimensions}</div>
            <div className="text-xs text-blue-600">With Dimensions</div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Lazy loading check */}
          <div className={`p-4 rounded-xl border ${
            totalImages === 0 || lazyImages >= totalImages * 0.5
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {totalImages === 0 || lazyImages >= totalImages * 0.5 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Lazy Loading</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {lazyImages} of {totalImages} images use lazy loading.
                  {lazyImages < totalImages && ' Add loading="lazy" to below-the-fold images.'}
                </p>
              </div>
            </div>
          </div>

          {/* Dimensions check */}
          <div className={`p-4 rounded-xl border ${
            totalImages === 0 || imagesWithDimensions >= totalImages * 0.8
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {totalImages === 0 || imagesWithDimensions >= totalImages * 0.8 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Image Dimensions</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {imagesWithDimensions} of {totalImages} images have explicit dimensions.
                  {imagesWithDimensions < totalImages && ' Add width and height to prevent layout shifts.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Issues */}
      {performanceIssues.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Performance Issues ({performanceIssues.length})
          </h3>
          <div className="space-y-3">
            {performanceIssues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border ${
                  issue.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  issue.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    issue.severity === 'critical' ? 'text-red-500' :
                    issue.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    {issue.fix && (
                      <p className="text-sm font-medium mt-2 text-gray-700">
                        Fix: {issue.fix}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Performance Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Use async or defer for non-critical scripts</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Add loading="lazy" to below-the-fold images</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Specify width and height on images to prevent CLS</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Keep HTML document size under 100KB when possible</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Move large inline scripts to external files</span>
          </li>
        </ul>
      </div>
    </div>
  );
}