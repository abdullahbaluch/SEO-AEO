/**
 * Onsite Analyzer - Comprehensive on-page SEO analysis
 * Analyzes content, metadata, headings, images, links, and more
 */

import { parseHTML, checkHeadingHierarchy } from '../parsers/html-parser';
import { extractMetadata, validateMetadata } from '../parsers/metadata-extractor';
import { extractLinks, calculateLinkMetrics } from '../parsers/link-extractor';
import { tokenize, calculateKeywordDensity, analyzeKeywordPlacement } from '../nlp/tokenizer';
import { calculateReadability, estimateReadingTime, calculateContentDepth } from '../nlp/readability';
import type {
  OnsiteAnalysisRequest,
  OnsiteAnalysisResult,
  SEOIssue,
  HeadingStructure,
  ContentAnalysis,
  ImageAnalysis,
  LinkAnalysis,
} from '@/types/modules';

/**
 * Perform complete onsite SEO analysis
 */
export async function analyzeOnsite(request: OnsiteAnalysisRequest): Promise<OnsiteAnalysisResult> {
  const { url, includeContent = true, checkImages = true, checkLinks = true } = request;

  // Fetch the page
  const html = await fetchPage(url);

  // Parse HTML
  const parsed = parseHTML(html, url);

  // Extract metadata
  const metadata = extractMetadata(html);

  // Analyze headings
  const headings = analyzeHeadings(parsed.headings);

  // Analyze content
  const content = includeContent
    ? analyzeContent(parsed.text, parsed.headings, metadata.title)
    : {
        wordCount: parsed.wordCount,
        readingTime: 0,
        readabilityScore: 0,
        keywordDensity: {},
        contentDepth: 'shallow' as const,
      };

  // Analyze images
  const images = checkImages
    ? analyzeImages(parsed.images)
    : { total: 0, withAlt: 0, withoutAlt: 0, altCoverage: 0, missingAlt: [] };

  // Analyze links
  const links = checkLinks
    ? await analyzeLinks(parsed.links, url, parsed.wordCount)
    : { internal: 0, external: 0, broken: 0, brokenLinks: [] };

  // Collect all issues
  const issues: SEOIssue[] = [];

  // Metadata issues
  const metadataValidation = validateMetadata(metadata);
  metadataValidation.issues.forEach(issue => {
    issues.push({
      severity: issue.severity === 'critical' ? 'critical' : issue.severity === 'warning' ? 'warning' : 'info',
      category: 'Metadata',
      title: issue.message,
      description: issue.message,
    });
  });

  // Heading issues
  const headingValidation = checkHeadingHierarchy(parsed.headings);
  headingValidation.issues.forEach(issue => {
    issues.push({
      severity: 'warning',
      category: 'Structure',
      title: issue,
      description: issue,
      recommendation: 'Maintain proper heading hierarchy for better SEO',
    });
  });

  // Image issues
  if (images.withoutAlt > 0) {
    issues.push({
      severity: 'warning',
      category: 'Images',
      title: `${images.withoutAlt} images missing alt text`,
      description: `${images.withoutAlt} out of ${images.total} images are missing alt attributes`,
      recommendation: 'Add descriptive alt text to all images for accessibility and SEO',
      impact: 'Affects image SEO and accessibility',
    });
  }

  // Content issues
  if (content.wordCount < 300) {
    issues.push({
      severity: 'warning',
      category: 'Content',
      title: 'Thin content',
      description: `Page has only ${content.wordCount} words. Recommended minimum is 300 words`,
      recommendation: 'Add more comprehensive content to improve SEO value',
      impact: 'Low word count may reduce search engine rankings',
    });
  }

  if (content.readabilityScore < 60) {
    issues.push({
      severity: 'info',
      category: 'Content',
      title: 'Content is difficult to read',
      description: `Readability score: ${content.readabilityScore.toFixed(1)}`,
      recommendation: 'Simplify language and use shorter sentences',
    });
  }

  // Link issues
  if (links.broken > 0) {
    issues.push({
      severity: 'critical',
      category: 'Links',
      title: `${links.broken} broken links found`,
      description: `${links.broken} links are returning errors or 404`,
      recommendation: 'Fix or remove broken links',
      impact: 'Broken links hurt user experience and SEO',
    });
  }

  // Calculate overall score (0-100)
  const score = calculateOverallScore(issues, content, images, links);

  return {
    url,
    title: metadata.title,
    metaDescription: metadata.description,
    headings,
    content,
    images,
    links,
    issues,
    score,
  };
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
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Analyze heading structure
 */
function analyzeHeadings(headings: { h1: string[]; h2: string[]; h3: string[]; h4: string[]; h5: string[]; h6: string[]; }): HeadingStructure {
  const validation = checkHeadingHierarchy(headings);

  return {
    ...headings,
    hierarchy: validation.valid,
    issues: validation.issues,
  };
}

/**
 * Analyze content quality
 */
function analyzeContent(
  text: string,
  headings: { h1: string[]; h2: string[] },
  title: string
): ContentAnalysis {
  // Tokenize text
  const tokens = tokenize(text, { minLength: 3, includeStopWords: false });

  // Calculate readability
  const { scores, stats } = calculateReadability(text);

  // Estimate reading time
  const readingTime = estimateReadingTime(tokens.totalWords).minutes;

  // Get top keywords
  const topKeywords = tokens.tokens.slice(0, 10).map(t => t.word);

  // Calculate keyword density for top keywords
  const keywordDensity = calculateKeywordDensity(text, topKeywords);

  // Calculate content depth
  const contentDepth = calculateContentDepth(
    tokens.totalWords,
    tokens.uniqueWords,
    stats.averageWordsPerSentence,
    scores.fleschReadingEase
  );

  return {
    wordCount: tokens.totalWords,
    readingTime,
    readabilityScore: scores.fleschReadingEase,
    keywordDensity,
    contentDepth,
  };
}

/**
 * Analyze images
 */
function analyzeImages(images: Array<{ src: string; alt: string }>): ImageAnalysis {
  const total = images.length;
  const withAlt = images.filter(img => img.alt && img.alt.trim().length > 0).length;
  const withoutAlt = total - withAlt;
  const altCoverage = total > 0 ? (withAlt / total) * 100 : 0;
  const missingAlt = images
    .filter(img => !img.alt || img.alt.trim().length === 0)
    .map(img => img.src);

  return {
    total,
    withAlt,
    withoutAlt,
    altCoverage,
    missingAlt,
  };
}

/**
 * Analyze links
 */
async function analyzeLinks(
  links: Array<{ href: string; text: string }>,
  baseUrl: string,
  wordCount: number
): Promise<LinkAnalysis> {
  const linkAnalysis = extractLinks(
    links.map(l => `<a href="${l.href}">${l.text}</a>`).join(''),
    baseUrl
  );

  return {
    internal: linkAnalysis.internalCount,
    external: linkAnalysis.externalCount,
    broken: 0, // Would need to check each link (expensive)
    brokenLinks: [],
  };
}

/**
 * Calculate overall SEO score (0-100)
 */
function calculateOverallScore(
  issues: SEOIssue[],
  content: ContentAnalysis,
  images: ImageAnalysis,
  links: LinkAnalysis
): number {
  let score = 100;

  // Deduct points for issues
  issues.forEach(issue => {
    if (issue.severity === 'critical') score -= 10;
    else if (issue.severity === 'warning') score -= 5;
    else if (issue.severity === 'info') score -= 2;
  });

  // Deduct for thin content
  if (content.wordCount < 300) score -= 10;
  else if (content.wordCount < 500) score -= 5;

  // Deduct for poor readability
  if (content.readabilityScore < 50) score -= 10;
  else if (content.readabilityScore < 60) score -= 5;

  // Deduct for missing alt text
  if (images.altCoverage < 50) score -= 10;
  else if (images.altCoverage < 80) score -= 5;

  // Bonus for good content depth
  if (content.contentDepth === 'deep') score += 5;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}
