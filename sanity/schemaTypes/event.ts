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
      description: 'Optional. Falls back to a generated brand cover (accent colour + title) when left empty.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'coverColour',
      title: 'Cover accent colour',
      description: 'Background colour of the generated cover (used when no cover image is set).',
      type: 'string',
      options: {
        list: [
          { title: 'Navy (default)', value: 'navy' },
          { title: 'Blue', value: 'blue' },
          { title: 'Green', value: 'green' },
          { title: 'Orange', value: 'orange' },
        ],
      },
      initialValue: 'navy',
    }),
    defineField({
      name: 'membersOnly',
      title: 'Members only',
      description: 'When on, only paid members can register. Turn OFF to let any logged-in user register (e.g. free info sessions).',
      type: 'boolean',
      initialValue: true,
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
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration URL (members)',
      description: 'Where a confirmed paid member goes to register (e.g. a form). If empty, the Register button sends members to their account.',
      type: 'url',
    }),
    defineField({
      name: 'waitingListUrl',
      title: 'Waiting list URL',
      description: 'Where the "Join the waiting list" button links. If empty, the button shows as coming soon.',
      type: 'url',
    }),
    defineField({
      name: 'registrationLabel',
      title: 'Registration link label',
      type: 'string',
      description: 'e.g. "Register now" or "Join the waiting list".',
      initialValue: 'Register now',
    }),
    defineField({
      name: 'joinUrl',
      title: 'Join link (registered attendees only)',
      description:
        'Meeting link, e.g. the Zoom URL. Shown only to people who have registered — never on the public event page. Do not put this link in the description.',
      type: 'url',
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
