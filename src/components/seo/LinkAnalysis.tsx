import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ExternalLink, 
  Link2, 
  AlertCircle, 
  Search,
  ArrowUpRight,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LinkAnalysis({ links }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  if (!links || links.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Link Analysis</h3>
        <div className="text-center py-8 text-gray-400">
          No links found on this page
        </div>
      </div>
    );
  }

  const internalLinks = links.filter(l => l.isInternal);
  const externalLinks = links.filter(l => !l.isInternal);
  const emptyLinks = links.filter(l => l.isEmpty);
  const nofollowLinks = links.filter(l => l.isNofollow);

  const filteredLinks = links.filter(link => {
    if (filter === 'internal' && !link.isInternal) return false;
    if (filter === 'external' && link.isInternal) return false;
    if (filter === 'issues' && !link.isEmpty && link.text?.length > 0) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        link.href?.toLowerCase().includes(searchLower) ||
        link.text?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">Total Links</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{links.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600">Internal</span>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{internalLinks.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">External</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{externalLinks.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600">Issues</span>
          </div>
          <span className="text-2xl font-bold text-amber-600">{emptyLinks.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({links.length})
              </Button>
              <Button
                variant={filter === 'internal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('internal')}
              >
                Internal ({internalLinks.length})
              </Button>
              <Button
                variant={filter === 'external' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('external')}
              >
                External ({externalLinks.length})
              </Button>
              {emptyLinks.length > 0 && (
                <Button
                  variant={filter === 'issues' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('issues')}
                  className="text-amber-600"
                >
                  Issues ({emptyLinks.length})
                </Button>
              )}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search links..."
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
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Anchor Text</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">URL</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Attributes</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLinks.slice(0, 100).map((link, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-3">
                    {link.isInternal ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        <ArrowRight className="w-3 h-3" />
                        Internal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <ExternalLink className="w-3 h-3" />
                        External
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {link.isEmpty ? (
                      <span className="text-amber-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Empty
                      </span>
                    ) : (
                      <span className="text-sm text-gray-900 line-clamp-1 max-w-[200px]">
                        {link.text || '(no text)'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline line-clamp-1 max-w-[300px] block"
                    >
                      {link.href}
                    </a>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {link.rel && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          rel="{link.rel}"
                        </span>
                      )}
                      {link.target && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          target="{link.target}"
                        </span>
                      )}
                      {link.isNofollow && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                          nofollow
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {link.isEmpty ? (
                      <span className="text-amber-500">
                        <AlertCircle className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="text-emerald-500">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredLinks.length > 100 && (
            <div className="px-5 py-3 bg-gray-50 text-center text-sm text-gray-500">
              Showing first 100 of {filteredLinks.length} links
            </div>
          )}
        </div>
      </div>

      {/* Nofollow Summary */}
      {nofollowLinks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Nofollow Links ({nofollowLinks.length})
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            These links have rel="nofollow" and won't pass link equity.
          </p>
          <div className="space-y-2">
            {nofollowLinks.slice(0, 10).map((link, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="truncate text-gray-600">{link.href}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}