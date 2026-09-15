import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';
import EventCard from '@/components/EventCard';
import JsonLd from '@/components/JsonLd';
import TestimonialWall from '@/components/TestimonialWall';
import { getUpcomingEvents } from '@/lib/content';
import { routes } from '@/lib/routes';
import { ORG_NAME, SITE_URL, faqLd } from '@/lib/seo';
import type { Event } from '@/types/content';

// Upcoming sessions come from Sanity. Re-render every minute so a finished
// session drops off promptly, as on /events.
export const revalidate = 60;

const HEADLINE = 'AI workshops for public affairs, advocacy, consulting and communications in Brussels';
const DESCRIPTION =
  'Hands-on AI workshops in Brussels and online for public affairs, advocacy, consulting and communications teams: AI fundamentals and agents, advanced automation, AI usage policies, and AI for creatives and social media.';
const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';
const PATH = '/ai-workshops-brussels';

export const metadata: Metadata = {
  title: 'AI workshops for public affairs and advocacy in Brussels',
  description: DESCRIPTION,
  openGraph: {
    title: HEADLINE,
    description: DESCRIPTION,
    images: [
      {
        url: '/workshops/brussels-ai-workshops-og.jpg',
        width: 1200,
        height: 630,
        alt: 'A trainer leads an AI workshop for public affairs professionals in Brussels',
      },
    ],
  },
};

type Workshop = {
  id: string;
  level: string;
  short: string;
  audienceLevel: string;
  title: string;
  tagline: string;
  summary: string;
  intro: string;
  learn: string[];
  build: string[];
  buildHeading: string;
  parts?: { title: string; body: string }[];
  tools?: string;
  forWhom: string;
  bestFor: string;
  outcome: string;
  leaveWith: string[];
  related?: { label: string; href: string };
  match: (e: Event) => boolean;
};

