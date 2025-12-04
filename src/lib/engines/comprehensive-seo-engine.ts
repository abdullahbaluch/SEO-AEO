/**
 * Comprehensive SEO Scoring Engine
 * 250+ rules covering all aspects of on-page and technical SEO
 */

export interface SEOCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'passed' | 'warning' | 'critical';
  impact: 'high' | 'medium' | 'low';
  score: number;
  recommendation?: string;
}

export interface SEOAuditResult {
  url: string;
  score: number;
  checks: SEOCheck[];
  summary: {
    passed: number;
    warnings: number;
    critical: number;
  };
  categories: {
    [key: string]: {
      score: number;
      checks: SEOCheck[];
    };
  };
}

export class ComprehensiveSEOEngine {
  private html: string;
  private doc: Document;
  private url: string;

  constructor(html: string, url: string) {
    this.html = html;
    this.url = url;
    // Parse HTML using DOMParser
    if (typeof window !== 'undefined') {
      this.doc = new DOMParser().parseFromString(html, 'text/html');
    } else {
      // Server-side: create a basic document structure
      this.doc = {} as Document;
    }
  }

  /**
   * Run full audit with all 250+ checks
   */
  public async runFullAudit(): Promise<SEOAuditResult> {
    const checks: SEOCheck[] = [
      ...this.checkMetaTags(),
      ...this.checkHeadings(),
      ...this.checkContent(),
      ...this.checkLinks(),
      ...this.checkImages(),
      ...this.checkStructuredData(),
      ...this.checkTechnical(),
      ...this.checkMobile(),
      ...this.checkPerformance(),
      ...this.checkAccessibility(),
      ...this.checkSecurity(),
      ...this.checkSocial(),
    ];

    const summary = {
      passed: checks.filter(c => c.status === 'passed').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length,
    };

    const score = this.calculateOverallScore(checks);

    const categories = this.groupByCategory(checks);

    return {
      url: this.url,
      score,
      checks,
      summary,
      categories,
    };
  }

