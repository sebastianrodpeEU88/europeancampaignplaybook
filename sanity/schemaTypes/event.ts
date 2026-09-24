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
          { title: 'Pink', value: 'pink' },
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
      name: 'showWaitingList',
      title: 'Show waiting list button',
      description: 'Shows non-members a "Join the waiting list" button (or "coming soon" when no waiting list URL is set). Turn OFF to hide it.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showNewcomerLinks',
      title: 'Show "New to our workshops?" links',
      description: 'The box linking to the AI workshop insights and testimonials. Turn OFF for events those do not describe.',
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
            {
              name: 'size',
              type: 'string',
              title: 'Size',
              description: 'Small shows the whole image at a modest size, e.g. a trainer photo. Wide shows it whole across the column, for a square or portrait picture the 16:9 crop would cut.',
              options: { list: [{ title: 'Full width', value: 'full' }, { title: 'Wide (uncropped)', value: 'wide' }, { title: 'Small', value: 'small' }] },
              initialValue: 'full',
            },
          ],
        }),
        defineArrayMember({
          // Trainer card: photo beside name, role and bio, so the picture reads
          // as part of the introduction instead of a standalone image.
          type: 'object',
          name: 'trainer',
          title: 'Trainer',
          fields: [
            defineField({ name: 'label', title: 'Heading', type: 'string', initialValue: 'Meet your trainer' }),
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'role', title: 'Role line', type: 'string', description: 'e.g. "Senior Communications Officer, European Youth Forum"' }),
            defineField({
              name: 'photo',
              title: 'Photo',
              type: 'image',
              description: 'Shown as a square. Set the hotspot on the face.',
              options: { hotspot: true },
              fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'trainerLink',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label', description: 'e.g. "LinkedIn"' },
                    { name: 'url', type: 'url', title: 'URL' },
                  ],
                }),
              ],
            }),
            defineField({ name: 'bio', title: 'Bio', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'role', media: 'photo' },
          },
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
