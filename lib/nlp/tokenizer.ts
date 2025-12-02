/**
 * Tokenizer - Text tokenization and word frequency analysis
 * Used for keyword extraction and content analysis
 */

export interface Token {
  word: string;
  count: number;
  frequency: number;
  positions: number[];
}

export interface TokenStats {
  totalWords: number;
  uniqueWords: number;
  averageWordLength: number;
  tokens: Token[];
}

/**
 * Common English stop words to filter out
 */
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does',
  'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'might', 'more', 'most', 'must', 'my', 'myself', 'no', 'nor',
  'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 's', 'same', 'should', 'so', 'some', 'such',
  't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves',
]);

/**
 * Tokenize text and calculate word frequencies
 */
export function tokenize(text: string, options: {
  minLength?: number;
  includeStopWords?: boolean;
  caseSensitive?: boolean;
} = {}): TokenStats {
  const {
    minLength = 3,
    includeStopWords = false,
    caseSensitive = false,
  } = options;

  // Normalize text
  let normalized = text;
  if (!caseSensitive) {
    normalized = text.toLowerCase();
  }

  // Extract words (alphanumeric sequences)
  const words = normalized.match(/\b[a-z0-9]+\b/gi) || [];

  // Count word frequencies with positions
  const wordMap = new Map<string, { count: number; positions: number[] }>();

  words.forEach((word, index) => {
    // Filter by length
    if (word.length < minLength) return;

    // Filter stop words
    if (!includeStopWords && STOP_WORDS.has(word.toLowerCase())) return;

    if (!wordMap.has(word)) {
      wordMap.set(word, { count: 0, positions: [] });
    }

    const entry = wordMap.get(word)!;
    entry.count++;
    entry.positions.push(index);
  });

  // Calculate statistics
  const totalWords = words.length;
  const uniqueWords = wordMap.size;
  const averageWordLength = words.reduce((sum, w) => sum + w.length, 0) / totalWords;

  // Convert to token array
  const tokens: Token[] = Array.from(wordMap.entries()).map(([word, data]) => ({
    word,
    count: data.count,
    frequency: data.count / totalWords,
    positions: data.positions,
  }));

  // Sort by count (descending)
  tokens.sort((a, b) => b.count - a.count);

  return {
    totalWords,
    uniqueWords,
    averageWordLength,
    tokens,
  };
}

/**
 * Extract n-grams (phrases) from text
 */
export interface NGram {
  phrase: string;
  count: number;
  words: string[];
  positions: number[];
}

export function extractNGrams(text: string, n: number = 2, options: {
  minOccurrences?: number;
  includeStopWords?: boolean;
} = {}): NGram[] {
  const {
    minOccurrences = 2,
    includeStopWords = false,
  } = options;

  // Normalize and split into words
  const words = text.toLowerCase().match(/\b[a-z0-9]+\b/gi) || [];

  // Generate n-grams
  const ngramMap = new Map<string, { words: string[]; positions: number[] }>();

  for (let i = 0; i <= words.length - n; i++) {
    const ngramWords = words.slice(i, i + n);

    // Skip if contains stop words (unless includeStopWords is true)
    if (!includeStopWords) {
      const hasStopWord = ngramWords.some(w => STOP_WORDS.has(w.toLowerCase()));
      if (hasStopWord) continue;
    }

    const phrase = ngramWords.join(' ');

    if (!ngramMap.has(phrase)) {
      ngramMap.set(phrase, { words: ngramWords, positions: [] });
    }

    ngramMap.get(phrase)!.positions.push(i);
  }

  // Convert to array and filter by min occurrences
  const ngrams: NGram[] = Array.from(ngramMap.entries())
    .map(([phrase, data]) => ({
      phrase,
      count: data.positions.length,
      words: data.words,
      positions: data.positions,
    }))
    .filter(ngram => ngram.count >= minOccurrences);

  // Sort by count (descending)
  ngrams.sort((a, b) => b.count - a.count);

  return ngrams;
}

/**
 * Calculate TF-IDF score for keywords
 * TF-IDF = Term Frequency * Inverse Document Frequency
 */
export function calculateTFIDF(
  documentTokens: Token[],
  allDocuments: TokenStats[]
): Array<Token & { tfidf: number }> {
  const numDocuments = allDocuments.length;

  return documentTokens.map(token => {
    // Term Frequency (TF)
    const tf = token.frequency;

    // Document Frequency (DF) - how many documents contain this word
    const df = allDocuments.filter(doc =>
      doc.tokens.some(t => t.word === token.word)
    ).length;

    // Inverse Document Frequency (IDF)
    const idf = Math.log(numDocuments / (df + 1));

    // TF-IDF score
    const tfidf = tf * idf;

    return {
      ...token,
      tfidf,
    };
  });
}

/**
 * Extract keyword density for specific keywords
 */
export function calculateKeywordDensity(
  text: string,
  keywords: string[]
): Record<string, number> {
  const normalized = text.toLowerCase();
  const words = normalized.match(/\b[a-z0-9]+\b/gi) || [];
  const totalWords = words.length;

  const density: Record<string, number> = {};

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(/\s+/);

    if (keywordWords.length === 1) {
      // Single word keyword
      const count = words.filter(w => w === keywordLower).length;
      density[keyword] = (count / totalWords) * 100;
    } else {
      // Multi-word keyword (phrase)
      const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
      const matches = normalized.match(regex) || [];
      density[keyword] = (matches.length / totalWords) * 100;
    }
  });

  return density;
}

/**
 * Find keyword positions in text
 */
export function findKeywordPositions(text: string, keyword: string): number[] {
  const normalized = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  const positions: number[] = [];

  let index = normalized.indexOf(keywordLower);
  while (index !== -1) {
    positions.push(index);
    index = normalized.indexOf(keywordLower, index + 1);
  }

  return positions;
}

/**
 * Check if keyword appears in important positions (title, headings, first paragraph)
 */
export interface KeywordPlacement {
  keyword: string;
  inTitle: boolean;
  inH1: boolean;
  inH2: boolean;
  inFirstParagraph: boolean;
  totalOccurrences: number;
}

export function analyzeKeywordPlacement(
  keyword: string,
  title: string,
  h1: string[],
  h2: string[],
  text: string
): KeywordPlacement {
  const keywordLower = keyword.toLowerCase();

  // Check title
  const inTitle = title.toLowerCase().includes(keywordLower);

  // Check H1
  const inH1 = h1.some(h => h.toLowerCase().includes(keywordLower));

  // Check H2
  const inH2 = h2.some(h => h.toLowerCase().includes(keywordLower));

  // Check first paragraph (first 300 characters)
  const firstParagraph = text.slice(0, 300).toLowerCase();
  const inFirstParagraph = firstParagraph.includes(keywordLower);

  // Count total occurrences
  const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
  const totalOccurrences = (text.match(regex) || []).length;

  return {
    keyword,
    inTitle,
    inH1,
    inH2,
    inFirstParagraph,
    totalOccurrences,
  };
}
