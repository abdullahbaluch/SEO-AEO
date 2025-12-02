/**
 * Readability Calculator - Calculate readability scores
 * Implements Flesch Reading Ease, Flesch-Kincaid Grade Level, and other metrics
 */

export interface ReadabilityScores {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  smogIndex: number;
  colemanLiauIndex: number;
  automatedReadabilityIndex: number;
  averageGradeLevel: number;
  readingLevel: 'very easy' | 'easy' | 'fairly easy' | 'standard' | 'fairly difficult' | 'difficult' | 'very difficult';
}

export interface TextStats {
  sentences: number;
  words: number;
  syllables: number;
  characters: number;
  complexWords: number; // 3+ syllables
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  averageCharactersPerWord: number;
}

/**
 * Calculate comprehensive readability scores
 */
export function calculateReadability(text: string): {
  scores: ReadabilityScores;
  stats: TextStats;
} {
  const stats = calculateTextStats(text);
  const scores = calculateAllScores(stats);

  return { scores, stats };
}

/**
 * Calculate text statistics
 */
function calculateTextStats(text: string): TextStats {
  // Count sentences (split by . ! ?)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  // Count words
  const words = text.match(/\b[a-z0-9]+\b/gi) || [];
  const wordCount = words.length;

  // Count syllables
  let totalSyllables = 0;
  let complexWords = 0;

  words.forEach(word => {
    const syllableCount = countSyllables(word);
    totalSyllables += syllableCount;
    if (syllableCount >= 3) {
      complexWords++;
    }
  });

  // Count characters (excluding spaces)
  const characters = text.replace(/\s/g, '').length;

  return {
    sentences,
    words: wordCount,
    syllables: totalSyllables,
    characters,
    complexWords,
    averageWordsPerSentence: wordCount / sentences,
    averageSyllablesPerWord: totalSyllables / wordCount,
    averageCharactersPerWord: characters / wordCount,
  };
}

/**
 * Count syllables in a word
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();

  // Remove non-letters
  word = word.replace(/[^a-z]/g, '');

  if (word.length <= 3) return 1;

  // Count vowel groups
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const syllables = word.match(/[aeiouy]{1,2}/g);
  const count = syllables ? syllables.length : 1;

  return Math.max(1, count);
}

/**
 * Calculate all readability scores
 */
function calculateAllScores(stats: TextStats): ReadabilityScores {
  const { sentences, words, syllables, characters, complexWords } = stats;

  // Flesch Reading Ease
  // Score: 0-100 (higher = easier)
  // Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const fleschReadingEase = 206.835
    - 1.015 * (words / sentences)
    - 84.6 * (syllables / words);

  // Flesch-Kincaid Grade Level
  // Score: US grade level
  // Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fleschKincaidGrade = 0.39 * (words / sentences)
    + 11.8 * (syllables / words)
    - 15.59;

  // SMOG Index (Simple Measure of Gobbledygook)
  // Score: Years of education needed
  // Formula: 1.0430 * sqrt(complex_words * (30/sentences)) + 3.1291
  const smogIndex = sentences > 0
    ? 1.0430 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291
    : 0;

  // Coleman-Liau Index
  // Score: US grade level
  // Formula: 0.0588 * L - 0.296 * S - 15.8
  // L = average letters per 100 words, S = average sentences per 100 words
  const L = (characters / words) * 100;
  const S = (sentences / words) * 100;
  const colemanLiauIndex = 0.0588 * L - 0.296 * S - 15.8;

  // Automated Readability Index (ARI)
  // Score: US grade level
  // Formula: 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
  const automatedReadabilityIndex = 4.71 * (characters / words)
    + 0.5 * (words / sentences)
    - 21.43;

  // Average grade level
  const averageGradeLevel = (
    fleschKincaidGrade +
    smogIndex +
    colemanLiauIndex +
    automatedReadabilityIndex
  ) / 4;

  // Reading level classification
  const readingLevel = classifyReadingLevel(fleschReadingEase);

  return {
    fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
    smogIndex: Math.max(0, smogIndex),
    colemanLiauIndex: Math.max(0, colemanLiauIndex),
    automatedReadabilityIndex: Math.max(0, automatedReadabilityIndex),
    averageGradeLevel: Math.max(0, averageGradeLevel),
    readingLevel,
  };
}

/**
 * Classify reading level based on Flesch Reading Ease score
 */
function classifyReadingLevel(score: number): ReadabilityScores['readingLevel'] {
  if (score >= 90) return 'very easy';
  if (score >= 80) return 'easy';
  if (score >= 70) return 'fairly easy';
  if (score >= 60) return 'standard';
  if (score >= 50) return 'fairly difficult';
  if (score >= 30) return 'difficult';
  return 'very difficult';
}

/**
 * Get reading time estimate (assumes 200 words per minute)
 */
export function estimateReadingTime(wordCount: number, wpm: number = 200): {
  minutes: number;
  seconds: number;
  text: string;
} {
  const totalMinutes = wordCount / wpm;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  let text = '';
  if (minutes > 0) {
    text = `${minutes} min`;
    if (seconds > 0) {
      text += ` ${seconds} sec`;
    }
  } else {
    text = `${seconds} sec`;
  }

  return { minutes, seconds, text };
}

/**
 * Analyze sentence complexity
 */
export interface SentenceComplexity {
  simple: number;    // < 15 words
  moderate: number;  // 15-25 words
  complex: number;   // > 25 words
  averageLength: number;
  longestSentence: number;
}

export function analyzeSentenceComplexity(text: string): SentenceComplexity {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let simple = 0;
  let moderate = 0;
  let complex = 0;
  let totalWords = 0;
  let longestSentence = 0;

  sentences.forEach(sentence => {
    const words = sentence.match(/\b[a-z0-9]+\b/gi) || [];
    const wordCount = words.length;
    totalWords += wordCount;

    if (wordCount > longestSentence) {
      longestSentence = wordCount;
    }

    if (wordCount < 15) {
      simple++;
    } else if (wordCount <= 25) {
      moderate++;
    } else {
      complex++;
    }
  });

  return {
    simple,
    moderate,
    complex,
    averageLength: totalWords / sentences.length,
    longestSentence,
  };
}

/**
 * Calculate content depth based on various factors
 */
export function calculateContentDepth(
  wordCount: number,
  uniqueWords: number,
  averageSentenceLength: number,
  readabilityScore: number
): 'shallow' | 'moderate' | 'deep' {
  // Lexical diversity (unique words / total words)
  const lexicalDiversity = uniqueWords / wordCount;

  // Score based on multiple factors
  let depthScore = 0;

  // Word count contributes to depth
  if (wordCount > 2000) depthScore += 3;
  else if (wordCount > 1000) depthScore += 2;
  else if (wordCount > 500) depthScore += 1;

  // Lexical diversity contributes to depth
  if (lexicalDiversity > 0.6) depthScore += 2;
  else if (lexicalDiversity > 0.4) depthScore += 1;

  // Sentence complexity contributes to depth
  if (averageSentenceLength > 20) depthScore += 2;
  else if (averageSentenceLength > 15) depthScore += 1;

  // Readability (lower score = more complex = deeper)
  if (readabilityScore < 50) depthScore += 2;
  else if (readabilityScore < 70) depthScore += 1;

  // Classify depth
  if (depthScore >= 6) return 'deep';
  if (depthScore >= 3) return 'moderate';
  return 'shallow';
}
