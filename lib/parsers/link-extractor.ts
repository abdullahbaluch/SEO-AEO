/**
 * Link Extractor - Categorize and analyze links from HTML
 * Handles internal, external, broken links, and link metrics
 */

export interface ExtractedLink {
  href: string;
  text: string;
  type: 'internal' | 'external';
  rel?: string;
  nofollow: boolean;
  target?: string;
}

export interface LinkAnalysis {
  internal: ExtractedLink[];
  external: ExtractedLink[];
  total: number;
  internalCount: number;
  externalCount: number;
  nofollowCount: number;
  brokenLinks: Array<{
    url: string;
    status: number;
    error?: string;
  }>;
}

/**
 * Extract and categorize all links from HTML
 */
export function extractLinks(html: string, baseUrl: string): LinkAnalysis {
  const links: ExtractedLink[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi;
  let match;

  // Parse base URL
  const base = new URL(baseUrl);
  const baseDomain = base.origin;

  while ((match = linkRegex.exec(html)) !== null) {
    const linkTag = match[0];
    const href = match[1];

    // Skip special protocols
    if (href.startsWith('javascript:') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('#')) {
      continue;
    }

    // Extract link attributes
    const textMatch = linkTag.match(/>([^<]+)</);
    const relMatch = linkTag.match(/rel=["']([^"']+)["']/i);
    const targetMatch = linkTag.match(/target=["']([^"']+)["']/i);

    const text = textMatch ? textMatch[1].trim() : '';
    const rel = relMatch ? relMatch[1] : undefined;
    const target = targetMatch ? targetMatch[1] : undefined;

    // Determine if nofollow
    const nofollow = rel?.includes('nofollow') || false;

    // Normalize URL
    const absoluteHref = normalizeUrl(href, baseUrl);

    // Determine if internal or external
    const type = absoluteHref.startsWith(baseDomain) ? 'internal' : 'external';

    links.push({
      href: absoluteHref,
      text,
      type,
      rel,
      nofollow,
      target,
    });
  }

  // Categorize links
  const internal = links.filter(link => link.type === 'internal');
  const external = links.filter(link => link.type === 'external');
  const nofollowCount = links.filter(link => link.nofollow).length;

  return {
    internal,
    external,
    total: links.length,
    internalCount: internal.length,
    externalCount: external.length,
    nofollowCount,
    brokenLinks: [],
  };
}

/**
 * Normalize URL (convert relative to absolute)
 */
function normalizeUrl(url: string, baseUrl: string): string {
  try {
    // If already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Convert relative to absolute
    const base = new URL(baseUrl);
    const absolute = new URL(url, base);

    // Remove hash
    absolute.hash = '';

    return absolute.href;
  } catch {
    return url;
  }
}

/**
 * Check if a link is broken (returns status code)
 */
export async function checkLink(url: string, timeout: number = 10000): Promise<{
  url: string;
  status: number;
  error?: string;
  redirected: boolean;
  finalUrl?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    return {
      url,
      status: response.status,
      redirected: response.redirected,
      finalUrl: response.redirected ? response.url : undefined,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { url, status: 0, error: 'Timeout', redirected: false };
    }
    return { url, status: 0, error: error.message, redirected: false };
  }
}

/**
 * Build internal link graph (who links to whom)
 */
export interface LinkGraph {
  nodes: Array<{
    id: string;
    url: string;
    incomingLinks: number;
    outgoingLinks: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    anchorText: string;
  }>;
}

/**
 * Build link graph from multiple pages
 */
export function buildLinkGraph(
  pages: Array<{url: string; links: ExtractedLink[]}>
): LinkGraph {
  const nodes = new Map<string, {url: string; incoming: number; outgoing: number}>();
  const edges: Array<{source: string; target: string; anchorText: string}> = [];

  // Initialize nodes
  for (const page of pages) {
    if (!nodes.has(page.url)) {
      nodes.set(page.url, { url: page.url, incoming: 0, outgoing: 0 });
    }
  }

  // Build edges
  for (const page of pages) {
    const sourceNode = nodes.get(page.url);
    if (!sourceNode) continue;

    for (const link of page.links) {
      if (link.type !== 'internal') continue;

      // Initialize target node if not exists
      if (!nodes.has(link.href)) {
        nodes.set(link.href, { url: link.href, incoming: 0, outgoing: 0 });
      }

      const targetNode = nodes.get(link.href);
      if (!targetNode) continue;

      // Update link counts
      sourceNode.outgoing++;
      targetNode.incoming++;

      // Add edge
      edges.push({
        source: page.url,
        target: link.href,
        anchorText: link.text,
      });
    }
  }

  // Convert to array format
  const nodeArray = Array.from(nodes.entries()).map(([id, data]) => ({
    id,
    url: data.url,
    incomingLinks: data.incoming,
    outgoingLinks: data.outgoing,
  }));

  return {
    nodes: nodeArray,
    edges,
  };
}

/**
 * Find orphan pages (pages with no incoming internal links)
 */
export function findOrphanPages(graph: LinkGraph): string[] {
  return graph.nodes
    .filter(node => node.incomingLinks === 0)
    .map(node => node.url);
}

/**
 * Calculate link metrics for a page
 */
export interface LinkMetrics {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  nofollowLinks: number;
  internalFollowRatio: number; // % of internal links that are follow
  externalFollowRatio: number;
  linkDensity: number; // links per 100 words
}

export function calculateLinkMetrics(
  links: ExtractedLink[],
  wordCount: number
): LinkMetrics {
  const internal = links.filter(l => l.type === 'internal');
  const external = links.filter(l => l.type === 'external');
  const internalNofollow = internal.filter(l => l.nofollow).length;
  const externalNofollow = external.filter(l => l.nofollow).length;

  return {
    totalLinks: links.length,
    internalLinks: internal.length,
    externalLinks: external.length,
    nofollowLinks: links.filter(l => l.nofollow).length,
    internalFollowRatio: internal.length > 0
      ? ((internal.length - internalNofollow) / internal.length) * 100
      : 0,
    externalFollowRatio: external.length > 0
      ? ((external.length - externalNofollow) / external.length) * 100
      : 0,
    linkDensity: wordCount > 0 ? (links.length / wordCount) * 100 : 0,
  };
}
