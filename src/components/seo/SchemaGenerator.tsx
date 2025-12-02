import React from 'react';

// Schema Generator - Generate structured data recommendations
export const SchemaGenerator = {
  // Schema templates
  templates: {
    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: '',
      description: '',
      author: {
        '@type': 'Person',
        name: '',
      },
      datePublished: '',
      dateModified: '',
      image: '',
      publisher: {
        '@type': 'Organization',
        name: '',
        logo: {
          '@type': 'ImageObject',
          url: '',
        },
      },
    },
    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '',
          },
        },
      ],
    },
    HowTo: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: '',
      description: '',
      step: [
        {
          '@type': 'HowToStep',
          name: '',
          text: '',
        },
      ],
    },
    Product: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: '',
      description: '',
      image: '',
      brand: {
        '@type': 'Brand',
        name: '',
      },
      offers: {
        '@type': 'Offer',
        price: '',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '',
      url: '',
      logo: '',
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '',
        contactType: 'customer service',
      },
    },
    BreadcrumbList: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: '',
        },
      ],
    },
    Person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: '',
      jobTitle: '',
      email: '',
      image: '',
      sameAs: [],
    },
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '',
      url: '',
      potentialAction: {
        '@type': 'SearchAction',
        target: '{search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    LocalBusiness: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '',
        addressLocality: '',
        addressRegion: '',
        postalCode: '',
        addressCountry: '',
      },
      telephone: '',
      openingHours: '',
      priceRange: '',
    },
  },

  // Suggest schemas based on content analysis
  suggestSchemas: (scanData) => {
    const suggestions = [];
    const existingTypes = (scanData.schemas || []).map(s => s.type);

    // Always suggest Organization if not present
    if (!existingTypes.includes('Organization')) {
      suggestions.push({
        type: 'Organization',
        reason: 'Every website should have Organization schema for brand visibility',
        priority: 'high',
      });
    }

    // Always suggest WebSite if not present
    if (!existingTypes.includes('WebSite')) {
      suggestions.push({
        type: 'WebSite',
        reason: 'WebSite schema helps search engines understand site structure',
        priority: 'medium',
      });
    }

    // Suggest BreadcrumbList if not present
    if (!existingTypes.includes('BreadcrumbList')) {
      suggestions.push({
        type: 'BreadcrumbList',
        reason: 'Breadcrumbs improve navigation display in search results',
        priority: 'medium',
      });
    }

    // Check content for FAQ-like patterns
    const headings = scanData.headings || [];
    const questionHeadings = headings.filter(h => 
      /^(what|how|why|when|where|who|which|can|does|is|are)\b/i.test(h.text)
    );
    if (questionHeadings.length >= 2 && !existingTypes.includes('FAQPage')) {
      suggestions.push({
        type: 'FAQPage',
        reason: `Found ${questionHeadings.length} question-like headings that could be structured as FAQ`,
        priority: 'high',
        detected: questionHeadings.map(h => h.text),
      });
    }

    // Check for step-like content
    const stepHeadings = headings.filter(h => 
      /step\s*\d|^\d+\.|^#\d+/i.test(h.text)
    );
    if (stepHeadings.length >= 2 && !existingTypes.includes('HowTo')) {
      suggestions.push({
        type: 'HowTo',
        reason: `Found ${stepHeadings.length} step-like headings that could be structured as HowTo`,
        priority: 'high',
        detected: stepHeadings.map(h => h.text),
      });
    }

    // Suggest Article for content-heavy pages
    const wordCount = scanData.contentMetrics?.wordCount || 0;
    if (wordCount > 500 && !existingTypes.includes('Article') && 
        !existingTypes.includes('NewsArticle') && !existingTypes.includes('BlogPosting')) {
      suggestions.push({
        type: 'Article',
        reason: 'Content-rich page would benefit from Article schema',
        priority: 'medium',
      });
    }

    return suggestions;
  },

  // Generate a populated schema based on scan data
  generateSchema: (type, scanData) => {
    const template = JSON.parse(JSON.stringify(SchemaGenerator.templates[type]));
    
    if (!template) return null;

    const metadata = scanData.metadata || {};
    const url = scanData.url || '';

    switch (type) {
      case 'Article':
        template.headline = metadata.title || '';
        template.description = metadata.description || '';
        template.author.name = metadata.author || 'Author Name';
        template.datePublished = new Date().toISOString().split('T')[0];
        template.dateModified = new Date().toISOString().split('T')[0];
        template.image = scanData.og?.image || scanData.images?.[0]?.src || '';
        template.publisher.name = 'Publisher Name';
        break;

      case 'FAQPage':
        const questionHeadings = (scanData.headings || []).filter(h => 
          /^(what|how|why|when|where|who|which|can|does|is|are)\b/i.test(h.text)
        );
        template.mainEntity = questionHeadings.slice(0, 5).map(h => ({
          '@type': 'Question',
          name: h.text,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Add your answer here',
          },
        }));
        break;

      case 'HowTo':
        const stepHeadings = (scanData.headings || []).filter(h => 
          /step\s*\d|^\d+\./i.test(h.text)
        );
        template.name = metadata.title || 'How To Guide';
        template.description = metadata.description || '';
        template.step = stepHeadings.map((h, i) => ({
          '@type': 'HowToStep',
          name: h.text,
          text: 'Add step description',
          position: i + 1,
        }));
        break;

      case 'Organization':
        template.name = metadata.title?.split('|')[0]?.trim() || 'Organization Name';
        template.url = url.split('/').slice(0, 3).join('/');
        template.logo = scanData.og?.image || '';
        break;

      case 'WebSite':
        template.name = metadata.title?.split('|')[0]?.trim() || 'Website Name';
        template.url = url.split('/').slice(0, 3).join('/');
        template.potentialAction.target = url.split('/').slice(0, 3).join('/') + '/search?q={search_term_string}';
        break;

      case 'BreadcrumbList':
        const pathParts = url.split('/').filter(p => p && !p.includes('.'));
        template.itemListElement = pathParts.slice(2).map((part, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: part.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
          item: pathParts.slice(0, 3 + i).join('/'),
        }));
        break;
    }

    return template;
  },

  // Validate JSON-LD structure
  validateSchema: (schema) => {
    const errors = [];
    const warnings = [];

    if (!schema['@context']) {
      errors.push('Missing @context property');
    } else if (schema['@context'] !== 'https://schema.org') {
      warnings.push('Consider using https://schema.org as @context');
    }

    if (!schema['@type']) {
      errors.push('Missing @type property');
    }

    // Type-specific validation
    const type = schema['@type'];
    
    if (type === 'Article' || type === 'NewsArticle' || type === 'BlogPosting') {
      if (!schema.headline) warnings.push('Article should have headline');
      if (!schema.author) warnings.push('Article should have author');
      if (!schema.datePublished) warnings.push('Article should have datePublished');
      if (!schema.image) warnings.push('Article should have image');
    }

    if (type === 'FAQPage') {
      if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
        errors.push('FAQPage must have mainEntity array');
      } else if (schema.mainEntity.length === 0) {
        warnings.push('FAQPage should have at least one Question');
      }
    }

    if (type === 'Product') {
      if (!schema.name) errors.push('Product must have name');
      if (!schema.offers) warnings.push('Product should have offers');
    }

    if (type === 'Organization') {
      if (!schema.name) errors.push('Organization must have name');
      if (!schema.url) warnings.push('Organization should have url');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  // Format schema as HTML script tag
  formatAsScriptTag: (schema) => {
    return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
  },
};

export default SchemaGenerator;