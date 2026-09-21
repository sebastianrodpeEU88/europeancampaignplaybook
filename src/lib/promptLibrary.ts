// The prompt library's collections. The Sanity prompt block imports this list
// (sanity/schemaTypes/article.ts), so a prompt written for a future bootcamp
// day can be filed into a collection as it is written, and appears in the
// library without any code change. Anything left unfiled lands in OTHER.

export const PROMPT_THEMES = [
  {
    slug: 'prompt-basics',
    title: 'Prompt basics',
    blurb: 'Role, audience and context, and the assumptions a model makes wherever you leave a gap.',
  },
  {
    slug: 'how-models-work',
    title: 'How models work',
    blurb: 'See prediction, fluency and training data for yourself, in your own tool.',
  },
  {
    slug: 'model-and-effort',
    title: 'Model and effort',
    blurb: 'Compare settings, make assumptions explicit, and stress-test an answer before you use it.',
  },
  {
    slug: 'policy-moments',
    title: 'Big policy moments',
    blurb: 'Summarise a speech, map it to your files, and turn it into an advocacy plan.',
  },
  {
    slug: 'research-evidence',
    title: 'Research and evidence',
    blurb: 'Organisational and issue research with sources, gaps, and context you can reuse.',
  },
  {
    slug: 'narrative-message',
    title: 'Narrative and message',
    blurb: 'Public narrative, and the same approved message carried across channels.',
  },
  {
    slug: 'stakeholders-audiences',
    title: 'Stakeholders and audiences',
    blurb: 'Verified stakeholder research, audience accessibility, and an inclusion check.',
  },
  {
    slug: 'visuals-video',
    title: 'Visuals and video',
    blurb: 'A creative brief first, then image concepts and short-form video prototypes.',
  },
  {
    slug: 'publish-measure',
    title: 'Publish, measure and translate',
    blurb: 'Rollout planning, measurement levels, and localisation that a fluent human approves.',
  },
] as const;

export type PromptThemeSlug = (typeof PROMPT_THEMES)[number]['slug'];

export const OTHER_THEME = {
  slug: 'more',
  title: 'More from the bootcamp',
  blurb: 'Prompts that have not been filed into a collection yet.',
} as const;

export interface LibraryPrompt {
  label: string;
  prompt: string | null; // null for signed-out visitors: the text stays server-side
  note?: string;
  theme?: string;
  episodeLabel: string;
  articleSlug: string;
  articleTitle: string;
  section: string;
}

export interface PromptCollection {
  slug: string;
  title: string;
  blurb: string;
  prompts: LibraryPrompt[];
}

// Groups prompts into the collections above, keeping the declared order and
// dropping collections that have nothing in them yet.
export function groupPrompts(prompts: LibraryPrompt[]): PromptCollection[] {
  const themes = [...PROMPT_THEMES, OTHER_THEME];
  return themes
    .map((theme) => ({
      slug: theme.slug,
      title: theme.title,
      blurb: theme.blurb,
      prompts: prompts.filter((p) =>
        theme.slug === OTHER_THEME.slug
          ? !p.theme || !PROMPT_THEMES.some((t) => t.slug === p.theme)
          : p.theme === theme.slug
      ),
    }))
    .filter((c) => c.prompts.length > 0);
}
