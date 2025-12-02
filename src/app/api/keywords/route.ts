import { NextRequest, NextResponse } from 'next/server';
import { extractKeywords } from '@/lib/analyzers/keyword-extractor';
import type { KeywordExtractionRequest } from '@/types/modules';

/**
 * POST /api/keywords
 * Keyword Extraction API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: KeywordExtractionRequest = await request.json();

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

    // Extract keywords
    const result = await extractKeywords(body);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Keyword extraction error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Extraction failed',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
