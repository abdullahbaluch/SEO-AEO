import React from 'react';

// SEO Scan Engine - Core extraction and analysis utilities
export const ScanEngine = {
  // Extract metadata from HTML string
  extractMetadata: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const getMeta = (name) => {
      const el = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return el?.getAttribute('content') || null;
    };

    return {
      title: doc.querySelector('title')?.textContent || null,
      description: getMeta('description'),
      keywords: getMeta('keywords'),
      robots: getMeta('robots'),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
      viewport: getMeta('viewport'),
      author: getMeta('author'),
      generator: getMeta('generator'),
      charset: doc.querySelector('meta[charset]')?.getAttribute('charset') || 
               doc.querySelector('meta[http-equiv="Content-Type"]')?.getAttribute('content') || null,
      language: doc.documentElement.lang || null,
    };
  },

  // Extract Open Graph tags
  extractOpenGraph: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const og = {};
    
    doc.querySelectorAll('meta[property^="og:"]').forEach(el => {
      const key = el.getAttribute('property').replace('og:', '');
      og[key] = el.getAttribute('content');
    });

    return og;
  },

  // Extract Twitter Card tags
  extractTwitterCard: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const twitter = {};
    
    doc.querySelectorAll('meta[name^="twitter:"]').forEach(el => {
      const key = el.getAttribute('name').replace('twitter:', '');
      twitter[key] = el.getAttribute('content');
    });

    return twitter;
  },

  // Extract headings structure
  extractHeadings: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = [];
    
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el, index) => {
      headings.push({
        level: parseInt(el.tagName.charAt(1)),
        text: el.textContent.trim(),
        id: el.id || null,
        index,
      });
    });

    return headings;
  },

  // Extract links
  extractLinks: (html, baseUrl) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = [];
    
    doc.querySelectorAll('a[href]').forEach((el, index) => {
      const href = el.getAttribute('href');
      const isInternal = href.startsWith('/') || href.startsWith(baseUrl) || !href.startsWith('http');
      
      links.push({
        href,
        text: el.textContent.trim(),
        rel: el.getAttribute('rel'),
        target: el.getAttribute('target'),
        title: el.getAttribute('title'),
        isInternal,
        isNofollow: el.getAttribute('rel')?.includes('nofollow'),
        isEmpty: !el.textContent.trim() && !el.querySelector('img'),
        index,
      });
    });

    return links;
  },

  // Extract images
  extractImages: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = [];
    
    doc.querySelectorAll('img').forEach((el, index) => {
      images.push({
        src: el.getAttribute('src'),
        alt: el.getAttribute('alt'),
        title: el.getAttribute('title'),
        width: el.getAttribute('width'),
        height: el.getAttribute('height'),
        loading: el.getAttribute('loading'),
        hasAlt: el.hasAttribute('alt'),
        altEmpty: el.getAttribute('alt') === '',
        index,
      });
    });

    return images;
  },

  // Extract structured data (JSON-LD)
  extractStructuredData: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const schemas = [];
    
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((el, index) => {
      try {
        const data = JSON.parse(el.textContent);
        schemas.push({
          index,
          type: data['@type'] || (Array.isArray(data) ? data.map(d => d['@type']).join(', ') : 'Unknown'),
          data,
          valid: true,
        });
      } catch (e) {
        schemas.push({
          index,
          type: 'Invalid JSON',
          raw: el.textContent,
          valid: false,
          error: e.message,
        });
      }
    });

    return schemas;
  },

  // Extract content metrics
  extractContentMetrics: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove scripts and styles
    doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    
    const bodyText = doc.body?.textContent || '';
    const words = bodyText.split(/\s+/).filter(w => w.length > 0);
    const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = doc.querySelectorAll('p');
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence: sentences.length ? Math.round(words.length / sentences.length) : 0,
      readingTime: Math.ceil(words.length / 200),
    };
  },

  // Extract scripts info
  extractScripts: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const scripts = [];
    
    doc.querySelectorAll('script').forEach((el, index) => {
      if (el.getAttribute('type') === 'application/ld+json') return;
      
      scripts.push({
        src: el.getAttribute('src'),
        async: el.hasAttribute('async'),
        defer: el.hasAttribute('defer'),
        type: el.getAttribute('type'),
        isInline: !el.getAttribute('src'),
        size: el.textContent?.length || 0,
        index,
      });
    });

    return scripts;
  },

  // Extract accessibility elements
  extractAccessibility: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    return {
      hasLang: !!doc.documentElement.lang,
      lang: doc.documentElement.lang || null,
      hasMainLandmark: !!doc.querySelector('main, [role="main"]'),
      hasNavLandmark: !!doc.querySelector('nav, [role="navigation"]'),
      hasSkipLink: !!doc.querySelector('a[href="#main"], a[href="#content"], .skip-link'),
      formsWithLabels: Array.from(doc.querySelectorAll('input, select, textarea')).map(el => ({
        type: el.type || el.tagName.toLowerCase(),
        hasLabel: !!doc.querySelector(`label[for="${el.id}"]`) || !!el.closest('label'),
        hasAriaLabel: !!el.getAttribute('aria-label'),
        hasPlaceholder: !!el.getAttribute('placeholder'),
      })),
      tablesWithHeaders: Array.from(doc.querySelectorAll('table')).map(table => ({
        hasHeaders: !!table.querySelector('th'),
        hasCaption: !!table.querySelector('caption'),
      })),
      ariaLandmarks: doc.querySelectorAll('[role]').length,
    };
  },

  // Keyword extraction using TF-IDF style approach
  extractKeywords: (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    
    const text = doc.body?.textContent?.toLowerCase() || '';
    const words = text.match(/\b[a-z]{3,}\b/g) || [];
    
    // Common stop words to filter
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was',
      'one', 'our', 'out', 'has', 'have', 'been', 'were', 'being', 'their', 'there', 'this',
      'that', 'with', 'they', 'from', 'will', 'would', 'could', 'should', 'what', 'which',
      'when', 'where', 'who', 'how', 'why', 'about', 'into', 'over', 'after', 'before',
    ]);
    
    const frequency = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / words.length) * 100).toFixed(2),
      }));
  },
};

export default ScanEngine;