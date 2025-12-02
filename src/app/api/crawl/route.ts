import { NextRequest, NextResponse } from 'next/server';

interface CrawlOptions {
  startUrl: string;
  maxPages?: number;
  maxDepth?: number;
  checkExternal?: boolean;
}

interface CrawledPage {
  url: string;
  title: string;
  depth: number;
  status: number;
  statusText: string;
  loadTime: number;
  error?: string;
  html?: string;
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: {url: string; status: number; error?: string}[];
  redirects: {from: string; to: string}[];
}

export async function POST(request: NextRequest) {
  try {
    const options: CrawlOptions = await request.json();
    const {
      startUrl,
      maxPages = 20,
      maxDepth = 3,
      checkExternal = false,
    } = options;

    if (!startUrl) {
      return NextResponse.json(
        { error: 'startUrl is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let baseUrl: URL;
    try {
      baseUrl = new URL(startUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const crawledPages: CrawledPage[] = [];
    const visitedUrls = new Set<string>();
    const queue: Array<{url: string; depth: number}> = [{ url: startUrl, depth: 0 }];
    const baseDomain = baseUrl.origin;

    // Helper: Normalize URL
    const normalizeUrl = (url: string, base: string): string | null => {
      try {
        if (url.startsWith('#') || url.startsWith('javascript:') ||
            url.startsWith('mailto:') || url.startsWith('tel:')) {
          return null;
        }
        const absolute = new URL(url, base);
        absolute.hash = '';
        return absolute.href;
      } catch {
        return null;
      }
    };

    // Helper: Extract links from HTML
    const extractLinks = (html: string, pageUrl: string): {internal: string[]; external: string[]} => {
      const internal: Set<string> = new Set();
      const external: Set<string> = new Set();

      // Simple regex to find hrefs (not perfect but works for most cases)
      const hrefRegex = /href=["']([^"']+)["']/gi;
      let match;

      while ((match = hrefRegex.exec(html)) !== null) {
        const normalized = normalizeUrl(match[1], pageUrl);
        if (!normalized) continue;

        if (normalized.startsWith(baseDomain)) {
          internal.add(normalized);
        } else {
          external.add(normalized);
        }
      }

      return {
        internal: Array.from(internal),
        external: Array.from(external),
      };
    };

    // Helper: Check if link is broken
    const checkLink = async (url: string): Promise<{status: number; error?: string}> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
          },
        });

        clearTimeout(timeoutId);
        return { status: response.status };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return { status: 0, error: 'Timeout' };
        }
        return { status: 0, error: error.message };
      }
    };

    // Main crawl loop
    while (queue.length > 0 && crawledPages.length < maxPages) {
      const { url, depth } = queue.shift()!;

      if (visitedUrls.has(url) || depth > maxDepth) {
        continue;
      }

      visitedUrls.add(url);

      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
          },
          redirect: 'follow',
        });

        clearTimeout(timeoutId);
        const loadTime = Date.now() - startTime;
        const html = await response.text();
        const finalUrl = response.url;

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'No Title';

        // Extract links
        const { internal, external } = extractLinks(html, finalUrl);

        // Check for broken internal links (sample check)
        const brokenLinks: {url: string; status: number; error?: string}[] = [];
        const linksToCheck = internal.slice(0, 10); // Check first 10 to avoid too many requests

        for (const link of linksToCheck) {
          if (!visitedUrls.has(link)) {
            const checkResult = await checkLink(link);
            if (checkResult.status >= 400 || checkResult.status === 0) {
              brokenLinks.push({ url: link, ...checkResult });
            }
          }
        }

        // Track redirects
        const redirects = response.redirected
          ? [{ from: url, to: finalUrl }]
          : [];

        const pageData: CrawledPage = {
          url: finalUrl,
          title,
          depth,
          status: response.status,
          statusText: response.statusText,
          loadTime,
          html,
          internalLinks: internal,
          externalLinks: external,
          brokenLinks,
          redirects,
        };

        crawledPages.push(pageData);

        // Add internal links to queue
        if (depth < maxDepth) {
          internal.forEach(link => {
            if (!visitedUrls.has(link)) {
              queue.push({ url: link, depth: depth + 1 });
            }
          });
        }

      } catch (error: any) {
        crawledPages.push({
          url,
          title: 'Error',
          depth,
          status: 0,
          statusText: 'Failed',
          loadTime: 0,
          error: error.message,
          internalLinks: [],
          externalLinks: [],
          brokenLinks: [],
          redirects: [],
        });
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate summary statistics
    const summary = {
      totalPages: crawledPages.length,
      successfulPages: crawledPages.filter(p => p.status >= 200 && p.status < 300).length,
      failedPages: crawledPages.filter(p => p.status >= 400 || p.status === 0).length,
      redirectedPages: crawledPages.filter(p => p.redirects.length > 0).length,
      totalBrokenLinks: crawledPages.reduce((sum, p) => sum + p.brokenLinks.length, 0),
      avgLoadTime: crawledPages.reduce((sum, p) => sum + p.loadTime, 0) / crawledPages.length,
      totalInternalLinks: new Set(crawledPages.flatMap(p => p.internalLinks)).size,
      totalExternalLinks: new Set(crawledPages.flatMap(p => p.externalLinks)).size,
    };

    return NextResponse.json({
      success: true,
      startUrl,
      pages: crawledPages.map(p => ({
        ...p,
        html: undefined, // Don't send HTML in summary, too large
      })),
      summary,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Crawl failed: ${error.message}` },
      { status: 500 }
    );
  }
}
