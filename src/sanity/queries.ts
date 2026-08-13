// GROQ query fragments and tags shared by src/lib/content.ts.
// Tags mirror Sanity document types so the webhook-driven revalidate route
// (src/app/api/revalidate/route.ts) can invalidate precisely by _type.

export const TAGS = {
  pillar: 'pillar',
  branch: 'branch',
  topic: 'topic',
  article: 'article',
  author: 'author',
  event: 'event',
  trend: 'trend',
} as const;

// Builds the nested pillar → branch → topic tree in a single GROQ query
// using back-reference joins, matching the shape the UI expects
// (Pillar.branches[].topics[]).
export const PILLARS_QUERY = /* groq */ `
*[_type == "pillar"] | order(order asc) {
  "id": _id,
  "slug": slug.current,
  title,
  description,
  accentColour,
  isNew,
  "branches": *[_type == "branch" && references(^._id)] | order(order asc) {
    "id": _id,
    "slug": slug.current,
    title,
    description,
    "topics": *[_type == "topic" && references(^._id)] | order(order asc) {
      "id": _id,
      "slug": slug.current,
      title,
      description,
      "pillarSlug": ^.^.slug.current,
      "branchSlug": ^.slug.current
    }
  }
}`;

export const PILLAR_BY_SLUG_QUERY = /* groq */ `
*[_type == "pillar" && slug.current == $slug][0] {
  "id": _id,
  "slug": slug.current,
  title,
  description,
  accentColour,
  isNew,
  "branches": *[_type == "branch" && references(^._id)] | order(order asc) {
    "id": _id,
    "slug": slug.current,
    title,
    description,
    "topics": *[_type == "topic" && references(^._id)] | order(order asc) {
      "id": _id,
      "slug": slug.current,
      title,
      description,
      "pillarSlug": ^.^.slug.current,
      "branchSlug": ^.slug.current
    }
  }
}`;

const ARTICLE_PROJECTION = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  subheadline,
  coverImage,
  type,
  "topicSlug": topic->slug.current,
  "branchSlug": topic->branch->slug.current,
  "pillarSlug": topic->pillar->slug.current,
  jurisdiction,
  // coalesce(..., []) on every array field: the schema leaves most of these
  // optional, so a document that omits one returns null — and the UI maps /
  // reads .length on them unguarded. Defaulting to [] here means an article
  // authored without, say, sources or fullSections can never crash the page.
  "countries": coalesce(countries, []),
  difficulty,
  readingTime,
  lastUpdated,
  "authorId": author._ref,
  reviewer,
  locked,
  whatItCovers,
  whoItIsFor,
  whenToUseIt,
  keyTakeaway,
  "inBrief": coalesce(inBrief, []),
  keyFramework,
  "previewSection": {
    "title": previewSection.title,
    "body": previewSection.body[]{
      ...,
      _type == "videoFile" => { "url": asset->url, "mimeType": asset->mimeType }
    }
  },
  "fullSections": coalesce(fullSections[]{
    title,
    "body": body[]{
      ...,
      _type == "videoFile" => { "url": asset->url, "mimeType": asset->mimeType }
    }
  }, []),
  "aiWorkflow": coalesce(aiWorkflow, []),
  "promptPack": coalesce(promptPack, []),
  complianceBox,
  "checklist": coalesce(checklist, []),
  "sources": coalesce(sources, []),
  "furtherReading": coalesce(furtherReading, []),
  "relatedTopicSlugs": coalesce(relatedTopics[]->slug.current, []),
  "versionHistory": coalesce(versionHistory, []),
  "trends": coalesce(trends[]->{
    "slug": slug.current,
    title,
    number,
    isFundamentals
  }, [])
}`;

// Fields needed for listing/browsing UI only — no gated content (fullSections,
// checklist, promptPack, aiWorkflow, sources, furtherReading, previewSection).
// Used wherever article data reaches a Client Component (e.g. ArticleList's
// client-side filtering), so premium content for locked articles never enters
// that page's RSC payload in the first place.
const ARTICLE_SUMMARY_PROJECTION = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  subheadline,
  coverImage,
  type,
  "pillarSlug": topic->pillar->slug.current,
  jurisdiction,
  difficulty,
  readingTime,
  locked,
  "authorId": author._ref,
  inBrief
}`;

