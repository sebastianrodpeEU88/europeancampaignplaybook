import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url';

export type ArticleType =
  | 'Explainer'
  | 'Practitioner framework'
  | 'Playbook'
  | 'Case study'
  | 'Interview'
  | 'Legal briefing'
  | 'Tool review'
  | 'Opinion essay'
  | 'Field note'
  | 'Field guide'
  | 'Prompt pack';

export type Difficulty = 'Beginner' | 'Practitioner' | 'Advanced' | 'Expert';

export type Jurisdiction =
  | 'EU-wide'
  | 'EU Member State'
  | 'Spain'
  | 'France'
  | 'Germany'
  | 'Italy'
  | 'Netherlands'
  | 'Poland'
  | 'International comparison';

export interface Author {
  id: string;
  slug: string;
  name: string;
  role: string;
  organisation: string;
  country: string;
  bio: string;
  initials: string;
  avatarColour: string;
  expertise: string[];
  disclosure: string;
  links: { label: string; url: string }[];
}

export interface Reviewer {
  name: string;
  role: string;
  reviewedOn: string; // e.g. "2026-05"
}

export interface ComplianceNote {
  accurateAsOf: string;   // e.g. "May 2026"
  jurisdiction: string;
  regulations: string[];  // e.g. ["Regulation (EU) 2024/900", "GDPR Art. 9"]
  reviewTrigger: string;
}

export interface ArticleImageBlock {
  _type: 'image';
  _key: string;
  asset: SanityImageSource;
  alt?: string;
  caption?: string;
}

export interface ArticleYoutubeEmbedBlock {
  _type: 'youtubeEmbed';
  _key: string;
  url: string;
  caption?: string;
}

export interface ArticleVideoFileBlock {
  _type: 'videoFile';
  _key: string;
  url: string;
  mimeType?: string;
  caption?: string;
}

export type ArticleBodyBlock =
  | PortableTextBlock
  | ArticleImageBlock
  | ArticleYoutubeEmbedBlock
  | ArticleVideoFileBlock;

export interface Article {
  id: string;
  slug: string;
  title: string;
  subheadline: string;
  coverImage?: SanityImageSource;
  type: ArticleType;
  pillarSlug: string;
  branchSlug: string;
  topicSlug: string;
  jurisdiction: Jurisdiction;
  countries: string[];
  difficulty: Difficulty;
  readingTime: number;
  lastUpdated: string;
  authorId: string;
  reviewer?: Reviewer;
  locked: boolean;
  whatItCovers: string;
  whoItIsFor: string;
  whenToUseIt: string;
  keyTakeaway: string;
  inBrief: string[];
  keyFramework?: {
    name: string;
    description: string;
    rows: { layer: string; label: string; description: string }[];
  };
  previewSection: { title: string; body: ArticleBodyBlock[] };
  fullSections: { title: string; body: ArticleBodyBlock[] }[];
  aiWorkflow?: string[];
  promptPack?: { title: string; prompt: string }[];
  complianceBox?: ComplianceNote;
  checklist?: string[];
  sources: string[];
  furtherReading: { title: string; type: ArticleType; readingTime: number }[];
  relatedTopicSlugs: string[];
  versionHistory: { date: string; note: string }[];
  trends: TrendRef[];
}

// The subset of Article fields needed for listing/browsing UI (cards,
// filters). Deliberately excludes gated fields (fullSections, checklist,
// promptPack, aiWorkflow, sources, furtherReading, previewSection, etc.).
// Use this — not Article — for any data passed into a Client Component that
// renders a list of articles: Client Component props get serialized into
// the page's RSC payload regardless of which fields are actually rendered,
// so passing the full Article there would leak locked articles' premium
// content to every visitor.
export type ArticleSummary = Pick<
  Article,
  | 'id'
  | 'slug'
  | 'title'
  | 'subheadline'
  | 'coverImage'
  | 'type'
  | 'pillarSlug'
  | 'jurisdiction'
  | 'difficulty'
  | 'readingTime'
  | 'locked'
  | 'authorId'
  | 'inBrief'
>;

export interface TrendRef {
  slug: string;
  title: string;
  number?: number;
  isFundamentals: boolean;
}

export interface Trend {
  id: string;
  slug: string;
  title: string;
  number?: number;
  year?: number;
  isFundamentals: boolean;
  description?: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  pillarSlug: string;
  branchSlug: string;
}

export interface Branch {
  id: string;
  slug: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface Pillar {
  id: string;
  slug: string;
  title: string;
  description: string;
  accentColour: string;
  isNew?: boolean;
  branches: Branch[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export type EventFormat = 'Online' | 'In-person' | 'Hybrid';

export interface Event {
  id: string;
  slug: string;
  title: string;
  coverImage?: SanityImageSource | null;
  coverColour?: 'navy' | 'blue' | 'green' | 'orange';
  membersOnly: boolean;
  startDateTime: string;
  endDateTime?: string;
  format: EventFormat;
  location: string;
  tags: string[];
  summary: string;
  description: PortableTextBlock[];
  registrationUrl?: string;
  waitingListUrl?: string;
  registrationLabel?: string;
}

// ── Search index ────────────────────────────────────────────────────────
// Thin, denormalized shapes for the sitewide command palette (⌘K) — just
// enough per item to render a result row and build its href client-side.
export interface SearchIndexArticle {
  id: string;
  slug: string;
  title: string;
  subheadline: string;
  type: ArticleType;
  pillarSlug: string | null;
  locked: boolean;
}

export interface SearchIndexTopic {
  slug: string;
  title: string;
  description: string;
  pillarSlug: string;
  pillarTitle: string;
}

export interface SearchIndexPillar {
  slug: string;
  title: string;
  description: string;
}

export interface SearchIndexTrend {
  slug: string;
  title: string;
  number: number;
}

export interface SearchIndex {
  articles: SearchIndexArticle[];
  topics: SearchIndexTopic[];
  pillars: SearchIndexPillar[];
  trends: SearchIndexTrend[];
}
