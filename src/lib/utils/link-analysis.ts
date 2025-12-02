/**
 * Link Analysis Utilities
 * Provides broken link detection, redirect chain analysis, and PageRank calculations
 */

export interface LinkCheckResult {
  url: string;
  status: number;
  statusText: string;
  redirects: number;
  redirectChain: string[];
  broken: boolean;
  responseTime: number;
}

export interface PageRankResult {
  url: string;
  pageRank: number;
  incomingLinks: number;
  outgoingLinks: number;
  depth: number;
}

export interface LinkGraphNode {
  url: string;
  links: string[];
  pageRank?: number;
  depth?: number;
}

/**
 * Check if a link is broken or has redirect chains
 */
export async function checkLink(url: string, followRedirects = true): Promise<LinkCheckResult> {
  const startTime = Date.now();
  const redirectChain: string[] = [url];
  let currentUrl = url;
  let redirectCount = 0;
  let status = 0;
  let statusText = '';

  try {
    // Follow redirects manually to track the chain
    while (redirectCount < 10) {
      const response = await fetch(currentUrl, {
        method: 'HEAD', // Use HEAD to avoid downloading full content
        redirect: 'manual', // Don't auto-follow redirects
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit/1.0)',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      status = response.status;
      statusText = response.statusText;

      // Check if it's a redirect
      if (status >= 300 && status < 400 && response.headers.get('location')) {
        const location = response.headers.get('location')!;
        const nextUrl = new URL(location, currentUrl).href;
        redirectChain.push(nextUrl);
        currentUrl = nextUrl;
        redirectCount++;

        if (!followRedirects) break;
      } else {
        // Not a redirect, we're done
        break;
      }
    }

    const responseTime = Date.now() - startTime;
    const broken = status >= 400 || status === 0;

    return {
      url,
      status,
      statusText,
      redirects: redirectCount,
      redirectChain,
      broken,
      responseTime,
    };
  } catch (error: any) {
    return {
      url,
      status: 0,
      statusText: error.message || 'Network error',
      redirects: redirectCount,
      redirectChain,
      broken: true,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Batch check multiple links in parallel
 */
export async function checkLinks(
  urls: string[],
  maxConcurrent = 5
): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = [];

  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map(url => checkLink(url))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // If check failed, mark as broken
        results.push({
          url: batch[index],
          status: 0,
          statusText: 'Check failed',
          redirects: 0,
          redirectChain: [batch[index]],
          broken: true,
          responseTime: 0,
        });
      }
    });
  }

  return results;
}

/**
 * Calculate PageRank for a graph of pages
 * Simplified implementation of the PageRank algorithm
 */
export function calculatePageRank(
  nodes: LinkGraphNode[],
  dampingFactor = 0.85,
  iterations = 20,
  tolerance = 0.0001
): Map<string, number> {
  const pageRank = new Map<string, number>();
  const outgoingLinks = new Map<string, number>();

  // Initialize PageRank and count outgoing links
  nodes.forEach(node => {
    pageRank.set(node.url, 1.0 / nodes.length);
    outgoingLinks.set(node.url, node.links.length || 1); // Avoid division by zero
  });

  // Create incoming links map
  const incomingLinks = new Map<string, string[]>();
  nodes.forEach(node => {
    node.links.forEach(link => {
      if (!incomingLinks.has(link)) {
        incomingLinks.set(link, []);
      }
      incomingLinks.get(link)!.push(node.url);
    });
  });

  // Iterative calculation
  for (let iter = 0; iter < iterations; iter++) {
    const newPageRank = new Map<string, number>();
    let maxDiff = 0;

    nodes.forEach(node => {
      const url = node.url;
      let rank = (1 - dampingFactor) / nodes.length;

      // Sum contributions from incoming links
      const incoming = incomingLinks.get(url) || [];
      incoming.forEach(incomingUrl => {
        const incomingRank = pageRank.get(incomingUrl) || 0;
        const incomingOutgoing = outgoingLinks.get(incomingUrl) || 1;
        rank += dampingFactor * (incomingRank / incomingOutgoing);
      });

      newPageRank.set(url, rank);

      // Track convergence
      const oldRank = pageRank.get(url) || 0;
      maxDiff = Math.max(maxDiff, Math.abs(rank - oldRank));
    });

    // Update PageRank
    newPageRank.forEach((rank, url) => {
      pageRank.set(url, rank);
    });

    // Check for convergence
    if (maxDiff < tolerance) {
      break;
    }
  }

  // Normalize to 0-100 scale
  const values = Array.from(pageRank.values());
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const normalized = new Map<string, number>();
  pageRank.forEach((rank, url) => {
    const normalizedRank = ((rank - min) / range) * 100;
    normalized.set(url, Math.round(normalizedRank * 100) / 100);
  });

  return normalized;
}

/**
 * Calculate click depth (distance from root) using BFS
 */
export function calculateClickDepth(
  nodes: LinkGraphNode[],
  rootUrl: string
): Map<string, number> {
  const depth = new Map<string, number>();
  const queue: { url: string; d: number }[] = [{ url: rootUrl, d: 0 }];
  const visited = new Set<string>();

  // Create adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach(node => {
    adjacency.set(node.url, node.links);
  });

  while (queue.length > 0) {
    const { url, d } = queue.shift()!;

    if (visited.has(url)) continue;
    visited.add(url);
    depth.set(url, d);

    const links = adjacency.get(url) || [];
    links.forEach(link => {
      if (!visited.has(link)) {
        queue.push({ url: link, d: d + 1 });
      }
    });
  }

  // Set unvisited nodes to maximum depth
  nodes.forEach(node => {
    if (!depth.has(node.url)) {
      depth.set(node.url, 999);
    }
  });

  return depth;
}

/**
 * Build complete link graph analysis with PageRank and depth
 */
export function analyzeLinkGraph(
  nodes: LinkGraphNode[],
  rootUrl: string
): PageRankResult[] {
  const pageRanks = calculatePageRank(nodes);
  const depths = calculateClickDepth(nodes, rootUrl);

  // Count incoming links
  const incomingCount = new Map<string, number>();
  nodes.forEach(node => {
    node.links.forEach(link => {
      incomingCount.set(link, (incomingCount.get(link) || 0) + 1);
    });
  });

  return nodes.map(node => ({
    url: node.url,
    pageRank: pageRanks.get(node.url) || 0,
    incomingLinks: incomingCount.get(node.url) || 0,
    outgoingLinks: node.links.length,
    depth: depths.get(node.url) || 999,
  }));
}

/**
 * Find orphan pages (pages with no incoming links)
 */
export function findOrphanPages(nodes: LinkGraphNode[]): string[] {
  const hasIncomingLink = new Set<string>();

  nodes.forEach(node => {
    node.links.forEach(link => {
      hasIncomingLink.add(link);
    });
  });

  return nodes
    .filter(node => !hasIncomingLink.has(node.url))
    .map(node => node.url);
}

/**
 * Find broken link chains (pages that only link to broken pages)
 */
export function findDeadEnds(
  nodes: LinkGraphNode[],
  brokenLinks: Set<string>
): string[] {
  return nodes
    .filter(node => {
      const outgoing = node.links;
      if (outgoing.length === 0) return false;
      return outgoing.every(link => brokenLinks.has(link));
    })
    .map(node => node.url);
}
