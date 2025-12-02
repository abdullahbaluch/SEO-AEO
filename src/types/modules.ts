/**
 * Type Definitions for SEO Toolkit Modules
 * All modules use these standardized types for portability
 */

// ============================================================================
// Common Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  processingTime: number;
}

export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: string;
  title: string;
  description: string;
  recommendation?: string;
  impact?: string;
  element?: string;
}

// ============================================================================
// Module 1: Onsite Analyzer
// ============================================================================

export interface OnsiteAnalysisRequest {
  url: string;
  includeContent?: boolean;
  checkImages?: boolean;
  checkLinks?: boolean;
}

export interface OnsiteAnalysisResult {
  url: string;
  title: string;
  metaDescription?: string;
  headings: HeadingStructure;
  content: ContentAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  issues: SEOIssue[];
  score: number;
}

export interface HeadingStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hierarchy: boolean;
  issues: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  readingTime: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  contentDepth: 'shallow' | 'moderate' | 'deep';
}

export interface ImageAnalysis {
  total: number;
  withAlt: number;
  withoutAlt: number;
  altCoverage: number;
  missingAlt: string[];
}

export interface LinkAnalysis {
  internal: number;
  external: number;
  broken: number;
  brokenLinks: Array<{url: string; status: number}>;
}

// ============================================================================
// Module 2: Technical Scanner
// ============================================================================

export interface TechnicalScanRequest {
  url: string;
  checkRobots?: boolean;
  checkSitemap?: boolean;
  checkCanonical?: boolean;
  checkSSL?: boolean;
}

export interface TechnicalScanResult {
  url: string;
  checks: TechnicalCheck[];
  score: number;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

export interface TechnicalCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation?: string;
  details?: any;
}

// ============================================================================
// Module 3: Keyword Extractor
// ============================================================================

export interface KeywordExtractionRequest {
  text?: string;
  url?: string;
  minLength?: number;
  maxKeywords?: number;
}

export interface KeywordExtractionResult {
  keywords: Keyword[];
  phrases: KeywordPhrase[];
  clusters: KeywordCluster[];
  totalWords: number;
  uniqueWords: number;
}

export interface Keyword {
  word: string;
  count: number;
  frequency: number;
  density: number;
  tfidf?: number;
}

export interface KeywordPhrase {
  phrase: string;
  count: number;
  words: number;
  type: 'bigram' | 'trigram' | 'n-gram';
}

export interface KeywordCluster {
  topic: string;
  keywords: string[];
  relevance: number;
}

// ============================================================================
// Module 4: Internal Link Mapper
// ============================================================================

export interface LinkMapRequest {
  startUrl: string;
  maxDepth?: number;
  maxPages?: number;
}

export interface LinkMapResult {
  nodes: LinkNode[];
  edges: LinkEdge[];
  orphanPages: string[];
  stats: {
    totalPages: number;
    totalLinks: number;
    avgLinksPerPage: number;
    maxDepth: number;
  };
}

export interface LinkNode {
  id: string;
  url: string;
  title: string;
  depth: number;
  incomingLinks: number;
  outgoingLinks: number;
  isOrphan: boolean;
  pageType?: string;
}

export interface LinkEdge {
  source: string;
  target: string;
  anchorText?: string;
  type: 'internal' | 'external';
}

// ============================================================================
// Module 5: SERP Snapshot Simulator
// ============================================================================

export interface SERPSimulatorRequest {
  keyword: string;
  location?: string;
  device?: 'desktop' | 'mobile';
  features?: ('paa' | 'featured-snippet' | 'local-pack' | 'knowledge-panel')[];
}

export interface SERPSimulatorResult {
  keyword: string;
  results: SERPResult[];
  features: SERPFeature[];
  metadata: {
    totalResults: string;
    searchTime: string;
  };
}

export interface SERPResult {
  position: number;
  title: string;
  url: string;
  description: string;
  sitelinks?: Array<{title: string; url: string}>;
  breadcrumb?: string;
}

export interface SERPFeature {
  type: 'paa' | 'featured-snippet' | 'local-pack' | 'knowledge-panel' | 'image-pack';
  title: string;
  content: any;
  position: number;
}

// ============================================================================
// Module 6: AEO Assistant
// ============================================================================

export interface AEOAnalysisRequest {
  url?: string;
  text?: string;
  suggestSchema?: boolean;
}

export interface AEOAnalysisResult {
  entities: Entity[];
  topics: Topic[];
  schemas: SchemasuggeSuggestion[];
  answerability: {
    score: number;
    factors: string[];
    improvements: string[];
  };
}

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'product' | 'event' | 'other';
  confidence: number;
  mentions: number;
  context?: string[];
}

export interface Topic {
  name: string;
  relevance: number;
  keywords: string[];
  category: string;
}

export interface SchemaSuggestion {
  type: string;
  confidence: number;
  properties: Record<string, any>;
  jsonld: string;
  reason: string;
}

// ============================================================================
// Module 7: Content Score Engine
// ============================================================================

export interface ContentScoreRequest {
  url?: string;
  text?: string;
  targetKeyword?: string;
}

export interface ContentScoreResult {
  overallScore: number;
  scores: {
    clarity: number;
    structure: number;
    keywordOptimization: number;
    engagement: number;
    readability: number;
  };
  recommendations: ContentRecommendation[];
  metrics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    avgWordsPerSentence: number;
    avgSentencesPerParagraph: number;
  };
}

export interface ContentRecommendation {
  type: 'clarity' | 'structure' | 'keyword' | 'engagement' | 'readability';
  priority: 'high' | 'medium' | 'low';
  message: string;
  impact: number;
  actionable: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
  followRedirects?: boolean;
}

export interface ScrapedContent {
  html: string;
  text: string;
  url: string;
  title: string;
  metadata: Record<string, string>;
}
