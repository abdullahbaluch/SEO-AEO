# SEO Toolkit - Next.js + React + Tailwind CSS

A comprehensive SEO (Search Engine Optimization) and AEO (Answer Engine Optimization) toolkit with integrated marketing team management capabilities, built with Next.js 15, React, TypeScript, and Tailwind CSS.

## Features

### 🔍 SEO Analysis
- **On-page SEO scoring** across 10 metrics
- **200+ automated checks** covering 8 categories
- **Answer Engine Optimization (AEO)** for AI assistants
- **Schema.org structured data** analysis and generation
- **Accessibility auditing**
- **Performance heuristics**

### 🕷️ Site Crawling
- Multi-page analysis with configurable depth/limits
- Link relationship mapping
- Site-wide score averaging
- Interactive site graph visualization

### 📈 Marketing Tools
- **Keyword tracking** with position history
- **Backlink monitoring** with status tracking
- **Competitor analysis** (traffic, keywords, backlinks)
- **Content optimizer** with readability scoring

### 📊 Data Visualization
- Network graphs of SEO relationships
- Historical trend charts
- Export to GEXF, GraphML, JSON formats

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with shadcn/ui patterns
- **State Management:** TanStack Query (React Query)
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
SEO/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page (Dashboard)
│   │   ├── globals.css          # Global styles
│   │   ├── dashboard/           # Dashboard route
│   │   ├── crawler/             # Crawler route
│   │   ├── marketing/           # Marketing tools route
│   │   ├── graph/               # Graph visualization route
│   │   └── analytics/           # Analytics route
│   │
│   ├── components/              # React components
│   │   ├── Layout.tsx           # App layout wrapper
│   │   ├── seo/                 # SEO analysis components (26 files)
│   │   │   ├── SEOAnalyzer.tsx
│   │   │   ├── ScanEngine.tsx
│   │   │   ├── ScoringEngine.tsx
│   │   │   ├── SchemaGenerator.tsx
│   │   │   ├── GraphEngine.tsx
│   │   │   ├── ReportGenerator.tsx
│   │   │   └── ...
│   │   ├── marketing/           # Marketing components
│   │   │   ├── KeywordTracker.tsx
│   │   │   ├── BacklinkMonitor.tsx
│   │   │   ├── ContentOptimizer.tsx
│   │   │   └── CompetitorAnalysis.tsx
│   │   └── ui/                  # Reusable UI components
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── entities.ts          # Entity interfaces
│   │
│   └── lib/                     # Utility functions
│       ├── entities/            # Entity schemas
│       └── seo/                 # SEO utilities
│
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── postcss.config.js           # PostCSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory for environment-specific variables:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url
```

### Database Setup

This project uses Base44 for entity management with JSON schemas. Configure your Base44 connection in:
- `src/lib/api/base44Client.ts` (you'll need to create this file)

## Key Components

### SEO Engines

- **ScanEngine** - HTML parsing and data extraction
- **ScoringEngine** - Scoring algorithms and issue detection
- **SchemaGenerator** - Schema.org structured data generation
- **GraphEngine** - Relationship graph building
- **ReportGenerator** - Export functionality (JSON, HTML, CSV)
- **SEOAnalyzer** - Main orchestrator

### Data Flow

1. User inputs URL or HTML
2. SEOAnalyzer orchestrates extraction (ScanEngine)
3. ScoringEngine analyzes and generates issues
4. Results saved to database
5. GraphEngine builds relationships
6. UI displays results with charts/tables
7. ReportGenerator exports data

## Routes

- `/` - Dashboard (SEO Analysis)
- `/crawler` - Site Crawler
- `/marketing` - Marketing Tools
- `/graph` - Graph Visualization
- `/analytics` - Analytics & Trends

## Development Notes

### File Extensions

All files have been converted to proper extensions:
- **Components:** `.tsx` (React TypeScript components)
- **Pages:** `.tsx` (Next.js pages)
- **Utilities:** `.ts` (TypeScript utilities)
- **Types:** `.ts` (TypeScript type definitions)
- **Styles:** `.css` (Stylesheets)

### Import Paths

The project uses absolute imports with the `@/` alias:
```typescript
import { Button } from '@/components/ui/button';
import { Scan } from '@/types/entities';
```

### Styling

- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming (see `globals.css`)
- **Responsive design** with mobile-first approach

## Next Steps

1. **Create missing UI components** (e.g., Button, Tabs, etc.) in `src/components/ui/`
2. **Set up Base44 client** or replace with your preferred database
3. **Configure API routes** if needed
4. **Add authentication** if required
5. **Customize theme** in `tailwind.config.ts` and `globals.css`
6. **Add tests** using Jest and React Testing Library

## Browser Compatibility

- **Analysis runs client-side** - all processing happens in the browser
- Requires modern browser with JavaScript enabled
- Uses DOMParser API for HTML parsing

## License

Private project - all rights reserved.

## Support

For questions or issues, please refer to the project documentation or contact the development team.
