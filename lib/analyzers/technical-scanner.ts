/**
 * Technical Scanner - Check technical SEO factors
 * Checks robots.txt, sitemap, SSL, mobile-friendly, page speed, etc.
 */

import type {
  TechnicalScanRequest,
  TechnicalScanResult,
  TechnicalCheck,
} from '@/types/modules';

/**
 * Perform technical SEO scan
 */
export async function scanTechnical(request: TechnicalScanRequest): Promise<TechnicalScanResult> {
  const {
    url,
    checkRobots = true,
    checkSitemap = true,
    checkCanonical = true,
    checkSSL = true,
  } = request;

  const checks: TechnicalCheck[] = [];

  // Parse URL
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

  // Check SSL/HTTPS
  if (checkSSL) {
    checks.push(await checkSSLStatus(urlObj));
  }

  // Check robots.txt
  if (checkRobots) {
    checks.push(await checkRobotsTxt(baseUrl));
  }

  // Check sitemap
  if (checkSitemap) {
    checks.push(await checkSitemapXml(baseUrl));
  }

  // Fetch the page for more checks
  const html = await fetchPage(url);

  // Check canonical tag
  if (checkCanonical) {
    checks.push(checkCanonicalTag(html, url));
  }

  // Check meta robots
  checks.push(checkMetaRobots(html));

  // Check viewport (mobile-friendly)
  checks.push(checkViewport(html));

  // Check structured data
  checks.push(checkStructuredData(html));

  // Check page speed indicators
  checks.push(...checkPageSpeedIndicators(html));

  // Calculate summary
  const summary = {
    passed: checks.filter(c => c.status === 'pass').length,
    failed: checks.filter(c => c.status === 'fail').length,
    warnings: checks.filter(c => c.status === 'warning').length,
  };

  // Calculate score
  const score = calculateScore(checks);

  return {
    url,
    checks,
    score,
    summary,
  };
}

/**
 * Check SSL status
 */
async function checkSSLStatus(url: URL): Promise<TechnicalCheck> {
  const isHTTPS = url.protocol === 'https:';

  return {
    id: 'ssl',
    name: 'HTTPS/SSL Certificate',
    status: isHTTPS ? 'pass' : 'fail',
    message: isHTTPS
      ? 'Site is using HTTPS'
      : 'Site is not using HTTPS',
    severity: isHTTPS ? 'low' : 'critical',
    impact: isHTTPS
      ? 'Secure connection established'
      : 'Insecure connection - visitors may see security warnings',
    recommendation: isHTTPS
      ? undefined
      : 'Install an SSL certificate and migrate to HTTPS',
  };
}

/**
 * Check robots.txt
 */
