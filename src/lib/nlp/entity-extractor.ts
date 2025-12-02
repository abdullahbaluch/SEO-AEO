/**
 * Entity Extractor - Simple named entity recognition
 * Extracts people, organizations, locations, products, etc.
 */

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'product' | 'event' | 'other';
  confidence: number;
  mentions: number;
  context: string[];
}

/**
 * Common patterns for entity recognition
 */
const PATTERNS = {
  // Capitalized words (potential entities)
  capitalized: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,

  // Organizations (Inc, Corp, Ltd, etc.)
  organization: /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s+(?:Inc|Corp|Corporation|Ltd|Limited|LLC|Company|Co|Group|Industries|Systems|Technologies|Services|Solutions|Enterprises)\b/g,

  // Locations (City, State, Country)
  location: /\b(?:New\s+York|Los\s+Angeles|San\s+Francisco|Chicago|London|Paris|Tokyo|Beijing|Mumbai|São\s+Paulo|California|Texas|United\s+States|USA|UK|Canada|Australia|Germany|France|China|Japan|India)\b/gi,

  // Products (common tech products, brands)
  product: /\b(?:iPhone|iPad|Android|Windows|MacBook|Tesla|PlayStation|Xbox|AWS|Azure|Google\s+Cloud)\b/gi,

  // Events (conference, summit, etc.)
  event: /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s+(?:Conference|Summit|Expo|Festival|Championship|Olympics|Awards)\b/g,

  // Person titles
  personTitle: /\b(?:Mr|Mrs|Ms|Dr|Prof|President|CEO|CTO|CFO|Director|Manager|Engineer|Developer)\b\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
};

/**
 * Extract named entities from text
 */
export function extractEntities(text: string): Entity[] {
  const entities = new Map<string, {
    type: Entity['type'];
    confidence: number;
    mentions: number;
    contexts: string[];
  }>();

  // Extract organizations
  const organizations = text.match(PATTERNS.organization) || [];
  organizations.forEach(org => {
    const normalized = org.trim();
    if (!entities.has(normalized)) {
      entities.set(normalized, {
        type: 'organization',
        confidence: 0.9,
        mentions: 0,
        contexts: [],
      });
    }
    const entry = entities.get(normalized)!;
    entry.mentions++;
    entry.contexts.push(extractContext(text, normalized));
  });

  // Extract locations
  const locations = text.match(PATTERNS.location) || [];
  locations.forEach(loc => {
    const normalized = loc.trim();
    if (!entities.has(normalized)) {
      entities.set(normalized, {
        type: 'location',
        confidence: 0.85,
        mentions: 0,
        contexts: [],
      });
    }
    const entry = entities.get(normalized)!;
    entry.mentions++;
    entry.contexts.push(extractContext(text, normalized));
  });

  // Extract products
  const products = text.match(PATTERNS.product) || [];
  products.forEach(prod => {
    const normalized = prod.trim();
    if (!entities.has(normalized)) {
      entities.set(normalized, {
        type: 'product',
        confidence: 0.8,
        mentions: 0,
        contexts: [],
      });
    }
    const entry = entities.get(normalized)!;
    entry.mentions++;
    entry.contexts.push(extractContext(text, normalized));
  });

  // Extract events
  const events = text.match(PATTERNS.event) || [];
  events.forEach(event => {
    const normalized = event.trim();
    if (!entities.has(normalized)) {
      entities.set(normalized, {
        type: 'event',
        confidence: 0.75,
        mentions: 0,
        contexts: [],
      });
    }
    const entry = entities.get(normalized)!;
    entry.mentions++;
    entry.contexts.push(extractContext(text, normalized));
  });

  // Extract people with titles
  const people = text.match(PATTERNS.personTitle) || [];
  people.forEach(person => {
    const normalized = person.trim();
    if (!entities.has(normalized)) {
      entities.set(normalized, {
        type: 'person',
        confidence: 0.85,
        mentions: 0,
        contexts: [],
      });
    }
    const entry = entities.get(normalized)!;
    entry.mentions++;
    entry.contexts.push(extractContext(text, normalized));
  });

  // Extract other capitalized entities (lower confidence)
  const capitalized = text.match(PATTERNS.capitalized) || [];
  capitalized.forEach(cap => {
    const normalized = cap.trim();

    // Skip if already classified
    if (entities.has(normalized)) return;

    // Skip common words
    const commonWords = new Set(['The', 'This', 'That', 'These', 'Those', 'There', 'Here', 'When', 'Where', 'What', 'Which', 'Who', 'How', 'Why']);
    if (commonWords.has(normalized)) return;

    // Skip short words
    if (normalized.length < 3) return;

    // Add as "other" entity type with low confidence
    if (!entities.has(normalized)) {
      entities.set(normalized, {
        type: 'other',
        confidence: 0.5,
        mentions: 0,
        contexts: [],
      });
    }
    const entry = entities.get(normalized)!;
    entry.mentions++;
    entry.contexts.push(extractContext(text, normalized));
  });

  // Convert to array
  const entityArray: Entity[] = Array.from(entities.entries()).map(([text, data]) => ({
    text,
    type: data.type,
    confidence: data.confidence,
    mentions: data.mentions,
    context: data.contexts.slice(0, 3), // Keep first 3 contexts
  }));

  // Sort by mentions (descending)
  entityArray.sort((a, b) => b.mentions - a.mentions);

  // Filter out entities with only 1 mention and low confidence
  return entityArray.filter(e => e.mentions > 1 || e.confidence > 0.7);
}

