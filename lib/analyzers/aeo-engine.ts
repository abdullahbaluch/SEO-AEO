/**
 * AEO Assistant - Answer Engine Optimization
 * Analyzes content for AEO, extracts entities, suggests schema markup
 */

import { extractEntities, clusterEntities } from '../nlp/entity-extractor';
import { tokenize } from '../nlp/tokenizer';
import { calculateReadability } from '../nlp/readability';
import type {
  AEOAnalysisRequest,
  AEOAnalysisResult,
  Entity,
  Topic,
  SchemaSuggestion,
} from '@/types/modules';

/**
 * Perform AEO analysis
 */
export async function analyzeAEO(request: AEOAnalysisRequest): Promise<AEOAnalysisResult> {
  const { url, text, suggestSchema = true } = request;

  // Get content
  let content: string;
  let htmlContent: string = '';

  if (text) {
    content = text;
  } else if (url) {
    htmlContent = await fetchPage(url);
    content = extractTextFromHTML(htmlContent);
  } else {
    throw new Error('Either text or url must be provided');
  }

  // Extract entities
  const entities = extractEntities(content);

  // Extract topics
  const topics = extractTopics(content, entities);

  // Suggest schema markup
  const schemas = suggestSchema ? generateSchemasuggeSuggestions(entities, topics, url || '') : [];

  // Calculate answerability score
  const answerability = calculateAnswerability(content, entities);

  return {
    entities,
    topics,
    schemas,
    answerability,
  };
}

/**
 * Extract topics from content
 */
function extractTopics(content: string, entities: Entity[]): Topic[] {
  // Cluster entities to identify topics
  const clusters = clusterEntities(entities);

  // Tokenize content for keywords
  const tokens = tokenize(content, { minLength: 4, includeStopWords: false });

  // Convert clusters to topics
  const topics: Topic[] = clusters.map(cluster => ({
    name: cluster.topic,
    relevance: cluster.relevance,
    keywords: cluster.entities.map(e => e.text),
    category: cluster.topic,
  }));

  // Add keyword-based topics
  const topKeywords = tokens.tokens.slice(0, 10);
  const keywordGroups = groupKeywordsByTheme(topKeywords.map(t => t.word));

  keywordGroups.forEach(group => {
    topics.push({
      name: group.theme,
      relevance: group.score,
      keywords: group.keywords,
      category: 'keyword-based',
    });
  });

  // Sort by relevance
  topics.sort((a, b) => b.relevance - a.relevance);

  return topics.slice(0, 10);
}

/**
 * Group keywords by theme
 */
function groupKeywordsByTheme(keywords: string[]): Array<{theme: string; keywords: string[]; score: number}> {
  // Simple grouping by first letter (in production, use proper clustering)
  const groups = new Map<string, string[]>();

  keywords.forEach(kw => {
    const firstLetter = kw[0].toUpperCase();
    if (!groups.has(firstLetter)) {
      groups.set(firstLetter, []);
    }
    groups.get(firstLetter)!.push(kw);
  });

  return Array.from(groups.entries())
    .filter(([_, kws]) => kws.length >= 2)
    .map(([letter, kws]) => ({
      theme: `${letter}-themed terms`,
      keywords: kws,
      score: kws.length,
    }));
}

/**
 * Generate schema markup suggestions
 */
function generateSchemasuggeSuggestions(
  entities: Entity[],
  topics: Topic[],
  url: string
): SchemaSuggestion[] {
  const suggestions: SchemaSuggestion[] = [];

  // Article schema (always suggest for content pages)
  suggestions.push(generateArticleSchema(url, topics));

  // Organization schema if organization entities found
  const orgEntities = entities.filter(e => e.type === 'organization');
  if (orgEntities.length > 0) {
    suggestions.push(generateOrganizationSchema(orgEntities[0]));
  }

  // Person schema if person entities found
  const personEntities = entities.filter(e => e.type === 'person');
  if (personEntities.length > 0) {
    suggestions.push(generatePersonSchema(personEntities[0]));
  }

  // Product schema if product entities found
  const productEntities = entities.filter(e => e.type === 'product');
  if (productEntities.length > 0) {
    suggestions.push(generateProductSchema(productEntities[0]));
  }

  // Event schema if event entities found
  const eventEntities = entities.filter(e => e.type === 'event');
  if (eventEntities.length > 0) {
    suggestions.push(generateEventSchema(eventEntities[0]));
  }

  // FAQ schema if content has question-answer format
  suggestions.push(generateFAQSchema(topics));

  return suggestions;
}