async function checkRobotsTxt(baseUrl: string): Promise<TechnicalCheck> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`, {
      method: 'HEAD',
    });

    if (response.ok) {
      return {
        id: 'robots',
        name: 'Robots.txt',
        status: 'pass',
        message: 'robots.txt file found',
        severity: 'low',
        impact: 'Search engines can check crawling permissions',
      };
    } else {
      return {
        id: 'robots',
        name: 'Robots.txt',
        status: 'warning',
        message: 'robots.txt file not found',
        severity: 'medium',
        impact: 'Search engines have no crawling guidance',
        recommendation: 'Create a robots.txt file to guide search engine crawlers',
      };
    }
  } catch (error) {
    return {
      id: 'robots',
      name: 'Robots.txt',
      status: 'warning',
      message: 'Could not check robots.txt',
      severity: 'low',
      impact: 'Unable to verify crawling permissions',
    };
  }
}

/**
 * Check sitemap.xml
 */
async function checkSitemapXml(baseUrl: string): Promise<TechnicalCheck> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, { method: 'HEAD' });
      if (response.ok) {
        return {
          id: 'sitemap',
          name: 'XML Sitemap',
          status: 'pass',
          message: 'XML sitemap found',
          severity: 'low',
          impact: 'Search engines can discover all pages efficiently',
          details: { url: sitemapUrl },
        };
      }
    } catch (error) {
      // Continue checking
    }
  }

  return {
    id: 'sitemap',
    name: 'XML Sitemap',
    status: 'warning',
    message: 'XML sitemap not found',
    severity: 'medium',
    impact: 'Search engines may miss some pages',
    recommendation: 'Create and submit an XML sitemap to search engines',
  };
}

/**
 * Check canonical tag
 */
function checkCanonicalTag(html: string, pageUrl: string): TechnicalCheck {
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);

  if (canonicalMatch) {
    const canonicalUrl = canonicalMatch[1];
    return {
      id: 'canonical',
      name: 'Canonical Tag',
      status: 'pass',
      message: 'Canonical tag present',
      severity: 'low',
      impact: 'Prevents duplicate content issues',
      details: { canonical: canonicalUrl },
    };
  }

  return {
    id: 'canonical',
    name: 'Canonical Tag',
    status: 'warning',
    message: 'No canonical tag found',
    severity: 'medium',
    impact: 'May have duplicate content issues',
    recommendation: 'Add a canonical tag to specify the preferred URL version',
  };
}

/**
 * Check meta robots tag
 */
function checkMetaRobots(html: string): TechnicalCheck {
  const metaRobotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);

  if (metaRobotsMatch) {
    const content = metaRobotsMatch[1].toLowerCase();

    if (content.includes('noindex') || content.includes('nofollow')) {
      return {
        id: 'meta-robots',
        name: 'Meta Robots',
        status: 'warning',
        message: `Meta robots contains: ${content}`,
        severity: 'high',
        impact: 'Page may be blocked from search engines',
        recommendation: 'Remove noindex/nofollow unless intentional',
        details: { content },
      };
    }

    return {
      id: 'meta-robots',
      name: 'Meta Robots',
      status: 'pass',
      message: 'Meta robots configured correctly',
      severity: 'low',
      impact: 'Page is indexable',
      details: { content },
    };
  }

  return {
    id: 'meta-robots',
    name: 'Meta Robots',
    status: 'info',
    message: 'No meta robots tag (default behavior applies)',
    severity: 'low',
    impact: 'Page uses default indexing behavior',
  };
}

/**
 * Check viewport meta tag (mobile-friendly)
 */
function checkViewport(html: string): TechnicalCheck {
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);

  if (viewportMatch) {
    return {
      id: 'viewport',
      name: 'Mobile Viewport',
      status: 'pass',
      message: 'Viewport meta tag present',
      severity: 'low',
      impact: 'Page is mobile-friendly',
      details: { content: viewportMatch[1] },
    };
  }

  return {
    id: 'viewport',
    name: 'Mobile Viewport',
    status: 'fail',
    message: 'No viewport meta tag found',
    severity: 'critical',
    impact: 'Page is not mobile-friendly - will rank poorly on mobile',
    recommendation: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
  };
}

/**
 * Check structured data (JSON-LD, Schema.org)
 */
function checkStructuredData(html: string): TechnicalCheck {
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  if (jsonLdMatches && jsonLdMatches.length > 0) {
    return {
      id: 'structured-data',
      name: 'Structured Data',
      status: 'pass',
      message: `${jsonLdMatches.length} structured data block(s) found`,
      severity: 'low',
      impact: 'Enhanced search results with rich snippets',
      details: { count: jsonLdMatches.length },
    };
  }

  return {
    id: 'structured-data',
    name: 'Structured Data',
    status: 'info',
    message: 'No structured data found',
    severity: 'low',
    impact: 'Missing opportunity for rich search results',
    recommendation: 'Add Schema.org structured data (JSON-LD) for better search visibility',
  };
}

/**
 * Check page speed indicators
 */
function checkPageSpeedIndicators(html: string): TechnicalCheck[] {
  const checks: TechnicalCheck[] = [];

  // Check for large images without lazy loading
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const lazyImages = imgTags.filter(img => img.includes('loading="lazy"')).length;
  const totalImages = imgTags.length;

  if (totalImages > 5 && lazyImages === 0) {
    checks.push({
      id: 'lazy-loading',
      name: 'Image Lazy Loading',
      status: 'warning',
      message: 'No lazy loading detected for images',
      severity: 'medium',
      impact: 'Slower initial page load',
      recommendation: 'Add loading="lazy" attribute to below-fold images',
    });
  }

  // Check for inline styles (anti-pattern)
  const inlineStyles = (html.match(/style=["'][^"']+["']/gi) || []).length;
  if (inlineStyles > 20) {
    checks.push({
      id: 'inline-styles',
      name: 'Inline Styles',
      status: 'warning',
      message: `${inlineStyles} inline style attributes found`,
      severity: 'low',
      impact: 'Increases HTML size and reduces caching efficiency',
      recommendation: 'Move styles to external CSS files',
    });
  }

  return checks;
}

/**
 * Fetch page HTML
 */
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

/**
 * Calculate overall technical score (0-100)
 */
function calculateScore(checks: TechnicalCheck[]): number {
  let score = 100;

  checks.forEach(check => {
    if (check.status === 'fail') {
      if (check.severity === 'critical') score -= 20;
      else if (check.severity === 'high') score -= 15;
      else if (check.severity === 'medium') score -= 10;
      else score -= 5;
    } else if (check.status === 'warning') {
      if (check.severity === 'high') score -= 10;
      else if (check.severity === 'medium') score -= 5;
      else score -= 2;
    }
  });

  return Math.max(0, Math.min(100, score));
}
