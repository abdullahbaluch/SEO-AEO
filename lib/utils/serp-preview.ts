/**
 * SERP Preview Generator
 * Generates pixel-perfect Google search result previews for desktop and mobile
 */

export interface SERPPreview {
  desktop: {
    title: string;
    titleTruncated: boolean;
    titleCharCount: number;
    titlePixelWidth: number;
    description: string;
    descriptionTruncated: boolean;
    descriptionCharCount: number;
    url: string;
    displayUrl: string;
  };
  mobile: {
    title: string;
    titleTruncated: boolean;
    titleCharCount: number;
    titlePixelWidth: number;
    description: string;
    descriptionTruncated: boolean;
    descriptionCharCount: number;
    url: string;
    displayUrl: string;
  };
}

/**
 * Estimate pixel width of text
 * Based on average character widths for Google's display font (Arial)
 */
function estimatePixelWidth(text: string, fontSize: number): number {
  // Average character widths at different sizes
  const avgCharWidth = fontSize * 0.5; // Rough approximation

  // More accurate: count different character types
  let width = 0;
  for (const char of text) {
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      // Uppercase letter
      width += fontSize * 0.7;
    } else if (char >= '0' && char <= '9') {
      // Number
      width += fontSize * 0.55;
    } else if (char === ' ') {
      // Space
      width += fontSize * 0.25;
    } else if (['i', 'l', 'I', 'j', 't'].includes(char)) {
      // Narrow characters
      width += fontSize * 0.3;
    } else if (['m', 'M', 'w', 'W'].includes(char)) {
      // Wide characters
      width += fontSize * 0.8;
    } else {
      // Regular character
      width += fontSize * 0.5;
    }
  }

  return width;
}

/**
 * Truncate text to fit within pixel width
 */
function truncateToPixelWidth(
  text: string,
  maxPixels: number,
  fontSize: number
): { text: string; truncated: boolean } {
  if (estimatePixelWidth(text, fontSize) <= maxPixels) {
    return { text, truncated: false };
  }

  // Binary search for the right length
  let low = 0;
  let high = text.length;
  let bestLength = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const truncated = text.slice(0, mid) + '…';
    const width = estimatePixelWidth(truncated, fontSize);

    if (width <= maxPixels) {
      bestLength = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Try to break at a word boundary
  let finalText = text.slice(0, bestLength);
  const lastSpace = finalText.lastIndexOf(' ');
  if (lastSpace > bestLength * 0.8) {
    finalText = finalText.slice(0, lastSpace);
  }

  return {
    text: finalText.trim() + '…',
    truncated: true,
  };
}

/**
 * Truncate text by character count
 */
function truncateByCharCount(
  text: string,
  maxChars: number
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  // Find last space before limit
  let truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.8) {
    truncated = truncated.slice(0, lastSpace);
  }

  return {
    text: truncated.trim() + '…',
    truncated: true,
  };
}

/**
 * Format display URL (breadcrumb-style)
 */
function formatDisplayUrl(url: string, mobile = false): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/$/, '');

    if (mobile) {
      // Mobile shows just domain
      return hostname;
    }

    // Desktop shows breadcrumb path
    if (pathname === '' || pathname === '/') {
      return hostname;
    }

    // Convert path to breadcrumb
    const segments = pathname.split('/').filter(s => s.length > 0);
    const breadcrumb = segments
      .slice(0, 3) // Limit to 3 segments
      .map(s => s.replace(/-/g, ' ').slice(0, 15))
      .join(' › ');

    return `${hostname} › ${breadcrumb}`;
  } catch {
    return url;
  }
}

/**
 * Generate SERP preview for desktop and mobile
 */