// Content mirrors the event descriptions in Sanity; keep the two in step.
// `match` picks each workshop's sessions by slug or exact title, so other
// levelled series (the policy events workshops, say) stay off this page.
const WORKSHOPS: Workshop[] = [
  {
    id: 'level-1',
    level: 'Level 1',
    short: 'Fundamentals + AI agents',
    audienceLevel: 'Beginner to intermediate',
    title: 'AI for small public affairs teams, level 1: fundamentals + AI agents',
    tagline: 'Put AI to work on real public affairs tasks, responsibly and with EU rules in mind.',
    summary:
      'A hands-on workshop helping small public affairs teams use AI for research, monitoring, communications and automation, responsibly and in line with EU rules.',
    intro:
      'Your public affairs team is small and the to-do list keeps growing. Used smartly and ethically, AI becomes an extra pair of hands: it helps you research faster, monitor policy developments, sharpen your communications and automate repetitive work. Level 1 is where you learn how it works, write prompts that get reliable results, and build your first AI agent.',
    learn: [
      'Use AI smartly and ethically in public affairs, with EU rules in mind',
      'Write better prompts that get more useful and reliable results',
      'Use AI to support campaign planning, messaging, research and outreach',
      'Build your first AI agent and start automating repetitive tasks and workflows',
    ],
    buildHeading: 'what you build in the room',
    build: [
      'Plan and launch a campaign with 10 AI prompts, from messaging and outreach to images and video',
      'Build an AI agent for policy and media monitoring, with daily updates and sentiment analysis',
      'Create a communications style guide that AI can use to help you write more consistently on LinkedIn',
      'Explore more ways to use AI agents and automation for communications and research',
    ],
    parts: [
      {
        title: 'Part 1: AI fundamentals and prompting',
        body: 'Get to grips with how AI works and with practical prompting techniques, then use 10 prompts to build a campaign covering messaging, images, video and outreach.',
      },
      {
        title: 'Part 2: AI agents and automation',
        body: 'After a coffee break, explore AI agents and automation for communications and research, then put the ideas into practice by building your own agent.',
      },
    ],
    tools:
      'ChatGPT, Claude, Mistral and Gemini, with prompting approaches you can apply across different AI platforms.',
    forWhom:
      'Public affairs professionals, campaigners, communications teams, advocacy organisations, policy professionals, and anyone who wants to use AI more effectively in their day-to-day work. No advanced AI or technical experience is needed.',
    bestFor: 'Teams starting with AI, or using it only now and then',
    outcome: '10 reusable prompts and your first AI agent',
    leaveWith: [
      'A practical framework for using AI in public affairs',
      '10 reusable prompts for campaign planning, messaging, content and outreach',
      'Your first AI agent, for tasks such as policy and media monitoring',
      'Prompting techniques that work across different AI tools',
      'Practical ideas for automating repetitive research and communications tasks',
      'A clearer understanding of how to use AI responsibly and with EU rules in mind',
    ],
    match: (e) => e.slug.startsWith('ai-public-affairs-level-1') || /^AI for small public affairs teams, level 1/i.test(e.title),
  },
  {
    id: 'level-2',
    level: 'Level 2',
    short: 'Advanced agents + automation',
    audienceLevel: 'Intermediate to advanced',
    title: 'AI for advocacy, level 2: advanced AI for advocacy',
    tagline: 'Move from individual prompts to AI agents and automated workflows.',
    summary:
      'An intermediate-to-advanced workshop on AI agents, no-code automation and advanced creative tools for advocacy and public affairs.',
    intro:
      'You have learned what AI can do. Now it is time to make it work for you. Building on Level 1, this workshop goes deeper into AI agents, automated workflows and advanced creative tools for advocacy and public affairs. You build AI systems that take on repetitive work, support research and monitoring, and help your team create richer campaign content, all with user-friendly tools and no coding.',
    learn: [
      'Design advanced AI agents for communications, research and strategy',
      'Build automated workflows for media monitoring, sentiment analysis and event management',
      'Connect AI tools with no-code automation platforms such as Zapier and Make',
      'Create more advanced images and videos with tools such as Veo, Runway and Midjourney',
      'Spot where automation saves your team time while people stay in control',
      'Apply AI responsibly and strategically in advocacy and public affairs',
    ],
    buildHeading: 'what you build in the room',
    build: [
      'An advocacy-focused AI agent for research, communications or strategy',
      'An automated media-monitoring workflow',
      'A workflow for sentiment tracking or event management',
      'A repeatable AI-powered workflow that connects different tools',
      'Campaign content made with advanced AI image and video tools',
    ],
    parts: [
      {
        title: 'Part 1: advanced AI agents and automation for advocacy',
        body: 'See what more advanced agents can do across research, communications and strategy, with practical examples from public affairs, then build an automated, advocacy-focused AI agent of your own.',
      },
      {
        title: 'Part 2: automating repetitive work',
        body: 'Get hands-on with the no-code platforms Zapier and Make: connect tools and automate everyday tasks, with workflows for media monitoring, sentiment tracking and event management.',
      },
    ],
    tools: 'Zapier and Make for automation; Veo, Runway and Midjourney for advanced images and video.',
    forWhom:
      'Public affairs professionals, campaigners, communications teams, advocacy organisations, policy professionals, and people already using AI who want to move from individual prompts to agents and automated workflows. It is most useful after Level 1, or if you already have a good grasp of prompting and everyday AI tools.',
    bestFor: 'People who prompt confidently and want agents and automation',
    outcome: 'A working advocacy agent and no-code workflows',
    leaveWith: [
      'A working, advocacy-focused AI agent',
      'Practical no-code automation workflows you can adapt to your team',
      'A framework for identifying which tasks are worth automating',
      'Experience connecting AI tools with Zapier and Make',
      'Practical experience with advanced AI image and video creation',
      'Ideas for applying agents and automation to research, monitoring, communications and campaign work',
      'A clearer approach to using advanced AI responsibly in your organisation',
    ],
    match: (e) => e.slug.startsWith('ai-advocacy-level-2') || /^AI for advocacy, level 2/i.test(e.title),
  },
  {
    id: 'level-3',
    level: 'Level 3',
    short: 'Your AI usage policy',
    audienceLevel: 'Advanced',
    title: 'AI for advocacy, level 3: writing your AI usage policy',
    tagline: 'AI is already in your team’s workflow. Put clear, practical rules around it.',
    summary:
      'An advanced workshop on writing a clear AI usage policy for trade associations, NGOs, consultancies and political parties working in EU public affairs.',
    intro:
      'Level 3 is about writing your organisation’s AI usage policy: what your team can and cannot do with AI, how to handle sensitive information and members’ data, how and when to disclose AI use, and how to stay aligned with the EU AI Act and your own governance. It is built for the EU affairs space, with real examples and adaptable templates you can take back to your team.',
    learn: [
      'Decide what your team can and cannot do with AI',
      'Handle sensitive information and members’ data safely',
      'Set out how and when to disclose AI use',
      'Align your policy with the EU AI Act and your organisation’s governance',
    ],
    buildHeading: 'what you write in the room',
    build: [
      'A first draft of your own AI usage policy, built on your organisation’s context',
      'A checklist to finalise the policy with your leadership and legal teams',
    ],
    parts: [
      {
        title: 'How the session works',
        body: 'Bring your organisation’s context and we build the policy together, working from real examples and adaptable templates from EU public affairs.',
      },
    ],
    forWhom:
      'Trade associations, NGOs, consulting firms and political parties working in EU public affairs.',
    bestFor: 'Organisations setting the rules for how their team uses AI',
    outcome: 'A first draft of your AI usage policy and a checklist',
    leaveWith: [
      'A first draft of your organisation’s AI usage policy',
      'A checklist to finalise it with your leadership and legal teams',
      'Real examples and adaptable templates to take back to your team',
    ],
    related: {
      label: 'Read our guide to writing an AI usage policy for an EU trade association',
      href: routes.article('why-write-ai-usage-policy-eu-trade-association'),
    },
    match: (e) => e.slug.startsWith('ai-advocacy-level-3') || /^AI for advocacy, level 3/i.test(e.title),
  },
  {
    id: 'ai-for-creatives',
    level: 'Creative track',
    short: 'AI for creatives + social media',
    audienceLevel: 'Beginner to intermediate',
    title: 'AI for creatives and social media teams',
    tagline: 'One campaign idea. Many formats. A lot less repetitive production work.',
    summary:
      'A hands-on workshop on creating campaign visuals and short-form video with AI, keeping campaigns consistent across formats, and building no-code workflows for social media production.',
    intro:
      'AI gives communications and creative teams new ways to turn ideas into campaign visuals, short-form videos and social content, without advanced technical skills. This workshop shows you how to create better visual content, keep a campaign consistent across formats and build simple workflows that make production faster. You work directly with no-code AI tools and leave with assets and workflows you can use straight away.',
    learn: [
      'Create images and short-form videos with AI',
      'Write prompts that produce more consistent creative results',
      'Turn campaign ideas into visuals for different channels and formats',
      'Keep visual and brand consistency when working with AI',
      'Build repeatable, no-code workflows for social media production',
      'Use AI responsibly, with ethical and copyright considerations in mind',
    ],
    buildHeading: 'what you build in the room',
    build: [
      'A visual campaign concept, turned into a series of social media assets',
      'A short AI-assisted video for social media',
      'One campaign adapted across multiple formats and platforms',
      'A simple content workflow your team can reuse for future campaigns',
    ],
    parts: [
      {
        title: 'Part 1: AI for visual storytelling',
        body: 'Learn the fundamentals of AI image and video generation, then create campaign visuals and short-form video. We cover prompting, visual storytelling, brand consistency, and the ethical and copyright questions that come with AI-generated content.',
      },
      {
        title: 'Part 2: building scalable creative workflows',
        body: 'Move from individual assets to a repeatable system: adapt content across formats, produce assets in batches and connect AI tools into practical workflows. Then build a lightweight AI-powered content workflow for a social media or communications team.',
      },
    ],
    tools:
      'ChatGPT, Gemini, Claude, Freepik, Higgsfield, Runway, CapCut, Canva and Veo, with the focus on picking the right tool for each task.',
    forWhom:
      'Social media teams, campaigners, communications professionals, designers, creatives, community managers, advocacy organisations, and marketing and branding teams.',
    bestFor: 'Social media, design and communications teams',
    outcome: 'Campaign-ready visuals and a reusable content workflow',
    leaveWith: [
      'Campaign-ready visual assets',
      'Reusable prompting frameworks',
      'Practical no-code creative workflows',
      'Experience with leading AI creative tools',
      'A clearer approach to bringing AI into your team’s everyday creative work',
    ],
    match: (e) => e.slug.startsWith('ai-creatives') || /^AI for creatives/i.test(e.title),
  },
];

