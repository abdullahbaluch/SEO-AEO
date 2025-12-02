import { NextRequest, NextResponse } from 'next/server';
import { generateSERP } from '@/lib/analyzers/serp-generator';
import type { SERPSimulatorRequest } from '@/types/modules';

/**
 * POST /api/serp-simulator
 * SERP Snapshot Simulator API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: SERPSimulatorRequest = await request.json();

    // Validate request
    if (!body.keyword) {
      return NextResponse.json(
        {
          success: false,
          error: 'keyword is required',
        },
        { status: 400 }
      );
    }

    // Generate SERP
    const result = await generateSERP(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('SERP generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Generation failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
