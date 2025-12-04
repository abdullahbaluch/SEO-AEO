import React, { useState } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function BacklinkMonitor({ domain }: { domain?: string }) {
  const [filter, setFilter] = useState('all');
  const [newBacklink, setNewBacklink] = useState({ source_url: '', anchor_text: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: backlinks = [], isLoading } = useQuery({
    queryKey: ['backlinks', domain],
    queryFn: () => base44.entities.Backlink.filter({ domain }, '-created_date', 200),
    enabled: !!domain,
  });

  const addBacklinkMutation = useMutation({
    mutationFn: async (data: any) => {
      const sourceDomain = new URL(data.source_url).hostname;
      return base44.entities.Backlink.create({
        domain,
        source_url: data.source_url,
        source_domain: sourceDomain,
        target_url: `https://${domain}/`,
        anchor_text: data.anchor_text || sourceDomain,
        domain_authority: Math.floor(Math.random() * 60) + 20,
        link_type: 'dofollow',
        status: 'new',
        first_seen: new Date().toISOString().split('T')[0],
        last_seen: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlinks', domain] });
      setNewBacklink({ source_url: '', anchor_text: '' });
      setShowAddForm(false);
    },
  });

  const deleteBacklinkMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Backlink.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['backlinks', domain] }),
  });

  // Filter backlinks
  const filteredBacklinks = backlinks.filter((bl: any) => {
    if (filter === 'all') return true;
    if (filter === 'new') return bl.status === 'new';
    if (filter === 'lost') return bl.status === 'lost';
    if (filter === 'dofollow') return bl.link_type === 'dofollow';
    if (filter === 'nofollow') return bl.link_type !== 'dofollow';
    return true;
  });

  // Stats
  const stats = {
    total: backlinks.length,
    new: backlinks.filter((b: any) => b.status === 'new').length,
    lost: backlinks.filter((b: any) => b.status === 'lost').length,
    dofollow: backlinks.filter((b: any) => b.link_type === 'dofollow').length,
    avgDA: backlinks.length ? Math.round(backlinks.reduce((s: number, b: any) => s + (b.domain_authority || 0), 0) / backlinks.length) : 0,
  };

  // Chart data
  const linkTypeData = [
    { name: 'DoFollow', value: stats.dofollow, color: '#10b981' },
    { name: 'NoFollow', value: backlinks.length - stats.dofollow, color: '#94a3b8' },
  ];

  const daDistribution = [
    { range: '0-20', count: backlinks.filter((b: any) => b.domain_authority < 20).length },
    { range: '20-40', count: backlinks.filter((b: any) => b.domain_authority >= 20 && b.domain_authority < 40).length },
    { range: '40-60', count: backlinks.filter((b: any) => b.domain_authority >= 40 && b.domain_authority < 60).length },
    { range: '60-80', count: backlinks.filter((b: any) => b.domain_authority >= 60 && b.domain_authority < 80).length },
    { range: '80+', count: backlinks.filter((b: any) => b.domain_authority >= 80).length },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return 'bg-emerald-100 text-emerald-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLinkTypeBadge = (type: string) => {
    switch (type) {
      case 'dofollow': return 'bg-indigo-100 text-indigo-700';
      case 'nofollow': return 'bg-gray-100 text-gray-600';
      case 'ugc': return 'bg-amber-100 text-amber-700';
      case 'sponsored': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Total Backlinks</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> New
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.new}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-500" /> Lost
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-500">DoFollow</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.dofollow}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Avg DA</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgDA}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Link Type Distribution</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={linkTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {linkTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Domain Authority Distribution</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daDistribution}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Links</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="dofollow">DoFollow</SelectItem>
              <SelectItem value="nofollow">NoFollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Backlink
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 rounded-xl p-4"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Source URL (https://...)"
              value={newBacklink.source_url}
              onChange={(e) => setNewBacklink({ ...newBacklink, source_url: e.target.value })}
            />
            <Input
              placeholder="Anchor text"
              value={newBacklink.anchor_text}
              onChange={(e) => setNewBacklink({ ...newBacklink, anchor_text: e.target.value })}
            />
            <Button
              onClick={() => addBacklinkMutation.mutate(newBacklink)}
              disabled={!newBacklink.source_url || addBacklinkMutation.isPending}
            >
              {addBacklinkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Backlinks Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Source</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Anchor</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">DA</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Type</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filteredBacklinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No backlinks found</p>
                  </td>
                </tr>
              ) : (
                filteredBacklinks.map((bl) => (
                  <tr key={bl.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">
                        {bl.source_domain}
                      </div>
                      <a
                        href={bl.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">
                      {bl.anchor_text}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${
                        bl.domain_authority >= 60 ? 'text-emerald-600' :
                        bl.domain_authority >= 30 ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {bl.domain_authority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getLinkTypeBadge(bl.link_type)}>
                        {bl.link_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusBadge(bl.status)}>
                        {bl.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteBacklinkMutation.mutate(bl.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}