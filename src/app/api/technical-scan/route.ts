import { NextRequest, NextResponse } from 'next/server';
import { scanTechnical } from '@/lib/analyzers/technical-scanner';
import type { TechnicalScanRequest } from '@/types/modules';

/**
 * POST /api/technical-scan
 * Technical SEO Scanner API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TechnicalScanRequest = await request.json();

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

    // Perform scan
    const result = await scanTechnical(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Technical scan error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Scan failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