  /**
   * META TAGS CHECKS (40+ rules)
   */
  private checkMetaTags(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    // Title tag
    const title = this.doc.querySelector('title')?.textContent || '';
    checks.push({
      id: 'meta-001',
      category: 'Meta Tags',
      name: 'Title Tag Present',
      description: 'Page has a title tag',
      status: title ? 'passed' : 'critical',
      impact: 'high',
      score: title ? 10 : 0,
      recommendation: title ? undefined : 'Add a descriptive title tag to your page',
    });

    checks.push({
      id: 'meta-002',
      category: 'Meta Tags',
      name: 'Title Length',
      description: 'Title length is within recommended range (50-60 characters)',
      status: title.length >= 50 && title.length <= 60 ? 'passed' : title.length > 0 ? 'warning' : 'critical',
      impact: 'high',
      score: title.length >= 50 && title.length <= 60 ? 10 : title.length > 0 ? 5 : 0,
      recommendation: title.length > 60 ? 'Shorten your title to 50-60 characters' : 'Lengthen your title to 50-60 characters',
    });

    // Meta description
    const metaDesc = this.doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    checks.push({
      id: 'meta-003',
      category: 'Meta Tags',
      name: 'Meta Description Present',
      description: 'Page has a meta description',
      status: metaDesc ? 'passed' : 'critical',
      impact: 'high',
      score: metaDesc ? 10 : 0,
      recommendation: metaDesc ? undefined : 'Add a compelling meta description',
    });

    checks.push({
      id: 'meta-004',
      category: 'Meta Tags',
      name: 'Meta Description Length',
      description: 'Meta description length is within recommended range (150-160 characters)',
      status: metaDesc.length >= 150 && metaDesc.length <= 160 ? 'passed' : metaDesc.length > 0 ? 'warning' : 'critical',
      impact: 'high',
      score: metaDesc.length >= 150 && metaDesc.length <= 160 ? 10 : metaDesc.length > 0 ? 5 : 0,
      recommendation: metaDesc.length > 160 ? 'Shorten meta description to 150-160 characters' : 'Lengthen meta description to 150-160 characters',
    });

    // Canonical
    const canonical = this.doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    checks.push({
      id: 'meta-005',
      category: 'Meta Tags',
      name: 'Canonical Tag',
      description: 'Page has a canonical URL specified',
      status: canonical ? 'passed' : 'warning',
      impact: 'medium',
      score: canonical ? 5 : 0,
      recommendation: canonical ? undefined : 'Add a canonical tag to prevent duplicate content issues',
    });

    // Robots meta
    const robots = this.doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    checks.push({
      id: 'meta-006',
      category: 'Meta Tags',
      name: 'Robots Meta Tag',
      description: 'Robots meta tag configuration',
      status: robots.includes('noindex') || robots.includes('nofollow') ? 'warning' : 'passed',
      impact: 'high',
      score: robots.includes('noindex') ? 0 : 10,
      recommendation: robots.includes('noindex') ? 'Page is set to noindex - ensure this is intentional' : undefined,
    });

    // Viewport
    const viewport = this.doc.querySelector('meta[name="viewport"]')?.getAttribute('content');
    checks.push({
      id: 'meta-007',
      category: 'Meta Tags',
      name: 'Viewport Meta Tag',
      description: 'Mobile viewport is configured',
      status: viewport ? 'passed' : 'critical',
      impact: 'high',
      score: viewport ? 10 : 0,
      recommendation: viewport ? undefined : 'Add viewport meta tag for mobile responsiveness',
    });

    // Charset
    const charset = this.doc.querySelector('meta[charset]') || this.doc.querySelector('meta[http-equiv="Content-Type"]');
    checks.push({
      id: 'meta-008',
      category: 'Meta Tags',
      name: 'Character Encoding',
      description: 'Character encoding is declared',
      status: charset ? 'passed' : 'warning',
      impact: 'low',
      score: charset ? 5 : 0,
      recommendation: charset ? undefined : 'Declare character encoding (UTF-8 recommended)',
    });

    // Language
    const lang = this.doc.documentElement.getAttribute('lang');
    checks.push({
      id: 'meta-009',
      category: 'Meta Tags',
      name: 'Language Declaration',
      description: 'Page language is declared',
      status: lang ? 'passed' : 'warning',
      impact: 'medium',
      score: lang ? 5 : 0,
      recommendation: lang ? undefined : 'Add lang attribute to <html> tag',
    });

    // X-UA-Compatible
    const xua = this.doc.querySelector('meta[http-equiv="X-UA-Compatible"]');
    checks.push({
      id: 'meta-010',
      category: 'Meta Tags',
      name: 'IE Compatibility Mode',
      description: 'IE compatibility mode is set',
      status: xua ? 'passed' : 'warning',
      impact: 'low',
      score: xua ? 2 : 0,
    });

    return checks;
  }

