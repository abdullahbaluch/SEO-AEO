/**
 * Readability Metrics
 * Implements Flesch Reading Ease, Flesch-Kincaid, and other readability formulas
 */

export interface ReadabilityScores {
  fleschReadingEase: {
    score: number;
    rating: string;
    gradeLevel: string;
  };
  fleschKincaidGrade: {
    score: number;
    rating: string;
  };
  smogIndex: {
    score: number;
    rating: string;
  };
  colemanLiauIndex: {
    score: number;
    rating: string;
  };
  automatedReadabilityIndex: {
    score: number;
    rating: string;
  };
  averageGradeLevel: number;
}

export interface KeywordDensityAnalysis {
  keyword: string;
  density: number;
  count: number;
  stuffing: boolean;
  recommendation: string;
}

/**
 * Calculate syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e
  if (word.endsWith('e')) syllables--;

  // Ensure at least one syllable
  return Math.max(syllables, 1);
}

/**
 * Get text statistics needed for readability calculations
 */
export function getTextStats(text: string) {
  // Clean text
  const cleaned = text.replace(/\s+/g, ' ').trim();

  // Count sentences (split by . ! ?)
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Count words
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length || 1;

  // Count syllables
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  // Count characters (excluding spaces)
  const characters = cleaned.replace(/\s/g, '').length;

  // Count complex words (3+ syllables)
  const complexWords = words.filter(word => countSyllables(word) >= 3).length;

  return {
    sentenceCount,
    wordCount,
    syllableCount: totalSyllables,
    characterCount: characters,
    complexWordCount: complexWords,
    averageWordsPerSentence: wordCount / sentenceCount,
    averageSyllablesPerWord: totalSyllables / wordCount,
    averageCharactersPerWord: characters / wordCount,
  };
}

/**
 * Flesch Reading Ease Score
 * Higher = easier to read
 * Score ranges from 0-100
 */
export function calculateFleschReadingEase(text: string): ReadabilityScores['fleschReadingEase'] {
  const stats = getTextStats(text);

  const score = 206.835 -
    (1.015 * stats.averageWordsPerSentence) -
    (84.6 * stats.averageSyllablesPerWord);

  const clampedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  let rating: string;
  let gradeLevel: string;

  if (clampedScore >= 90) {
    rating = 'Very Easy';
    gradeLevel = '5th grade';
  } else if (clampedScore >= 80) {
    rating = 'Easy';
    gradeLevel = '6th grade';
  } else if (clampedScore >= 70) {
    rating = 'Fairly Easy';
    gradeLevel = '7th grade';
  } else if (clampedScore >= 60) {
    rating = 'Standard';
    gradeLevel = '8th-9th grade';
  } else if (clampedScore >= 50) {
    rating = 'Fairly Difficult';
    gradeLevel = '10th-12th grade';
  } else if (clampedScore >= 30) {
    rating = 'Difficult';
    gradeLevel = 'College';
  } else {
    rating = 'Very Difficult';
    gradeLevel = 'College graduate';
  }

  return {
    score: clampedScore,
    rating,
    gradeLevel,
  };
}

/**
 * Flesch-Kincaid Grade Level
 * Indicates US school grade level needed to understand the text
 */
export function calculateFleschKincaidGrade(text: string): ReadabilityScores['fleschKincaidGrade'] {
  const stats = getTextStats(text);

  const score = (0.39 * stats.averageWordsPerSentence) +
    (11.8 * stats.averageSyllablesPerWord) - 15.59;

  const roundedScore = Math.max(0, Math.round(score * 10) / 10);

  let rating: string;
  if (roundedScore <= 6) rating = 'Elementary';
  else if (roundedScore <= 8) rating = 'Middle School';
  else if (roundedScore <= 12) rating = 'High School';
  else if (roundedScore <= 16) rating = 'College';
  else rating = 'Graduate School';

  return {
    score: roundedScore,
    rating,
  };
}

/**
 * SMOG Index (Simple Measure of Gobbledygook)
 * Estimates years of education needed to understand text
 */
export function calculateSMOGIndex(text: string): ReadabilityScores['smogIndex'] {
  const stats = getTextStats(text);

  // SMOG requires at least 30 sentences; use approximation for shorter texts
  const score = 1.0430 * Math.sqrt(stats.complexWordCount * (30 / stats.sentenceCount)) + 3.1291;

  const roundedScore = Math.max(0, Math.round(score * 10) / 10);

  let rating: string;
  if (roundedScore <= 6) rating = 'Elementary';
  else if (roundedScore <= 8) rating = 'Middle School';
  else if (roundedScore <= 12) rating = 'High School';
  else if (roundedScore <= 16) rating = 'College';
  else rating = 'Graduate School';

  return {
    score: roundedScore,
    rating,
  };
}

