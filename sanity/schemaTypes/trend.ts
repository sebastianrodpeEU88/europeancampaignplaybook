import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'trend',
  title: 'Trend',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isFundamentals',
      title: 'Is "Fundamentals"',
      description: 'The evergreen catch-all for content that doesn’t tie to a specific year’s numbered trends. There should only be one of these.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'The year this trend was collected from the community. Not required for "Fundamentals".',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { isFundamentals?: boolean } | undefined;
          if (!doc?.isFundamentals && !value) {
            return 'Required unless this trend is marked as "Fundamentals".';
          }
          return true;
        }),
    }),
    defineField({
      name: 'number',
      title: 'Number',
      description: 'Display order within the year, e.g. 1 for "#1". Leave blank for "Fundamentals".',
      type: 'number',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { isFundamentals?: boolean } | undefined;
          if (!doc?.isFundamentals && !value) {
            return 'Required unless this trend is marked as "Fundamentals".';
          }
          return true;
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Year, then number',
      name: 'yearNumberAsc',
      by: [
        { field: 'year', direction: 'desc' },
        { field: 'number', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'title', number: 'number', year: 'year', isFundamentals: 'isFundamentals' },
    prepare({ title, number, year, isFundamentals }) {
      return {
        title,
        subtitle: isFundamentals ? 'Fundamentals' : `#${number} · ${year}`,
      };
    },
  },
});