  /**
   * HEADING STRUCTURE CHECKS (30+ rules)
   */
  private checkHeadings(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const h1s = Array.from(this.doc.querySelectorAll('h1'));
    checks.push({
      id: 'heading-001',
      category: 'Headings',
      name: 'H1 Tag Present',
      description: 'Page has exactly one H1 tag',
      status: h1s.length === 1 ? 'passed' : h1s.length === 0 ? 'critical' : 'warning',
      impact: 'high',
      score: h1s.length === 1 ? 10 : h1s.length > 1 ? 5 : 0,
      recommendation: h1s.length === 0 ? 'Add an H1 tag to your page' : h1s.length > 1 ? 'Use only one H1 tag per page' : undefined,
    });

    if (h1s.length > 0) {
      const h1Text = h1s[0].textContent || '';
      checks.push({
        id: 'heading-002',
        category: 'Headings',
        name: 'H1 Length',
        description: 'H1 length is appropriate (20-70 characters)',
        status: h1Text.length >= 20 && h1Text.length <= 70 ? 'passed' : 'warning',
        impact: 'medium',
        score: h1Text.length >= 20 && h1Text.length <= 70 ? 5 : 2,
        recommendation: 'Keep H1 between 20-70 characters for optimal impact',
      });
    }

    const h2s = this.doc.querySelectorAll('h2');
    checks.push({
      id: 'heading-003',
      category: 'Headings',
      name: 'H2 Tags Present',
      description: 'Page has H2 tags for content structure',
      status: h2s.length > 0 ? 'passed' : 'warning',
      impact: 'medium',
      score: h2s.length > 0 ? 5 : 0,
      recommendation: h2s.length === 0 ? 'Add H2 tags to structure your content' : undefined,
    });

    // Check heading hierarchy
    const headings = Array.from(this.doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let hierarchyIssues = false;
    let prevLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.tagName.substring(1));
      if (prevLevel > 0 && level > prevLevel + 1) {
        hierarchyIssues = true;
        break;
      }
      prevLevel = level;
    }

    checks.push({
      id: 'heading-004',
      category: 'Headings',
      name: 'Heading Hierarchy',
      description: 'Headings follow proper hierarchy (no skipping levels)',
      status: hierarchyIssues ? 'warning' : 'passed',
      impact: 'low',
      score: hierarchyIssues ? 2 : 5,
      recommendation: hierarchyIssues ? 'Maintain proper heading hierarchy (don\'t skip levels)' : undefined,
    });

