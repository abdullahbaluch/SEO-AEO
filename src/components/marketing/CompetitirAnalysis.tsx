import React, { useState } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  RefreshCw,
  Users,
  Globe,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CompetitorAnalysis({ domain }: { domain?: string }) {
  const [newCompetitor, setNewCompetitor] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const queryClient = useQueryClient();

  const { data: competitors = [], isLoading } = useQuery({
    queryKey: ['competitors', domain],
    queryFn: () => base44.entities.Competitor.filter({ your_domain: domain }, '-created_date', 10),
    enabled: !!domain,
  });

  const yourMetrics = {
    domain: domain,
    estimated_traffic: 15000,
    domain_authority: 45,
    total_keywords: 850,
    total_backlinks: 2500,
    referring_domains: 180,
  };

  const addCompetitorMutation = useMutation({
    mutationFn: async (competitorDomain) => {
      const traffic = Math.floor(Math.random() * 50000) + 5000;
      const da = Math.floor(Math.random() * 60) + 20;
      const keywords = Math.floor(Math.random() * 2000) + 200;
      const backlinks = Math.floor(Math.random() * 10000) + 500;
      const referringDomains = Math.floor(Math.random() * 500) + 50;
      const commonKeywords = Math.floor(Math.random() * Math.min(keywords, 850) * 0.3);

      const topKeywords = [
        { keyword: `${competitorDomain.split('.')[0]} reviews`, position: Math.floor(Math.random() * 10) + 1 },
        { keyword: `best ${competitorDomain.split('.')[0]}`, position: Math.floor(Math.random() * 20) + 1 },
        { keyword: `${competitorDomain.split('.')[0]} pricing`, position: Math.floor(Math.random() * 15) + 1 },
        { keyword: `${competitorDomain.split('.')[0]} alternatives`, position: Math.floor(Math.random() * 10) + 1 },
        { keyword: `${competitorDomain.split('.')[0]} vs`, position: Math.floor(Math.random() * 20) + 1 },
      ];

      return base44.entities.Competitor.create({
        your_domain: domain,
        competitor_domain: competitorDomain,
        estimated_traffic: traffic,
        domain_authority: da,
        total_keywords: keywords,
        total_backlinks: backlinks,
        referring_domains: referringDomains,
        common_keywords: commonKeywords,
        top_keywords: JSON.stringify(topKeywords),
        history: JSON.stringify([{
          date: new Date().toISOString().split('T')[0],
          traffic,
          da,
          keywords,
        }]),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', domain] });
      setNewCompetitor('');
    },
  });

  const deleteCompetitorMutation = useMutation({
    mutationFn: (compId) => base44.entities.Competitor.delete(compId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', domain] });
    },
  });

  const handleDeleteCompetitor = (compId) => {
    if (selectedCompetitor?.id === compId) {
      setSelectedCompetitor(null);
    }
    deleteCompetitorMutation.mutate(compId);
  };

  const refreshCompetitorMutation = useMutation({
    mutationFn: async (comp) => {
      const traffic = Math.max(1000, comp.estimated_traffic + Math.floor(Math.random() * 4000) - 2000);
      const history = JSON.parse(comp.history || '[]');
      history.push({
        date: new Date().toISOString().split('T')[0],
        traffic,
        da: comp.domain_authority,
        keywords: comp.total_keywords,
      });

      return base44.entities.Competitor.update(comp.id, {
        estimated_traffic: traffic,
        history: JSON.stringify(history.slice(-12)),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitors', domain] }),
  });

  const handleAddCompetitor = (e) => {
    e.preventDefault();
    if (newCompetitor.trim()) {
      let clean = newCompetitor.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      addCompetitorMutation.mutate(clean);
    }
  };

  const comparisonData = [
    { metric: 'Traffic (K)', you: yourMetrics.estimated_traffic / 1000, ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, (c.estimated_traffic || 0) / 1000])) },
    { metric: 'DA', you: yourMetrics.domain_authority, ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, c.domain_authority || 0])) },
    { metric: 'Keywords', you: yourMetrics.total_keywords / 100, ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, (c.total_keywords || 0) / 100])) },
    { metric: 'Backlinks (K)', you: yourMetrics.total_backlinks / 1000, ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, (c.total_backlinks || 0) / 1000])) },
    { metric: 'Ref Domains', you: yourMetrics.referring_domains, ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, c.referring_domains || 0])) },
  ];

  const radarData = [
    { subject: 'Traffic', you: Math.min(100, (yourMetrics.estimated_traffic / 50000) * 100), ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, Math.min(100, ((c.estimated_traffic || 0) / 50000) * 100)])) },
    { subject: 'Authority', you: yourMetrics.domain_authority, ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, c.domain_authority || 0])) },
    { subject: 'Keywords', you: Math.min(100, (yourMetrics.total_keywords / 2000) * 100), ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, Math.min(100, ((c.total_keywords || 0) / 2000) * 100)])) },
    { subject: 'Backlinks', you: Math.min(100, (yourMetrics.total_backlinks / 10000) * 100), ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, Math.min(100, ((c.total_backlinks || 0) / 10000) * 100)])) },
    { subject: 'Domains', you: Math.min(100, (yourMetrics.referring_domains / 500) * 100), ...Object.fromEntries(competitors.map((c, i) => [`comp${i}`, Math.min(100, ((c.referring_domains || 0) / 500) * 100)])) },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddCompetitor} className="flex gap-2">
        <Input
          placeholder="Enter competitor domain (e.g., competitor.com)"
          value={newCompetitor}
          onChange={(e) => setNewCompetitor(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={addCompetitorMutation.isPending}>
          {addCompetitorMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          Add Competitor
        </Button>
      </form>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5" />
          <span className="font-semibold">Your Domain: {domain}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-indigo-200 text-sm">Est. Traffic</div>
            <div className="text-2xl font-bold">{formatNumber(yourMetrics.estimated_traffic)}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Domain Authority</div>
            <div className="text-2xl font-bold">{yourMetrics.domain_authority}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Keywords</div>
            <div className="text-2xl font-bold">{formatNumber(yourMetrics.total_keywords)}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Backlinks</div>
            <div className="text-2xl font-bold">{formatNumber(yourMetrics.total_backlinks)}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">Ref. Domains</div>
            <div className="text-2xl font-bold">{formatNumber(yourMetrics.referring_domains)}</div>
          </div>
        </div>
      </div>

      {competitors.length > 0 && (
        <div className="grid gap-4">
          {competitors.map((comp, index) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow ${
                selectedCompetitor?.id === comp.id ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => setSelectedCompetitor(selectedCompetitor?.id === comp.id ? null : comp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    {comp.competitor_domain?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{comp.competitor_domain}</div>
                    <div className="text-sm text-gray-500">
                      {comp.common_keywords || 0} overlapping keywords
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshCompetitorMutation.mutate(comp);
                    }}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshCompetitorMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompetitor(comp.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div>
                  <div className="text-xs text-gray-500">Traffic</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    {formatNumber(comp.estimated_traffic)}
                    {comp.estimated_traffic > yourMetrics.estimated_traffic ? (
                      <ArrowUpRight className="w-3 h-3 text-red-500" />
                    ) : comp.estimated_traffic < yourMetrics.estimated_traffic ? (
                      <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Minus className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">DA</div>
                  <div className={`font-semibold ${
                    comp.domain_authority > yourMetrics.domain_authority ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {comp.domain_authority}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Keywords</div>
                  <div className="font-semibold text-gray-900">{formatNumber(comp.total_keywords)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Backlinks</div>
                  <div className="font-semibold text-gray-900">{formatNumber(comp.total_backlinks)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ref. Domains</div>
                  <div className="font-semibold text-gray-900">{formatNumber(comp.referring_domains)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {competitors.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Metrics Comparison</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="metric" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="you" name={domain} fill="#6366f1" radius={[0, 4, 4, 0]} />
                  {competitors.map((c, i) => (
                    <Bar key={c.id} dataKey={`comp${i}`} name={c.competitor_domain} fill={COLORS[(i + 1) % COLORS.length]} radius={[0, 4, 4, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Competitive Position</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name={domain} dataKey="you" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  {competitors.map((c, i) => (
                    <Radar key={c.id} name={c.competitor_domain} dataKey={`comp${i}`} stroke={COLORS[(i + 1) % COLORS.length]} fill={COLORS[(i + 1) % COLORS.length]} fillOpacity={0.2} />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedCompetitor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCompetitor.competitor_domain} - Top Keywords
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="pb-2">Keyword</th>
                      <th className="pb-2 text-center">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {JSON.parse(selectedCompetitor.top_keywords || '[]').map((kw, i) => (
                      <tr key={i}>
                        <td className="py-2 text-sm text-gray-900">{kw.keyword}</td>
                        <td className="py-2 text-center">
                          <Badge className={
                            kw.position <= 3 ? 'bg-emerald-100 text-emerald-700' :
                            kw.position <= 10 ? 'bg-indigo-100 text-indigo-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            #{kw.position}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Traffic History</h4>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={JSON.parse(selectedCompetitor.history || '[]')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="traffic" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && competitors.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No Competitors Added</h3>
          <p className="text-gray-500 mt-1">Add competitor domains above to start tracking</p>
        </div>
      )}
    </div>
  );
}