const PHOTOS = [
  {
    src: '/workshops/brussels-ai-workshop-session.jpg',
    width: 1600,
    height: 1137,
    alt: 'A trainer speaks to a room of seated participants during an AI workshop, with a slide on large language models open on a laptop in the foreground',
    cell: 'col-span-2 row-span-2',
  },
  {
    src: '/workshops/brussels-ai-workshop-group.jpg',
    width: 1280,
    height: 1707,
    alt: 'Workshop participants smiling together for a group selfie in a meeting room',
    cell: 'lg:row-span-2',
  },
  {
    src: '/workshops/brussels-ai-workshop-community.jpg',
    width: 1170,
    height: 878,
    alt: 'A large group of participants gathered for a selfie at the end of a workshop',
    cell: '',
  },
  {
    src: '/workshops/brussels-policy-comms-workshop.jpg',
    width: 1600,
    height: 1242,
    alt: 'Participants and the trainer pose in front of a screen showing the european campaign playbook logo after a policy communications workshop',
    cell: '',
  },
];

const AT_A_GLANCE = [
  { label: 'Four workshops', body: 'Levels 1, 2 and 3 build on each other. The creative workshop stands on its own.' },
  { label: 'Two and a half hours', body: 'Hands-on from the start: you build as you learn.' },
  { label: 'Brussels and online', body: 'Each session lists its own format and location.' },
  { label: 'No coding', body: 'User-friendly, no-code tools at every level.' },
  { label: 'EU context', body: 'Responsible AI use, with EU rules and the EU AI Act in mind.' },
];

