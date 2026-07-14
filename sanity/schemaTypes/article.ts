import { defineArrayMember, defineField, defineType } from 'sanity';

const ARTICLE_TYPES = [
  'Explainer',
  'Practitioner framework',
  'Playbook',
  'Case study',
  'Interview',
  'Legal briefing',
  'Tool review',
  'Opinion essay',
  'Field note',
  'Prompt pack',
];

const DIFFICULTIES = ['Beginner', 'Practitioner', 'Advanced', 'Expert'];

const JURISDICTIONS = [
  'EU-wide',
  'EU Member State',
  'Spain',
  'France',
  'Germany',
  'Italy',
  'Netherlands',
  'Poland',
  'International comparison',
];

// Pillars whose content is inherently regulatory — mirrors the old
// COMPLIANCE_PILLAR_SLUGS check in src/lib/content.ts's validateArticle().
const COMPLIANCE_PILLAR_SLUGS = [
  'governance-ethics-compliance',
  'international-regulation-comparative',
];

async function touchesRegulatedPillar(
  topicRef: { _ref?: string } | undefined,
  context: { getClient: (options: { apiVersion: string }) => { fetch: (query: string, params?: Record<string, unknown>) => Promise<string | null> } }
): Promise<boolean> {
  if (!topicRef?._ref) return false;
  const client = context.getClient({ apiVersion: '2026-07-12' });
  const pillarSlug = await client.fetch(
    `*[_type == "topic" && _id == $id][0].pillar->slug.current`,
    { id: topicRef._ref }
  );
  return !!pillarSlug && COMPLIANCE_PILLAR_SLUGS.includes(pillarSlug);
}

