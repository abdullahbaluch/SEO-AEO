'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/lib/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Network, Download, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Graph() {
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: () => base44.entities.Scan.list('-created_date', 50),
  });

  useEffect(() => {
    if (selectedScanId) {
      const scan = scans.find((s: any) => s.id === selectedScanId);
      if (scan?.graph_data) {
        try {
          setGraphData(JSON.parse(scan.graph_data));
        } catch (e) {
          console.error('Error parsing graph data:', e);
        }
      }
    }
  }, [selectedScanId, scans]);

  useEffect(() => {
    if (scans.length > 0 && !selectedScanId) {
      setSelectedScanId(scans[0].id || null);
    }
  }, [scans, selectedScanId]);

  // Get node type colors and info
  const getNodeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      page: '#6366f1',
      metadata: '#ec4899',
      heading: '#8b5cf6',
      link: '#3b82f6',
      image: '#10b981',
      schema: '#f59e0b',
      keyword: '#ef4444',
      default: '#6b7280',
    };
    return colors[type] || colors.default;
  };

  const getNodeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      page: '🌐',
      metadata: '📝',
      heading: '📑',
      link: '🔗',
      image: '🖼️',
      schema: '⚙️',
      keyword: '🔑',
      default: '●',
    };
    return icons[type] || icons.default;
  };

  // Calculate node positions in a circular layout
  const layoutNodes = useMemo(() => {
    if (!graphData?.nodes) return [];

    const nodes = graphData.nodes;
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    return nodes.map((node: any, index: number) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        ...node,
        x,
        y,
      };
    });
  }, [graphData]);

  const selectedScan = scans.find((s: any) => s.id === selectedScanId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Network className="w-6 h-6 text-indigo-500" />
                Graph Explorer
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Visualize SEO relationships and dependencies
              </p>
            </div>
          </div>
          <Link href="/">
            <Button className="bg-[rgb(70,95,255)] hover:bg-[rgb(60,85,245)]">
              <Network className="w-4 h-4 mr-2" />
              Run New Scan
            </Button>
          </Link>
        </div>

        {scans.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Scan</label>
            <select
              value={selectedScanId || ''}
              onChange={(e) => setSelectedScanId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {scans.map((scan: any) => (
                <option key={scan.id} value={scan.id}>
                  {scan.url} - {new Date(scan.created_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {graphData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Total Nodes</div>
                <div className="text-3xl font-bold text-gray-900">{graphData.nodes?.length || 0}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Total Edges</div>
                <div className="text-3xl font-bold text-gray-900">{graphData.edges?.length || 0}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Page URL</div>
                <div className="text-sm font-medium text-gray-900 truncate">{selectedScan?.url || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-sm text-gray-500 mb-1">Overall Score</div>
                <div className="text-3xl font-bold text-gray-900">{Math.round(((selectedScan?.seo_score || 0) + (selectedScan?.aeo_score || 0)) / 2)}</div>
              </div>
            </div>

            {/* Graph Visualization */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">SEO Relationship Graph</h3>
                <div className="text-sm text-gray-500">
                  Hover over nodes to see details
                </div>
              </div>

              <div className="relative bg-gray-50 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 600" className="w-full h-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                    </marker>
                  </defs>

                  {/* Render edges first (so they appear behind nodes) */}
                  {graphData.edges?.map((edge: any, index: number) => {
                    const sourceNode = layoutNodes.find((n: any) => n.id === edge.source);
                    const targetNode = layoutNodes.find((n: any) => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;

                    return (
                      <g key={`edge-${index}`}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="#cbd5e1"
                          strokeWidth="1.5"
                          markerEnd="url(#arrowhead)"
                          className="transition-all"
                        />
                      </g>
                    );
                  })}

                  {/* Render nodes */}
                  {layoutNodes.map((node: any) => {
                    const isHovered = hoveredNode === node.id;
                    const radius = isHovered ? 14 : 10;

                    return (
                      <g
                        key={node.id}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer transition-all"
                      >
                        {/* Node circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius}
                          fill={getNodeColor(node.type)}
                          stroke="white"
                          strokeWidth="2"
                          className="transition-all"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none',
                          }}
                        />

                        {/* Node label */}
                        <text
                          x={node.x}
                          y={node.y + radius + 16}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#374151"
                          fontWeight={isHovered ? 'bold' : 'normal'}
                          className="pointer-events-none"
                        >
                          {node.label?.length > 20 ? node.label.substring(0, 17) + '...' : node.label}
                        </text>

                        {/* Tooltip on hover */}
                        {isHovered && (
                          <g>
                            <rect
                              x={node.x - 80}
                              y={node.y - 50}
                              width="160"
                              height="35"
                              fill="white"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                              rx="6"
                              className="drop-shadow-lg"
                            />
                            <text
                              x={node.x}
                              y={node.y - 35}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#111827"
                              fontWeight="bold"
                            >
                              {getNodeIcon(node.type)} {node.type}
                            </text>
                            <text
                              x={node.x}
                              y={node.y - 20}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                            >
                              {node.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Node Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries({
                  page: 'Page',
                  metadata: 'Metadata',
                  heading: 'Heading',
                  link: 'Link',
                  image: 'Image',
                  schema: 'Schema',
                  keyword: 'Keyword',
                }).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getNodeColor(type) }}
                    />
                    <span className="text-sm text-gray-700">
                      {getNodeIcon(type)} {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Node Details */}
            {graphData.nodes && graphData.nodes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Node Details</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {graphData.nodes.map((node: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getNodeColor(node.type) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {getNodeIcon(node.type)} {node.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {node.type} • ID: {node.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Graph Data Yet</h3>
            <p className="text-gray-500 mb-6">
              {isLoading ? 'Loading scans...' : 'Run SEO scans from the homepage to visualize relationships'}
            </p>
            {!isLoading && (
              <Link href="/">
                <Button className="bg-[rgb(70,95,255)] hover:bg-[rgb(60,85,245)]">
                  <Network className="w-4 h-4 mr-2" />
                  Go to Homepage & Scan
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
