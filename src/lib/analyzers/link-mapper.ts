/**
 * Internal Link Mapper - Map internal link structure
 * Builds a graph of internal links, finds orphan pages, analyzes link distribution
 */

import { buildLinkGraph, findOrphanPages, extractLinks } from '../parsers/link-extractor';
import type {
  LinkMapRequest,
  LinkMapResult,
  LinkNode,
  LinkEdge,
} from '@/types/modules';

/**
 * Map internal link structure of a website
 */
export async function mapLinks(request: LinkMapRequest): Promise<LinkMapResult> {
  const { startUrl, maxDepth = 3, maxPages = 50 } = request;

  // Crawl the website
  const pages = await crawlWebsite(startUrl, maxDepth, maxPages);

  // Build link graph
  const graph = buildLinkGraph(pages);

  // Find orphan pages
  const orphanPages = findOrphanPages(graph);

  // Calculate statistics
  const stats = calculateLinkStats(graph);

  // Enhance nodes with additional info
  const enhancedNodes: LinkNode[] = graph.nodes.map(node => {
    const page = pages.find(p => p.url === node.url);
    return {
      id: node.id,
      url: node.url,
      title: page?.title || 'Unknown',
      depth: page?.depth || 0,
      incomingLinks: node.incomingLinks,
      outgoingLinks: node.outgoingLinks,
      isOrphan: orphanPages.includes(node.url),
      pageType: classifyPageType(node.url),
    };
  });

  // Format edges
  const edges: LinkEdge[] = graph.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    anchorText: edge.anchorText,
    type: 'internal',
  }));

  return {
    nodes: enhancedNodes,
    edges,
    orphanPages,
    stats,
  };
}

/**
 * Crawl website to discover pages and links
 */
async function crawlWebsite(
  startUrl: string,
  maxDepth: number,
  maxPages: number
): Promise<Array<{url: string; title: string; depth: number; links: any[]}>> {
  const pages: Array<{url: string; title: string; depth: number; links: any[]}> = [];
  const visited = new Set<string>();
  const queue: Array<{url: string; depth: number}> = [{ url: startUrl, depth: 0 }];

  const baseUrl = new URL(startUrl);
  const baseDomain = baseUrl.origin;

  while (queue.length > 0 && pages.length < maxPages) {
    const { url, depth } = queue.shift()!;

    if (visited.has(url) || depth > maxDepth) {
      continue;
    }

    visited.add(url);

    try {
      // Fetch page
      const html = await fetchPage(url);

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'No Title';

      // Extract links
      const linkAnalysis = extractLinks(html, url);

      // Add page
      pages.push({
        url,
        title,
        depth,
        links: linkAnalysis.internal,
      });

      // Add internal links to queue
      if (depth < maxDepth) {
        linkAnalysis.internal.forEach(link => {
          if (!visited.has(link.href) && link.href.startsWith(baseDomain)) {
            queue.push({ url: link.href, depth: depth + 1 });
          }
        });
      }

      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    }
  }

  return pages;
}

/**
 * Fetch page HTML
 */
async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Calculate link statistics
 */
function calculateLinkStats(graph: any): {
  totalPages: number;
  totalLinks: number;
  avgLinksPerPage: number;
  maxDepth: number;
} {
  const totalPages = graph.nodes.length;
  const totalLinks = graph.edges.length;
  const avgLinksPerPage = totalPages > 0 ? totalLinks / totalPages : 0;

  // Find max depth (would need depth info from crawl)
  const maxDepth = 0; // Placeholder

  return {
    totalPages,
    totalLinks,
    avgLinksPerPage: Math.round(avgLinksPerPage * 10) / 10,
    maxDepth,
  };
}

/**
 * Classify page type based on URL
 */
function classifyPageType(url: string): string {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('/blog/') || urlLower.includes('/article/')) {
    return 'blog';
  }
  if (urlLower.includes('/product/') || urlLower.includes('/shop/')) {
    return 'product';
  }
  if (urlLower.includes('/category/')) {
    return 'category';
  }
  if (urlLower.includes('/about') || urlLower.includes('/contact')) {
    return 'information';
  }
  if (urlLower.endsWith('/') || urlLower.match(/\/$/) || urlLower === new URL(url).origin) {
    return 'homepage';
  }

  return 'page';
}

/**
 * Analyze link distribution
 */
export interface LinkDistribution {
  wellLinked: LinkNode[]; // Pages with good internal linking
  underLinked: LinkNode[]; // Pages with few incoming links
  overLinked: LinkNode[]; // Pages with too many outgoing links
  hubs: LinkNode[]; // Pages with many outgoing links (navigation pages)
  authorities: LinkNode[]; // Pages with many incoming links (important content)
}

export function analyzeLinkDistribution(nodes: LinkNode[]): LinkDistribution {
  // Calculate thresholds
  const avgIncoming = nodes.reduce((sum, n) => sum + n.incomingLinks, 0) / nodes.length;
  const avgOutgoing = nodes.reduce((sum, n) => sum + n.outgoingLinks, 0) / nodes.length;

  return {
    wellLinked: nodes.filter(n =>
      n.incomingLinks >= avgIncoming * 0.5 &&
      n.outgoingLinks >= avgOutgoing * 0.5 &&
      n.outgoingLinks <= avgOutgoing * 2
    ),
    underLinked: nodes.filter(n => n.incomingLinks < avgIncoming * 0.3),
    overLinked: nodes.filter(n => n.outgoingLinks > avgOutgoing * 3),
    hubs: nodes.filter(n => n.outgoingLinks > avgOutgoing * 2),
    authorities: nodes.filter(n => n.incomingLinks > avgIncoming * 2),
  };
}

/**
 * Suggest internal linking opportunities
 */
export interface LinkSuggestion {
  fromPage: string;
  toPage: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export function suggestInternalLinks(
  nodes: LinkNode[],
  edges: LinkEdge[]
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];

  // Find orphan pages that need links
  const orphans = nodes.filter(n => n.isOrphan);

  orphans.forEach(orphan => {
    // Suggest linking from pages of same type
    const sametype = nodes.filter(n =>
      n.pageType === orphan.pageType &&
      n.url !== orphan.url &&
      !n.isOrphan
    );

    if (sametype.length > 0) {
      suggestions.push({
        fromPage: sametype[0].url,
        toPage: orphan.url,
        reason: `Link to orphan page from similar ${orphan.pageType} page`,
        priority: 'high',
      });
    }
  });

  // Find under-linked important pages
  const underLinked = nodes.filter(n =>
    n.incomingLinks < 2 &&
    !n.isOrphan &&
    n.pageType !== 'homepage'
  );

  underLinked.forEach(page => {
    // Suggest linking from hub pages
    const hubs = nodes.filter(n =>
      n.outgoingLinks > 5 &&
      n.url !== page.url
    );

    if (hubs.length > 0) {
      suggestions.push({
        fromPage: hubs[0].url,
        toPage: page.url,
        reason: `Increase visibility of under-linked ${page.pageType}`,
        priority: 'medium',
      });
    }
  });

  return suggestions.slice(0, 10); // Return top 10 suggestions
}