export const ALL_ARTICLES_QUERY = /* groq */ `
*[_type == "article"] | order(lastUpdated desc) ${ARTICLE_PROJECTION}`;

export const ALL_ARTICLE_SUMMARIES_QUERY = /* groq */ `
*[_type == "article"] | order(lastUpdated desc) ${ARTICLE_SUMMARY_PROJECTION}`;

export const ARTICLE_BY_SLUG_QUERY = /* groq */ `
*[_type == "article" && slug.current == $slug][0] ${ARTICLE_PROJECTION}`;

export const ARTICLES_BY_PILLAR_QUERY = /* groq */ `
*[_type == "article" && topic->pillar->slug.current == $slug] | order(lastUpdated desc) ${ARTICLE_PROJECTION}`;

export const ARTICLES_BY_BRANCH_QUERY = /* groq */ `
*[_type == "article" && topic->branch->slug.current == $slug] | order(lastUpdated desc) ${ARTICLE_PROJECTION}`;

export const ARTICLES_BY_TOPIC_QUERY = /* groq */ `
*[_type == "article" && topic->slug.current == $slug] | order(lastUpdated desc) ${ARTICLE_PROJECTION}`;

export const TOPIC_ARTICLE_COUNTS_QUERY = /* groq */ `
*[_type == "topic"]{
  "slug": slug.current,
  "count": count(*[_type == "article" && references(^._id)])
}`;

const AUTHOR_PROJECTION = /* groq */ `{
  "id": _id,
  name,
  role,
  organisation,
  country,
  bio,
  initials,
  avatarColour,
  expertise,
  disclosure,
  links
}`;

export const ALL_AUTHORS_QUERY = /* groq */ `
*[_type == "author"] | order(name asc) ${AUTHOR_PROJECTION}`;

export const AUTHOR_BY_ID_QUERY = /* groq */ `
*[_type == "author" && _id == $id][0] ${AUTHOR_PROJECTION}`;

const EVENT_PROJECTION = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  coverImage,
  startDateTime,
  endDateTime,
  format,
  location,
  "tags": coalesce(tags, []),
  summary,
  description,
  registrationUrl,
  waitingListUrl,
  registrationLabel
}`;

export const ALL_EVENTS_QUERY = /* groq */ `
*[_type == "event"] | order(startDateTime desc) ${EVENT_PROJECTION}`;

export const EVENT_BY_SLUG_QUERY = /* groq */ `
*[_type == "event" && slug.current == $slug][0] ${EVENT_PROJECTION}`;

const TREND_PROJECTION = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  number,
  year,
  isFundamentals,
  description
}`;

export const ALL_TRENDS_QUERY = /* groq */ `
*[_type == "trend"] | order(isFundamentals asc, year desc, number asc) ${TREND_PROJECTION}`;

export const TREND_BY_SLUG_QUERY = /* groq */ `
*[_type == "trend" && slug.current == $slug][0] ${TREND_PROJECTION}`;

export const ARTICLES_BY_TREND_QUERY = /* groq */ `
*[_type == "article" && $trendId in trends[]._ref] | order(lastUpdated desc) ${ARTICLE_PROJECTION}`;

export const TREND_ARTICLE_COUNTS_QUERY = /* groq */ `
*[_type == "trend"]{
  "id": _id,
  "count": count(*[_type == "article" && references(^._id)])
}`;

// ── Search index ─────────────────────────────────────────────────────────
// One lightweight combined fetch for the sitewide command palette (⌘K).
// Kept intentionally thin — just enough per item to render a result row
// and build its href client-side.
export const SEARCH_INDEX_QUERY = /* groq */ `{
  "articles": *[_type == "article"]{
    "id": _id,
    "slug": slug.current,
    title,
    subheadline,
    type,
    "pillarSlug": topic->pillar->slug.current,
    locked
  },
  "topics": *[_type == "topic"]{
    "slug": slug.current,
    title,
    description,
    "pillarSlug": pillar->slug.current,
    "pillarTitle": pillar->title
  },
  "pillars": *[_type == "pillar"]{
    "slug": slug.current,
    title,
    description
  },
  "trends": *[_type == "trend" && isFundamentals == false]{
    "slug": slug.current,
    title,
    number
  }
}`;
