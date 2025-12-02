/**
 * Keyword Enrichment Utilities
 * Provides additional context for keywords: related queries, entities, questions
 */

import * as cheerio from 'cheerio';

/**
 * Scrape People Also Ask questions from Google
 * Returns common questions people search for related to the keyword
 */
export async function scrapePAA(query: string): Promise<string[]> {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=us&hl=en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.warn(`PAA scrape failed for "${query}": ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract questions from various PAA selectors
    const questions: string[] = [];

    // Try multiple selectors as Google changes their HTML frequently
    const selectors = [
      'div[jsname="Cpkphb"] span',
      'div[data-attrid="RelatedQuestions"] span',
      'div[jscontroller] div[role="heading"]',
      '.related-question-pair span',
    ];

    selectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.includes('?') && text.length > 10 && text.length < 200) {
          if (!questions.includes(text)) {
            questions.push(text);
          }
        }
      });
    });

    return questions.slice(0, 10); // Return top 10 unique questions
  } catch (error) {
    console.error('PAA scraping error:', error);
    return [];
  }
}

/**
 * Get related entities from Wikipedia
 * Returns entity suggestions that might be semantically related
 */
export async function getWikipediaEntities(keyword: string): Promise<string[]> {
  try {
    const api = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(keyword)}&limit=10&format=json&origin=*`;

    const response = await fetch(api, {
      headers: {
        'User-Agent': 'SEO-Toolkit/1.0 (Educational purposes)',
      },
    });

    if (!response.ok) {
      console.warn(`Wikipedia API failed for "${keyword}": ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Wikipedia OpenSearch returns [query, [titles], [descriptions], [urls]]
    const titles = data[1] || [];
    return titles.filter((title: string) => title.toLowerCase() !== keyword.toLowerCase());
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return [];
  }
}

/**
 * Get search suggestions from multiple sources
 * Combines autocomplete suggestions to find related searches
 */
export async function getSearchSuggestions(keyword: string): Promise<string[]> {
  try {
    // Use Google Autocomplete API (public, no auth required)
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit/1.0)',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Returns [query, [suggestions]]
    const suggestions = data[1] || [];
    return suggestions.slice(0, 10);
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return [];
  }
}

/**
 * Estimate keyword seasonality based on the query type
 * Returns a simple seasonality indicator
 */
export function estimateSeasonality(keyword: string): {
  seasonal: boolean;
  confidence: number;
  reason: string;
} {
  const keywordLower = keyword.toLowerCase();

  // Seasonal keywords patterns
  const seasonalPatterns = [
    { pattern: /(christmas|xmas|holiday|santa)/i, reason: 'Christmas/Holiday season' },
    { pattern: /(halloween|costume|trick|treat)/i, reason: 'Halloween season' },
    { pattern: /(valentine|love day)/i, reason: 'Valentine\'s Day season' },
    { pattern: /(summer|beach|vacation)/i, reason: 'Summer season' },
    { pattern: /(winter|snow|ski)/i, reason: 'Winter season' },
    { pattern: /(spring|easter)/i, reason: 'Spring season' },
    { pattern: /(fall|autumn|thanksgiving)/i, reason: 'Fall season' },
    { pattern: /(tax|taxes)/i, reason: 'Tax season (April)' },
    { pattern: /(back to school|school supplies)/i, reason: 'Back to school season' },
    { pattern: /(black friday|cyber monday)/i, reason: 'Holiday shopping season' },
  ];

  for (const { pattern, reason } of seasonalPatterns) {
    if (pattern.test(keywordLower)) {
      return {
        seasonal: true,
        confidence: 0.8,
        reason,
      };
    }
  }

  return {
    seasonal: false,
    confidence: 0.6,
    reason: 'No strong seasonal indicators detected',
  };
}

/**
 * Enrich a keyword with additional data from multiple sources
 */
export async function enrichKeyword(keyword: string) {
  const [paaQuestions, wikiEntities, suggestions] = await Promise.allSettled([
    scrapePAA(keyword),
    getWikipediaEntities(keyword),
    getSearchSuggestions(keyword),
  ]);

  const seasonality = estimateSeasonality(keyword);

  return {
    keyword,
    questions: paaQuestions.status === 'fulfilled' ? paaQuestions.value : [],
    entities: wikiEntities.status === 'fulfilled' ? wikiEntities.value : [],
    suggestions: suggestions.status === 'fulfilled' ? suggestions.value : [],
    seasonality,
  };
}
