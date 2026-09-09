import { defineArrayMember, defineField, defineType } from 'sanity';

export const BOOTCAMP_STATUSES = [
  { title: 'Live', value: 'Live' },
  { title: 'Coming soon', value: 'Coming soon' },
  { title: 'Finished', value: 'Finished' },
];

// A digital bootcamp: a run of short, sequential lessons, each one published as
// an article. The bootcamp document is the spine — it holds the running order
// so episodes can be released one at a time without touching the page.
export default defineType({
  name: 'bootcamp',
  title: 'Digital bootcamp',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: BOOTCAMP_STATUSES },
      initialValue: 'Live',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'One or two sentences shown under the title on the bootcamp page.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'whoItIsFor',
      title: 'Who it is for',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'cadence',
      title: 'Cadence',
      description: 'e.g. "a new episode most weeks" — shown as a small note beside the status.',
      type: 'string',
    }),
    defineField({
      name: 'episodes',
      title: 'Episodes',
      description: 'In running order. Each episode points at the article that carries it.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'episode',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              description: 'e.g. "Day 1".',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'article',
              title: 'Article',
              type: 'reference',
              to: [{ type: 'article' }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', title: 'article.title' },
            prepare({ label, title }) {
              return { title: label ?? 'Episode', subtitle: title };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', status: 'status', episodes: 'episodes' },
    prepare({ title, status, episodes }) {
      const n = (episodes ?? []).length;
      return { title, subtitle: `${status} · ${n} episode${n === 1 ? '' : 's'}` };
    },
  },
});
