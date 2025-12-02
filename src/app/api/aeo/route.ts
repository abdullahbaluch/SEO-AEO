import { NextRequest, NextResponse } from 'next/server';
import { analyzeAEO } from '@/lib/analyzers/aeo-engine';
import type { AEOAnalysisRequest } from '@/types/modules';

/**
 * POST /api/aeo
 * Answer Engine Optimization API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AEOAnalysisRequest = await request.json();

    // Validate request
    if (!body.text && !body.url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either text or url is required',
        },
        { status: 400 }
      );
    }

    // Analyze for AEO
    const result = await analyzeAEO(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('AEO analysis error:', error);

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
