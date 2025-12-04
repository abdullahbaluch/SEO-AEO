/**
 * Site Crawler Engine
 * Crawls websites and analyzes page structure with live progress tracking
 */

export interface CrawledPage {
  url: string;
  title: string;
  statusCode: number;
  depth: number;
  parentUrl: string | null;
  links: string[];
  internalLinks: number;
  externalLinks: number;
  images: number;
  h1Count: number;
  metaDescription: string;
  wordCount: number;
  issues: string[];
  crawledAt: Date;
}

export interface CrawlProgress {
  current: number;
  total: number;
  currentUrl: string;
  status: 'idle' | 'crawling' | 'completed' | 'error';
}

export interface CrawlResult {
  pages: CrawledPage[];
  sitemapFound: boolean;
  robotsFound: boolean;
  robotsContent: string;
  startUrl: string;
  totalPages: number;
  totalLinks: number;
  errors: string[];
}

export class SiteCrawler {
  private startUrl: string;
  private maxDepth: number;
  private maxPages: number;
  private crawledUrls: Set<string> = new Set();
  private pages: CrawledPage[] = [];
  private domain: string;
  private progressCallback?: (progress: CrawlProgress) => void;
  private errors: string[] = [];

  constructor(
    startUrl: string,
    maxDepth: number = 3,
    maxPages: number = 100,
    progressCallback?: (progress: CrawlProgress) => void
  ) {
    this.startUrl = this.normalizeUrl(startUrl);
    this.maxDepth = maxDepth;
    this.maxPages = maxPages;
    this.progressCallback = progressCallback;

    try {
      const url = new URL(this.startUrl);
      this.domain = url.hostname;
    } catch (e) {
      throw new Error('Invalid URL provided');
    }
  }

  /**
   * Start crawling the website
   */
  public async crawl(): Promise<CrawlResult> {
    this.updateProgress('crawling', 0, this.maxPages, this.startUrl);

    // Check robots.txt
    const { robotsFound, robotsContent } = await this.checkRobotsTxt();

    // Check sitemap
    const sitemapFound = await this.checkSitemap();

    // Start crawling from the start URL
    await this.crawlPage(this.startUrl, 0, null);

    this.updateProgress('completed', this.pages.length, this.pages.length, '');

    const totalLinks = this.pages.reduce((sum, page) => sum + page.links.length, 0);

    return {
      pages: this.pages,
      sitemapFound,
      robotsFound,
      robotsContent,
      startUrl: this.startUrl,
      totalPages: this.pages.length,
      totalLinks,
      errors: this.errors,
    };
  }

  /**
   * Crawl a single page
   */
  private async crawlPage(url: string, depth: number, parentUrl: string | null): Promise<void> {
    // Stop conditions
    if (this.crawledUrls.has(url)) return;
    if (depth > this.maxDepth) return;
    if (this.pages.length >= this.maxPages) return;

    this.crawledUrls.add(url);
    this.updateProgress('crawling', this.pages.length, this.maxPages, url);

    try {
      // Fetch the page
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        this.errors.push(`Failed to fetch ${url}: ${response.status}`);
        return;
      }

      const { html, finalUrl } = await response.json();

      // Parse HTML
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Extract page data
      const pageData = this.extractPageData(doc, finalUrl || url, depth, parentUrl);

      this.pages.push(pageData);

      // Find and crawl child links
      if (depth < this.maxDepth && this.pages.length < this.maxPages) {
        const childLinks = this.extractInternalLinks(doc, url);

        // Crawl children (limited to prevent overwhelming the system)
        const linksToFollow = childLinks.slice(0, 10); // Limit links per page

        for (const childUrl of linksToFollow) {
          if (this.pages.length >= this.maxPages) break;
          await this.crawlPage(childUrl, depth + 1, url);
        }
      }
    } catch (error) {
      const errorMsg = `Error crawling ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  /**
   * Extract data from a page
   */
  private extractPageData(
    doc: Document,
    url: string,
    depth: number,
    parentUrl: string | null
  ): CrawledPage {
    const title = doc.querySelector('title')?.textContent || 'No Title';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Count elements
    const h1Count = doc.querySelectorAll('h1').length;
    const images = doc.querySelectorAll('img').length;

    // Count words
    const bodyText = doc.body?.textContent || '';
    const wordCount = bodyText.trim().split(/\s+/).length;

    // Extract all links
    const allLinks = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => {
        try {
          const href = a.getAttribute('href') || '';
          return new URL(href, url).href;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];

    // Separate internal and external links
    const internalLinks = allLinks.filter(link => {
      try {
        return new URL(link).hostname === this.domain;
      } catch {
        return false;
      }
    });

    const externalLinks = allLinks.filter(link => {
      try {
        return new URL(link).hostname !== this.domain;
      } catch {
        return false;
      }
    });

    // Identify issues
    const issues: string[] = [];
    if (!title) issues.push('Missing title');
    if (!metaDescription) issues.push('Missing meta description');
    if (h1Count === 0) issues.push('No H1 tag');
    if (h1Count > 1) issues.push('Multiple H1 tags');
    if (wordCount < 300) issues.push('Thin content');
    if (internalLinks.length === 0) issues.push('No internal links');

    return {
      url,
      title,
      statusCode: 200, // We'll assume 200 if we successfully fetched it
      depth,
      parentUrl,
      links: allLinks,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      images,
      h1Count,
      metaDescription,
      wordCount,
      issues,
      crawledAt: new Date(),
    };
  }

  /**
   * Extract internal links from a page
   */
  private extractInternalLinks(doc: Document, baseUrl: string): string[] {
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => {
        try {
          const href = a.getAttribute('href') || '';
          const absoluteUrl = new URL(href, baseUrl);

          // Only return internal links
          if (absoluteUrl.hostname === this.domain) {
            // Remove hash and normalize
            absoluteUrl.hash = '';
            return absoluteUrl.href;
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];

    // Remove duplicates
    return Array.from(new Set(links));
  }

  /**
   * Check if robots.txt exists
   */
  private async checkRobotsTxt(): Promise<{ robotsFound: boolean; robotsContent: string }> {
    try {
      const robotsUrl = `${new URL(this.startUrl).origin}/robots.txt`;
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: robotsUrl }),
      });

      if (response.ok) {
        const { html } = await response.json();
        return {
          robotsFound: true,
          robotsContent: html,
        };
      }
    } catch (error) {
      console.error('Error checking robots.txt:', error);
    }

    return {
      robotsFound: false,
      robotsContent: '',
    };
  }

  /**
   * Check if sitemap.xml exists
   */
  private async checkSitemap(): Promise<boolean> {
    try {
      const sitemapUrls = [
        `${new URL(this.startUrl).origin}/sitemap.xml`,
        `${new URL(this.startUrl).origin}/sitemap_index.xml`,
      ];

      for (const sitemapUrl of sitemapUrls) {
        const response = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: sitemapUrl }),
        });

        if (response.ok) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking sitemap:', error);
    }

    return false;
  }

  /**
   * Normalize URL (remove trailing slashes, etc.)
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      urlObj.hash = '';
      let normalized = urlObj.href;
      if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch {
      return url;
    }
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    status: CrawlProgress['status'],
    current: number,
    total: number,
    currentUrl: string
  ) {
    if (this.progressCallback) {
      this.progressCallback({
        status,
        current,
        total,
        currentUrl,
      });
    }
  }
}
