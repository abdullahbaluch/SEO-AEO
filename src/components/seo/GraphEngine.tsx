import React from 'react';

// Graph Engine - Build relationship graphs from scan data
export const GraphEngine = {
  // Build a complete graph from scan results
  buildGraph: (scanData) => {
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    // Page node (root)
    const pageNode = {
      id: `node_${nodeId++}`,
      type: 'page',
      label: scanData.metadata?.title || scanData.url || 'Page',
      group: 'page',
      data: {
        url: scanData.url,
        title: scanData.metadata?.title,
        seoScore: scanData.scores?.overall,
      },
    };
    nodes.push(pageNode);

    // Score nodes
    const scoreCategories = [
      { key: 'metadata', label: 'Metadata', score: scanData.scores?.metadata },
      { key: 'schema', label: 'Schema', score: scanData.scores?.schema },
      { key: 'content', label: 'Content', score: scanData.scores?.content },
      { key: 'links', label: 'Links', score: scanData.scores?.links },
      { key: 'images', label: 'Images', score: scanData.scores?.images },
      { key: 'accessibility', label: 'Accessibility', score: scanData.scores?.accessibility },
      { key: 'performance', label: 'Performance', score: scanData.scores?.performance },
      { key: 'aeo', label: 'AEO', score: scanData.scores?.aeo },
    ];

    scoreCategories.forEach(cat => {
      if (cat.score !== undefined) {
        const scoreNode = {
          id: `node_${nodeId++}`,
          type: 'score',
          label: `${cat.label}: ${cat.score}`,
          group: cat.key,
          data: {
            category: cat.key,
            score: cat.score,
            severity: cat.score >= 80 ? 'good' : cat.score >= 60 ? 'warning' : 'critical',
          },
        };
        nodes.push(scoreNode);
        edges.push({
          source: pageNode.id,
          target: scoreNode.id,
          type: 'has_score',
          label: 'scores',
        });
      }
    });

    // Issue nodes
    if (scanData.issues) {
      scanData.issues.forEach((issue, idx) => {
        const issueNode = {
          id: `node_${nodeId++}`,
          type: 'issue',
          label: issue.title,
          group: issue.severity,
          data: {
            ...issue,
            index: idx,
          },
        };
        nodes.push(issueNode);

        // Connect to relevant score node
        const scoreNode = nodes.find(n => n.type === 'score' && n.data.category === issue.category);
        if (scoreNode) {
          edges.push({
            source: scoreNode.id,
            target: issueNode.id,
            type: 'has_issue',
            label: issue.severity,
          });
        } else {
          edges.push({
            source: pageNode.id,
            target: issueNode.id,
            type: 'has_issue',
            label: issue.severity,
          });
        }
      });
    }

    // Heading nodes
    if (scanData.headings) {
      const headingParent = {
        id: `node_${nodeId++}`,
        type: 'heading_group',
        label: 'Headings',
        group: 'structure',
      };
      nodes.push(headingParent);
      edges.push({
        source: pageNode.id,
        target: headingParent.id,
        type: 'has_structure',
      });

      scanData.headings.slice(0, 10).forEach(heading => {
        const headingNode = {
          id: `node_${nodeId++}`,
          type: 'heading',
          label: `H${heading.level}: ${heading.text.substring(0, 30)}${heading.text.length > 30 ? '...' : ''}`,
          group: `h${heading.level}`,
          data: heading,
        };
        nodes.push(headingNode);
        edges.push({
          source: headingParent.id,
          target: headingNode.id,
          type: 'contains',
        });
      });
    }

    // Schema nodes
    if (scanData.schemas && scanData.schemas.length > 0) {
      scanData.schemas.forEach(schema => {
        const schemaNode = {
          id: `node_${nodeId++}`,
          type: 'schema',
          label: schema.type,
          group: 'schema',
          data: schema,
        };
        nodes.push(schemaNode);
        edges.push({
          source: pageNode.id,
          target: schemaNode.id,
          type: 'has_schema',
        });
      });
    }

    // Keyword nodes
    if (scanData.keywords && scanData.keywords.length > 0) {
      const keywordParent = {
        id: `node_${nodeId++}`,
        type: 'keyword_group',
        label: 'Keywords',
        group: 'keywords',
      };
      nodes.push(keywordParent);
      edges.push({
        source: pageNode.id,
        target: keywordParent.id,
        type: 'has_keywords',
      });

      scanData.keywords.slice(0, 8).forEach(kw => {
        const kwNode = {
          id: `node_${nodeId++}`,
          type: 'keyword',
          label: `${kw.word} (${kw.count})`,
          group: 'keyword',
          data: kw,
        };
        nodes.push(kwNode);
        edges.push({
          source: keywordParent.id,
          target: kwNode.id,
          type: 'contains',
        });
      });
    }

    // Link nodes (sample)
    if (scanData.links && scanData.links.length > 0) {
      const linkParent = {
        id: `node_${nodeId++}`,
        type: 'link_group',
        label: `Links (${scanData.links.length})`,
        group: 'links',
      };
      nodes.push(linkParent);
      edges.push({
        source: pageNode.id,
        target: linkParent.id,
        type: 'has_links',
      });

      const internalLinks = scanData.links.filter(l => l.isInternal).slice(0, 5);
      const externalLinks = scanData.links.filter(l => !l.isInternal).slice(0, 5);

      [...internalLinks, ...externalLinks].forEach(link => {
        const linkNode = {
          id: `node_${nodeId++}`,
          type: link.isInternal ? 'internal_link' : 'external_link',
          label: link.text?.substring(0, 25) || link.href?.substring(0, 25) || 'Link',
          group: link.isInternal ? 'internal' : 'external',
          data: link,
        };
        nodes.push(linkNode);
        edges.push({
          source: linkParent.id,
          target: linkNode.id,
          type: link.isInternal ? 'internal_to' : 'external_to',
        });
      });
    }

    return { nodes, edges };
  },

  // Convert graph to JSON export format
  graphToJSON: (graph) => {
    return JSON.stringify(graph, null, 2);
  },

  // Export to GEXF format (Gephi)
  exportToGEXF: (graph) => {
    const nodeAttrs = graph.nodes.map(n => `
      <node id="${n.id}" label="${escapeXml(n.label)}">
        <attvalues>
          <attvalue for="type" value="${n.type}"/>
          <attvalue for="group" value="${n.group || ''}"/>
        </attvalues>
      </node>`).join('');

    const edgeAttrs = graph.edges.map((e, i) => `
      <edge id="e${i}" source="${e.source}" target="${e.target}" label="${e.type}"/>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <meta>
    <creator>SEO Toolkit</creator>
    <description>SEO Analysis Graph</description>
  </meta>
  <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
      <attribute id="type" title="Type" type="string"/>
      <attribute id="group" title="Group" type="string"/>
    </attributes>
    <nodes>${nodeAttrs}
    </nodes>
    <edges>${edgeAttrs}
    </edges>
  </graph>
</gexf>`;
  },

  // Export to GraphML format
  exportToGraphML: (graph) => {
    const nodeAttrs = graph.nodes.map(n => `
    <node id="${n.id}">
      <data key="label">${escapeXml(n.label)}</data>
      <data key="type">${n.type}</data>
      <data key="group">${n.group || ''}</data>
    </node>`).join('');

    const edgeAttrs = graph.edges.map((e, i) => `
    <edge id="e${i}" source="${e.source}" target="${e.target}">
      <data key="edgetype">${e.type}</data>
    </edge>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="group" for="node" attr.name="group" attr.type="string"/>
  <key id="edgetype" for="edge" attr.name="edgetype" attr.type="string"/>
  <graph id="G" edgedefault="directed">${nodeAttrs}${edgeAttrs}
  </graph>
</graphml>`;
  },

  // Get node colors based on type/severity
  getNodeColor: (node) => {
    const colors = {
      page: '#1f2937',
      score: node.data?.severity === 'good' ? '#10b981' :
             node.data?.severity === 'warning' ? '#f59e0b' : '#ef4444',
      issue: node.group === 'critical' ? '#ef4444' :
             node.group === 'warning' ? '#f59e0b' :
             node.group === 'info' ? '#3b82f6' : '#10b981',
      heading: '#4b5563',
      heading_group: '#374151',
      schema: '#6b7280',
      keyword: '#4b5563',
      keyword_group: '#374151',
      link_group: '#6b7280',
      internal_link: '#10b981',
      external_link: '#f59e0b',
    };
    return colors[node.type] || '#94a3b8';
  },

  // Get node size based on type
  getNodeSize: (node) => {
    const sizes = {
      page: 40,
      score: 30,
      issue: 20,
      heading_group: 25,
      heading: 15,
      schema: 25,
      keyword_group: 25,
      keyword: 15,
      link_group: 25,
      internal_link: 12,
      external_link: 12,
    };
    return sizes[node.type] || 15;
  },

  // Convert to vis.js format
  toVisFormat: (graph) => {
    const nodes = graph.nodes.map(n => ({
      id: n.id,
      label: n.label,
      color: GraphEngine.getNodeColor(n),
      size: GraphEngine.getNodeSize(n),
      title: n.data ? JSON.stringify(n.data, null, 2) : n.label,
      shape: n.type === 'page' ? 'diamond' : 
             n.type === 'issue' ? 'triangle' : 
             n.type === 'schema' ? 'hexagon' : 'dot',
      font: { size: 12, color: '#1f2937' },
    }));

    const edges = graph.edges.map((e, i) => ({
      id: `edge_${i}`,
      from: e.source,
      to: e.target,
      label: e.label || '',
      arrows: 'to',
      color: { color: '#94a3b8', opacity: 0.6 },
      font: { size: 10, color: '#6b7280' },
    }));

    return { nodes, edges };
  },
};

// Helper to escape XML special characters
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default GraphEngine;