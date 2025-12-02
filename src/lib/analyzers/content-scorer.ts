/**
 * Content Score Engine - Analyze and score content quality
 * Evaluates clarity, structure, keyword optimization, engagement, and readability
 */

import { parseHTML } from '../parsers/html-parser';
import { extractMetadata } from '../parsers/metadata-extractor';
import { tokenize, analyzeKeywordPlacement } from '../nlp/tokenizer';
import { calculateReadability, analyzeSentenceComplexity } from '../nlp/readability';
import type {
  ContentScoreRequest,
  ContentScoreResult,
  ContentRecommendation,
} from '@/types/modules';

/**
 * Score content quality
 */
export async function scoreContent(request: ContentScoreRequest): Promise<ContentScoreResult> {
  const { url, text, targetKeyword } = request;

  // Get content
  let content: string;
  let htmlContent: string = '';

  if (text) {
    content = text;
  } else if (url) {
    htmlContent = await fetchPage(url);
    const parsed = parseHTML(htmlContent, url);
    content = parsed.text;
  } else {
    throw new Error('Either text or url must be provided');
  }

  // Parse HTML if available
  const parsed = htmlContent ? parseHTML(htmlContent, url || '') : null;
  const metadata = htmlContent ? extractMetadata(htmlContent) : null;

  // Tokenize content
  const tokens = tokenize(content, { minLength: 3, includeStopWords: false });

  // Calculate readability
  const { scores, stats } = calculateReadability(content);

  // Analyze sentence complexity
  const sentenceComplexity = analyzeSentenceComplexity(content);

  // Calculate individual scores
  const clarityScore = calculateClarityScore(scores, sentenceComplexity);
  const structureScore = calculateStructureScore(parsed, content);
  const keywordScore = targetKeyword
    ? calculateKeywordScore(targetKeyword, content, parsed, metadata)
    : 80; // Default if no target keyword
  const engagementScore = calculateEngagementScore(content, tokens);
  const readabilityScore = scores.fleschReadingEase;

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    clarityScore * 0.2 +
    structureScore * 0.2 +
    keywordScore * 0.25 +
    engagementScore * 0.15 +
    readabilityScore * 0.2
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    clarityScore,
    structureScore,
    keywordScore,
    engagementScore,
    readabilityScore,
    targetKeyword,
    content,
    parsed,
    tokens,
    sentenceComplexity
  );

  // Calculate metrics
  const metrics = {
    wordCount: tokens.totalWords,
    sentenceCount: stats.sentences,
    paragraphCount: content.split(/\n\n+/).filter(p => p.trim()).length,
    avgWordsPerSentence: stats.averageWordsPerSentence,
    avgSentencesPerParagraph: stats.sentences / (content.split(/\n\n+/).length || 1),
  };

  return {
    overallScore,
    scores: {
      clarity: Math.round(clarityScore),
      structure: Math.round(structureScore),
      keywordOptimization: Math.round(keywordScore),
      engagement: Math.round(engagementScore),
      readability: Math.round(readabilityScore),
    },
    recommendations,
    metrics,
  };
}

/**
 * Calculate clarity score
 */
function calculateClarityScore(
  readabilityScores: any,
  sentenceComplexity: any
): number {
  let score = 100;

  // Penalize difficult readability
  if (readabilityScores.fleschReadingEase < 50) score -= 30;
  else if (readabilityScores.fleschReadingEase < 60) score -= 15;

  // Penalize too many complex sentences
  const complexRatio = sentenceComplexity.complex /
    (sentenceComplexity.simple + sentenceComplexity.moderate + sentenceComplexity.complex);

  if (complexRatio > 0.3) score -= 20;
  else if (complexRatio > 0.2) score -= 10;

  // Penalize very long sentences
  if (sentenceComplexity.longestSentence > 40) score -= 15;
  else if (sentenceComplexity.longestSentence > 30) score -= 10;

  return Math.max(0, score);
}

/**
 * Calculate structure score
 */
function calculateStructureScore(parsed: any, content: string): number {
  let score = 100;

  if (!parsed) return 70; // Can't fully evaluate without HTML

  // Check for H1
  if (parsed.headings.h1.length === 0) score -= 20;
  else if (parsed.headings.h1.length > 1) score -= 10;

  // Check for H2s
  if (parsed.headings.h2.length === 0) score -= 15;

  // Check paragraph structure
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length < 3) score -= 10;

  // Check for bullet points/lists
  const hasList = /<[ou]l>/i.test(parsed.html || '');
  if (!hasList && parsed.wordCount > 500) score -= 10;

  return Math.max(0, score);
}

