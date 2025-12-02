import React, { useState } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function KeywordTracker({ domain }: { domain?: string }) {
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const queryClient = useQueryClient();

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['keywords', domain],
    queryFn: () => Promise.resolve([]), // base44.entities.KeywordRank.filter({ domain }, '-created_date', 100),
    enabled: !!domain,
  });

  const addKeywordMutation = useMutation({
    mutationFn: async (keyword: string) => {
      // Simulate SERP check - in production, use a SERP API
      const position = Math.floor(Math.random() * 50) + 1;
      const volume = Math.floor(Math.random() * 10000) + 100;
      const difficulty = Math.floor(Math.random() * 100);
      
      return base44.entities.KeywordRank.create({
        keyword,
        domain,
        position,
        previous_position: position,
        search_volume: volume,
        difficulty,
        url: `https://${domain}/`,
        history: JSON.stringify([{ date: new Date().toISOString().split('T')[0], position }]),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords', domain] });
      setNewKeyword('');
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: (id) => base44.entities.KeywordRank.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keywords', domain] }),
  });

  const refreshMutation = useMutation({
    mutationFn: async (kw) => {
      const newPosition = Math.max(1, kw.position + Math.floor(Math.random() * 11) - 5);
      const history = JSON.parse(kw.history || '[]');
      history.push({ date: new Date().toISOString().split('T')[0], position: newPosition });
      
      return base44.entities.KeywordRank.update(kw.id, {
        previous_position: kw.position,
        position: newPosition,
        history: JSON.stringify(history.slice(-30)),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keywords', domain] }),
  });

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      addKeywordMutation.mutate(newKeyword.trim());
    }
  };

  const getPositionChange = (kw) => {
    const change = (kw.previous_position || kw.position) - kw.position;
    if (change > 0) return { icon: TrendingUp, color: 'text-emerald-500', value: `+${change}` };
    if (change < 0) return { icon: TrendingDown, color: 'text-red-500', value: change };
    return { icon: Minus, color: 'text-gray-400', value: '0' };
  };

  const getDifficultyColor = (diff) => {
    if (diff < 30) return 'bg-emerald-100 text-emerald-700';
    if (diff < 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Add Keyword Form */}
      <form onSubmit={handleAddKeyword} className="flex gap-2">
        <Input
          placeholder="Enter keyword to track..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={addKeywordMutation.isPending}>
          {addKeywordMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          Add
        </Button>
      </form>

      {/* Keywords Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Keyword</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Position</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Change</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Volume</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Difficulty</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : keywords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No keywords tracked yet</p>
                  </td>
                </tr>
              ) : (
                keywords.map((kw) => {
                  const change = getPositionChange(kw);
                  const ChangeIcon = change.icon;
                  return (
                    <motion.tr
                      key={kw.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedKeyword?.id === kw.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedKeyword(kw)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{kw.keyword}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{kw.url}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-bold ${
                          kw.position <= 3 ? 'text-emerald-600' :
                          kw.position <= 10 ? 'text-indigo-600' :
                          kw.position <= 20 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          #{kw.position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 ${change.color}`}>
                          <ChangeIcon className="w-4 h-4" />
                          {change.value}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {kw.search_volume?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={getDifficultyColor(kw.difficulty)}>
                          {kw.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshMutation.mutate(kw);
                            }}
                            disabled={refreshMutation.isPending}
                          >
                            <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteKeywordMutation.mutate(kw.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position History Chart */}
      <AnimatePresence>
        {selectedKeyword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Position History: {selectedKeyword.keyword}
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={JSON.parse(selectedKeyword.history || '[]')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis reversed domain={[1, 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="position"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}