/**
 * SERP Snapshot Simulator - Simulate search engine results page
 * Generates mock SERP with features like PAA, featured snippets, local pack
 */

import type {
  SERPSimulatorRequest,
  SERPSimulatorResult,
  SERPResult,
  SERPFeature,
} from '@/types/modules';

/**
 * Generate simulated SERP
 */
export async function generateSERP(request: SERPSimulatorRequest): Promise<SERPSimulatorResult> {
  const {
    keyword,
    location = 'United States',
    device = 'desktop',
    features = [],
  } = request;

  // Generate organic results
  const results = generateOrganicResults(keyword, 10);

  // Generate SERP features
  const serpFeatures = generateSERPFeatures(keyword, features);

  // Generate metadata
  const metadata = {
    totalResults: generateResultCount(keyword),
    searchTime: `${(Math.random() * 0.5 + 0.1).toFixed(2)} seconds`,
  };

  return {
    keyword,
    results,
    features: serpFeatures,
    metadata,
  };
}

/**
 * Generate organic search results
 */
function generateOrganicResults(keyword: string, count: number): SERPResult[] {
  const results: SERPResult[] = [];

  for (let i = 0; i < count; i++) {
    const domain = generateDomain(keyword, i);
    const title = generateTitle(keyword, i);
    const description = generateDescription(keyword);
    const sitelinks = i === 0 ? generateSitelinks(domain) : undefined;

    results.push({
      position: i + 1,
      title,
      url: `https://${domain}`,
      description,
      sitelinks,
      breadcrumb: `${domain} › ${generateBreadcrumb(keyword)}`,
    });
  }

  return results;
}

/**
 * Generate domain name
 */
function generateDomain(keyword: string, index: number): string {
  const words = keyword.toLowerCase().split(/\s+/);
  const firstWord = words[0] || 'example';

  const domains = [
    `${firstWord}.com`,
    `www.${firstWord}online.com`,
    `${firstWord}hub.org`,
    `best${firstWord}.net`,
    `${firstWord}guide.io`,
    `the${firstWord}site.com`,
    `${firstWord}central.com`,
    `${firstWord}pro.com`,
    `all${firstWord}.com`,
    `${firstWord}world.com`,
  ];

  return domains[index] || `${firstWord}${index}.com`;
}

/**
 * Generate result title
 */
function generateTitle(keyword: string, index: number): string {
  const templates = [
    `${keyword} - Complete Guide 2024`,
    `Best ${keyword} - Top Picks & Reviews`,
    `${keyword}: Everything You Need to Know`,
    `${keyword} - Expert Tips & Tricks`,
    `Ultimate ${keyword} Guide | Pro Tips`,
    `${keyword} - Beginner to Advanced`,
    `${keyword} Explained Simply`,
    `Top 10 ${keyword} Solutions`,
    `${keyword} - Free Resources & Tools`,
    `${keyword} - Latest Updates 2024`,
  ];

  return templates[index] || `${keyword} - Information & Resources`;
}

/**
 * Generate meta description
 */
function generateDescription(keyword: string): string {
  const templates = [
    `Learn everything about ${keyword} with our comprehensive guide. Expert tips, best practices, and actionable advice for success.`,
    `Discover the best ${keyword} solutions. Compare features, pricing, and reviews to find the perfect fit for your needs.`,
    `Get started with ${keyword} today. Step-by-step tutorials, helpful resources, and community support included.`,
    `Expert ${keyword} insights and analysis. Stay up-to-date with the latest trends, tools, and techniques.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate sitelinks
 */
function generateSitelinks(domain: string): Array<{title: string; url: string}> {
  return [
    { title: 'Getting Started', url: `https://${domain}/getting-started` },
    { title: 'Pricing', url: `https://${domain}/pricing` },
    { title: 'Features', url: `https://${domain}/features` },
    { title: 'Support', url: `https://${domain}/support` },
  ];
}

/**
 * Generate breadcrumb
 */
function generateBreadcrumb(keyword: string): string {
  const words = keyword.split(/\s+/);
  return words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' › ');
}

/**
 * Generate result count
 */
function generateResultCount(keyword: string): string {
  const count = Math.floor(Math.random() * 900000000 + 100000000);
  return `About ${count.toLocaleString()} results`;
}

/**
 * Generate SERP features
 */
