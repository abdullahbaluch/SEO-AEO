import React from 'react';

// Scoring Engine - Calculate scores and generate issues
export const ScoringEngine = {
  // Metadata scoring
  scoreMetadata: (metadata, og, twitter) => {
    const issues = [];
    let score = 100;

    // Title checks
    if (!metadata.title) {
      issues.push({
        severity: 'critical',
        title: 'Missing page title',
        description: 'The page is missing a title tag',
        impact: 'Title is crucial for SEO and user experience',
        fix: 'Add a unique, descriptive title tag between 50-60 characters',
      });
      score -= 20;
    } else if (metadata.title.length < 30) {
      issues.push({
        severity: 'warning',
        title: 'Title too short',
        description: `Title is only ${metadata.title.length} characters`,
        current: metadata.title,
        recommended: 'Expand to 50-60 characters',
        impact: 'Short titles may not fully describe page content',
        fix: 'Add more descriptive keywords to your title',
      });
      score -= 10;
    } else if (metadata.title.length > 60) {
      issues.push({
        severity: 'warning',
        title: 'Title too long',
        description: `Title is ${metadata.title.length} characters (recommended: 50-60)`,
        current: metadata.title,
        impact: 'Long titles get truncated in search results',
        fix: 'Shorten your title to under 60 characters',
      });
      score -= 5;
    }

    // Description checks
    if (!metadata.description) {
      issues.push({
        severity: 'critical',
        title: 'Missing meta description',
        description: 'No meta description found',
        impact: 'Search engines may generate their own snippet',
        fix: 'Add a compelling meta description of 150-160 characters',
      });
      score -= 15;
    } else if (metadata.description.length < 120) {
      issues.push({
        severity: 'warning',
        title: 'Meta description too short',
        description: `Description is ${metadata.description.length} characters`,
        impact: 'Short descriptions may not be compelling in search results',
        fix: 'Expand to 150-160 characters with a call to action',
      });
      score -= 5;
    } else if (metadata.description.length > 160) {
      issues.push({
        severity: 'info',
        title: 'Meta description may be truncated',
        description: `Description is ${metadata.description.length} characters`,
        impact: 'Long descriptions get cut off in search results',
        fix: 'Consider shortening to under 160 characters',
      });
      score -= 3;
    }

    // Canonical check
    if (!metadata.canonical) {
      issues.push({
        severity: 'warning',
        title: 'Missing canonical URL',
        description: 'No canonical link tag found',
        impact: 'May cause duplicate content issues',
        fix: 'Add a canonical link tag pointing to the preferred URL',
      });
      score -= 10;
    }

    // Viewport check
    if (!metadata.viewport) {
      issues.push({
        severity: 'critical',
        title: 'Missing viewport meta tag',
        description: 'No viewport meta tag found',
        impact: 'Page may not be mobile-friendly',
        fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      });
      score -= 15;
    }

    // Open Graph checks
    if (!og.title && !og.description && !og.image) {
      issues.push({
        severity: 'warning',
        title: 'Missing Open Graph tags',
        description: 'No Open Graph meta tags found',
        impact: 'Social sharing will use fallback data',
        fix: 'Add og:title, og:description, og:image tags',
      });
      score -= 10;
    }

    // Twitter Card checks
    if (!twitter.card) {
      issues.push({
        severity: 'info',
        title: 'Missing Twitter Card',
        description: 'No Twitter Card meta tags found',
        impact: 'Twitter will use Open Graph or fallback data',
        fix: 'Add twitter:card and related tags for better Twitter sharing',
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues, category: 'metadata' };
  },

  // Schema scoring
  scoreSchema: (schemas) => {
    const issues = [];
    let score = 100;

    if (schemas.length === 0) {
      issues.push({
        severity: 'critical',
        title: 'No structured data found',
        description: 'Page has no JSON-LD structured data',
        impact: 'Missing rich snippet opportunities in search results',
        fix: 'Add relevant schema.org structured data (Article, Organization, FAQPage, etc.)',
      });
      score -= 30;
    }

    schemas.forEach((schema, index) => {
      if (!schema.valid) {
        issues.push({
          severity: 'critical',
          title: `Invalid JSON-LD at position ${index + 1}`,
          description: schema.error,
          impact: 'Search engines cannot parse invalid structured data',
          fix: 'Fix the JSON syntax error in your structured data',
        });
        score -= 20;
      } else {
        // Check for required fields based on schema type
        if (schema.type === 'Article' || schema.type === 'NewsArticle' || schema.type === 'BlogPosting') {
          const required = ['headline', 'author', 'datePublished', 'image'];
          required.forEach(field => {
            if (!schema.data[field]) {
              issues.push({
                severity: 'warning',
                title: `Missing ${field} in ${schema.type}`,
                description: `${schema.type} schema is missing recommended ${field} property`,
                impact: 'May reduce rich snippet eligibility',
                fix: `Add the ${field} property to your ${schema.type} schema`,
              });
              score -= 5;
            }
          });
        }

        if (schema.type === 'Organization') {
          const required = ['name', 'logo', 'url'];
          required.forEach(field => {
            if (!schema.data[field]) {
              issues.push({
                severity: 'warning',
                title: `Missing ${field} in Organization`,
                description: `Organization schema is missing ${field}`,
                fix: `Add the ${field} property`,
              });
              score -= 5;
            }
          });
        }

        if (schema.type === 'FAQPage') {
          if (!schema.data.mainEntity || !Array.isArray(schema.data.mainEntity) || schema.data.mainEntity.length === 0) {
            issues.push({
              severity: 'warning',
              title: 'FAQPage has no questions',
              description: 'FAQPage schema has empty or missing mainEntity',
              fix: 'Add Question items to mainEntity array',
            });
            score -= 10;
          }
        }
      }
    });

    // Suggest schemas if none present
    if (schemas.length === 0) {
      issues.push({
        severity: 'opportunity',
        title: 'Schema suggestions available',
        description: 'Consider adding structured data based on your content type',
        fix: 'Add Article, FAQPage, HowTo, Product, or Organization schema as appropriate',
      });
    }

    return { score: Math.max(0, score), issues, category: 'schema' };
  },

  // Content and headings scoring
  scoreContent: (headings, contentMetrics) => {
    const issues = [];
    let score = 100;

    // H1 checks
    const h1s = headings.filter(h => h.level === 1);
    if (h1s.length === 0) {
      issues.push({
        severity: 'critical',
        title: 'Missing H1 heading',
        description: 'Page has no H1 heading',
        impact: 'H1 is important for SEO and accessibility',
        fix: 'Add a single, descriptive H1 heading to your page',
      });
      score -= 20;
    } else if (h1s.length > 1) {
      issues.push({
        severity: 'warning',
        title: 'Multiple H1 headings',
        description: `Found ${h1s.length} H1 headings`,
        impact: 'Multiple H1s can confuse search engines',
        fix: 'Use only one H1 per page and convert others to H2',
      });
      score -= 10;
    }

    // Heading hierarchy check
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      if (heading.level > lastLevel + 1 && lastLevel !== 0) {
        issues.push({
          severity: 'warning',
          title: 'Skipped heading level',
          description: `H${heading.level} follows H${lastLevel} (skipped H${lastLevel + 1})`,
          element: heading.text.substring(0, 50),
          impact: 'May affect accessibility and SEO',
          fix: 'Maintain proper heading hierarchy without skipping levels',
        });
        score -= 3;
      }
      lastLevel = heading.level;
    });

    // Content length check
    if (contentMetrics.wordCount < 300) {
      issues.push({
        severity: 'warning',
        title: 'Thin content',
        description: `Page has only ${contentMetrics.wordCount} words`,
        impact: 'Short content may not rank well',
        fix: 'Consider adding more comprehensive content (aim for 1000+ words for articles)',
      });
      score -= 15;
    }

    // Reading level
    if (contentMetrics.avgWordsPerSentence > 25) {
      issues.push({
        severity: 'info',
        title: 'Complex sentences',
        description: `Average ${contentMetrics.avgWordsPerSentence} words per sentence`,
        impact: 'May reduce readability',
        fix: 'Consider breaking long sentences into shorter ones',
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues, category: 'content' };
  },

  // Link scoring
  scoreLinks: (links) => {
    const issues = [];
    let score = 100;

    const internalLinks = links.filter(l => l.isInternal);
    const externalLinks = links.filter(l => !l.isInternal);
    const emptyLinks = links.filter(l => l.isEmpty);
    const nofollowLinks = links.filter(l => l.isNofollow);

    if (links.length === 0) {
      issues.push({
        severity: 'warning',
        title: 'No links found',
        description: 'Page has no internal or external links',
        impact: 'Links help establish page relationships',
        fix: 'Add relevant internal and external links',
      });
      score -= 15;
    }

    if (internalLinks.length < 3) {
      issues.push({
        severity: 'warning',
        title: 'Few internal links',
        description: `Only ${internalLinks.length} internal links found`,
        impact: 'Internal linking helps distribute page authority',
        fix: 'Add more internal links to related content',
      });
      score -= 10;
    }

    if (emptyLinks.length > 0) {
      issues.push({
        severity: 'warning',
        title: 'Empty link text',
        description: `${emptyLinks.length} links have no text or image`,
        impact: 'Affects accessibility and SEO',
        fix: 'Add descriptive text to all links',
      });
      score -= emptyLinks.length * 3;
    }

    // Check for generic anchor text
    const genericAnchors = links.filter(l => 
      ['click here', 'read more', 'learn more', 'here', 'link'].includes(l.text.toLowerCase().trim())
    );
    if (genericAnchors.length > 0) {
      issues.push({
        severity: 'info',
        title: 'Generic anchor text',
        description: `${genericAnchors.length} links use generic text like "click here"`,
        impact: 'Descriptive anchor text helps SEO',
        fix: 'Use descriptive, keyword-rich anchor text',
      });
      score -= genericAnchors.length * 2;
    }

    return { score: Math.max(0, score), issues, category: 'links' };
  },

  // Image scoring
  scoreImages: (images) => {
    const issues = [];
    let score = 100;

    if (images.length === 0) {
      issues.push({
        severity: 'info',
        title: 'No images found',
        description: 'Page has no images',
        impact: 'Images can improve engagement and SEO',
        fix: 'Consider adding relevant images to your content',
      });
      return { score, issues, category: 'images' };
    }

    const missingAlt = images.filter(i => !i.hasAlt);
    const emptyAlt = images.filter(i => i.altEmpty);
    const missingDimensions = images.filter(i => !i.width || !i.height);
    const noLazyLoad = images.filter(i => i.loading !== 'lazy');

    if (missingAlt.length > 0) {
      issues.push({
        severity: 'critical',
        title: 'Images missing alt attribute',
        description: `${missingAlt.length} images have no alt attribute`,
        impact: 'Critical for accessibility and SEO',
        fix: 'Add descriptive alt text to all images',
      });
      score -= missingAlt.length * 5;
    }

    if (emptyAlt.length > 0) {
      issues.push({
        severity: 'warning',
        title: 'Images with empty alt text',
        description: `${emptyAlt.length} images have empty alt=""`,
        impact: 'Only decorative images should have empty alt',
        fix: 'Add descriptive alt text unless image is purely decorative',
      });
      score -= emptyAlt.length * 3;
    }

    if (missingDimensions.length > 0) {
      issues.push({
        severity: 'info',
        title: 'Images missing dimensions',
        description: `${missingDimensions.length} images lack width/height`,
        impact: 'Can cause layout shifts (CLS)',
        fix: 'Add width and height attributes to prevent layout shifts',
      });
      score -= missingDimensions.length * 2;
    }

    if (noLazyLoad.length > 3) {
      issues.push({
        severity: 'info',
        title: 'Images not lazy loaded',
        description: `${noLazyLoad.length} images could use lazy loading`,
        impact: 'May slow initial page load',
        fix: 'Add loading="lazy" to below-the-fold images',
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues, category: 'images' };
  },

  // Accessibility scoring
  scoreAccessibility: (accessibility) => {
    const issues = [];
    let score = 100;

    if (!accessibility.hasLang) {
      issues.push({
        severity: 'critical',
        title: 'Missing language attribute',
        description: 'HTML element has no lang attribute',
        impact: 'Screen readers need language information',
        fix: 'Add lang attribute to <html> element',
      });
      score -= 15;
    }

    if (!accessibility.hasMainLandmark) {
      issues.push({
        severity: 'warning',
        title: 'Missing main landmark',
        description: 'No <main> element or role="main" found',
        impact: 'Affects screen reader navigation',
        fix: 'Wrap main content in <main> element',
      });
      score -= 10;
    }

    if (!accessibility.hasNavLandmark) {
      issues.push({
        severity: 'info',
        title: 'Missing nav landmark',
        description: 'No <nav> element found',
        impact: 'Navigation regions help screen reader users',
        fix: 'Wrap navigation in <nav> element',
      });
      score -= 5;
    }

    if (!accessibility.hasSkipLink) {
      issues.push({
        severity: 'info',
        title: 'Missing skip link',
        description: 'No skip-to-content link found',
        impact: 'Keyboard users must tab through navigation',
        fix: 'Add a skip link at the start of the page',
      });
      score -= 5;
    }

    // Form labels check
    const formsWithoutLabels = accessibility.formsWithLabels.filter(
      f => !f.hasLabel && !f.hasAriaLabel
    );
    if (formsWithoutLabels.length > 0) {
      issues.push({
        severity: 'critical',
        title: 'Form inputs without labels',
        description: `${formsWithoutLabels.length} inputs lack proper labels`,
        impact: 'Screen reader users cannot identify inputs',
        fix: 'Add <label> elements or aria-label to all form inputs',
      });
      score -= formsWithoutLabels.length * 5;
    }

    return { score: Math.max(0, score), issues, category: 'accessibility' };
  },

  // AEO (Answer Engine Optimization) scoring
  scoreAEO: (metadata, schemas, headings, contentMetrics) => {
    const issues = [];
    let score = 100;

    // FAQ schema check
    const hasFAQ = schemas.some(s => s.type === 'FAQPage');
    if (!hasFAQ) {
      issues.push({
        severity: 'opportunity',
        title: 'No FAQ schema',
        description: 'Page lacks FAQPage structured data',
        impact: 'FAQ schema helps AI assistants find answers',
        fix: 'Add FAQPage schema if content includes Q&A',
      });
      score -= 15;
    }

    // HowTo schema check
    const hasHowTo = schemas.some(s => s.type === 'HowTo');
    const hasSteps = headings.some(h => 
      /step\s*\d|how\s*to/i.test(h.text)
    );
    if (hasSteps && !hasHowTo) {
      issues.push({
        severity: 'opportunity',
        title: 'Missing HowTo schema',
        description: 'Content appears to have steps but lacks HowTo schema',
        impact: 'HowTo schema improves visibility in AI responses',
        fix: 'Add HowTo structured data for step-by-step content',
      });
      score -= 10;
    }

    // Question-like headings
    const questionHeadings = headings.filter(h => 
      /^(what|how|why|when|where|who|which|can|does|is|are)\b/i.test(h.text)
    );
    if (questionHeadings.length === 0) {
      issues.push({
        severity: 'info',
        title: 'No question-format headings',
        description: 'Content lacks question-based headings',
        impact: 'Question headings align with voice search queries',
        fix: 'Add headings that match common user questions',
      });
      score -= 10;
    }

    // Content depth for comprehensive answers
    if (contentMetrics.wordCount < 1000) {
      issues.push({
        severity: 'info',
        title: 'Content may lack depth',
        description: `${contentMetrics.wordCount} words may not fully answer complex queries`,
        impact: 'AI assistants prefer comprehensive content',
        fix: 'Expand content to thoroughly cover the topic',
      });
      score -= 10;
    }

    // Clear, concise paragraphs
    if (contentMetrics.paragraphCount < 5) {
      issues.push({
        severity: 'info',
        title: 'Few content paragraphs',
        description: 'Content structure could be improved',
        impact: 'Well-structured content is easier to extract',
        fix: 'Break content into clear, focused paragraphs',
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues, category: 'aeo' };
  },

  // Performance scoring (heuristics based on HTML analysis)
  scorePerformance: (scripts, images, html) => {
    const issues = [];
    let score = 100;

    // Large inline scripts
    const largeInlineScripts = scripts.filter(s => s.isInline && s.size > 10000);
    if (largeInlineScripts.length > 0) {
      issues.push({
        severity: 'warning',
        title: 'Large inline scripts',
        description: `${largeInlineScripts.length} inline scripts over 10KB`,
        impact: 'Increases HTML size and blocks rendering',
        fix: 'Move large scripts to external files',
      });
      score -= largeInlineScripts.length * 5;
    }

    // Render-blocking scripts
    const blockingScripts = scripts.filter(s => !s.isInline && !s.async && !s.defer);
    if (blockingScripts.length > 3) {
      issues.push({
        severity: 'warning',
        title: 'Render-blocking scripts',
        description: `${blockingScripts.length} scripts block rendering`,
        impact: 'Delays page render and interaction',
        fix: 'Add async or defer to non-critical scripts',
      });
      score -= blockingScripts.length * 3;
    }

    // Large HTML size
    if (html.length > 100000) {
      issues.push({
        severity: 'info',
        title: 'Large HTML document',
        description: `HTML is ${Math.round(html.length / 1024)}KB`,
        impact: 'Large documents take longer to parse',
        fix: 'Consider reducing HTML size or lazy loading content',
      });
      score -= 10;
    }

    // Too many images
    if (images.length > 50) {
      issues.push({
        severity: 'info',
        title: 'Many images',
        description: `Page has ${images.length} images`,
        impact: 'May impact load time',
        fix: 'Consider lazy loading and image optimization',
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues, category: 'performance' };
  },
};

export default ScoringEngine;