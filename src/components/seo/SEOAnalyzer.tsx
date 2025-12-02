import React from 'react';
import { ScanEngine } from './ScanEngine';
import { ScoringEngine } from './ScoringEngine';
import { SchemaGenerator } from './SchemaGenerator';
import { GraphEngine } from './GraphEngine';

// Main SEO Analyzer - Orchestrates the full scan
export const SEOAnalyzer = {
  // Perform a complete analysis
  analyze: async (url, html = null) => {
    let htmlContent = html;

    // If no HTML provided, try to fetch via proxy or use sample
    if (!htmlContent) {
      try {
        // In a real implementation, this would fetch the URL
        // For browser-based analysis, we'll need the HTML passed in
        throw new Error('HTML content required for analysis');
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    }

    // Extract all data
    const metadata = ScanEngine.extractMetadata(htmlContent);
    const og = ScanEngine.extractOpenGraph(htmlContent);
    const twitter = ScanEngine.extractTwitterCard(htmlContent);
    const headings = ScanEngine.extractHeadings(htmlContent);
    const links = ScanEngine.extractLinks(htmlContent, url);
    const images = ScanEngine.extractImages(htmlContent);
    const schemas = ScanEngine.extractStructuredData(htmlContent);
    const contentMetrics = ScanEngine.extractContentMetrics(htmlContent);
    const scripts = ScanEngine.extractScripts(htmlContent);
    const accessibility = ScanEngine.extractAccessibility(htmlContent);
    const keywords = ScanEngine.extractKeywords(htmlContent);

    // Score all categories
    const metadataScore = ScoringEngine.scoreMetadata(metadata, og, twitter);
    const schemaScore = ScoringEngine.scoreSchema(schemas);
    const contentScore = ScoringEngine.scoreContent(headings, contentMetrics);
    const linksScore = ScoringEngine.scoreLinks(links);
    const imagesScore = ScoringEngine.scoreImages(images);
    const accessibilityScore = ScoringEngine.scoreAccessibility(accessibility);
    const performanceScore = ScoringEngine.scorePerformance(scripts, images, htmlContent);
    const aeoScore = ScoringEngine.scoreAEO(metadata, schemas, headings, contentMetrics);

    // Aggregate issues
    const allIssues = [
      ...metadataScore.issues.map(i => ({ ...i, category: 'metadata' })),
      ...schemaScore.issues.map(i => ({ ...i, category: 'schema' })),
      ...contentScore.issues.map(i => ({ ...i, category: 'content' })),
      ...linksScore.issues.map(i => ({ ...i, category: 'links' })),
      ...imagesScore.issues.map(i => ({ ...i, category: 'images' })),
      ...accessibilityScore.issues.map(i => ({ ...i, category: 'accessibility' })),
      ...performanceScore.issues.map(i => ({ ...i, category: 'performance' })),
      ...aeoScore.issues.map(i => ({ ...i, category: 'aeo' })),
    ];

    // Calculate overall scores
    const scores = {
      metadata: metadataScore.score,
      schema: schemaScore.score,
      content: contentScore.score,
      links: linksScore.score,
      images: imagesScore.score,
      accessibility: accessibilityScore.score,
      performance: performanceScore.score,
      aeo: aeoScore.score,
    };

    // Weight factors for overall score
    const weights = {
      metadata: 0.2,
      schema: 0.1,
      content: 0.15,
      links: 0.1,
      images: 0.1,
      accessibility: 0.1,
      performance: 0.1,
      aeo: 0.15,
    };

    const overallScore = Math.round(
      Object.entries(scores).reduce((sum, [key, score]) => sum + (score * (weights[key] || 0.1)), 0)
    );

    // SEO score (excluding AEO)
    const seoScore = Math.round(
      (scores.metadata * 0.25 + scores.schema * 0.15 + scores.content * 0.2 + 
       scores.links * 0.15 + scores.images * 0.1 + scores.performance * 0.15)
    );

    // Get schema suggestions
    const schemaSuggestions = SchemaGenerator.suggestSchemas({
      schemas,
      headings,
      contentMetrics,
    });

    // Build scan data object
    const scanData = {
      url,
      timestamp: new Date().toISOString(),
      metadata,
      og,
      twitter,
      headings,
      links,
      images,
      schemas,
      contentMetrics,
      scripts,
      accessibility,
      keywords,
      issues: allIssues,
      schemaSuggestions,
      scores: {
        ...scores,
        overall: overallScore,
        seo: seoScore,
      },
    };

    // Build graph
    const graph = GraphEngine.buildGraph(scanData);
    scanData.graph = graph;

    return scanData;
  },

  // Get severity counts
  getSeverityCounts: (issues) => {
    return {
      critical: issues.filter(i => i.severity === 'critical').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      opportunity: issues.filter(i => i.severity === 'opportunity').length,
    };
  },

  // Get issues by category
  getIssuesByCategory: (issues) => {
    const categories = {};
    issues.forEach(issue => {
      if (!categories[issue.category]) {
        categories[issue.category] = [];
      }
      categories[issue.category].push(issue);
    });
    return categories;
  },

  // Compare two scans
  compareScan: (oldScan, newScan) => {
    const comparison = {
      scoreChanges: {},
      newIssues: [],
      fixedIssues: [],
      unchangedIssues: [],
    };

    // Compare scores
    if (oldScan.scores && newScan.scores) {
      Object.keys(newScan.scores).forEach(key => {
        const oldScore = oldScan.scores[key] || 0;
        const newScore = newScan.scores[key] || 0;
        comparison.scoreChanges[key] = {
          old: oldScore,
          new: newScore,
          change: newScore - oldScore,
        };
      });
    }

    // Compare issues
    const oldIssueKeys = new Set(
      (oldScan.issues || []).map(i => `${i.category}:${i.title}`)
    );
    const newIssueKeys = new Set(
      (newScan.issues || []).map(i => `${i.category}:${i.title}`)
    );

    (newScan.issues || []).forEach(issue => {
      const key = `${issue.category}:${issue.title}`;
      if (!oldIssueKeys.has(key)) {
        comparison.newIssues.push(issue);
      } else {
        comparison.unchangedIssues.push(issue);
      }
    });

    (oldScan.issues || []).forEach(issue => {
      const key = `${issue.category}:${issue.title}`;
      if (!newIssueKeys.has(key)) {
        comparison.fixedIssues.push(issue);
      }
    });

    return comparison;
  },

  // Generate quick summary
  getSummary: (scanData) => {
    const criticalCount = scanData.issues?.filter(i => i.severity === 'critical').length || 0;
    const warningCount = scanData.issues?.filter(i => i.severity === 'warning').length || 0;

    let status = 'good';
    let message = 'Your page is well optimized!';

    if (criticalCount > 0) {
      status = 'critical';
      message = `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} need${criticalCount === 1 ? 's' : ''} immediate attention`;
    } else if (warningCount > 0) {
      status = 'warning';
      message = `${warningCount} issue${warningCount > 1 ? 's' : ''} could be improved`;
    }

    return {
      status,
      message,
      overallScore: scanData.scores?.overall || 0,
      seoScore: scanData.scores?.seo || 0,
      aeoScore: scanData.scores?.aeo || 0,
      criticalCount,
      warningCount,
      totalIssues: scanData.issues?.length || 0,
    };
  },
};

export default SEOAnalyzer;