/**
 * Generate Article schema
 */
function generateArticleSchema(url: string, topics: Topic[]): SchemaSuggestion {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Your Article Title',
    description: 'Your article description',
    author: {
      '@type': 'Person',
      name: 'Author Name',
    },
    datePublished: new Date().toISOString(),
    keywords: topics.flatMap(t => t.keywords).slice(0, 5).join(', '),
  };

  return {
    type: 'Article',
    confidence: 0.9,
    properties: schema,
    jsonld: JSON.stringify(schema, null, 2),
    reason: 'Content appears to be an article or blog post',
  };
}

/**
 * Generate Organization schema
 */
function generateOrganizationSchema(entity: Entity): SchemaSuggestion {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: entity.text,
    description: entity.context[0] || '',
  };

  return {
    type: 'Organization',
    confidence: entity.confidence,
    properties: schema,
    jsonld: JSON.stringify(schema, null, 2),
    reason: `Organization "${entity.text}" mentioned ${entity.mentions} times`,
  };
}

/**
 * Generate Person schema
 */
function generatePersonSchema(entity: Entity): SchemaSuggestion {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: entity.text,
    description: entity.context[0] || '',
  };

  return {
    type: 'Person',
    confidence: entity.confidence,
    properties: schema,
    jsonld: JSON.stringify(schema, null, 2),
    reason: `Person "${entity.text}" mentioned ${entity.mentions} times`,
  };
}

/**
 * Generate Product schema
 */
function generateProductSchema(entity: Entity): SchemaSuggestion {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entity.text,
    description: entity.context[0] || '',
  };

  return {
    type: 'Product',
    confidence: entity.confidence,
    properties: schema,
    jsonld: JSON.stringify(schema, null, 2),
    reason: `Product "${entity.text}" mentioned ${entity.mentions} times`,
  };
}

/**
 * Generate Event schema
 */
function generateEventSchema(entity: Entity): SchemaSuggestion {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: entity.text,
    description: entity.context[0] || '',
  };

  return {
    type: 'Event',
    confidence: entity.confidence,
    properties: schema,
    jsonld: JSON.stringify(schema, null, 2),
    reason: `Event "${entity.text}" mentioned ${entity.mentions} times`,
  };
}

/**
 * Generate FAQ schema
 */
function generateFAQSchema(topics: Topic[]): SchemaSuggestion {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Sample Question',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sample answer text',
        },
      },
    ],
  };

  return {
    type: 'FAQPage',
    confidence: 0.6,
    properties: schema,
    jsonld: JSON.stringify(schema, null, 2),
    reason: 'Content structure suitable for FAQ schema',
  };
}

/**
 * Calculate answerability score
 */
function calculateAnswerability(content: string, entities: Entity[]): {
  score: number;
  factors: string[];
  improvements: string[];
} {
  let score = 100;
  const factors: string[] = [];
  const improvements: string[] = [];

  // Check content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    score -= 30;
    improvements.push('Increase content length to at least 300 words');
  } else {
    factors.push('Sufficient content length');
  }

  // Check for questions
  const questions = (content.match(/\?/g) || []).length;
  if (questions > 0) {
    factors.push(`Contains ${questions} question(s)`);
    score += 5;
  } else {
    improvements.push('Add questions that your content answers');
  }

  // Check for clear structure
  const hasStructure = /\n\n/.test(content);
  if (hasStructure) {
    factors.push('Well-structured content');
  } else {
    score -= 10;
    improvements.push('Break content into clear paragraphs');
  }

  // Check for entities
  if (entities.length >= 5) {
    factors.push(`Rich entity coverage (${entities.length} entities)`);
    score += 10;
  } else {
    improvements.push('Include more specific entities (names, places, organizations)');
  }

  // Check readability
  const { scores } = calculateReadability(content);
  if (scores.fleschReadingEase >= 60) {
    factors.push('Good readability');
  } else {
    score -= 15;
    improvements.push('Improve readability - use simpler language');
  }

  // Check for definitive answers
  const hasDefinitiveLanguage = /\b(is|are|means|refers to|defined as)\b/i.test(content);
  if (hasDefinitiveLanguage) {
    factors.push('Contains definitive answers');
    score += 10;
  } else {
    improvements.push('Provide clear, definitive answers to questions');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
    improvements,
  };
}

/**
 * Extract text from HTML
 */
function extractTextFromHTML(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
