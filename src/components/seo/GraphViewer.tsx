import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphEngine } from './GraphEngine';

export default function GraphViewer({ graph, onExport }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});

  // Initialize node positions using force-directed layout simulation
  useEffect(() => {
    if (!graph || !graph.nodes.length) return;

    const positions = {};
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Simple radial layout
    const nodesByType = {};
    graph.nodes.forEach(node => {
      if (!nodesByType[node.type]) nodesByType[node.type] = [];
      nodesByType[node.type].push(node);
    });

    // Position page node at center
    const pageNodes = nodesByType.page || [];
    pageNodes.forEach(node => {
      positions[node.id] = { x: centerX, y: centerY };
    });

    // Position other nodes in rings
    const rings = [
      { types: ['score'], radius: 150 },
      { types: ['heading_group', 'keyword_group', 'link_group', 'schema'], radius: 250 },
      { types: ['issue'], radius: 350 },
      { types: ['heading', 'keyword', 'internal_link', 'external_link'], radius: 450 },
    ];

    rings.forEach(ring => {
      const nodesInRing = ring.types.flatMap(type => nodesByType[type] || []);
      const angleStep = (2 * Math.PI) / Math.max(nodesInRing.length, 1);
      nodesInRing.forEach((node, i) => {
        const angle = i * angleStep - Math.PI / 2;
        positions[node.id] = {
          x: centerX + ring.radius * Math.cos(angle),
          y: centerY + ring.radius * Math.sin(angle),
        };
      });
    });

    setNodePositions(positions);
    setTransform({ x: 0, y: 0, scale: 0.6 });
  }, [graph]);

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
    graph.edges.forEach(edge => {
      const source = nodePositions[edge.source];
      const target = nodePositions[edge.target];
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw nodes
    graph.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;

      const color = GraphEngine.getNodeColor(node);
      const size = GraphEngine.getNodeSize(node);
      const isSelected = selectedNode?.id === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label;
      ctx.fillText(label, pos.x, pos.y + size / 2 + 12);
    });

    ctx.restore();
  }, [graph, nodePositions, transform, selectedNode]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    if (!canvasRef.current || !graph) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Transform click coordinates
    const transformedX = (x - canvas.width / 2 - transform.x) / transform.scale + 400;
    const transformedY = (y - canvas.height / 2 - transform.y) / transform.scale + 300;

    // Find clicked node
    let clickedNode = null;
    graph.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      const size = GraphEngine.getNodeSize(node);
      const dist = Math.sqrt((pos.x - transformedX) ** 2 + (pos.y - transformedY) ** 2);
      if (dist < size / 2) {
        clickedNode = node;
      }
    });

    setSelectedNode(clickedNode);
  }, [graph, nodePositions, transform]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoom = (direction) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(2, prev.scale + direction * 0.2)),
    }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 0.6 });
    setSelectedNode(null);
  };

  if (!graph || !graph.nodes.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No graph data available</p>
        <p className="text-sm text-gray-400">Run a scan to generate the relationship graph</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(1)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-1)}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {graph.nodes.length} nodes · {graph.edges.length} edges
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.('json')}
          >
            <Download className="w-4 h-4 mr-1" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.('gexf')}
          >
            <Download className="w-4 h-4 mr-1" />
            GEXF
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative bg-gray-50"
        style={{ height: '500px' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-600 mb-2">Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Page</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Good Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Heading</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500" />
              <span>Schema</span>
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
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: GraphEngine.getNodeColor(selectedNode) }}
                  />
                  <span className="font-medium text-gray-900">{selectedNode.label}</span>
                </div>
                <div className="text-sm text-gray-500">Type: {selectedNode.type}</div>
                {selectedNode.data && (
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedNode.data, null, 2)}
                  </pre>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}