/**
 * Calculate keyword optimization score
 */
function calculateKeywordScore(
  keyword: string,
  content: string,
  parsed: any,
  metadata: any
): number {
  let score = 100;

  // Analyze keyword placement
  const placement = analyzeKeywordPlacement(
    keyword,
    metadata?.title || '',
    parsed?.headings.h1 || [],
    parsed?.headings.h2 || [],
    content
  );

  // Check title
  if (!placement.inTitle) score -= 25;

  // Check H1
  if (!placement.inH1) score -= 20;

  // Check first paragraph
  if (!placement.inFirstParagraph) score -= 15;

  // Check H2s
  if (!placement.inH2) score -= 10;

  // Check keyword density
  const density = (placement.totalOccurrences / content.split(/\s+/).length) * 100;
  if (density < 0.5) score -= 15; // Too few
  else if (density > 3) score -= 20; // Keyword stuffing

  return Math.max(0, score);
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(content: string, tokens: any): number {
  let score = 100;

  // Check word count
  if (tokens.totalWords < 300) score -= 30;
  else if (tokens.totalWords < 500) score -= 15;

  // Check lexical diversity
  const lexicalDiversity = tokens.uniqueWords / tokens.totalWords;
  if (lexicalDiversity < 0.3) score -= 20;
  else if (lexicalDiversity < 0.4) score -= 10;

  // Check for questions (engagement indicator)
  const questions = (content.match(/\?/g) || []).length;
  if (questions === 0 && tokens.totalWords > 500) score -= 10;

  // Check for emotional words (simplified)
  const emotionalWords = ['amazing', 'incredible', 'stunning', 'wonderful', 'excellent', 'terrible', 'awful', 'fantastic'];
  const hasEmotionalWords = emotionalWords.some(word => content.toLowerCase().includes(word));
  if (!hasEmotionalWords) score -= 5;

  return Math.max(0, score);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  clarity: number,
  structure: number,
  keyword: number,
  engagement: number,
  readability: number,
  targetKeyword: string | undefined,
  content: string,
  parsed: any,
  tokens: any,
  sentenceComplexity: any
): ContentRecommendation[] {
  const recommendations: ContentRecommendation[] = [];

  // Clarity recommendations
  if (clarity < 70) {
    if (sentenceComplexity.longestSentence > 30) {
      recommendations.push({
        type: 'clarity',
        priority: 'high',
        message: 'Shorten long sentences',
        impact: 20,
        actionable: `Your longest sentence is ${sentenceComplexity.longestSentence} words. Break it into 2-3 shorter sentences.`,
      });
    }

    if (sentenceComplexity.complex > sentenceComplexity.simple) {
      recommendations.push({
        type: 'clarity',
        priority: 'medium',
        message: 'Simplify complex sentences',
        impact: 15,
        actionable: 'Use simpler words and shorter phrases. Aim for 15-20 words per sentence.',
      });
    }
  }

  // Structure recommendations
  if (structure < 70) {
    if (!parsed?.headings.h1.length) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        message: 'Add H1 heading',
        impact: 20,
        actionable: 'Add a clear, descriptive H1 heading at the top of your content.',
      });
    }

    if (!parsed?.headings.h2.length) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        message: 'Add H2 subheadings',
        impact: 15,
        actionable: 'Break content into sections with H2 subheadings every 200-300 words.',
      });
    }
  }

  // Keyword recommendations
  if (keyword < 70 && targetKeyword) {
    recommendations.push({
      type: 'keyword',
      priority: 'high',
      message: 'Improve keyword placement',
      impact: 25,
      actionable: `Include "${targetKeyword}" in the title, first paragraph, and at least one heading.`,
    });
  }

  // Engagement recommendations
  if (engagement < 70) {
    if (tokens.totalWords < 500) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        message: 'Increase content length',
        impact: 20,
        actionable: `Add ${500 - tokens.totalWords} more words of valuable content. Aim for 500-2000 words.`,
      });
    }

    const questions = (content.match(/\?/g) || []).length;
    if (questions === 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Add engaging questions',
        impact: 10,
        actionable: 'Include questions to engage readers and address their concerns.',
      });
    }
  }

  // Readability recommendations
  if (readability < 60) {
    recommendations.push({
      type: 'readability',
      priority: 'high',
      message: 'Improve readability',
      impact: 20,
      actionable: 'Use shorter words, simpler sentences, and active voice. Aim for 8th-9th grade reading level.',
    });
  }

  // Sort by priority and impact
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impact - a.impact;
  });

  return recommendations;
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
