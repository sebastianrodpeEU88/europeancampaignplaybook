import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'topic',
  title: 'Topic',
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
      description: 'Must be unique across the whole taxonomy — used in /topics/[slug].',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'branch',
      title: 'Branch',
      type: 'reference',
      to: [{ type: 'branch' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pillar',
      title: 'Pillar',
      type: 'reference',
      to: [{ type: 'pillar' }],
      description: 'Denormalized from the branch’s pillar, kept in sync manually — avoids a double dereference in every query.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first within the branch.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'branch.title' },
  },
});
