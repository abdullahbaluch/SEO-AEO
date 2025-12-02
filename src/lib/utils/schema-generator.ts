/**
 * Schema.org JSON-LD Generator
 * Generates structured data markup for better search engine understanding
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ProductData {
  name: string;
  description: string;
  image?: string;
  brand?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
}

export interface ArticleData {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  publisher: {
    name: string;
    logo?: string;
  };
}

/**
 * Generate FAQ Schema from questions and answers
 */
export function generateFAQSchema(faqs: FAQItem[]): any {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate FAQ Schema from scraped questions (auto-generate placeholder answers)
 */
export function generateFAQSchemaFromQuestions(questions: string[]): any {
  if (!questions || questions.length === 0) {
    return null;
  }

  const faqs: FAQItem[] = questions.map(q => ({
    question: q,
    answer: 'Please refer to the detailed article above for comprehensive information on this topic.',
  }));

  return generateFAQSchema(faqs);
}

/**
 * Generate Breadcrumb Schema
 */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): any {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Product Schema
 */
export function generateProductSchema(product: ProductData): any {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
  };

  if (product.image) schema.image = product.image;
  if (product.brand) schema.brand = { '@type': 'Brand', name: product.brand };

  if (product.price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
    };
  }

  if (product.rating !== undefined) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    };
  }

  return schema;
}

/**
 * Generate Article Schema
 */
export function generateArticleSchema(article: ArticleData): any {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.datePublished,
    publisher: {
      '@type': 'Organization',
      name: article.publisher.name,
    },
  };

  if (article.dateModified) schema.dateModified = article.dateModified;
  if (article.image) schema.image = article.image;
  if (article.publisher.logo) {
    schema.publisher.logo = {
      '@type': 'ImageObject',
      url: article.publisher.logo,
    };
  }

  return schema;
}

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema(data: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // Social media profiles
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
}): any {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
  };

  if (data.logo) schema.logo = data.logo;
  if (data.description) schema.description = data.description;
  if (data.sameAs) schema.sameAs = data.sameAs;
  if (data.contactPoint) schema.contactPoint = data.contactPoint;

  return schema;
}

/**
 * Generate HowTo Schema
 */
export function generateHowToSchema(data: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string; // ISO 8601 duration (e.g., "PT30M")
  image?: string;
}): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    totalTime: data.totalTime,
    image: data.image,
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Generate Review Schema
 */
export function generateReviewSchema(data: {
  itemName: string;
  rating: number;
  author: string;
  reviewBody: string;
  datePublished: string;
}): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: data.itemName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.rating,
      bestRating: 5,
    },
    author: {
      '@type': 'Person',
      name: data.author,
    },
    reviewBody: data.reviewBody,
    datePublished: data.datePublished,
  };
}

/**
 * Generate Local Business Schema
 */
export function generateLocalBusinessSchema(data: {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  priceRange?: string;
  openingHours?: string[];
}): any {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.street,
      addressLocality: data.address.city,
      addressRegion: data.address.state,
      postalCode: data.address.postalCode,
      addressCountry: data.address.country,
    },
  };

  if (data.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    };
  }

  if (data.telephone) schema.telephone = data.telephone;
  if (data.priceRange) schema.priceRange = data.priceRange;
  if (data.openingHours) schema.openingHoursSpecification = data.openingHours;

  return schema;
}

/**
 * Format schema as JSON-LD script tag
 */
export function formatSchemaAsScript(schema: any): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/**
 * Combine multiple schemas into a graph
 */
export function combineSchemas(...schemas: any[]): any {
  const validSchemas = schemas.filter(s => s !== null && s !== undefined);

  if (validSchemas.length === 0) return null;
  if (validSchemas.length === 1) return validSchemas[0];

  return {
    '@context': 'https://schema.org',
    '@graph': validSchemas.map(s => {
      // Remove @context from individual schemas
      const { '@context': _, ...rest } = s;
      return rest;
    }),
  };
}
