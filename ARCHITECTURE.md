# SEO Toolkit Architecture

## Overview
Modular, self-hosted SEO analysis platform - open-source alternative to Semrush.
Built for portability and integration with Unitive SaaS.

## Core Principles
1. **No Vendor Lock-in**: All components are open-source and self-contained
2. **Modular Design**: Each tool is an independent module
3. **API-First**: Every feature exposed via API for external integration
4. **Stateless**: No required external services
5. **Scalable**: Horizontal scaling via containerization

## Project Structure

```
seo-toolkit/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes (Backend Logic)
│   │   │   ├── analyze/              # Onsite Analyzer API
│   │   │   ├── technical-scan/       # Technical Scanner API
│   │   │   ├── keywords/             # Keyword Extractor API
│   │   │   ├── link-map/             # Internal Link Mapper API
│   │   │   ├── serp-simulator/       # SERP Simulator API
│   │   │   ├── aeo/                  # AEO Assistant API
│   │   │   └── content-score/        # Content Scoring API
│   │   │
│   │   ├── modules/                  # Feature Pages
│   │   │   ├── onsite/               # Onsite Analyzer UI
│   │   │   ├── technical/            # Technical Scanner UI
│   │   │   ├── keywords/             # Keyword Extractor UI
│   │   │   ├── linkmap/              # Link Mapper UI
│   │   │   ├── serp/                 # SERP Simulator UI
│   │   │   ├── aeo/                  # AEO Assistant UI
│   │   │   └── content/              # Content Scorer UI
│   │   │
│   │   └── layout.tsx                # Root Layout
│   │
│   ├── components/                   # Shared UI Components
│   │   ├── modules/                  # Module-specific components
│   │   │   ├── onsite/
│   │   │   ├── technical/
│   │   │   ├── keywords/
│   │   │   ├── linkmap/
│   │   │   ├── serp/
│   │   │   ├── aeo/
│   │   │   └── content/
│   │   └── ui/                       # Reusable UI primitives
│   │
│   ├── lib/                          # Core Business Logic
│   │   ├── analyzers/                # Analysis Engines
│   │   │   ├── onsite-analyzer.ts
│   │   │   ├── technical-scanner.ts
│   │   │   ├── keyword-extractor.ts
│   │   │   ├── link-mapper.ts
│   │   │   ├── serp-generator.ts
│   │   │   ├── aeo-engine.ts
│   │   │   └── content-scorer.ts
│   │   │
│   │   ├── parsers/                  # HTML/Content Parsers
│   │   │   ├── html-parser.ts
│   │   │   ├── metadata-extractor.ts
│   │   │   └── link-extractor.ts
│   │   │
│   │   ├── nlp/                      # NLP Utilities
│   │   │   ├── tokenizer.ts
│   │   │   ├── entity-extractor.ts
│   │   │   └── readability.ts
│   │   │
│   │   └── utils/                    # Shared Utilities
│   │
│   └── types/                        # TypeScript Definitions
│       └── modules.ts
│
├── docs/                             # Documentation
│   ├── api/                          # API Documentation
│   └── integration/                  # Integration Guides
│
└── tests/                            # Test Suites
    ├── unit/
    └── integration/
```

## Module Design Pattern

Each module follows this pattern:

```
Module/
├── api/route.ts              # API endpoint
├── page.tsx                  # UI page
├── components/               # Module components
├── lib/engine.ts             # Core logic
└── types.ts                  # Type definitions
```

## API Design

All APIs follow REST principles:

```
POST /api/[module]
Content-Type: application/json

Request:
{
  "url": "https://example.com",
  "options": { ... }
}

Response:
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-01T00:00:00Z",
  "processingTime": 1234
}
```

## Data Flow

```
User Input → UI Component → API Route → Engine → Parser → Result → UI
```

## Storage Strategy

- **Session Data**: In-memory (Redis optional)
- **Historical Data**: SQLite/PostgreSQL (optional)
- **Export Formats**: JSON, CSV, PDF
- **No Required Database**: Everything works standalone

## Scaling Strategy

1. **Horizontal**: Multiple Next.js instances behind load balancer
2. **Caching**: Redis for API response caching
3. **Queue**: Bull for long-running scans
4. **Workers**: Separate processing workers for heavy tasks

## Integration Points

Each module exposes:
1. **REST API**: Standard HTTP endpoints
2. **TypeScript SDK**: Type-safe client library
3. **Webhooks**: Event notifications
4. **Exports**: JSON data for external processing

## Security

- Rate limiting on all APIs
- Input validation and sanitization
- CORS configuration
- API key authentication (optional)
- No data retention by default

## Performance Targets

- Page load: < 1s
- API response: < 3s
- Concurrent users: 100+
- Requests/second: 50+

## Technology Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Parsing**: Cheerio, DOMParser
- **NLP**: Natural (open-source)
- **Graphs**: Cytoscape.js, D3.js
- **Charts**: Recharts
- **Testing**: Jest, Playwright
- **Deployment**: Docker, Vercel, Self-hosted

## Deployment Options

1. **Vercel**: One-click deployment
2. **Docker**: Containerized deployment
3. **Self-hosted**: Node.js server
4. **Kubernetes**: Production scaling

## Environment Variables

```env
# Optional - all features work without these
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
API_KEY_SECRET=...
RATE_LIMIT_MAX=100
```

## License

MIT - Fully open-source, no restrictions