function generateSERPFeatures(
  keyword: string,
  requestedFeatures: SERPSimulatorRequest['features']
): SERPFeature[] {
  const features: SERPFeature[] = [];

  if (!requestedFeatures || requestedFeatures.length === 0) {
    // Auto-generate relevant features
    features.push(generatePAA(keyword));
    features.push(generateImagePack(keyword));
  } else {
    // Generate requested features
    requestedFeatures.forEach(featureType => {
      switch (featureType) {
        case 'paa':
          features.push(generatePAA(keyword));
          break;
        case 'featured-snippet':
          features.push(generateFeaturedSnippet(keyword));
          break;
        case 'local-pack':
          features.push(generateLocalPack(keyword));
          break;
        case 'knowledge-panel':
          features.push(generateKnowledgePanel(keyword));
          break;
      }
    });
  }

  return features;
}

/**
 * Generate People Also Ask
 */
function generatePAA(keyword: string): SERPFeature {
  const questions = [
    `What is ${keyword}?`,
    `How does ${keyword} work?`,
    `What are the benefits of ${keyword}?`,
    `Is ${keyword} worth it?`,
    `How much does ${keyword} cost?`,
  ];

  return {
    type: 'paa',
    title: 'People Also Ask',
    content: questions.slice(0, 4),
    position: 3,
  };
}

/**
 * Generate Featured Snippet
 */
function generateFeaturedSnippet(keyword: string): SERPFeature {
  return {
    type: 'featured-snippet',
    title: `About ${keyword}`,
    content: {
      text: `${keyword} is an important concept that helps users achieve their goals. It involves multiple aspects including planning, execution, and optimization. Many experts recommend starting with a solid foundation and building from there.`,
      source: `www.${keyword.toLowerCase().replace(/\s+/g, '')}.com`,
      date: new Date().toISOString().split('T')[0],
    },
    position: 0,
  };
}

/**
 * Generate Local Pack
 */
function generateLocalPack(keyword: string): SERPFeature {
  const businesses = [
    { name: `Best ${keyword} Services`, rating: 4.8, reviews: 127 },
    { name: `${keyword} Experts`, rating: 4.6, reviews: 89 },
    { name: `Top ${keyword} Solutions`, rating: 4.9, reviews: 203 },
  ];

  return {
    type: 'local-pack',
    title: 'Local Results',
    content: businesses,
    position: 1,
  };
}

/**
 * Generate Knowledge Panel
 */
function generateKnowledgePanel(keyword: string): SERPFeature {
  return {
    type: 'knowledge-panel',
    title: keyword,
    content: {
      description: `${keyword} refers to a concept or entity that is widely recognized and discussed across various platforms.`,
      image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(keyword)}`,
      facts: [
        { label: 'Category', value: 'Information' },
        { label: 'Related Topics', value: keyword.split(/\s+/).join(', ') },
      ],
    },
    position: 0,
  };
}

/**
 * Generate Image Pack
 */
function generateImagePack(keyword: string): SERPFeature {
  const images = Array.from({ length: 4 }, (_, i) => ({
    url: `https://via.placeholder.com/200x150?text=${encodeURIComponent(keyword)}+${i + 1}`,
    source: `image${i + 1}.com`,
  }));

  return {
    type: 'image-pack',
    title: 'Images',
    content: images,
    position: 2,
  };
}

/**
 * Analyze SERP competition
 */
export interface SERPAnalysis {
  competitionLevel: 'low' | 'medium' | 'high';
  topDomains: string[];
  averageTitleLength: number;
  averageDescriptionLength: number;
  featuresPresent: string[];
  recommendations: string[];
}

export function analyzeSERP(serp: SERPSimulatorResult): SERPAnalysis {
  // Analyze top domains
  const topDomains = serp.results.slice(0, 3).map(r => new URL(r.url).hostname);

  // Calculate average lengths
  const avgTitleLength = Math.round(
    serp.results.reduce((sum, r) => sum + r.title.length, 0) / serp.results.length
  );
  const avgDescLength = Math.round(
    serp.results.reduce((sum, r) => sum + r.description.length, 0) / serp.results.length
  );

  // Determine competition level
  const hasManyFeatures = serp.features.length >= 3;
  const competitionLevel = hasManyFeatures ? 'high' : serp.features.length >= 2 ? 'medium' : 'low';

  // Features present
  const featuresPresent = serp.features.map(f => f.type);

  // Generate recommendations
  const recommendations: string[] = [];

  if (avgTitleLength > 60) {
    recommendations.push('Keep title under 60 characters for better display');
  }
  if (avgDescLength > 160) {
    recommendations.push('Keep description under 160 characters');
  }
  if (featuresPresent.includes('featured-snippet')) {
    recommendations.push('Optimize for featured snippet with clear, concise answers');
  }
  if (featuresPresent.includes('paa')) {
    recommendations.push('Address "People Also Ask" questions in your content');
  }

  return {
    competitionLevel,
    topDomains,
    averageTitleLength: avgTitleLength,
    averageDescriptionLength: avgDescLength,
    featuresPresent,
    recommendations,
  };
}
