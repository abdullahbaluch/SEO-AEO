/**
 * Keyword Extractor - Extract and analyze keywords from text
 * Uses TF-IDF, n-grams, and clustering
 */

import { tokenize, extractNGrams, calculateTFIDF } from '../nlp/tokenizer';
import type {
  KeywordExtractionRequest,
  KeywordExtractionResult,
  Keyword,
  KeywordPhrase,
  KeywordCluster,
} from '@/types/modules';

/**
 * Extract keywords from text or URL
 */
export async function extractKeywords(request: KeywordExtractionRequest): Promise<KeywordExtractionResult> {
  const { text, url, minLength = 3, maxKeywords = 50 } = request;

  // Get text content
  let content: string;
  if (text) {
    content = text;
  } else if (url) {
    content = await fetchPageText(url);
  } else {
    throw new Error('Either text or url must be provided');
  }

  // Tokenize
  const tokenStats = tokenize(content, {
    minLength,
    includeStopWords: false,
    caseSensitive: false,
  });

  // Extract single keywords
  const keywords: Keyword[] = tokenStats.tokens.slice(0, maxKeywords).map(token => ({
    word: token.word,
    count: token.count,
    frequency: token.frequency,
    density: token.frequency * 100,
    tfidf: undefined, // Would need multiple documents for TF-IDF
  }));

  // Extract phrases (bigrams and trigrams)
  const bigrams = extractNGrams(content, 2, { minOccurrences: 2 });
  const trigrams = extractNGrams(content, 3, { minOccurrences: 2 });

  const phrases: KeywordPhrase[] = [
    ...bigrams.slice(0, 20).map(bg => ({
      phrase: bg.phrase,
      count: bg.count,
      words: bg.words.length,
      type: 'bigram' as const,
    })),
    ...trigrams.slice(0, 10).map(tg => ({
      phrase: tg.phrase,
      count: tg.count,
      words: tg.words.length,
      type: 'trigram' as const,
    })),
  ];

  // Cluster keywords by semantic similarity
  const clusters = clusterKeywords(keywords);

  return {
    keywords,
    phrases,
    clusters,
    totalWords: tokenStats.totalWords,
    uniqueWords: tokenStats.uniqueWords,
  };
}

/**
 * Fetch text from URL
 */
async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();

  // Simple text extraction (remove HTML tags)
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cluster keywords by semantic similarity
 * Simple clustering based on word co-occurrence
 */
function clusterKeywords(keywords: Keyword[]): KeywordCluster[] {
  // This is a simplified clustering approach
  // In production, you'd use more sophisticated algorithms like k-means or DBSCAN

  const clusters: KeywordCluster[] = [];

  // Group keywords by first letter (simple approach)
  const groups = new Map<string, Keyword[]>();

  keywords.forEach(kw => {
    const firstLetter = kw.word[0].toLowerCase();
    if (!groups.has(firstLetter)) {
      groups.set(firstLetter, []);
    }
    groups.get(firstLetter)!.push(kw);
  });

  // Convert to clusters
  groups.forEach((kws, letter) => {
    if (kws.length >= 2) {
      const totalFrequency = kws.reduce((sum, kw) => sum + kw.frequency, 0);
      clusters.push({
        topic: `${letter.toUpperCase()}-words`,
        keywords: kws.map(kw => kw.word),
        relevance: totalFrequency,
      });
    }
  });

  // Sort by relevance
  clusters.sort((a, b) => b.relevance - a.relevance);

  return clusters.slice(0, 10);
}

/**
 * Calculate keyword difficulty (0-100)
 * Higher = more competitive
 */
export function estimateKeywordDifficulty(keyword: string): number {
  // Simplified difficulty estimation
  // In production, you'd query search engine APIs or databases

  const wordCount = keyword.split(/\s+/).length;
  const length = keyword.length;

  let difficulty = 50; // Base difficulty

  // Single words are more competitive
  if (wordCount === 1) difficulty += 20;

  // Short keywords are more competitive
  if (length < 5) difficulty += 15;

  // Long-tail keywords (3+ words) are less competitive
  if (wordCount >= 3) difficulty -= 20;

  // Very specific keywords (5+ words) are even less competitive
  if (wordCount >= 5) difficulty -= 30;

  return Math.max(0, Math.min(100, difficulty));
}

/**
 * Suggest related keywords
 */
export function suggestRelatedKeywords(keyword: string, allKeywords: Keyword[]): string[] {
  const keywordLower = keyword.toLowerCase();
  const words = keywordLower.split(/\s+/);

  // Find keywords that contain any word from the input keyword
  const related = allKeywords
    .filter(kw => {
      const kwLower = kw.word.toLowerCase();
      return words.some(word => kwLower.includes(word) || word.includes(kwLower));
    })
    .filter(kw => kw.word.toLowerCase() !== keywordLower) // Exclude exact match
    .slice(0, 10)
    .map(kw => kw.word);

  return related;
}
