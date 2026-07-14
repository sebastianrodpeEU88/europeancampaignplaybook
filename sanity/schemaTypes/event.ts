import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Event',
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
      options: { source: 'title', maxLength: 120 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startDateTime',
      title: 'Start date & time',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDateTime',
      title: 'End date & time',
      type: 'datetime',
      description: 'Used, together with the start time, to determine whether the event shows under Upcoming or Past.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { startDateTime?: string } | undefined;
          if (value && doc?.startDateTime && new Date(value) < new Date(doc.startDateTime)) {
            return 'End time must be after the start time.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: { list: ['Online', 'In-person', 'Hybrid'] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. "Zoom Meeting" or "Central Brussels, Belgium".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'Short badges shown on the event card, e.g. "Workshop", "Advanced".',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Short teaser shown on the events list.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration URL',
      description: 'Link to register, join the waiting list, or join the call.',
      type: 'url',
    }),
    defineField({
      name: 'registrationLabel',
      title: 'Registration link label',
      type: 'string',
      description: 'e.g. "Register now" or "Join the waiting list".',
      initialValue: 'Register now',
    }),
  ],
  orderings: [
    {
      title: 'Start date, soonest first',
      name: 'startDateAsc',
      by: [{ field: 'startDateTime', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'startDateTime', media: 'coverImage' },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleString('en-GB') : undefined,
        media,
      };
    },
  },
});
