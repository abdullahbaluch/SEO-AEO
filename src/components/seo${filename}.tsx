import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  X,
  Info,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SiteGraphViewer({ graph, onExport }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filterDepth, setFilterDepth] = useState('all');

  // Get node color based on type and status
  const getNodeColor = (node) => {
    if (node.group === 'root') return '#6366f1';
    if (node.group === 'error') return '#ef4444';
    if (node.data?.seoScore >= 80) return '#10b981';
    if (node.data?.seoScore >= 60) return '#f59e0b';
    if (node.data?.seoScore) return '#ef4444';
    return '#10b981';
  };

  // Get node size based on connections
  const getNodeSize = (node) => {
    if (node.group === 'root') return 30;
    const connections = graph?.edges?.filter(
      e => e.source === node.id || e.target === node.id
    ).length || 0;
    return Math.min(25, Math.max(15, 12 + connections * 2));
  };

  // Initialize node positions using force-directed simulation
  useEffect(() => {
    if (!graph || !graph.nodes.length) return;

    const positions = {};
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes by depth
    const nodesByDepth = {};
    graph.nodes.forEach(node => {
      const depth = node.data?.depth ?? 0;
      if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
      nodesByDepth[depth].push(node);
    });

    // Position nodes in concentric circles by depth
    Object.entries(nodesByDepth).forEach(([depth, nodes]) => {
      const depthNum = parseInt(depth);
      const radius = depthNum === 0 ? 0 : 120 + depthNum * 100;
      const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);
      
      nodes.forEach((node, i) => {
        if (depthNum === 0) {
          positions[node.id] = { x: centerX, y: centerY };
        } else {
          const angle = i * angleStep - Math.PI / 2;
          positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          };
        }
      });
    });

    setNodePositions(positions);
  }, [graph]);

  // Filter nodes by depth
  const filteredNodes = graph?.nodes?.filter(node => {
    if (filterDepth === 'all') return true;
    return node.data?.depth === parseInt(filterDepth);
  }) || [];

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graph?.edges?.filter(
    e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  ) || [];

  // Draw graph on canvas
  useEffect(() => {
    if (!canvasRef.current || !graph || !Object.keys(nodePositions).length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Apply transform
    ctx.translate(width / 2 + transform.x, height / 2 + transform.y);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-400, -300);

    // Draw edges
    filteredEdges.forEach(edge => {
      const source = nodePositions[edge.source];
      const target = nodePositions[edge.target];
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      
      // Draw curved lines for better visibility
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const offset = 20;
      const controlX = midX + (Math.random() - 0.5) * offset;
      const controlY = midY + (Math.random() - 0.5) * offset;
      
      ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw arrow
      const angle = Math.atan2(target.y - controlY, target.x - controlX);
      const arrowSize = 6;
      ctx.beginPath();
      ctx.moveTo(target.x, target.y);
      ctx.lineTo(
        target.x - arrowSize * Math.cos(angle - Math.PI / 6),
        target.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        target.x - arrowSize * Math.cos(angle + Math.PI / 6),
        target.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fill();
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;

      const color = getNodeColor(node);
      const size = getNodeSize(node);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;

      // Node shadow
      ctx.beginPath();
      ctx.arc(pos.x + 2, pos.y + 2, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSelected || isHovered) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#1f2937';
      ctx.font = `${isSelected || isHovered ? 'bold ' : ''}11px Inter, sans-serif`;
      ctx.textAlign = 'center';
      const label = node.label?.length > 20 ? node.label.substring(0, 20) + '...' : node.label;
      ctx.fillText(label || '', pos.x, pos.y + size / 2 + 14);

      // Depth indicator
      if (node.data?.depth !== undefined) {
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`L${node.data.depth}`, pos.x, pos.y + size / 2 + 26);
      }
    });

    ctx.restore();
  }, [graph, nodePositions, transform, selectedNode, hoveredNode, filteredNodes, filteredEdges]);

  // Handle canvas interactions
  const getNodeAtPosition = useCallback((x, y) => {
    if (!canvasRef.current || !graph) return null;

    const canvas = canvasRef.current;
    const transformedX = (x - canvas.width / 2 - transform.x) / transform.scale + 400;
    const transformedY = (y - canvas.height / 2 - transform.y) / transform.scale + 300;

    for (const node of filteredNodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      const size = getNodeSize(node);
      const dist = Math.sqrt((pos.x - transformedX) ** 2 + (pos.y - transformedY) ** 2);
      if (dist < size / 2 + 5) {
        return node;
      }
    }
    return null;
  }, [graph, nodePositions, transform, filteredNodes]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);
    setSelectedNode(node);
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = getNodeAtPosition(x, y);
      setHoveredNode(node);
      canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    canvasRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    canvasRef.current.style.cursor = hoveredNode ? 'pointer' : 'grab';
  };

  const handleZoom = (direction) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(2, prev.scale + direction * 0.2)),
    }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 0.8 });
    setSelectedNode(null);
  };

  if (!graph || !graph.nodes?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No site graph data available</p>
        <p className="text-sm text-gray-400">Run a site crawl to generate the structure graph</p>
      </div>
    );
  }

  // Get unique depths for filter
  const depths = [...new Set(graph.nodes.map(n => n.data?.depth ?? 0))].sort();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom(1)}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleZoom(-1)}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <Select value={filterDepth} onValueChange={setFilterDepth}>
            <SelectTrigger className="w-32 h-8">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depths</SelectItem>
              {depths.map(d => (
                <SelectItem key={d} value={String(d)}>Level {d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredNodes.length} pages · {filteredEdges.length} links
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport?.('json')}>
            <Download className="w-4 h-4 mr-1" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('gexf')}>
            <Download className="w-4 h-4 mr-1" />
            GEXF
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gradient-to-br from-slate-50 to-gray-100" style={{ height: '500px' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-600 mb-2">Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Root Page</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Good SEO (80+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Needs Work (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Poor SEO (&lt;60)</span>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-sm">
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Total Pages:</span>
              <span className="font-semibold">{graph.nodes.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Total Links:</span>
              <span className="font-semibold">{graph.edges.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Max Depth:</span>
              <span className="font-semibold">{Math.max(...depths)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node details panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-gray-100 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getNodeColor(selectedNode) }}
                  />
                  <span className="font-medium text-gray-900">{selectedNode.label}</span>
                  {selectedNode.data?.depth !== undefined && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      Level {selectedNode.data.depth}
                    </span>
                  )}
                </div>
                <a 
                  href={selectedNode.data?.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {selectedNode.data?.url}
                </a>
                <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <div className="text-gray-500">SEO Score</div>
                    <div className="font-semibold">{selectedNode.data?.seoScore || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Internal Links</div>
                    <div className="font-semibold">{selectedNode.data?.internalLinks || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">External Links</div>
                    <div className="font-semibold">{selectedNode.data?.externalLinks || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className={`font-semibold ${selectedNode.data?.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {selectedNode.data?.status || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}