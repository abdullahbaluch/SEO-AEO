/**
 * Core Web Vitals Estimation
 * Provides lab estimates for LCP, CLS, and other performance metrics
 */

import * as cheerio from 'cheerio';

export interface WebVitalsEstimate {
  lcp: {
    estimate: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    element: string;
  };
  cls: {
    estimate: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    risks: string[];
  };
  fid: {
    estimate: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  };
  ttfb: {
    estimate: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  };
}

export interface AccessibilityCheck {
  score: number;
  issues: {
    severity: 'critical' | 'warning' | 'info';
    type: string;
    count: number;
    description: string;
    recommendation: string;
  }[];
}

/**
 * Estimate Largest Contentful Paint (LCP)
 * Good: < 2.5s, Needs Improvement: 2.5s-4s, Poor: > 4s
 */
export function estimateLCP(html: string): WebVitalsEstimate['lcp'] {
  const $ = cheerio.load(html);

  // Find potential LCP candidates
  const images = $('img[src]');
  const headings = $('h1, h2');
  const textBlocks = $('p').filter((_, el) => $(el).text().length > 100);

  let estimate = 2.0; // Base estimate
  let element = 'Unknown';

  // Check for large images (likely LCP candidates)
  if (images.length > 0) {
    const hasLargeImages = images.toArray().some(img => {
      const src = $(img).attr('src') || '';
      // Check for likely large image indicators
      return src.includes('hero') || src.includes('banner') ||
             $(img).attr('width') && parseInt($(img).attr('width')!) > 800;
    });

    if (hasLargeImages) {
      estimate += 1.5; // Large images take longer
      element = 'Hero image or banner';
    }
  }

  // Check for lazy loading
  const hasLazyLoading = $('img[loading="lazy"]').length > 0;
  if (hasLazyLoading) {
    estimate -= 0.3; // Lazy loading helps
  }

  // Check for preload hints
  const hasPreload = $('link[rel="preload"]').length > 0;
  if (hasPreload) {
    estimate -= 0.5; // Preloading helps
  }

  // Check HTML size (larger HTML = slower parse)
  const htmlSize = html.length / 1024; // KB
  if (htmlSize > 100) {
    estimate += 0.5;
  }

  // Determine rating
  let rating: 'good' | 'needs-improvement' | 'poor';
  if (estimate < 2.5) rating = 'good';
  else if (estimate < 4.0) rating = 'needs-improvement';
  else rating = 'poor';

  if (!element || element === 'Unknown') {
    if (headings.length > 0) element = 'Main heading';
    else if (textBlocks.length > 0) element = 'Text block';
    else element = 'Unknown element';
  }

  return {
    estimate: Math.round(estimate * 10) / 10,
    rating,
    element,
  };
}

/**
 * Estimate Cumulative Layout Shift (CLS)
 * Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
 */
export function estimateCLS(html: string): WebVitalsEstimate['cls'] {
  const $ = cheerio.load(html);

  let estimate = 0.0;
  const risks: string[] = [];

  // Check for images without dimensions
  const imagesWithoutDimensions = $('img').filter((_, el) => {
    const $el = $(el);
    return !$el.attr('width') && !$el.attr('height') && !$el.css('width') && !$el.css('height');
  }).length;

  if (imagesWithoutDimensions > 0) {
    estimate += imagesWithoutDimensions * 0.05;
    risks.push(`${imagesWithoutDimensions} images without width/height attributes`);
  }

  // Check for iframes without dimensions
  const iframesWithoutDimensions = $('iframe').filter((_, el) => {
    const $el = $(el);
    return !$el.attr('width') && !$el.attr('height');
  }).length;

  if (iframesWithoutDimensions > 0) {
    estimate += iframesWithoutDimensions * 0.08;
    risks.push(`${iframesWithoutDimensions} iframes without dimensions`);
  }

  // Check for dynamic content injection points
  const dynamicContainers = $('[id*="dynamic"], [class*="dynamic"], [id*="placeholder"]').length;
  if (dynamicContainers > 0) {
    estimate += dynamicContainers * 0.03;
    risks.push(`${dynamicContainers} dynamic content containers detected`);
  }

  // Check for web fonts without font-display
  const fontLinks = $('link[href*="font"]').length;
  if (fontLinks > 0) {
    estimate += 0.05;
    risks.push('Web fonts may cause layout shift');
  }

  // Determine rating
  let rating: 'good' | 'needs-improvement' | 'poor';
  if (estimate < 0.1) rating = 'good';
  else if (estimate < 0.25) rating = 'needs-improvement';
  else rating = 'poor';

  return {
    estimate: Math.round(estimate * 100) / 100,
    rating,
    risks: risks.length > 0 ? risks : ['No significant CLS risks detected'],
  };
}

/**
 * Estimate First Input Delay (FID)
 * Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms
 */
export function estimateFID(html: string): WebVitalsEstimate['fid'] {
  const $ = cheerio.load(html);

  let estimate = 50; // Base estimate (ms)

  // Check for inline scripts
  const inlineScripts = $('script:not([src])').length;
  estimate += inlineScripts * 20;

  // Check for external scripts
  const externalScripts = $('script[src]').length;
  estimate += externalScripts * 10;

  // Check for event listeners
  const elementsWithEvents = $('[onclick], [onload], [onchange]').length;
  estimate += elementsWithEvents * 5;

  // Determine rating
  let rating: 'good' | 'needs-improvement' | 'poor';
  if (estimate < 100) rating = 'good';
  else if (estimate < 300) rating = 'needs-improvement';
  else rating = 'poor';

  return {
    estimate: Math.round(estimate),
    rating,
  };
}

