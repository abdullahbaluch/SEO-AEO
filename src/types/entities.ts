// Entity Type Definitions for SEO Toolkit

export type ScanStatus = 'pending' | 'scanning' | 'completed' | 'failed';
export type CrawlStatus = 'pending' | 'crawling' | 'completed' | 'stopped';
export type IssueCategory = 'metadata' | 'schema' | 'content' | 'keywords' | 'links' | 'accessibility' | 'performance' | 'images' | 'aeo';
export type IssueSeverity = 'critical' | 'warning' | 'info' | 'opportunity';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Backlog' | 'In Progress' | 'Review' | 'Completed';
export type TeamMemberRole = 'Marketing Manager' | 'Content Creator' | 'Social Media Specialist' | 'SEO Specialist' | 'PPC Specialist' | 'Designer' | 'Copywriter' | 'Data Analyst';
export type SkillType = 'content_creation' | 'social_media' | 'seo' | 'ppc_advertising' | 'design' | 'copywriting' | 'analytics' | 'strategy';
export type LinkType = 'dofollow' | 'nofollow' | 'ugc' | 'sponsored';
export type BacklinkStatus = 'active' | 'lost' | 'new';

export interface Skills {
  content_creation?: number;
  social_media?: number;
  seo?: number;
  ppc_advertising?: number;
  design?: number;
  copywriting?: number;
  analytics?: number;
  strategy?: number;
}

export interface Scan {
  id?: string;
  url: string;
  title?: string;
  status?: ScanStatus;
  seo_score?: number;
  aeo_score?: number;
  metadata_score?: number;
  schema_score?: number;
  content_score?: number;
  keyword_score?: number;
  link_score?: number;
  accessibility_score?: number;
  performance_score?: number;
  image_score?: number;
  issues_count?: number;
  critical_count?: number;
  warnings_count?: number;
  scan_data?: string;
  graph_data?: string;
  created_date?: string;
}

export interface Issue {
  id?: string;
  scan_id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description?: string;
  element?: string;
  current_value?: string;
  recommended_value?: string;
  impact?: string;
  fix_instructions?: string;
}

export interface CrawlSession {
  id?: string;
  start_url: string;
  domain?: string;
  status?: CrawlStatus;
  total_pages?: number;
  max_pages?: number;
  max_depth?: number;
  avg_seo_score?: number;
  pages_data?: string;
  graph_data?: string;
  created_date?: string;
}

export interface KeywordRank {
  id?: string;
  keyword: string;
  domain: string;
  position?: number;
  previous_position?: number;
  search_volume?: number;
  difficulty?: number;
  url?: string;
  history?: string;
  created_date?: string;
}

export interface Backlink {
  id?: string;
  domain: string;
  source_url: string;
  source_domain: string;
  target_url?: string;
  anchor_text?: string;
  domain_authority?: number;
  link_type?: LinkType;
  status?: BacklinkStatus;
  first_seen?: string;
  last_seen?: string;
}

export interface Competitor {
  id?: string;
  your_domain: string;
  competitor_domain: string;
  estimated_traffic?: number;
  domain_authority?: number;
  total_keywords?: number;
  total_backlinks?: number;
  referring_domains?: number;
  common_keywords?: number;
  top_keywords?: string;
  history?: string;
  created_date?: string;
}

export interface ContentAnalysis {
  id?: string;
  url: string;
  title?: string;
  target_keyword: string;
  content_score?: number;
  readability_score?: number;
  keyword_density?: number;
  word_count?: number;
  suggestions?: string;
  semantic_keywords?: string;
  created_date?: string;
}

export interface TeamMember {
  id?: string;
  name: string;
  role: TeamMemberRole;
  email: string;
  skills?: Skills;
  availability?: number;
  current_workload?: number;
  created_date?: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  required_skills?: SkillType[];
  campaign?: string;
  tags?: string[];
  created_date?: string;
}