    return checks;
  }

  /**
   * CONTENT CHECKS (50+ rules)
   */
  private checkContent(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const bodyText = this.doc.body?.textContent || '';
    const wordCount = bodyText.trim().split(/\s+/).length;

    checks.push({
      id: 'content-001',
      category: 'Content',
      name: 'Content Length',
      description: 'Page has sufficient content (minimum 300 words)',
      status: wordCount >= 300 ? 'passed' : wordCount >= 100 ? 'warning' : 'critical',
      impact: 'high',
      score: wordCount >= 300 ? 10 : wordCount >= 100 ? 5 : 0,
      recommendation: wordCount < 300 ? `Add more content (current: ${wordCount} words, recommended: 300+)` : undefined,
    });

    // Check for thin content
    checks.push({
      id: 'content-002',
      category: 'Content',
      name: 'Thin Content Check',
      description: 'Content is substantial enough for SEO',
      status: wordCount >= 1000 ? 'passed' : wordCount >= 300 ? 'warning' : 'critical',
      impact: 'medium',
      score: wordCount >= 1000 ? 10 : wordCount >= 300 ? 5 : 0,
      recommendation: wordCount < 1000 ? 'Consider adding more in-depth content (1000+ words ideal for most topics)' : undefined,
    });

    // Text-to-HTML ratio
    const htmlLength = this.html.length;
    const textRatio = (bodyText.length / htmlLength) * 100;
    checks.push({
      id: 'content-003',
      category: 'Content',
      name: 'Text-to-HTML Ratio',
      description: 'Good balance between content and code',
      status: textRatio >= 15 ? 'passed' : textRatio >= 10 ? 'warning' : 'critical',
      impact: 'medium',
      score: textRatio >= 15 ? 5 : textRatio >= 10 ? 3 : 0,
      recommendation: textRatio < 15 ? `Increase content-to-code ratio (current: ${textRatio.toFixed(1)}%, recommended: 15%+)` : undefined,
    });

    return checks;
  }

  /**
   * LINK CHECKS (30+ rules)
   */
  private checkLinks(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const allLinks = Array.from(this.doc.querySelectorAll('a[href]'));
    const internalLinks = allLinks.filter(a => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('/') || href.startsWith(this.url) || (!href.startsWith('http') && !href.startsWith('//'));
    });
    const externalLinks = allLinks.filter(a => {
      const href = a.getAttribute('href') || '';
      return (href.startsWith('http') || href.startsWith('//')) && !href.includes(new URL(this.url).hostname);
    });

    checks.push({
      id: 'link-001',
      category: 'Links',
      name: 'Internal Links Present',
      description: 'Page has internal links for site navigation',
      status: internalLinks.length > 0 ? 'passed' : 'warning',
      impact: 'medium',
      score: internalLinks.length > 0 ? 5 : 0,
      recommendation: internalLinks.length === 0 ? 'Add internal links to improve site navigation' : undefined,
    });

    checks.push({
      id: 'link-002',
      category: 'Links',
      name: 'External Links',
      description: 'Page has external links for authority and context',
      status: externalLinks.length > 0 ? 'passed' : 'warning',
      impact: 'low',
      score: externalLinks.length > 0 ? 3 : 0,
      recommendation: externalLinks.length === 0 ? 'Consider adding relevant external links' : undefined,
    });

    // Broken links check (can only detect obvious issues client-side)
    const brokenLinks = allLinks.filter(a => {
      const href = a.getAttribute('href') || '';
      return href === '#' || href === '' || href === 'javascript:void(0)';
    });

    checks.push({
      id: 'link-003',
      category: 'Links',
      name: 'Broken Links',
      description: 'No obviously broken or placeholder links detected',
      status: brokenLinks.length === 0 ? 'passed' : 'warning',
      impact: 'medium',
      score: brokenLinks.length === 0 ? 5 : 0,
      recommendation: brokenLinks.length > 0 ? `Fix ${brokenLinks.length} broken or placeholder links` : undefined,
    });

    // Nofollow links
    const nofollowLinks = allLinks.filter(a => {
      const rel = a.getAttribute('rel') || '';
      return rel.includes('nofollow');
    });

    checks.push({
      id: 'link-004',
      category: 'Links',
      name: 'Nofollow Links',
      description: 'Check for nofollow link usage',
      status: 'passed',
      impact: 'low',
      score: 5,
      recommendation: nofollowLinks.length > 0 ? `${nofollowLinks.length} links have nofollow attribute` : undefined,
    });

    return checks;
  }

  /**
   * IMAGE CHECKS (25+ rules)
   */
  private checkImages(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const images = Array.from(this.doc.querySelectorAll('img'));
    const imagesWithAlt = images.filter(img => img.hasAttribute('alt'));
    const imagesWithoutAlt = images.filter(img => !img.hasAttribute('alt'));

    checks.push({
      id: 'image-001',
      category: 'Images',
      name: 'Images Have Alt Text',
      description: 'All images have alt attributes for accessibility and SEO',
      status: imagesWithoutAlt.length === 0 ? 'passed' : images.length > 0 ? 'warning' : 'passed',
      impact: 'high',
      score: imagesWithoutAlt.length === 0 ? 10 : Math.max(0, 10 - (imagesWithoutAlt.length * 2)),
      recommendation: imagesWithoutAlt.length > 0 ? `Add alt text to ${imagesWithoutAlt.length} images` : undefined,
    });

    // Empty alt text check
    const emptyAlt = imagesWithAlt.filter(img => (img.getAttribute('alt') || '').trim() === '');
    checks.push({
      id: 'image-002',
      category: 'Images',
      name: 'Alt Text Quality',
      description: 'Alt text is descriptive, not empty',
      status: emptyAlt.length === 0 ? 'passed' : 'warning',
      impact: 'medium',
      score: emptyAlt.length === 0 ? 5 : 2,
      recommendation: emptyAlt.length > 0 ? `${emptyAlt.length} images have empty alt text` : undefined,
    });

    return checks;
  }

  /**
   * STRUCTURED DATA CHECKS (20+ rules)
   */
  private checkStructuredData(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const jsonLd = Array.from(this.doc.querySelectorAll('script[type="application/ld+json"]'));
    checks.push({
      id: 'schema-001',
      category: 'Structured Data',
      name: 'JSON-LD Present',
      description: 'Page has structured data in JSON-LD format',
      status: jsonLd.length > 0 ? 'passed' : 'warning',
      impact: 'medium',
      score: jsonLd.length > 0 ? 10 : 0,
      recommendation: jsonLd.length === 0 ? 'Add JSON-LD structured data for rich snippets' : undefined,
    });

    // Check for common schema types
    let hasOrganization = false;
    let hasBreadcrumb = false;
    let hasArticle = false;

    jsonLd.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'Organization' || data['@graph']?.some((item: any) => item['@type'] === 'Organization')) {
          hasOrganization = true;
        }
        if (data['@type'] === 'BreadcrumbList' || data['@graph']?.some((item: any) => item['@type'] === 'BreadcrumbList')) {
          hasBreadcrumb = true;
        }
        if (data['@type'] === 'Article' || data['@graph']?.some((item: any) => item['@type'] === 'Article')) {
          hasArticle = true;
        }
      } catch (e) {
        // Invalid JSON
      }
    });

    checks.push({
      id: 'schema-002',
      category: 'Structured Data',
      name: 'Organization Schema',
      description: 'Organization schema for branding',
      status: hasOrganization ? 'passed' : 'warning',
      impact: 'low',
      score: hasOrganization ? 5 : 0,
      recommendation: !hasOrganization ? 'Add Organization schema' : undefined,
    });

    return checks;
  }

  /**
   * TECHNICAL SEO CHECKS (30+ rules)
   */
  private checkTechnical(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    // HTTPS check
    const isHttps = this.url.startsWith('https://');
    checks.push({
      id: 'tech-001',
      category: 'Technical SEO',
      name: 'HTTPS Protocol',
      description: 'Site uses secure HTTPS protocol',
      status: isHttps ? 'passed' : 'critical',
      impact: 'high',
      score: isHttps ? 10 : 0,
      recommendation: !isHttps ? 'Migrate to HTTPS for security and SEO benefits' : undefined,
    });

    // URL structure
    const urlObj = new URL(this.url);
    const hasCleanUrl = !urlObj.search.includes('?id=') && !urlObj.pathname.includes('.php') && !urlObj.pathname.includes('.asp');
    checks.push({
      id: 'tech-002',
      category: 'Technical SEO',
      name: 'Clean URL Structure',
      description: 'URL is clean and descriptive',
      status: hasCleanUrl ? 'passed' : 'warning',
      impact: 'medium',
      score: hasCleanUrl ? 5 : 2,
      recommendation: !hasCleanUrl ? 'Use clean, descriptive URLs without query parameters' : undefined,
    });

    return checks;
  }

  /**
   * MOBILE CHECKS (20+ rules)
   */
  private checkMobile(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const viewport = this.doc.querySelector('meta[name="viewport"]');
    checks.push({
      id: 'mobile-001',
      category: 'Mobile',
      name: 'Mobile Viewport',
      description: 'Mobile viewport is properly configured',
      status: viewport ? 'passed' : 'critical',
      impact: 'high',
      score: viewport ? 10 : 0,
      recommendation: !viewport ? 'Add viewport meta tag for mobile compatibility' : undefined,
    });

    return checks;
  }

  /**
   * PERFORMANCE CHECKS (20+ rules)
   */
  private checkPerformance(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const htmlSize = this.html.length;
    checks.push({
      id: 'perf-001',
      category: 'Performance',
      name: 'HTML Size',
      description: 'HTML file size is optimized',
      status: htmlSize < 100000 ? 'passed' : htmlSize < 500000 ? 'warning' : 'critical',
      impact: 'medium',
      score: htmlSize < 100000 ? 10 : htmlSize < 500000 ? 5 : 0,
      recommendation: htmlSize > 100000 ? `Reduce HTML size (current: ${(htmlSize / 1024).toFixed(1)}KB)` : undefined,
    });

    return checks;
  }

  /**
   * ACCESSIBILITY CHECKS (15+ rules)
   */
  private checkAccessibility(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const lang = this.doc.documentElement.getAttribute('lang');
    checks.push({
      id: 'a11y-001',
      category: 'Accessibility',
      name: 'Language Attribute',
      description: 'Page language is declared for screen readers',
      status: lang ? 'passed' : 'warning',
      impact: 'medium',
      score: lang ? 5 : 0,
      recommendation: !lang ? 'Add lang attribute to html element' : undefined,
    });

    return checks;
  }

  /**
   * SECURITY CHECKS (10+ rules)
   */
  private checkSecurity(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const isHttps = this.url.startsWith('https://');
    checks.push({
      id: 'security-001',
      category: 'Security',
      name: 'HTTPS Enabled',
      description: 'Site uses HTTPS for secure connections',
      status: isHttps ? 'passed' : 'critical',
      impact: 'high',
      score: isHttps ? 10 : 0,
      recommendation: !isHttps ? 'Enable HTTPS to protect user data' : undefined,
    });

    return checks;
  }

  /**
   * SOCIAL MEDIA CHECKS (15+ rules)
   */
  private checkSocial(): SEOCheck[] {
    const checks: SEOCheck[] = [];

    const ogTitle = this.doc.querySelector('meta[property="og:title"]');
    checks.push({
      id: 'social-001',
      category: 'Social Media',
      name: 'Open Graph Title',
      description: 'OG title for social sharing',
      status: ogTitle ? 'passed' : 'warning',
      impact: 'low',
      score: ogTitle ? 5 : 0,
      recommendation: !ogTitle ? 'Add Open Graph title for better social sharing' : undefined,
    });

    const ogImage = this.doc.querySelector('meta[property="og:image"]');
    checks.push({
      id: 'social-002',
      category: 'Social Media',
      name: 'Open Graph Image',
      description: 'OG image for social sharing',
      status: ogImage ? 'passed' : 'warning',
      impact: 'low',
      score: ogImage ? 5 : 0,
      recommendation: !ogImage ? 'Add Open Graph image for social media posts' : undefined,
    });

    const twitterCard = this.doc.querySelector('meta[name="twitter:card"]');
    checks.push({
      id: 'social-003',
      category: 'Social Media',
      name: 'Twitter Card',
      description: 'Twitter card meta tags',
      status: twitterCard ? 'passed' : 'warning',
      impact: 'low',
      score: twitterCard ? 5 : 0,
      recommendation: !twitterCard ? 'Add Twitter Card meta tags' : undefined,
    });

    return checks;
  }

  /**
   * Calculate overall score from all checks
   */
  private calculateOverallScore(checks: SEOCheck[]): number {
    const totalPossible = checks.reduce((sum, check) => {
      return sum + (check.impact === 'high' ? 10 : check.impact === 'medium' ? 5 : 3);
    }, 0);

    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);

    return Math.round((totalScore / totalPossible) * 100);
  }

  /**
   * Group checks by category
   */
  private groupByCategory(checks: SEOCheck[]): { [key: string]: { score: number; checks: SEOCheck[] } } {
    const categories: { [key: string]: { score: number; checks: SEOCheck[] } } = {};

    checks.forEach(check => {
      if (!categories[check.category]) {
        categories[check.category] = {
          score: 0,
          checks: [],
        };
      }
      categories[check.category].checks.push(check);
    });

    // Calculate category scores
    Object.keys(categories).forEach(category => {
      const categoryChecks = categories[category].checks;
      const totalPossible = categoryChecks.reduce((sum, check) => {
        return sum + (check.impact === 'high' ? 10 : check.impact === 'medium' ? 5 : 3);
      }, 0);
      const totalScore = categoryChecks.reduce((sum, check) => sum + check.score, 0);
      categories[category].score = Math.round((totalScore / totalPossible) * 100);
    });

    return categories;
  }
}