/**
 * Extract context around an entity mention
 */
function extractContext(text: string, entity: string, contextLength: number = 50): string {
  const index = text.indexOf(entity);
  if (index === -1) return '';

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + entity.length + contextLength);

  let context = text.slice(start, end);

  // Add ellipsis if truncated
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context.trim();
}

/**
 * Classify entity type based on context
 */
export function classifyEntity(entity: string, context: string): Entity['type'] {
  const entityLower = entity.toLowerCase();
  const contextLower = context.toLowerCase();

  // Organization indicators
  if (
    /\b(company|corporation|inc|ltd|llc|firm|agency|startup|business)\b/.test(contextLower) ||
    /\b(founded|acquired|merged|announced|released|launched)\b/.test(contextLower)
  ) {
    return 'organization';
  }

  // Person indicators
  if (
    /\b(said|told|wrote|believes|thinks|stated|explained|founded|created)\b/.test(contextLower) ||
    /\b(mr|mrs|ms|dr|prof|ceo|cto|founder|author|speaker)\b/.test(contextLower)
  ) {
    return 'person';
  }

  // Location indicators
  if (
    /\b(city|state|country|region|located|based|headquarters|office)\b/.test(contextLower) ||
    /\b(in|at|from|near|around)\s+\b/.test(contextLower)
  ) {
    return 'location';
  }

  // Product indicators
  if (
    /\b(product|service|software|app|tool|platform|device|system)\b/.test(contextLower) ||
    /\b(features|version|released|launched|announced)\b/.test(contextLower)
  ) {
    return 'product';
  }

  // Event indicators
  if (
    /\b(conference|summit|event|festival|expo|meeting|gathering|championship)\b/.test(contextLower) ||
    /\b(held|hosted|attended|organized|scheduled)\b/.test(contextLower)
  ) {
    return 'event';
  }

  return 'other';
}

/**
 * Group related entities into topics
 */
export interface EntityCluster {
  topic: string;
  entities: Entity[];
  relevance: number;
}

export function clusterEntities(entities: Entity[]): EntityCluster[] {
  // Simple clustering by entity type
  const clusters = new Map<string, Entity[]>();

  entities.forEach(entity => {
    const key = entity.type;
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(entity);
  });

  // Convert to array format
  const clusterArray: EntityCluster[] = Array.from(clusters.entries()).map(([type, ents]) => {
    const totalMentions = ents.reduce((sum, e) => sum + e.mentions, 0);
    const avgConfidence = ents.reduce((sum, e) => sum + e.confidence, 0) / ents.length;

    return {
      topic: type,
      entities: ents,
      relevance: totalMentions * avgConfidence,
    };
  });

  // Sort by relevance
  clusterArray.sort((a, b) => b.relevance - a.relevance);

  return clusterArray;
}
