import { NextRequest, NextResponse } from 'next/server';
import { scoreContent } from '@/lib/analyzers/content-scorer';
import type { ContentScoreRequest } from '@/types/modules';

/**
 * POST /api/content-score
 * Content Score Engine API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ContentScoreRequest = await request.json();

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

    // Score content
    const result = await scoreContent(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Content scoring error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Scoring failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