/**
 * Coleman-Liau Index
 * Based on characters rather than syllables
 */
export function calculateColemanLiauIndex(text: string): ReadabilityScores['colemanLiauIndex'] {
  const stats = getTextStats(text);

  const L = (stats.characterCount / stats.wordCount) * 100; // Average letters per 100 words
  const S = (stats.sentenceCount / stats.wordCount) * 100; // Average sentences per 100 words

  const score = (0.0588 * L) - (0.296 * S) - 15.8;

  const roundedScore = Math.max(0, Math.round(score * 10) / 10);

  let rating: string;
  if (roundedScore <= 6) rating = 'Elementary';
  else if (roundedScore <= 8) rating = 'Middle School';
  else if (roundedScore <= 12) rating = 'High School';
  else if (roundedScore <= 16) rating = 'College';
  else rating = 'Graduate School';

  return {
    score: roundedScore,
    rating,
  };
}

/**
 * Automated Readability Index (ARI)
 * Based on characters and words
 */
export function calculateARI(text: string): ReadabilityScores['automatedReadabilityIndex'] {
  const stats = getTextStats(text);

  const score = (4.71 * stats.averageCharactersPerWord) +
    (0.5 * stats.averageWordsPerSentence) - 21.43;

  const roundedScore = Math.max(0, Math.round(score * 10) / 10);

  let rating: string;
  if (roundedScore <= 6) rating = 'Elementary';
  else if (roundedScore <= 8) rating = 'Middle School';
  else if (roundedScore <= 12) rating = 'High School';
  else if (roundedScore <= 16) rating = 'College';
  else rating = 'Graduate School';

  return {
    score: roundedScore,
    rating,
  };
}

/**
 * Calculate all readability scores
 */
export function analyzeReadability(text: string): ReadabilityScores {
  const flesch = calculateFleschReadingEase(text);
  const fk = calculateFleschKincaidGrade(text);
  const smog = calculateSMOGIndex(text);
  const coleman = calculateColemanLiauIndex(text);
  const ari = calculateARI(text);

  // Calculate average grade level
  const avgGrade = (fk.score + smog.score + coleman.score + ari.score) / 4;

  return {
    fleschReadingEase: flesch,
    fleschKincaidGrade: fk,
    smogIndex: smog,
    colemanLiauIndex: coleman,
    automatedReadabilityIndex: ari,
    averageGradeLevel: Math.round(avgGrade * 10) / 10,
  };
}

/**
 * Analyze keyword density and detect stuffing
 */
export function analyzeKeywordDensity(text: string, keyword: string): KeywordDensityAnalysis {
  const textLower = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // Count keyword occurrences
  const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = textLower.match(regex);
  const count = matches ? matches.length : 0;

  // Count total words
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length || 1;

  // Calculate density (percentage)
  const density = (count / wordCount) * 100;

  // Detect keyword stuffing
  // Generally, 1-2% is optimal, 3%+ is stuffing
  const stuffing = density > 3;

  let recommendation: string;
  if (density === 0) {
    recommendation = 'Keyword not found in content. Consider adding it naturally.';
  } else if (density < 0.5) {
    recommendation = 'Keyword density is very low. Consider using the keyword more frequently.';
  } else if (density < 1) {
    recommendation = 'Keyword density is slightly low but acceptable. Could use 1-2 more mentions.';
  } else if (density <= 2) {
    recommendation = 'Optimal keyword density. Good balance for SEO.';
  } else if (density <= 3) {
    recommendation = 'Keyword density is slightly high. Consider reducing mentions.';
  } else {
    recommendation = 'Keyword stuffing detected! Reduce keyword frequency to avoid penalties.';
  }

  return {
    keyword,
    density: Math.round(density * 100) / 100,
    count,
    stuffing,
    recommendation,
  };
}

/**
 * Get comprehensive content quality analysis
 */
export function analyzeContentQuality(text: string, targetKeyword?: string) {
  const readability = analyzeReadability(text);
  const stats = getTextStats(text);

  const result: any = {
    readability,
    stats,
  };

  if (targetKeyword) {
    result.keywordDensity = analyzeKeywordDensity(text, targetKeyword);
  }

  return result;
}
