import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const startTime = Date.now();
      const response = await fetch(targetUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Toolkit-Bot/1.0)',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      const loadTime = Date.now() - startTime;

      const html = await response.text();
      const finalUrl = response.url; // After redirects

      return NextResponse.json({
        html,
        url: finalUrl,
        status: response.status,
        statusText: response.statusText,
        redirected: response.redirected,
        loadTime,
        headers: {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - page took too long to load' },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch URL: ${fetchError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: { 'Content-Type': 'application/json' },
  }));
}