const richText = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H3', value: 'h3' },
      { title: 'H4', value: 'h4' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bullet', value: 'bullet' },
      { title: 'Number', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [{ name: 'href', type: 'url', title: 'URL' }],
        },
      ],
    },
  }),
  defineArrayMember({
    type: 'image',
    name: 'image',
    title: 'Image',
    options: { hotspot: true },
    fields: [
      defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required() }),
      defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    ],
  }),
  defineArrayMember({
    type: 'object',
    name: 'youtubeEmbed',
    title: 'YouTube video',
    fields: [
      defineField({
        name: 'url',
        title: 'YouTube URL',
        type: 'url',
        description: 'e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...',
        validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
      }),
      defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    ],
    preview: {
      select: { url: 'url', caption: 'caption' },
      prepare({ url, caption }) {
        return { title: caption || 'YouTube video', subtitle: url };
      },
    },
  }),
  defineArrayMember({
    type: 'file',
    name: 'videoFile',
    title: 'Video file',
    options: { accept: 'video/*' },
    fields: [defineField({ name: 'caption', title: 'Caption', type: 'string' })],
  }),
];

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'metadata', title: 'Metadata', default: true },
    { name: 'summary', title: 'Summary' },
    { name: 'body', title: 'Body' },
    { name: 'gated', title: 'Gated content' },
    { name: 'compliance', title: 'Reviewer & compliance' },
    { name: 'related', title: 'Related & history' },
  ],
  fields: [
    // ── Metadata ──────────────────────────────────────────────────────
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'metadata', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'metadata',
      options: { source: 'title', maxLength: 120 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 2, group: 'metadata', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'type',
      title: 'Article type',
      type: 'string',
      group: 'metadata',
      options: { list: ARTICLE_TYPES },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'reference',
      to: [{ type: 'topic' }],
      group: 'metadata',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'trends',
      title: 'Trends',
      description: 'Which of this year’s community trends this article speaks to. Use "Fundamentals" if none of the current numbered trends fit.',
      type: 'array',
      group: 'metadata',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'trend' }] })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'jurisdiction',
      title: 'Jurisdiction',
      type: 'string',
      group: 'metadata',
      options: { list: JURISDICTIONS },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'metadata',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      group: 'metadata',
      options: { list: DIFFICULTIES },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'readingTime', title: 'Reading time (minutes)', type: 'number', group: 'metadata', validation: (Rule) => Rule.required().positive() }),
    defineField({ name: 'lastUpdated', title: 'Last updated', type: 'date', group: 'metadata', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'metadata',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'locked',
      title: 'Locked (members only)',
      type: 'boolean',
      group: 'metadata',
      initialValue: true,
    }),

    // ── Summary ───────────────────────────────────────────────────────
    defineField({ name: 'whatItCovers', title: 'What it covers', type: 'text', rows: 3, group: 'summary', validation: (Rule) => Rule.required() }),
    defineField({ name: 'whoItIsFor', title: 'Who it is for', type: 'text', rows: 3, group: 'summary', validation: (Rule) => Rule.required() }),
    defineField({ name: 'whenToUseIt', title: 'When to use it', type: 'text', rows: 3, group: 'summary', validation: (Rule) => Rule.required() }),
    defineField({ name: 'keyTakeaway', title: 'Key takeaway', type: 'text', rows: 2, group: 'summary', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'inBrief',
      title: 'In brief',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'summary',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'keyFramework',
      title: 'Key framework',
      type: 'object',
      group: 'summary',
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
        defineField({
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'frameworkRow',
              fields: [
                defineField({ name: 'layer', title: 'Layer', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'description', title: 'Description', type: 'string', validation: (Rule) => Rule.required() }),
              ],
              preview: { select: { title: 'layer', subtitle: 'label' } },
            }),
          ],
          validation: (Rule) => Rule.required().min(1),
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { type?: string } | undefined;
          const requires = doc?.type === 'Practitioner framework' || doc?.type === 'Playbook';
          if (requires && !value) {
            return 'Required for Practitioner framework and Playbook article types.';
          }
          return true;
        }),
    }),

    // ── Body ──────────────────────────────────────────────────────────
    defineField({
      name: 'previewSection',
      title: 'Preview section',
      description: 'Shown to everyone, including locked/non-member readers.',
      type: 'object',
      group: 'body',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'body', title: 'Body', type: 'array', of: richText, validation: (Rule) => Rule.required() }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fullSections',
      title: 'Full sections',
      description: 'Gated: stripped server-side from the response for locked articles.',
      type: 'array',
      group: 'gated',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'section',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'body', title: 'Body', type: 'array', of: richText, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),

    // ── Gated content ─────────────────────────────────────────────────
    defineField({
      name: 'aiWorkflow',
      title: 'AI workflow suggestions',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'gated',
    }),
    defineField({
      name: 'promptPack',
      title: 'Prompt pack',
      type: 'array',
      group: 'gated',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'prompt',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'prompt', title: 'Prompt', type: 'text', rows: 6, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { type?: string } | undefined;
          if (doc?.type === 'Prompt pack' && (!value || value.length === 0)) {
            return 'Required (non-empty) for Prompt pack article types.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'checklist',
      title: 'Checklist',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'gated',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'gated',
    }),
    defineField({
      name: 'furtherReading',
      title: 'Further reading',
      type: 'array',
      group: 'gated',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'furtherReadingItem',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'type', title: 'Type', type: 'string', options: { list: ARTICLE_TYPES }, validation: (Rule) => Rule.required() }),
            defineField({ name: 'readingTime', title: 'Reading time (minutes)', type: 'number', validation: (Rule) => Rule.required().positive() }),
          ],
          preview: { select: { title: 'title', subtitle: 'type' } },
        }),
      ],
    }),

    // ── Reviewer & compliance ────────────────────────────────────────
    defineField({
      name: 'reviewer',
      title: 'Reviewer',
      type: 'object',
      group: 'compliance',
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'role', title: 'Role', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'reviewedOn', title: 'Reviewed on', type: 'string', description: 'e.g. "2026-05"', validation: (Rule) => Rule.required() }),
      ],
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          const doc = context.document as { type?: string; complianceBox?: unknown; topic?: { _ref?: string } } | undefined;
          const requires =
            doc?.type === 'Legal briefing' ||
            !!doc?.complianceBox ||
            (await touchesRegulatedPillar(doc?.topic, context));
          if (requires && !value) {
            return 'Required for Legal briefing articles, articles with a compliance box, or articles in a regulation-focused pillar (Governance/Compliance or International Regulation).';
          }
          return true;
        }),
    }),
    defineField({
      name: 'complianceBox',
      title: 'Compliance box',
      description: 'Always rendered, even for locked articles.',
      type: 'object',
      group: 'compliance',
      fields: [
        defineField({ name: 'accurateAsOf', title: 'Accurate as of', type: 'string', description: 'e.g. "May 2026"', validation: (Rule) => Rule.required() }),
        defineField({ name: 'jurisdiction', title: 'Jurisdiction', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'regulations', title: 'Regulations', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'reviewTrigger', title: 'Review trigger', type: 'text', rows: 2 }),
      ],
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          const doc = context.document as { type?: string; topic?: { _ref?: string } } | undefined;
          const requires = doc?.type === 'Legal briefing' || (await touchesRegulatedPillar(doc?.topic, context));
          if (requires && !value) {
            return 'Required for Legal briefing articles or articles in a regulation-focused pillar (Governance/Compliance or International Regulation).';
          }
          return true;
        }),
    }),

    // ── Related & history ────────────────────────────────────────────
    defineField({
      name: 'relatedTopics',
      title: 'Related topics',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'topic' }] })],
    }),
    defineField({
      name: 'versionHistory',
      title: 'Version history',
      type: 'array',
      group: 'related',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'versionEntry',
          fields: [
            defineField({ name: 'date', title: 'Date', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'note', title: 'Note', type: 'string', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'date', subtitle: 'note' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'type', locked: 'locked' },
    prepare({ title, subtitle, locked }) {
      return { title, subtitle: locked ? `${subtitle} · Locked` : subtitle };
    },
  },
});
