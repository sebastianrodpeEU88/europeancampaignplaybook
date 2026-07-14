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
  type,
  "topicSlug": topic->slug.current,
  "branchSlug": topic->branch->slug.current,
  "pillarSlug": topic->pillar->slug.current,
  jurisdiction,
  countries,
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
  inBrief,
  keyFramework,
  previewSection,
  fullSections,
  aiWorkflow,
  promptPack,
  complianceBox,
  checklist,
  sources,
  furtherReading,
  "relatedTopicSlugs": relatedTopics[]->slug.current,
  versionHistory
}`;

export const ALL_ARTICLES_QUERY = /* groq */ `
*[_type == "article"] | order(lastUpdated desc) ${ARTICLE_PROJECTION}`;

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
  tags,
  summary,
  description,
  registrationUrl,
  registrationLabel
}`;

export const ALL_EVENTS_QUERY = /* groq */ `
*[_type == "event"] | order(startDateTime desc) ${EVENT_PROJECTION}`;

export const EVENT_BY_SLUG_QUERY = /* groq */ `
*[_type == "event" && slug.current == $slug][0] ${EVENT_PROJECTION}`;
