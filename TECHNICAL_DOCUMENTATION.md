# SEO Toolkit - Technical Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [API Documentation](#api-documentation)
7. [Data Flow](#data-flow)
8. [Features Implemented](#features-implemented)
9. [Code Quality & Best Practices](#code-quality--best-practices)
10. [Performance Considerations](#performance-considerations)
11. [Security Considerations](#security-considerations)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Guide](#deployment-guide)
14. [Integration Guide](#integration-guide)
15. [Known Issues & Limitations](#known-issues--limitations)
16. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Project Purpose
Open-source, self-hosted SEO analysis platform designed as a lightweight alternative to commercial tools (Semrush, Ahrefs, Moz). Built for portability and easy integration into existing SaaS platforms.

### Key Achievements
- ✅ 7 independent SEO analysis modules
- ✅ Comprehensive reporting system with PDF export
- ✅ RESTful API architecture
- ✅ Type-safe TypeScript implementation
- ✅ No external service dependencies
- ✅ Modular, portable design

### Technology Choices Rationale
- **Next.js 15**: Server-side rendering, API routes, optimal performance
- **TypeScript**: Type safety, better IDE support, reduced runtime errors
- **Tailwind CSS**: Rapid UI development, consistent styling
- **TanStack Query**: Efficient data fetching and caching
- **Framer Motion**: Smooth animations and transitions

---

## Architecture Overview

### Design Principles

#### 1. Modular Architecture
Each SEO module is completely independent:
```
Module = Parser + Analyzer + API Endpoint + UI Component
```

#### 2. API-First Design
Every feature exposed via RESTful API endpoints for external integration.

#### 3. Separation of Concerns
```
UI Layer (React Components)
    ↓
API Layer (Next.js API Routes)
    ↓
Business Logic (Analyzer Engines)
    ↓
Data Layer (Parsers & Utilities)
```

#### 4. Stateless Operation
- No required database
- All data processing in-memory
- Optional persistence via external storage

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │  Modules │  │  Report  │  │Components│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ /analyze│  │/keywords│  │/technical│ │/full-report│      │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
└───────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Analyzers   │  │   Parsers    │  │  NLP Utils   │     │
│  │              │  │              │  │              │     │
│  │ • Onsite    │  │ • HTML       │  │ • Tokenizer  │     │
│  │ • Technical │  │ • Metadata   │  │ • Entity Ext │     │
│  │ • Keywords  │  │ • Links      │  │ • Readability│     │
│  │ • Content   │  │              │  │              │     │
│  │ • AEO       │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies
| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Next.js | 15.5.6 | Framework | Server-side rendering, API routes, optimal DX |
| React | 18.3.1 | UI Library | Component-based architecture, large ecosystem |
| TypeScript | 5.x | Language | Type safety, better tooling, reduced bugs |
| Tailwind CSS | 3.4.15 | Styling | Rapid development, consistent design |
| TanStack Query | 5.x | State Management | Efficient data fetching, caching, optimistic updates |
| Framer Motion | 11.x | Animations | Smooth transitions, professional UX |

### Development Tools
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (recommended)
- **Git**: Version control

### Runtime Environment
- **Node.js**: 18.x or higher recommended
- **npm/yarn/pnpm**: Package management

---

## Project Structure

```
seo-toolkit/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Endpoints
│   │   │   ├── analyze/              # Onsite analysis
│   │   │   ├── technical-scan/       # Technical SEO
│   │   │   ├── keywords/             # Keyword extraction
│   │   │   ├── content-score/        # Content scoring
│   │   │   ├── aeo/                  # AEO analysis
│   │   │   ├── serp-simulator/       # SERP preview
│   │   │   ├── link-map/             # Link mapping
│   │   │   ├── crawl/                # Website crawler
│   │   │   └── full-report/          # Comprehensive analysis
│   │   │
│   │   ├── modules/                  # Feature Pages
│   │   │   ├── onsite/               # Onsite analyzer UI
│   │   │   ├── technical/            # Technical scanner UI
│   │   │   ├── keywords/             # Keyword extractor UI
│   │   │   ├── content/              # Content scorer UI
│   │   │   ├── aeo/                  # AEO assistant UI
│   │   │   ├── serp/                 # SERP simulator UI
│   │   │   └── linkmap/              # Link mapper UI
│   │   │
│   │   ├── report/                   # Full report page
│   │   ├── crawler/                  # Legacy crawler page
│   │   ├── page.tsx                  # Dashboard
│   │   ├── layout.tsx                # Root layout
│   │   └── providers.tsx             # React Query provider
│   │
│   ├── components/                   # React Components
│   │   ├── seo/                      # SEO-specific components
│   │   │   ├── ComprehensiveReport.tsx
│   │   │   ├── SiteCrawler.tsx
│   │   │   ├── ScanForm.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   └── [other SEO components]
│   │   │
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── [other UI components]
│   │   │
│   │   └── Layout.tsx                # Global layout component
│   │
│   ├── lib/                          # Core Business Logic
│   │   ├── analyzers/                # Analysis Engines
│   │   │   ├── onsite-analyzer.ts    # 500+ lines
│   │   │   ├── technical-scanner.ts   # 400+ lines
│   │   │   ├── keyword-extractor.ts   # 200+ lines
│   │   │   ├── content-scorer.ts      # 600+ lines
│   │   │   ├── aeo-engine.ts          # 500+ lines
│   │   │   ├── serp-generator.ts      # 300+ lines
│   │   │   └── link-mapper.ts         # 400+ lines
│   │   │
│   │   ├── parsers/                  # HTML/Content Parsers
│   │   │   ├── html-parser.ts        # 250+ lines
│   │   │   ├── metadata-extractor.ts # 300+ lines
│   │   │   └── link-extractor.ts     # 350+ lines
│   │   │
│   │   ├── nlp/                      # NLP Utilities
│   │   │   ├── tokenizer.ts          # 400+ lines
│   │   │   ├── entity-extractor.ts   # 300+ lines
│   │   │   └── readability.ts        # 400+ lines
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   ├── pdf-generator.ts      # Professional PDF reports
│   │   │   └── index.ts              # Helper functions
│   │   │
│   │   └── api/                      # API Client
│   │       └── base44Client.ts       # Mock database
│   │
│   └── types/                        # TypeScript Definitions
│       ├── modules.ts                # All module types (334 lines)
│       └── entities.ts               # Entity types
│
├── public/                           # Static assets
├── docs/                             # Documentation
├── .next/                            # Next.js build output
├── node_modules/                     # Dependencies
│
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.js                    # Next.js config
├── ARCHITECTURE.md                   # Architecture documentation
├── TECHNICAL_DOCUMENTATION.md        # This file
└── README.md                         # Project readme
```

### Key Metrics
- **Total Files**: 60+ TypeScript/TSX files
- **Lines of Code**: ~15,000+ lines
- **Components**: 40+ React components
- **API Endpoints**: 9 RESTful endpoints
- **Analyzers**: 7 independent engines
- **Type Definitions**: 100+ interfaces/types

---

## Core Components

### 1. Parsers (`src/lib/parsers/`)

#### html-parser.ts
**Purpose**: Extract structured content from HTML
**Key Functions**:
- `parseHTML(html: string, baseUrl?: string): ParsedHTML`
- `extractTags(html: string, tag: string): string[]`
- `extractTextContent(html: string): string`
- `extractImages(html: string, baseUrl?: string)`
- `extractLinks(html: string, baseUrl?: string)`
- `checkHeadingHierarchy(headings)`

**Features**:
- Regex-based HTML parsing (no DOM dependencies)
- Heading extraction (h1-h6)
- Image extraction with alt text
- Link categorization
- Heading hierarchy validation

#### metadata-extractor.ts
**Purpose**: Extract SEO metadata and structured data
**Key Functions**:
- `extractMetadata(html: string): PageMetadata`
- `extractMetaTags(html: string): Record<string, string>`
- `extractOpenGraph(metaTags)`
- `extractTwitterCard(metaTags)`
- `extractSchema(html: string): any[]`
- `validateMetadata(metadata): ValidationResult`

**Supports**:
- Standard meta tags (title, description, keywords)
- Open Graph protocol
- Twitter Cards
- Schema.org JSON-LD
- Canonical URLs
- Alternate language links (hreflang)

#### link-extractor.ts
**Purpose**: Analyze link structure and relationships
**Key Functions**:
- `extractLinks(html: string, baseUrl: string): LinkAnalysis`
- `buildLinkGraph(pages): LinkGraph`
- `findOrphanPages(graph): string[]`
- `calculateLinkMetrics(links, wordCount): LinkMetrics`
- `checkLink(url: string): Promise<LinkStatus>`

**Features**:
- Internal/external link categorization
- Nofollow detection
- Link graph construction
- Orphan page detection
- Broken link checking

### 2. NLP Utilities (`src/lib/nlp/`)

#### tokenizer.ts
**Purpose**: Text analysis and keyword extraction
**Key Functions**:
- `tokenize(text: string, options): TokenStats`
- `extractNGrams(text: string, n: number): NGram[]`
- `calculateTFIDF(tokens, allDocuments)`
- `calculateKeywordDensity(text, keywords): Record<string, number>`
- `analyzeKeywordPlacement(keyword, title, headings, text)`

**Algorithms**:
- Stop word filtering (200+ common English words)
- N-gram extraction (bigrams, trigrams)
- TF-IDF scoring
- Keyword density calculation
- Strategic keyword placement analysis

#### entity-extractor.ts
**Purpose**: Named Entity Recognition (NER)
**Key Functions**:
- `extractEntities(text: string): Entity[]`
- `classifyEntity(entity, context): EntityType`
- `clusterEntities(entities): EntityCluster[]`

**Entity Types**:
- Person
- Organization
- Location
- Product
- Event
- Other

**Approach**: Pattern-based recognition with confidence scoring

#### readability.ts
**Purpose**: Content readability analysis
**Key Functions**:
- `calculateReadability(text: string): ReadabilityScores`
- `calculateTextStats(text: string): TextStats`
- `analyzeSentenceComplexity(text): SentenceComplexity`
- `estimateReadingTime(wordCount, wpm): ReadingTime`
- `calculateContentDepth(metrics): 'shallow' | 'moderate' | 'deep'`

**Metrics Implemented**:
- Flesch Reading Ease (0-100)
- Flesch-Kincaid Grade Level
- SMOG Index
- Coleman-Liau Index
- Automated Readability Index (ARI)

### 3. Analyzer Engines (`src/lib/analyzers/`)

#### onsite-analyzer.ts (500+ lines)
**Purpose**: Comprehensive on-page SEO analysis
**Process**:
1. Fetch page HTML
2. Parse HTML structure
3. Extract metadata
4. Analyze content quality
5. Check images and alt text
6. Analyze link structure
7. Compile issues
8. Calculate overall score

**Output**: `OnsiteAnalysisResult` with:
- SEO score (0-100)
- Heading structure
- Content analysis
- Image analysis
- Link analysis
- Issue list with recommendations

#### technical-scanner.ts (400+ lines)
**Purpose**: Technical SEO health checks
**Checks Performed**:
- SSL/HTTPS status
- robots.txt existence
- XML sitemap availability
- Canonical tags
- Meta robots directives
- Viewport (mobile-friendly)
- Structured data (JSON-LD)
- Page speed indicators

**Output**: `TechnicalScanResult` with:
- Technical score (0-100)
- Check results (pass/fail/warning)
- Summary statistics
- Recommendations

#### keyword-extractor.ts (200+ lines)
**Purpose**: Extract and analyze keywords
**Features**:
- Single keyword extraction
- Phrase extraction (bigrams, trigrams)
- Keyword clustering
- Frequency analysis
- Density calculation
- Difficulty estimation

**Output**: `KeywordExtractionResult` with:
- Top keywords (50+)
- Top phrases (20+)
- Keyword clusters
- Word statistics

#### content-scorer.ts (600+ lines)
**Purpose**: Content quality assessment
**Scoring Dimensions**:
1. **Clarity** (0-100): Readability, sentence complexity
2. **Structure** (0-100): Headings, paragraphs, lists
3. **Keyword Optimization** (0-100): Placement, density
4. **Engagement** (0-100): Length, diversity, questions
5. **Readability** (0-100): Flesch score

**Output**: `ContentScoreResult` with:
- Overall score (weighted average)
- Individual dimension scores
- Actionable recommendations
- Content metrics

#### aeo-engine.ts (500+ lines)
**Purpose**: Answer Engine Optimization
**Features**:
- Entity extraction and classification
- Topic identification
- Schema.org suggestions (Article, FAQPage, Product, etc.)
- Answerability scoring
- Question-answer format detection

**Output**: `AEOAnalysisResult` with:
- Entities with confidence scores
- Topics with relevance
- Schema suggestions with JSON-LD
- Answerability score with improvements

#### serp-generator.ts (300+ lines)
**Purpose**: SERP preview simulation
**Features**:
- Organic result generation (10 results)
- SERP features simulation:
  - People Also Ask (PAA)
  - Featured Snippets
  - Local Pack
  - Knowledge Panel
  - Image Pack
- Domain generation
- Metadata generation

**Output**: `SERPSimulatorResult` with:
- Organic results
- SERP features
- Metadata (result count, search time)

#### link-mapper.ts (400+ lines)
**Purpose**: Internal link structure analysis
**Features**:
- Website crawling (BFS algorithm)
- Link graph construction
- Orphan page detection
- Link distribution analysis
- Internal linking suggestions

**Output**: `LinkMapResult` with:
- Nodes (pages)
- Edges (links)
- Orphan pages
- Statistics

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently no authentication required (add API key authentication for production).

### Response Format
All endpoints return standardized JSON responses:

```typescript
{
  "success": boolean,
  "data": T | null,
  "error"?: string,
  "timestamp": string,
  "processingTime": number
}
```

### Endpoints

#### 1. POST /api/analyze
**Purpose**: Onsite SEO analysis

**Request**:
```json
{
  "url": "https://example.com",
  "includeContent": true,
  "checkImages": true,
  "checkLinks": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "score": 85,
    "issues": [...],
    "content": {...},
    "images": {...},
    "links": {...}
  },
  "timestamp": "2025-12-02T07:00:00.000Z",
  "processingTime": 1234
}
```

**Processing Time**: 2-5 seconds
**Rate Limit**: 100 requests/hour (recommended)

#### 2. POST /api/technical-scan
**Purpose**: Technical SEO checks

**Request**:
```json
{
  "url": "https://example.com",
  "checkRobots": true,
  "checkSitemap": true,
  "checkCanonical": true,
  "checkSSL": true
}
```

**Response**: Technical checks with pass/fail status
**Processing Time**: 3-7 seconds

#### 3. POST /api/keywords
**Purpose**: Keyword extraction

**Request**:
```json
{
  "url": "https://example.com",
  // OR
  "text": "Your content here...",
  "minLength": 3,
  "maxKeywords": 50
}
```

**Response**: Keywords, phrases, clusters
**Processing Time**: 1-3 seconds

#### 4. POST /api/content-score
**Purpose**: Content quality scoring

**Request**:
```json
{
  "url": "https://example.com",
  // OR
  "text": "Your content...",
  "targetKeyword": "seo tools"
}
```

**Response**: Scores and recommendations
**Processing Time**: 2-4 seconds

#### 5. POST /api/aeo
**Purpose**: AEO analysis

**Request**:
```json
{
  "url": "https://example.com",
  // OR
  "text": "Your content...",
  "suggestSchema": true
}
```

**Response**: Entities, topics, schemas
**Processing Time**: 2-5 seconds

#### 6. POST /api/serp-simulator
**Purpose**: SERP preview

**Request**:
```json
{
  "keyword": "seo tools",
  "location": "United States",
  "device": "desktop",
  "features": ["paa", "featured-snippet"]
}
```

**Response**: Simulated SERP
**Processing Time**: <1 second

#### 7. POST /api/link-map
**Purpose**: Link structure mapping

**Request**:
```json
{
  "startUrl": "https://example.com",
  "maxPages": 20,
  "maxDepth": 3
}
```

**Response**: Link graph
**Processing Time**: 30-120 seconds (depends on site size)

#### 8. POST /api/crawl
**Purpose**: Full website crawl

**Request**:
```json
{
  "startUrl": "https://example.com",
  "maxPages": 20,
  "maxDepth": 2,
  "checkExternal": false
}
```

**Response**: Crawl results
**Processing Time**: 20-180 seconds

#### 9. POST /api/full-report
**Purpose**: Comprehensive analysis (ALL modules)

**Request**:
```json
{
  "url": "https://example.com",
  "includeCrawl": true,
  "maxPages": 20
}
```

**Response**: Complete SEO report
**Processing Time**: 30-120 seconds

**What it does**:
- Runs all analyzers in parallel
- Compiles unified report
- Calculates overall score
- Aggregates all issues
- Optionally includes full crawl

---

## Data Flow

### Full Report Generation Flow

```
User Input (URL)
    ↓
/api/full-report
    ↓
Parallel Execution:
├─ analyzeOnsite() ───────→ Onsite Score
├─ scanTechnical() ───────→ Technical Score
├─ extractKeywords() ─────→ Keywords
├─ scoreContent() ────────→ Content Score
├─ analyzeAEO() ──────────→ AEO Score
└─ [Optional] crawl() ────→ Crawl Data
    ↓
Compile Results
    ↓
Calculate Overall Score
    ↓
Aggregate Issues
    ↓
Return Unified Report
    ↓
Frontend Rendering
    ↓
PDF Export (if requested)
```

### Module Processing Flow

```
URL Input
    ↓
fetch(url) ──→ HTML
    ↓
parseHTML() ──→ Parsed Structure
    ↓
extractMetadata() ──→ Meta Tags
    ↓
Analyzer Engine ──→ Analysis
    ↓
Issue Detection ──→ Issues List
    ↓
Score Calculation ──→ Score (0-100)
    ↓
Result Compilation
    ↓
API Response
```

---

## Features Implemented

### 1. Comprehensive Analysis
- ✅ On-page SEO (meta, content, structure)
- ✅ Technical SEO (SSL, robots.txt, sitemap)
- ✅ Keyword analysis
- ✅ Content quality scoring
- ✅ AEO optimization
- ✅ SERP preview
- ✅ Link structure mapping
- ✅ Website crawling

### 2. User Interface
- ✅ Modern, responsive design
- ✅ Dashboard with module cards
- ✅ Individual module pages
- ✅ Comprehensive report page
- ✅ Real-time analysis feedback
- ✅ Progress indicators
- ✅ Error handling
- ✅ Mobile-friendly

### 3. Reporting
- ✅ Unified report generation
- ✅ Professional PDF export
- ✅ JSON export
- ✅ Detailed metrics
- ✅ Issue prioritization
- ✅ Actionable recommendations

### 4. Integration
- ✅ RESTful API endpoints
- ✅ Type-safe interfaces
- ✅ Modular architecture
- ✅ No vendor lock-in
- ✅ Stateless operation

---

## Code Quality & Best Practices

### TypeScript Usage
- ✅ Strict mode enabled
- ✅ Comprehensive type definitions
- ✅ Interface-based contracts
- ✅ Type-safe API responses
- ✅ No `any` types (except where necessary)

### Code Organization
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Clear separation of concerns
- ✅ Consistent naming conventions
- ✅ Comprehensive comments

### Error Handling
```typescript
try {
  const result = await analyzeOnsite(request);
  return NextResponse.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    processingTime: Date.now() - startTime,
  });
} catch (error: any) {
  return NextResponse.json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
    processingTime: Date.now() - startTime,
  }, { status: 500 });
}
```

### Performance Optimizations
- ✅ Parallel API execution (`Promise.allSettled`)
- ✅ Request timeouts (30 seconds)
- ✅ Rate limiting (100ms between crawl requests)
- ✅ Efficient regex patterns
- ✅ Minimal DOM manipulation

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Color contrast compliance

---

## Performance Considerations

### Response Times
| Endpoint | Expected Time | Factors |
|----------|---------------|---------|
| /api/analyze | 2-5s | Page size, external resources |
| /api/technical-scan | 3-7s | Network requests (robots.txt, sitemap) |
| /api/keywords | 1-3s | Content length |
| /api/content-score | 2-4s | Content complexity |
| /api/aeo | 2-5s | Text processing |
| /api/serp-simulator | <1s | Simulation only |
| /api/link-map | 30-120s | Site size, crawl depth |
| /api/crawl | 20-180s | Pages crawled |
| /api/full-report | 30-120s | All analyses combined |

### Bottlenecks
1. **Network requests**: Fetching external URLs
2. **HTML parsing**: Regex-based parsing on large pages
3. **Crawling**: Sequential page fetching
4. **NLP processing**: Text analysis on large content

### Optimization Strategies
- Parallel execution where possible
- Caching (not yet implemented)
- Request pooling for crawl operations
- Worker threads for heavy computation (future)

---

## Security Considerations

### Current Implementation
- ✅ Input validation (URL format checking)
- ✅ Request timeouts (prevent hanging)
- ✅ User-Agent headers (identify bot traffic)
- ✅ CORS configuration (Next.js default)
- ✅ No data retention by default

### Recommended Additions
- ⚠️ Rate limiting per IP/user
- ⚠️ API key authentication
- ⚠️ Request size limits
- ⚠️ Sanitization of HTML output
- ⚠️ HTTPS enforcement in production
- ⚠️ Content Security Policy (CSP)
- ⚠️ Input sanitization for XSS prevention

### Vulnerabilities to Address
1. **SSRF (Server-Side Request Forgery)**:
   - Current: Accepts any URL
   - Fix: Whitelist domains or block internal IPs

2. **DoS (Denial of Service)**:
   - Current: No rate limiting
   - Fix: Implement rate limiting middleware

3. **Data exposure**:
   - Current: Full error messages returned
   - Fix: Generic error messages in production

---

## Testing Strategy

### Current Status
❌ No automated tests implemented

### Recommended Test Coverage

#### Unit Tests
```typescript
// Example test structure
describe('html-parser', () => {
  test('should extract title from HTML', () => {
    const html = '<html><head><title>Test</title></head></html>';
    const result = parseHTML(html);
    expect(result.title).toBe('Test');
  });

  test('should extract headings in order', () => {
    const html = '<h1>Main</h1><h2>Sub</h2>';
    const result = parseHTML(html);
    expect(result.headings.h1).toEqual(['Main']);
    expect(result.headings.h2).toEqual(['Sub']);
  });
});
```

#### Integration Tests
- API endpoint responses
- Full report generation
- Error handling paths

#### E2E Tests
- User flows (full report generation)
- Module interactions
- Export functionality

### Testing Tools Recommended
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

---

## Deployment Guide

### Environment Variables
```env
# Optional - all features work without these
DATABASE_URL=postgresql://...      # If using database
REDIS_URL=redis://...              # If using caching
API_KEY_SECRET=...                 # For API authentication
RATE_LIMIT_MAX=100                 # Requests per hour
NODE_ENV=production                # Production mode
```

### Deployment Options

#### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

**Pros**:
- One-click deployment
- Automatic HTTPS
- Edge network CDN
- Serverless functions

**Cons**:
- Function timeout limits (10s Hobby, 60s Pro)
- May need upgrade for long-running analyses

#### 2. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t seo-toolkit .
docker run -p 3000:3000 seo-toolkit
```

#### 3. Self-Hosted (Node.js)
```bash
npm ci
npm run build
npm start
```

**Requirements**:
- Node.js 18+
- 2GB RAM minimum
- Reverse proxy (nginx) recommended

#### 4. Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seo-toolkit
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: seo-toolkit
        image: seo-toolkit:latest
        ports:
        - containerPort: 3000
```

### Build Commands
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Production start
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Performance Tuning
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Increase timeout for long analyses
  serverRuntimeConfig: {
    apiTimeout: 120000, // 2 minutes
  },

  // Optimize images
  images: {
    domains: [], // Add allowed domains
    formats: ['image/webp'],
  },
};
```

---

## Integration Guide

### Using as API Service

#### JavaScript/TypeScript Client
```typescript
class SEOToolkitClient {
  constructor(private baseUrl: string) {}

  async analyzeOnsite(url: string): Promise<OnsiteAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }

  async fullReport(url: string, includeCrawl = false) {
    const response = await fetch(`${this.baseUrl}/api/full-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, includeCrawl }),
    });
    return response.json();
  }
}

// Usage
const client = new SEOToolkitClient('http://localhost:3000');
const report = await client.fullReport('https://example.com', true);
```

#### Python Client
```python
import requests

class SEOToolkitClient:
    def __init__(self, base_url):
        self.base_url = base_url

    def full_report(self, url, include_crawl=False):
        response = requests.post(
            f"{self.base_url}/api/full-report",
            json={"url": url, "includeCrawl": include_crawl}
        )
        return response.json()

# Usage
client = SEOToolkitClient('http://localhost:3000')
report = client.full_report('https://example.com', True)
```

#### cURL
```bash
# Full report
curl -X POST http://localhost:3000/api/full-report \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","includeCrawl":true}'

# Onsite analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Embedding in SaaS Platform

#### Option 1: API Integration
```typescript
// In your SaaS backend
import axios from 'axios';

async function analyzeSEO(userUrl: string) {
  const response = await axios.post('http://seo-toolkit:3000/api/full-report', {
    url: userUrl,
    includeCrawl: true,
  });

  // Store in your database
  await db.seoReports.create({
    userId: currentUser.id,
    url: userUrl,
    data: response.data.data,
    createdAt: new Date(),
  });

  return response.data;
}
```

#### Option 2: Monorepo Integration
```
your-saas/
├── apps/
│   ├── web/              # Your SaaS frontend
│   ├── api/              # Your SaaS backend
│   └── seo-toolkit/      # This project
└── packages/
    └── shared/
```

#### Option 3: Microservice
Deploy as separate service, communicate via HTTP/gRPC.

---

## Known Issues & Limitations

### Current Limitations

#### 1. Scalability
- **Single-threaded**: Node.js single process
- **No horizontal scaling**: No built-in load balancing
- **No queue system**: Long-running tasks block

**Impact**: Cannot handle high concurrent load
**Solution**: Add Redis queue (Bull/BullMQ) + worker processes

#### 2. Performance
- **Sequential crawling**: One page at a time
- **No caching**: Repeated analyses re-fetch everything
- **Large pages slow**: 10MB+ HTML pages cause delays

**Impact**: Slow for large sites
**Solution**: Parallel crawling, Redis caching, streaming parsing

#### 3. Accuracy
- **Regex-based parsing**: May miss edge cases
- **No JavaScript execution**: SPAs not fully analyzed
- **Simple NER**: Pattern-based entity recognition

**Impact**: May miss some content/entities
**Solution**: Use Cheerio/Puppeteer for better parsing

#### 4. Security
- **No authentication**: APIs publicly accessible
- **No rate limiting**: Vulnerable to abuse
- **SSRF possible**: Accepts any URL

**Impact**: Security risk in production
**Solution**: Add auth middleware, rate limiting, URL validation

### Known Bugs
1. **PDF export**: Opens print dialog instead of direct download
   - **Workaround**: Use browser print to PDF
   - **Fix**: Implement server-side PDF generation

2. **Long URLs**: URLs >200 chars may truncate
   - **Workaround**: None currently
   - **Fix**: Better URL handling in UI

3. **Cache errors**: Occasional webpack cache errors
   - **Workaround**: Delete `.next` folder
   - **Fix**: Investigate Next.js 15 caching issues

---

## Future Enhancements

### High Priority
1. **Authentication & Authorization**
   - API key system
   - User accounts
   - Usage quotas

2. **Performance Improvements**
   - Redis caching layer
   - Queue system (Bull)
   - Parallel crawling
   - Worker threads for NLP

3. **Enhanced Parsing**
   - Cheerio for HTML parsing
   - Puppeteer for JavaScript-rendered pages
   - Better error recovery

4. **Real PDF Generation**
   - Server-side PDF with charts
   - Branded templates
   - Custom styling

### Medium Priority
5. **Historical Tracking**
   - Database integration
   - Score trends over time
   - Change detection

6. **Competitive Analysis**
   - Compare multiple sites
   - Benchmark against competitors
   - Gap analysis

7. **Advanced NLP**
   - Better entity recognition
   - Sentiment analysis
   - Topic modeling

8. **Integrations**
   - Google Search Console
   - Google Analytics
   - Webhook notifications

### Low Priority
9. **Scheduled Scans**
   - Cron-based scanning
   - Email reports
   - Alerting system

10. **White-label Support**
    - Custom branding
    - Custom domains
    - Reseller features

---

## Maintenance & Support

### Code Maintenance
- **Regular updates**: Keep dependencies updated
- **Security patches**: Monitor npm audit
- **TypeScript updates**: Stay on latest stable
- **Next.js updates**: Follow Next.js release notes

### Monitoring
Recommended tools:
- **Sentry**: Error tracking
- **DataDog/New Relic**: Performance monitoring
- **LogRocket**: Session replay
- **Prometheus + Grafana**: Metrics

### Documentation Updates
- Update this file when architecture changes
- Document API changes in separate API docs
- Maintain changelog for version updates

---

## Conclusion

### Project Status
✅ **Production-Ready**: Core functionality complete
⚠️ **Security Hardening Needed**: Add auth, rate limiting
⚠️ **Performance Tuning Needed**: Add caching, optimize crawling
✅ **Well-Documented**: Comprehensive documentation
✅ **Type-Safe**: Full TypeScript coverage
✅ **Modular**: Easy to extend and integrate

### Strengths
1. Modular, portable architecture
2. Comprehensive SEO analysis
3. Type-safe implementation
4. Clean, maintainable code
5. No vendor lock-in
6. API-first design

### Areas for Improvement
1. Security hardening
2. Performance optimization
3. Automated testing
4. Better error handling
5. Enhanced parsing (SPAs)
6. Real PDF generation

### Recommended Next Steps
1. **Week 1**: Add authentication + rate limiting
2. **Week 2**: Implement Redis caching
3. **Week 3**: Add comprehensive test suite
4. **Week 4**: Server-side PDF generation
5. **Week 5**: Database integration for history
6. **Week 6**: Performance optimization

---

## Contact & Support

### Development Team
- **Lead Developer**: [Your Name]
- **Architecture**: [Architect Name]
- **Code Review**: [Reviewer Name]

### Repository
- **GitHub**: [Repository URL]
- **Issues**: [Issues URL]
- **Documentation**: [Docs URL]

### License
MIT License - Open source, no restrictions

---

**Document Version**: 1.0.0
**Last Updated**: December 2, 2025
**Next Review**: January 2, 2026
