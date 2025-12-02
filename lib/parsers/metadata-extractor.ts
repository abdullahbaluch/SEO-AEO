/**
 * Metadata Extractor - Extract SEO-relevant metadata from HTML
 * Supports: meta tags, Open Graph, Twitter Cards, Schema.org
 */

export interface PageMetadata {
  // Basic meta tags
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;

  // Open Graph
  og: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
  };

  // Twitter Card
  twitter: {
    card?: string;
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  // Schema.org structured data
  schema: any[];

  // Additional SEO data
  language?: string;
  alternates: Array<{
    hreflang: string;
    href: string;
  }>;
}

/**
 * Extract all metadata from HTML
 */
export function extractMetadata(html: string): PageMetadata {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta tags
  const metaTags = extractMetaTags(html);

  // Extract Open Graph data
  const og = extractOpenGraph(metaTags);

  // Extract Twitter Card data
  const twitter = extractTwitterCard(metaTags);

  // Extract Schema.org structured data
  const schema = extractSchema(html);

  // Extract language
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const language = langMatch ? langMatch[1] : undefined;

  // Extract alternate links (hreflang)
  const alternates = extractAlternates(html);

  return {
    title,
    description: metaTags['description'],
    keywords: metaTags['keywords']?.split(',').map((k: string) => k.trim()),
    author: metaTags['author'],
    canonical: extractCanonical(html),
    robots: metaTags['robots'],
    viewport: metaTags['viewport'],
    charset: extractCharset(html),
    og,
    twitter,
    schema,
    language,
    alternates,
  };
}

/**
 * Extract all meta tags into a key-value map
 */
function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const metaRegex = /<meta[^>]+>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const metaTag = match[0];

    // Extract name and content
    const nameMatch = metaTag.match(/name=["']([^"']+)["']/i);
    const propertyMatch = metaTag.match(/property=["']([^"']+)["']/i);
    const contentMatch = metaTag.match(/content=["']([^"']*)["']/i);

    if (contentMatch) {
      const key = nameMatch?.[1] || propertyMatch?.[1];
      if (key) {
        tags[key] = contentMatch[1];
      }
    }
  }

  return tags;
}

/**
 * Extract Open Graph metadata
 */
function extractOpenGraph(metaTags: Record<string, string>) {
  return {
    title: metaTags['og:title'],
    description: metaTags['og:description'],
    image: metaTags['og:image'],
    url: metaTags['og:url'],
    type: metaTags['og:type'],
    siteName: metaTags['og:site_name'],
  };
}

/**
 * Extract Twitter Card metadata
 */
function extractTwitterCard(metaTags: Record<string, string>) {
  return {
    card: metaTags['twitter:card'],
    site: metaTags['twitter:site'],
    creator: metaTags['twitter:creator'],
    title: metaTags['twitter:title'],
    description: metaTags['twitter:description'],
    image: metaTags['twitter:image'],
  };
}

/**
 * Extract Schema.org structured data from JSON-LD and microdata
 */
function extractSchema(html: string): any[] {
  const schemas: any[] = [];

  // Extract JSON-LD
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const schemaData = JSON.parse(match[1]);
      schemas.push(schemaData);
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return schemas;
}

/**
 * Extract canonical URL
 */
function extractCanonical(html: string): string | undefined {
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  if (!canonicalMatch) return undefined;

  const hrefMatch = canonicalMatch[0].match(/href=["']([^"']+)["']/i);
  return hrefMatch ? hrefMatch[1] : undefined;
}

/**
 * Extract charset
 */
function extractCharset(html: string): string | undefined {
  // Look for charset in meta tag
  const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  if (charsetMatch) return charsetMatch[1];

  // Look for charset in Content-Type meta tag
  const contentTypeMatch = html.match(/<meta[^>]*http-equiv=["']Content-Type["'][^>]*content=["']([^"']+)["']/i);
  if (contentTypeMatch) {
    const charsetInContent = contentTypeMatch[1].match(/charset=([^\s;]+)/i);
    if (charsetInContent) return charsetInContent[1];
  }

  return undefined;
}

/**
 * Extract alternate language links (hreflang)
 */
function extractAlternates(html: string): Array<{hreflang: string; href: string}> {
  const alternates: Array<{hreflang: string; href: string}> = [];
  const alternateRegex = /<link[^>]*rel=["']alternate["'][^>]*>/gi;
  let match;

  while ((match = alternateRegex.exec(html)) !== null) {
    const linkTag = match[0];

    const hreflangMatch = linkTag.match(/hreflang=["']([^"']+)["']/i);
    const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);

    if (hreflangMatch && hrefMatch) {
      alternates.push({
        hreflang: hreflangMatch[1],
        href: hrefMatch[1],
      });
    }
  }

  return alternates;
}

/**
 * Validate metadata for SEO best practices
 */
export function validateMetadata(metadata: PageMetadata): {
  valid: boolean;
  issues: Array<{severity: 'critical' | 'warning' | 'info'; message: string}>;
} {
  const issues: Array<{severity: 'critical' | 'warning' | 'info'; message: string}> = [];

  // Check title
  if (!metadata.title) {
    issues.push({ severity: 'critical', message: 'Missing page title' });
  } else if (metadata.title.length < 30) {
    issues.push({ severity: 'warning', message: `Title too short (${metadata.title.length} chars, recommended 30-60)` });
  } else if (metadata.title.length > 60) {
    issues.push({ severity: 'warning', message: `Title too long (${metadata.title.length} chars, recommended 30-60)` });
  }

  // Check description
  if (!metadata.description) {
    issues.push({ severity: 'critical', message: 'Missing meta description' });
  } else if (metadata.description.length < 120) {
    issues.push({ severity: 'warning', message: `Description too short (${metadata.description.length} chars, recommended 120-160)` });
  } else if (metadata.description.length > 160) {
    issues.push({ severity: 'warning', message: `Description too long (${metadata.description.length} chars, recommended 120-160)` });
  }

  // Check canonical
  if (!metadata.canonical) {
    issues.push({ severity: 'info', message: 'No canonical URL specified' });
  }

  // Check Open Graph
  if (!metadata.og.title) {
    issues.push({ severity: 'info', message: 'Missing Open Graph title' });
  }
  if (!metadata.og.description) {
    issues.push({ severity: 'info', message: 'Missing Open Graph description' });
  }
  if (!metadata.og.image) {
    issues.push({ severity: 'info', message: 'Missing Open Graph image' });
  }

  // Check viewport (mobile-friendly)
  if (!metadata.viewport) {
    issues.push({ severity: 'warning', message: 'Missing viewport meta tag (not mobile-friendly)' });
  }

  return {
    valid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
  };
}
