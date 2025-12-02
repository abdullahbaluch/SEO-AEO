import { NextRequest, NextResponse } from 'next/server';
import { analyzeOnsite } from '@/lib/analyzers/onsite-analyzer';
import type { OnsiteAnalysisRequest } from '@/types/modules';

/**
 * POST /api/analyze
 * Onsite SEO Analysis API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: OnsiteAnalysisRequest = await request.json();

    // Validate request
    if (!body.url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
        },
        { status: 400 }
      );
    }

    // Perform analysis
    const result = await analyzeOnsite(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Onsite analysis error:', error);

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