/**
 * Estimate Time to First Byte (TTFB)
 * Good: < 800ms, Needs Improvement: 800-1800ms, Poor: > 1800ms
 */
export function estimateTTFB(htmlSize: number): WebVitalsEstimate['ttfb'] {
  // Base estimate on HTML size
  let estimate = 200 + (htmlSize / 1024) * 5; // ms

  // Determine rating
  let rating: 'good' | 'needs-improvement' | 'poor';
  if (estimate < 800) rating = 'good';
  else if (estimate < 1800) rating = 'needs-improvement';
  else rating = 'poor';

  return {
    estimate: Math.round(estimate),
    rating,
  };
}

/**
 * Get complete Web Vitals estimates
 */
export function analyzeWebVitals(html: string): WebVitalsEstimate {
  return {
    lcp: estimateLCP(html),
    cls: estimateCLS(html),
    fid: estimateFID(html),
    ttfb: estimateTTFB(html.length),
  };
}

/**
 * Perform accessibility audit
 */
export function checkAccessibility(html: string): AccessibilityCheck {
  const $ = cheerio.load(html);
  const issues: AccessibilityCheck['issues'] = [];

  // Check for missing alt attributes
  const imgMissingAlt = $('img:not([alt])').length;
  if (imgMissingAlt > 0) {
    issues.push({
      severity: 'critical',
      type: 'missing-alt-text',
      count: imgMissingAlt,
      description: `${imgMissingAlt} images without alt text`,
      recommendation: 'Add descriptive alt attributes to all images for screen readers',
    });
  }

  // Check for empty alt on decorative images
  const decorativeImages = $('img[alt=""]').length;
  if (decorativeImages > 0) {
    issues.push({
      severity: 'info',
      type: 'decorative-images',
      count: decorativeImages,
      description: `${decorativeImages} images with empty alt (decorative)`,
      recommendation: 'Ensure these are truly decorative; otherwise provide meaningful alt text',
    });
  }

  // Check for empty links
  const emptyLinks = $('a[href]:empty, a[href]:not(:has(*)):not(:has(img))').filter((_, el) => {
    return $(el).text().trim().length === 0;
  }).length;
  if (emptyLinks > 0) {
    issues.push({
      severity: 'critical',
      type: 'empty-links',
      count: emptyLinks,
      description: `${emptyLinks} links with no text content`,
      recommendation: 'Add descriptive text or aria-label to all links',
    });
  }

  // Check for form inputs without labels
  const inputsWithoutLabels = $('input:not([type="hidden"]):not([id])').length +
    $('input[id]:not([type="hidden"])').filter((_, el) => {
      const id = $(el).attr('id');
      return $(`label[for="${id}"]`).length === 0;
    }).length;
  if (inputsWithoutLabels > 0) {
    issues.push({
      severity: 'critical',
      type: 'unlabeled-inputs',
      count: inputsWithoutLabels,
      description: `${inputsWithoutLabels} form inputs without associated labels`,
      recommendation: 'Associate all form inputs with <label> elements using for/id',
    });
  }

  // Check for missing language attribute
  const hasLangAttr = $('html[lang]').length > 0;
  if (!hasLangAttr) {
    issues.push({
      severity: 'warning',
      type: 'missing-lang',
      count: 1,
      description: 'HTML element missing lang attribute',
      recommendation: 'Add lang="en" (or appropriate language code) to <html> element',
    });
  }

  // Check for heading hierarchy
  const headings = $('h1, h2, h3, h4, h5, h6');
  const h1Count = $('h1').length;
  if (h1Count === 0) {
    issues.push({
      severity: 'warning',
      type: 'missing-h1',
      count: 1,
      description: 'No H1 heading found',
      recommendation: 'Add a single H1 heading as the main page title',
    });
  } else if (h1Count > 1) {
    issues.push({
      severity: 'warning',
      type: 'multiple-h1',
      count: h1Count,
      description: `${h1Count} H1 headings found (should be only 1)`,
      recommendation: 'Use only one H1 per page; use H2-H6 for subheadings',
    });
  }

  // Check for low contrast (simple check for inline styles)
  const lowContrastElements = $('[style*="color"]').filter((_, el) => {
    const style = $(el).attr('style') || '';
    return style.includes('color: #fff') || style.includes('color: white');
  }).length;
  if (lowContrastElements > 0) {
    issues.push({
      severity: 'warning',
      type: 'potential-contrast-issues',
      count: lowContrastElements,
      description: `${lowContrastElements} elements with light text colors (may have contrast issues)`,
      recommendation: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)',
    });
  }

  // Check for missing ARIA landmarks
  const hasMainLandmark = $('main, [role="main"]').length > 0;
  const hasNavLandmark = $('nav, [role="navigation"]').length > 0;
  if (!hasMainLandmark) {
    issues.push({
      severity: 'warning',
      type: 'missing-main-landmark',
      count: 1,
      description: 'No <main> landmark found',
      recommendation: 'Add <main> element to identify primary content',
    });
  }

  // Calculate score (100 - deductions for issues)
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'critical') score -= 10;
    else if (issue.severity === 'warning') score -= 5;
    else score -= 2;
  });
  score = Math.max(0, score);

  return {
    score,
    issues,
  };
}
