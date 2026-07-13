import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'organisation',
      title: 'Organisation',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'initials',
      title: 'Initials',
      type: 'string',
      description: 'Shown in the avatar badge when no photo is set.',
      validation: (Rule) => Rule.required().max(3),
    }),
    defineField({
      name: 'avatarColour',
      title: 'Avatar colour',
      type: 'string',
      description: 'Hex colour for the initials avatar background, e.g. #7F77DD.',
      validation: (Rule) =>
        Rule.required().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex colour',
        }),
    }),
    defineField({
      name: 'expertise',
      title: 'Expertise',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'disclosure',
      title: 'Disclosure',
      type: 'text',
      rows: 3,
      description: 'Conflict-of-interest / affiliation disclosure shown alongside the byline.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'link',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required() }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' },
  },
});