const FAQS = [
  {
    q: 'Where are the workshops held?',
    a: 'In Brussels, Belgium, and online via Zoom. Each session lists its own format and location.',
  },
  {
    q: 'Which workshop should I start with?',
    a: 'Start with Level 1 if you are new to AI or use it only now and then. Go to Level 2 if you already prompt confidently and want to build agents and automated workflows. Level 3 is for organisations ready to write their AI usage policy. AI for creatives and social media teams is a beginner-to-intermediate workshop for social media, design and communications teams.',
  },
  {
    q: 'Do I need technical or coding skills?',
    a: 'No. Level 1 needs no advanced AI or technical experience, and every workshop uses user-friendly, no-code tools.',
  },
  {
    q: 'Which AI tools do the workshops use?',
    a: 'Level 1 works with ChatGPT, Claude, Mistral and Gemini. Level 2 adds the no-code automation platforms Zapier and Make, plus advanced image and video tools such as Veo, Runway and Midjourney. The creative workshop uses ChatGPT, Gemini, Claude, Freepik, Higgsfield, Runway, CapCut, Canva and Veo. The techniques carry across platforms.',
  },
  { q: 'How long is each workshop?', a: 'Two and a half hours.' },
  {
    q: 'Who runs the workshops?',
    a: 'Sebastián Rodríguez Pérez, campaign and tech strategist and founder of european campaign playbook. He often invites other leading experts to deliver masterclasses.',
  },
];

const dayFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Brussels',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Brussels',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function sessionLabel(e: Event): string {
  const start = new Date(e.startDateTime);
  const end = e.endDateTime ? `–${timeFmt.format(new Date(e.endDateTime))}` : '';
  const where = e.format === 'Online' ? e.location : `${e.format}, ${e.location}`;
  return `${dayFmt.format(start)}, ${timeFmt.format(start)}${end} Brussels time · ${where}`;
}

