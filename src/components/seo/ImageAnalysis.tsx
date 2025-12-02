import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function ImageAnalysis({ images }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Image Analysis</h3>
        <div className="text-center py-8 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
          No images found on this page
        </div>
      </div>
    );
  }

  const withAlt = images.filter(i => i.hasAlt && !i.altEmpty);
  const withoutAlt = images.filter(i => !i.hasAlt);
  const emptyAlt = images.filter(i => i.altEmpty);
  const missingDimensions = images.filter(i => !i.width || !i.height);
  const lazyLoaded = images.filter(i => i.loading === 'lazy');

  const filteredImages = images.filter(img => {
    if (filter === 'missing-alt' && (img.hasAlt && !img.altEmpty)) return false;
    if (filter === 'missing-dimensions' && img.width && img.height) return false;
    if (filter === 'not-lazy' && img.loading === 'lazy') return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        img.src?.toLowerCase().includes(searchLower) ||
        img.alt?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusIcon = (img) => {
    if (!img.hasAlt) return <XCircle className="w-4 h-4 text-red-500" />;
    if (img.altEmpty) return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{images.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600">With Alt</span>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{withAlt.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">No Alt</span>
          </div>
          <span className="text-2xl font-bold text-red-600">{withoutAlt.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600">Empty Alt</span>
          </div>
          <span className="text-2xl font-bold text-amber-600">{emptyAlt.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Lazy</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{lazyLoaded.length}</span>
        </div>
      </div>

      {/* Image Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({images.length})
              </Button>
              {withoutAlt.length > 0 && (
                <Button
                  variant={filter === 'missing-alt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('missing-alt')}
                  className="text-red-600"
                >
                  Missing Alt ({withoutAlt.length + emptyAlt.length})
                </Button>
              )}
              {missingDimensions.length > 0 && (
                <Button
                  variant={filter === 'missing-dimensions' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('missing-dimensions')}
                >
                  No Dimensions ({missingDimensions.length})
                </Button>
              )}
              <Button
                variant={filter === 'not-lazy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('not-lazy')}
              >
                Not Lazy ({images.length - lazyLoaded.length})
              </Button>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Preview</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Source</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Alt Text</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Dimensions</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Loading</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredImages.map((img, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-3">
                    {getStatusIcon(img)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {img.src ? (
                        <img
                          src={img.src}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-900 line-clamp-1 max-w-[200px] block" title={img.src}>
                      {img.src || '(no src)'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {!img.hasAlt ? (
                      <span className="text-red-600 text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Missing
                      </span>
                    ) : img.altEmpty ? (
                      <span className="text-amber-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Empty
                      </span>
                    ) : (
                      <span className="text-sm text-gray-700 line-clamp-2 max-w-[200px]">
                        {img.alt}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {img.width && img.height ? (
                      <span className="text-sm text-gray-600">
                        {img.width} × {img.height}
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm">Not set</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {img.loading === 'lazy' ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        lazy
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        eager
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Image Optimization Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Add descriptive alt text to all non-decorative images</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Include width and height attributes to prevent layout shifts (CLS)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Use loading="lazy" for below-the-fold images</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Use modern formats like WebP or AVIF for better compression</span>
          </li>
        </ul>
      </div>
    </div>
  );
}