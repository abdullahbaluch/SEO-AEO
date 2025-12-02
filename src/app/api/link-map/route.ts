import { NextRequest, NextResponse } from 'next/server';
import { mapLinks } from '@/lib/analyzers/link-mapper';
import type { LinkMapRequest } from '@/types/modules';

/**
 * POST /api/link-map
 * Internal Link Mapper API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: LinkMapRequest = await request.json();

    // Validate request
    if (!body.startUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'startUrl is required',
        },
        { status: 400 }
      );
    }

    // Map links
    const result = await mapLinks(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Link mapping error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Mapping failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