// Each workshop as a schema.org Course, with its upcoming sessions as course
// instances, so search and AI engines can see what is taught and when.
function coursesLd(sessions: { w: Workshop; events: Event[] }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: HEADLINE,
    itemListElement: sessions.map(({ w, events }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: w.title,
        description: w.summary,
        url: `${SITE_URL}${PATH}#${w.id}`,
        provider: { '@type': 'Organization', name: ORG_NAME, sameAs: SITE_URL },
        educationalLevel: w.audienceLevel,
        inLanguage: 'en',
        ...(events.length
          ? {
              hasCourseInstance: events.map((e) => ({
                '@type': 'CourseInstance',
                courseMode: e.format === 'Online' ? 'online' : e.format === 'Hybrid' ? 'blended' : 'onsite',
                startDate: e.startDateTime,
                ...(e.endDateTime ? { endDate: e.endDateTime } : {}),
                ...(e.format === 'Online' ? {} : { location: e.location }),
                url: `${SITE_URL}${routes.event(e.slug)}`,
              })),
            }
          : {}),
      },
    })),
  };
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-ink/80 leading-relaxed">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#dd3c13]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function AiWorkshopsBrusselsPage() {
  const upcoming = await getUpcomingEvents();
  const sessions = WORKSHOPS.map((w) => ({ w, events: upcoming.filter(w.match) }));
  const nextSessions = upcoming.filter((e) => WORKSHOPS.some((w) => w.match(e)));
  const contactHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AI workshops')}`;

  return (
    <div className="bg-paper">
      <JsonLd data={[coursesLd(sessions), faqLd(FAQS)]} />

      {/* Hero */}
      <section className="py-16 sm:py-20 bg-navy">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/60 mb-4">
              What we do · Workshops
            </p>
            <h1 className="display text-[#EDE7DA] text-3xl sm:text-5xl leading-[0.95] mb-6">{HEADLINE}</h1>
            <p className="text-lg text-[#EDE7DA]/80 leading-relaxed mb-8 max-w-2xl">
              {ORG_NAME} runs hands-on AI workshops in Brussels and online for public affairs
              professionals, advocacy organisations, consultancies and communications teams. Four
              workshops take you from your first prompts to AI agents, automated workflows, campaign
              visuals made with AI, and a written AI usage policy for your organisation. Each one lasts
              two and a half hours and is built around the everyday work of EU affairs.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#dates"
                className="inline-flex rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                See upcoming dates
              </a>
              <a
                href="#compare"
                className="inline-flex rounded-[2px] border border-[#EDE7DA]/40 px-6 py-3 text-sm font-semibold text-[#EDE7DA] hover:bg-[#EDE7DA]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Compare the workshops
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Photos */}
      <section className="pt-10" aria-label="Photos from our workshops in Brussels">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] sm:auto-rows-[220px] gap-3">
            {PHOTOS.map((p, i) => (
              <figure key={p.src} className={`relative overflow-hidden rounded-[2px] bg-navy ${p.cell}`}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={i === 0 ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
                  className="object-cover"
                  priority={i === 0}
                />
              </figure>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink/50">From our AI and policy communications workshops in Brussels.</p>
        </Container>
      </section>

      {/* At a glance */}
      <section className="py-14" aria-labelledby="glance-heading">
        <Container>
          <h2 id="glance-heading" className="display text-2xl text-ink mb-6">
            at a glance
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AT_A_GLANCE.map((f) => (
              <div key={f.label} className="rounded-[2px] border border-rule/20 p-5">
                <dt className="font-semibold text-ink mb-1">{f.label}</dt>
                <dd className="text-sm text-ink/65 leading-relaxed">{f.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Why now */}
      <section className="pb-14" aria-labelledby="why-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="why-heading" className="display text-2xl text-ink mb-4">
              why AI training for public affairs teams, and why now
            </h2>
            <p className="text-ink/75 leading-relaxed mb-4">
              Most public affairs, advocacy and communications teams in Brussels are small, and the
              monitoring, research, drafting and reporting never stop. AI can take on a large share of
              that routine work, which frees people for the judgement, relationships and strategy that
              win policy debates. Getting there takes more than a chatbot subscription: it takes good
              prompts, agents that run reliably, clear rules, and a team that trusts the output
              because it knows how to check it.
            </p>
            <p className="text-ink/75 leading-relaxed">
              There is a regulatory reason too. Since 2 February 2025, the EU AI Act (Article 4) has
              required organisations that use AI systems to take measures to ensure their staff have a
              sufficient level of AI literacy. Hands-on training is one of the most practical ways to
              build it.
            </p>
          </div>
        </Container>
      </section>

      {/* Learning path */}
      <section className="pb-14" aria-labelledby="path-heading">
        <Container>
          <h2 id="path-heading" className="display text-2xl text-ink mb-2">
            the learning path
          </h2>
          <p className="text-ink/60 mb-6 max-w-2xl">
            Levels 1 to 3 build on each other, from first prompts to agents to a written policy. The
            creative workshop runs alongside them for teams that produce visual and social content.
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {WORKSHOPS.map((w) => (
              <li key={w.id}>
                <a
                  href={`#${w.id}`}
                  className="group block h-full rounded-[2px] border border-rule/20 p-5 hover:border-[#dd3c13] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-2">{w.level}</p>
                  <p className="font-semibold text-ink mb-1 group-hover:underline">{w.short}</p>
                  <p className="text-sm text-ink/55">{w.audienceLevel}</p>
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Next sessions */}
      <section id="dates" className="pb-16 scroll-mt-24" aria-labelledby="dates-heading">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <h2 id="dates-heading" className="display text-2xl text-ink">
              next sessions
            </h2>
            <Link
              href={routes.events()}
              className="text-sm font-semibold text-[#dd3c13] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded"
            >
              all workshops →
            </Link>
          </div>
          {nextSessions.length === 0 ? (
            <div className="rounded-[2px] border border-rule/20 p-8 text-center">
              <p className="text-ink/60">No sessions are scheduled right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nextSessions.map((event) => (
                <EventCard key={event.id} event={event} isPast={false} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Workshop details */}
      {sessions.map(({ w, events }) => (
        <section
          key={w.id}
          id={w.id}
          className="py-16 border-t border-rule/15 scroll-mt-24"
          aria-labelledby={`${w.id}-heading`}
        >
          <Container>
            <div className="max-w-3xl mb-8">
              <p className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-[2px] bg-navy px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]">
                  {w.level}
                </span>
                <span className="rounded-[2px] bg-ink/5 px-2 py-0.5 text-xs text-ink/65">{w.audienceLevel}</span>
              </p>
              <h2 id={`${w.id}-heading`} className="display text-2xl sm:text-3xl text-ink mb-3">
                {w.title}
              </h2>
              <p className="text-lg font-medium text-ink mb-4">{w.tagline}</p>
              <p className="text-ink/75 leading-relaxed">{w.intro}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-[2px] border border-rule/20 p-6">
                <h3 className="display text-lg text-ink mb-4">what you&apos;ll learn</h3>
                <Checklist items={w.learn} />
              </div>
              <div className="rounded-[2px] border border-rule/20 p-6">
                <h3 className="display text-lg text-ink mb-4">{w.buildHeading}</h3>
                <Checklist items={w.build} />
              </div>
            </div>

            {w.parts && (
              <div className="rounded-[2px] border border-rule/20 p-6 mb-4">
                <h3 className="display text-lg text-ink mb-4">how the session runs</h3>
                <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {w.parts.map((part) => (
                    <li key={part.title}>
                      <p className="font-semibold text-ink mb-1">{part.title}</p>
                      <p className="text-sm text-ink/70 leading-relaxed">{part.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[2px] bg-[#F7F4EE] p-6 md:col-span-2">
                <h3 className="display text-lg text-ink mb-4">what you&apos;ll leave with</h3>
                <Checklist items={w.leaveWith} />
              </div>
              <div className="space-y-4">
                <div className="rounded-[2px] border border-rule/20 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">who it&apos;s for</h3>
                  <p className="text-sm text-ink/75 leading-relaxed">{w.forWhom}</p>
                </div>
                {w.tools && (
                  <div className="rounded-[2px] border border-rule/20 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">tools</h3>
                    <p className="text-sm text-ink/75 leading-relaxed">{w.tools}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {events.length > 0 ? (
                events.map((e) => (
                  <Link
                    key={e.id}
                    href={routes.event(e.slug)}
                    className="text-sm font-semibold text-[#dd3c13] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded w-fit"
                  >
                    Next: {sessionLabel(e)} →
                  </Link>
                ))
              ) : (
                <Link
                  href={routes.events()}
                  className="text-sm font-semibold text-[#dd3c13] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded w-fit"
                >
                  No date scheduled yet. See all workshops →
                </Link>
              )}
              {w.related && (
                <Link
                  href={w.related.href}
                  className="text-sm text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded w-fit"
                >
                  {w.related.label}
                </Link>
              )}
            </div>
          </Container>
        </section>
      ))}

      {/* Compare */}
      <section id="compare" className="py-16 border-t border-rule/15 scroll-mt-24" aria-labelledby="compare-heading">
        <Container>
          <h2 id="compare-heading" className="display text-2xl text-ink mb-6">
            which workshop is right for you?
          </h2>
          <div className="overflow-x-auto rounded-[2px] border border-rule/20">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-rule/20">
                  {['Workshop', 'Level', 'Best for', 'You leave with'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/10">
                {WORKSHOPS.map((w) => (
                  <tr key={w.id}>
                    <td className="px-4 py-3 align-top font-medium text-ink">
                      <a href={`#${w.id}`} className="hover:underline">
                        {w.level}: {w.short}
                      </a>
                    </td>
                    <td className="px-4 py-3 align-top text-ink/75">{w.audienceLevel}</td>
                    <td className="px-4 py-3 align-top text-ink/75">{w.bestFor}</td>
                    <td className="px-4 py-3 align-top text-ink/75">{w.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-16 border-t border-rule/15" aria-labelledby="proof-heading">
        <Container>
          <h2 id="proof-heading" className="display text-2xl text-ink mb-6">
            what participants say afterwards
          </h2>
          <TestimonialWall limit={3} />
        </Container>
      </section>

      {/* Trainer */}
      <section className="py-16 border-t border-rule/15" aria-labelledby="trainer-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="trainer-heading" className="display text-2xl text-ink mb-4">
              your trainer
            </h2>
            <p className="text-ink/75 leading-relaxed mb-3">
              Sebastián Rodríguez Pérez is a campaign and tech strategist and the founder of {ORG_NAME}.
              He designs and leads the workshops, and often invites other leading experts to deliver
              masterclasses.
            </p>
            <Link
              href={routes.author('sebastian-rodriguez-perez')}
              className="text-sm font-semibold text-[#dd3c13] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded"
            >
              More about Sebastián →
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-rule/15" aria-labelledby="faq-heading">
        <Container>
          <div className="max-w-2xl">
            <h2 id="faq-heading" className="display text-2xl text-ink mb-4">
              questions
            </h2>
            <div className="divide-y divide-rule/15 border-y border-rule/15">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-ink/50 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-2 text-sm text-ink/70 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Call to action */}
      <section className="pb-16">
        <Container>
          <div className="rounded-[2px] bg-navy p-8 text-[#EDE7DA]">
            <div className="max-w-2xl">
              <h2 className="display text-2xl text-[#EDE7DA] mb-3">join the next session</h2>
              <p className="text-[#EDE7DA]/75 leading-relaxed mb-6">
                Pick the workshop that fits where your team is today. Not sure which one? Email us and
                we&apos;ll help you choose. New to AI and want to start right away? The free digital
                bootcamp is open to anyone with an account.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={routes.events()}
                  className="inline-flex rounded-[2px] bg-paper px-5 py-2.5 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  See all workshops
                </Link>
                <Link
                  href={routes.digitalBootcamp()}
                  className="inline-flex rounded-[2px] border border-[#EDE7DA]/40 px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#EDE7DA]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Start the digital bootcamp
                </Link>
                <a
                  href={contactHref}
                  className="inline-flex items-center px-2 py-2.5 text-sm font-semibold text-[#EDE7DA] underline underline-offset-2 hover:no-underline"
                >
                  Email {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