export function generateSERPPreview(
  title: string,
  description: string,
  url: string
): SERPPreview {
  // Desktop constraints
  const DESKTOP_TITLE_PIXELS = 600; // Approximately 60 characters
  const DESKTOP_TITLE_FONT = 20;
  const DESKTOP_DESC_CHARS = 160; // Google typically shows 155-160 chars
  const DESKTOP_DESC_FONT = 14;

  // Mobile constraints
  const MOBILE_TITLE_PIXELS = 520; // Approximately 55 characters
  const MOBILE_TITLE_FONT = 20;
  const MOBILE_DESC_CHARS = 120; // Mobile shows less description
  const MOBILE_DESC_FONT = 14;

  // Desktop preview
  const desktopTitle = truncateToPixelWidth(title, DESKTOP_TITLE_PIXELS, DESKTOP_TITLE_FONT);
  const desktopDesc = truncateByCharCount(description, DESKTOP_DESC_CHARS);

  // Mobile preview
  const mobileTitle = truncateToPixelWidth(title, MOBILE_TITLE_PIXELS, MOBILE_TITLE_FONT);
  const mobileDesc = truncateByCharCount(description, MOBILE_DESC_CHARS);

  return {
    desktop: {
      title: desktopTitle.text,
      titleTruncated: desktopTitle.truncated,
      titleCharCount: desktopTitle.text.length,
      titlePixelWidth: estimatePixelWidth(desktopTitle.text, DESKTOP_TITLE_FONT),
      description: desktopDesc.text,
      descriptionTruncated: desktopDesc.truncated,
      descriptionCharCount: desktopDesc.text.length,
      url,
      displayUrl: formatDisplayUrl(url, false),
    },
    mobile: {
      title: mobileTitle.text,
      titleTruncated: mobileTitle.truncated,
      titleCharCount: mobileTitle.text.length,
      titlePixelWidth: estimatePixelWidth(mobileTitle.text, MOBILE_TITLE_FONT),
      description: mobileDesc.text,
      descriptionTruncated: mobileDesc.truncated,
      descriptionCharCount: mobileDesc.text.length,
      url,
      displayUrl: formatDisplayUrl(url, true),
    },
  };
}

/**
 * Validate and score title tag optimization
 */
export function scoreTitleTag(title: string): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const length = title.length;
  const pixelWidth = estimatePixelWidth(title, 20);

  // Check length
  if (length === 0) {
    score = 0;
    issues.push('Title is empty');
    recommendations.push('Add a descriptive title tag (50-60 characters)');
  } else if (length < 30) {
    score -= 20;
    issues.push('Title is too short');
    recommendations.push('Expand title to at least 30 characters for better context');
  } else if (length > 60) {
    score -= 15;
    issues.push('Title may be truncated in search results');
    recommendations.push('Reduce title to 50-60 characters');
  }

  // Check pixel width (more accurate than character count)
  if (pixelWidth > 600) {
    score -= 10;
    issues.push('Title exceeds desktop pixel width limit');
  }

  // Check for keyword placement (simple check)
  const hasNumberAtStart = /^\d/.test(title);
  if (hasNumberAtStart) {
    recommendations.push('Numbers at the start can improve CTR');
  }

  // Check for branding
  const hasPipe = title.includes('|');
  const hasDash = title.includes('-');
  if (!hasPipe && !hasDash) {
    recommendations.push('Consider adding brand name (e.g., "Title | Brand")');
  }

  // Check for caps lock (bad practice)
  const allCaps = title === title.toUpperCase() && title.length > 10;
  if (allCaps) {
    score -= 20;
    issues.push('Avoid all caps titles');
    recommendations.push('Use title case or sentence case instead');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

/**
 * Validate and score meta description optimization
 */
export function scoreMetaDescription(description: string): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const length = description.length;

  // Check length
  if (length === 0) {
    score = 0;
    issues.push('Meta description is missing');
    recommendations.push('Add a compelling meta description (150-160 characters)');
  } else if (length < 70) {
    score -= 30;
    issues.push('Meta description is too short');
    recommendations.push('Expand description to at least 120 characters');
  } else if (length > 160) {
    score -= 15;
    issues.push('Description may be truncated');
    recommendations.push('Reduce description to 150-160 characters');
  }

  // Check for call-to-action
  const cta = /(learn more|discover|find out|get started|try|buy|shop|download|read)/i.test(description);
  if (!cta && length > 0) {
    score -= 10;
    recommendations.push('Consider adding a call-to-action');
  }

  // Check for duplicate punctuation
  const duplicatePunctuation = /[.!?]{2,}/.test(description);
  if (duplicatePunctuation) {
    score -= 5;
    issues.push('Contains duplicate punctuation');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}
