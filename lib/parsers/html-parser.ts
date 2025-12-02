/**
 * HTML Parser - Extract structured content from HTML
 * Uses DOMParser for client-side and regex fallbacks for server-side
 */

export interface ParsedHTML {
  title: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  text: string;
  wordCount: number;
  images: Array<{
    src: string;
    alt: string;
    title?: string;
  }>;
  links: Array<{
    href: string;
    text: string;
    rel?: string;
  }>;
}

/**
 * Parse HTML string and extract structured content
 */
export function parseHTML(html: string, baseUrl?: string): ParsedHTML {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract headings
  const headings = {
    h1: extractTags(html, 'h1'),
    h2: extractTags(html, 'h2'),
    h3: extractTags(html, 'h3'),
    h4: extractTags(html, 'h4'),
    h5: extractTags(html, 'h5'),
    h6: extractTags(html, 'h6'),
  };

  // Extract text content (remove scripts, styles, and HTML tags)
  const text = extractTextContent(html);
  const wordCount = countWords(text);

  // Extract images
  const images = extractImages(html, baseUrl);

  // Extract links
  const links = extractLinks(html, baseUrl);

  return {
    title,
    headings,
    text,
    wordCount,
    images,
    links,
  };
}

/**
 * Extract all tags of a specific type
 */
function extractTags(html: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'gi');
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1].trim());
  }

  return matches;
}

/**
 * Extract text content from HTML (remove scripts, styles, tags)
 */
function extractTextContent(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = decodeHTMLEntities(text);

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Decode common HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Extract images with alt text
 */
function extractImages(html: string, baseUrl?: string): Array<{src: string; alt: string; title?: string}> {
  const images: Array<{src: string; alt: string; title?: string}> = [];
  const imgRegex = /<img[^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];

    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);

    if (srcMatch) {
      const src = normalizeUrl(srcMatch[1], baseUrl);
      images.push({
        src,
        alt: altMatch ? altMatch[1] : '',
        title: titleMatch ? titleMatch[1] : undefined,
      });
    }
  }

  return images;
}

/**
 * Extract links with anchor text
 */
function extractLinks(html: string, baseUrl?: string): Array<{href: string; text: string; rel?: string}> {
  const links: Array<{href: string; text: string; rel?: string}> = [];
  const linkRegex = /<a[^>]*>[\s\S]*?<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const linkTag = match[0];

    const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
    const relMatch = linkTag.match(/rel=["']([^"']+)["']/i);
    const textMatch = linkTag.match(/>([^<]+)</);

    if (hrefMatch) {
      const href = normalizeUrl(hrefMatch[1], baseUrl);
      links.push({
        href,
        text: textMatch ? textMatch[1].trim() : '',
        rel: relMatch ? relMatch[1] : undefined,
      });
    }
  }

  return links;
}

/**
 * Normalize URL (convert relative to absolute)
 */
function normalizeUrl(url: string, baseUrl?: string): string {
  if (!baseUrl) return url;

  try {
    // Skip special protocols
    if (url.startsWith('javascript:') || url.startsWith('mailto:') ||
        url.startsWith('tel:') || url.startsWith('#')) {
      return url;
    }

    // If already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Convert relative to absolute
    const base = new URL(baseUrl);
    const absolute = new URL(url, base);
    return absolute.href;
  } catch {
    return url;
  }
}

/**
 * Check heading hierarchy (h1 should come before h2, etc.)
 */
export function checkHeadingHierarchy(headings: ParsedHTML['headings']): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check h1 count
  if (headings.h1.length === 0) {
    issues.push('No H1 heading found');
  } else if (headings.h1.length > 1) {
    issues.push(`Multiple H1 headings found (${headings.h1.length})`);
  }

  // Check if headings skip levels
  const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
  let lastLevel = -1;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (headings[level].length > 0) {
      if (lastLevel !== -1 && i - lastLevel > 1) {
        issues.push(`Heading hierarchy skips from ${levels[lastLevel]} to ${level}`);
      }
      lastLevel = i;
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
