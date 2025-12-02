import { NextRequest, NextResponse } from 'next/server';
import { analyzeOnsite } from '@/lib/analyzers/onsite-analyzer';
import { scanTechnical } from '@/lib/analyzers/technical-scanner';
import { extractKeywords } from '@/lib/analyzers/keyword-extractor';
import { analyzeAEO } from '@/lib/analyzers/aeo-engine';
import { scoreContent } from '@/lib/analyzers/content-scorer';

/**
 * POST /api/full-report
 * Comprehensive SEO Analysis - Runs all modules
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { url, includeCrawl = false, maxPages = 20 } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Run all analyses in parallel where possible
    const [
      onsiteResult,
      technicalResult,
      keywordResult,
      aeoResult,
      contentResult,
    ] = await Promise.allSettled([
      analyzeOnsite({ url, includeContent: true, checkImages: true, checkLinks: true }),
      scanTechnical({ url, checkRobots: true, checkSitemap: true, checkCanonical: true, checkSSL: true }),
      extractKeywords({ url, maxKeywords: 50 }),
      analyzeAEO({ url, suggestSchema: true }),
      scoreContent({ url }),
    ]);

    // Optionally run crawler (can be slow)
    let crawlResult = null;
    if (includeCrawl) {
      try {
        const crawlResponse = await fetch(`${request.nextUrl.origin}/api/crawl`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startUrl: url, maxPages, maxDepth: 2 }),
        });
        if (crawlResponse.ok) {
          crawlResult = await crawlResponse.json();
        }
      } catch (error) {
        console.error('Crawl failed:', error);
      }
    }

    // Compile results
    const report = {
      url,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,

      onsite: onsiteResult.status === 'fulfilled' ? onsiteResult.value : null,
      technical: technicalResult.status === 'fulfilled' ? technicalResult.value : null,
      keywords: keywordResult.status === 'fulfilled' ? keywordResult.value : null,
      aeo: aeoResult.status === 'fulfilled' ? aeoResult.value : null,
      content: contentResult.status === 'fulfilled' ? contentResult.value : null,
      crawl: crawlResult?.success ? crawlResult : null,

      // Calculate overall score
      overallScore: calculateOverallScore({
        onsite: onsiteResult.status === 'fulfilled' ? onsiteResult.value : null,
        technical: technicalResult.status === 'fulfilled' ? technicalResult.value : null,
        content: contentResult.status === 'fulfilled' ? contentResult.value : null,
        aeo: aeoResult.status === 'fulfilled' ? aeoResult.value : null,
      }),

      // Compile all issues
      allIssues: compileIssues({
        onsite: onsiteResult.status === 'fulfilled' ? onsiteResult.value : null,
        technical: technicalResult.status === 'fulfilled' ? technicalResult.value : null,
      }),

      errors: {
        onsite: onsiteResult.status === 'rejected' ? onsiteResult.reason.message : null,
        technical: technicalResult.status === 'rejected' ? technicalResult.reason.message : null,
        keywords: keywordResult.status === 'rejected' ? keywordResult.reason.message : null,
        aeo: aeoResult.status === 'rejected' ? aeoResult.reason.message : null,
        content: contentResult.status === 'rejected' ? contentResult.reason.message : null,
      },
    };

    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Full report error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Analysis failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall score from all modules
 */
function calculateOverallScore(results: any): number {
  const scores: number[] = [];

  if (results.onsite?.score) scores.push(results.onsite.score);
  if (results.technical?.score) scores.push(results.technical.score);
  if (results.content?.overallScore) scores.push(results.content.overallScore);
  if (results.aeo?.answerability?.score) scores.push(results.aeo.answerability.score);

  if (scores.length === 0) return 0;

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Compile all issues from different modules
 */
function compileIssues(results: any): any[] {
  const issues: any[] = [];

  if (results.onsite?.issues) {
    issues.push(...results.onsite.issues.map((i: any) => ({
      ...i,
      module: 'Onsite Analysis',
    })));
  }

  if (results.technical?.checks) {
    results.technical.checks.forEach((check: any) => {
      if (check.status === 'fail' || check.status === 'warning') {
        issues.push({
          severity: check.status === 'fail' ? 'critical' : 'warning',
          category: 'Technical SEO',
          title: check.name,
          description: check.message,
          recommendation: check.recommendation,
          module: 'Technical Scanner',
        });
      }
    });
  }

  // Sort by severity
  const severityOrder: { [key: string]: number } = { critical: 0, warning: 1, info: 2 };
  issues.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  return issues;
}
