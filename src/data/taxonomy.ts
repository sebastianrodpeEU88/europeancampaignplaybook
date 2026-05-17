import type { Pillar } from '@/types/content';

export const PILLARS: Pillar[] = [
  {
    id: '1',
    slug: 'strategy',
    title: 'Strategy',
    description: 'Campaign strategy, strategic communications, electoral positioning, public affairs strategy, narrative architecture, and international campaign strategy.',
    accentColour: '#7F77DD',
    branches: [
      {
        id: '1-1', slug: 'campaign-strategy', title: 'Campaign strategy', description: 'Foundational strategy frameworks for political and public affairs campaigns.',
        topics: [
          { id: '1-1-1', slug: 'campaign-planning', title: 'Campaign planning', description: 'Structuring a campaign from objective-setting to execution.', pillarSlug: 'strategy', branchSlug: 'campaign-strategy' },
          { id: '1-1-2', slug: 'theory-of-change', title: 'Theory of change', description: 'Building causal logic that links campaign actions to outcomes.', pillarSlug: 'strategy', branchSlug: 'campaign-strategy' },
          { id: '1-1-3', slug: 'audience-segmentation', title: 'Audience segmentation', description: 'Identifying and prioritising target audiences for strategic resources.', pillarSlug: 'strategy', branchSlug: 'campaign-strategy' },
          { id: '1-1-4', slug: 'coalition-strategy', title: 'Coalition strategy', description: 'Building and managing cross-sector alliances for campaign impact.', pillarSlug: 'strategy', branchSlug: 'campaign-strategy' },
        ],
      },
      {
        id: '1-2', slug: 'strategic-communications', title: 'Strategic communications', description: 'Integrating communications across channels to serve campaign goals.',
        topics: [
          { id: '1-2-1', slug: 'communications-planning', title: 'Communications planning', description: 'Building a comms strategy aligned to campaign objectives.', pillarSlug: 'strategy', branchSlug: 'strategic-communications' },
          { id: '1-2-2', slug: 'channel-strategy', title: 'Channel strategy', description: 'Selecting and weighting channels for maximum reach and resonance.', pillarSlug: 'strategy', branchSlug: 'strategic-communications' },
          { id: '1-2-3', slug: 'content-calendar', title: 'Content calendar and planning', description: 'Scheduling and sequencing communications across a campaign timeline.', pillarSlug: 'strategy', branchSlug: 'strategic-communications' },
        ],
      },
      {
        id: '1-3', slug: 'public-opinion', title: 'Public opinion', description: 'Understanding, tracking, and influencing public attitudes.',
        topics: [
          { id: '1-3-1', slug: 'public-opinion-research', title: 'Public opinion research', description: 'Methods for understanding and tracking voter and citizen attitudes.', pillarSlug: 'strategy', branchSlug: 'public-opinion' },
          { id: '1-3-2', slug: 'attitude-change', title: 'Attitude change and persuasion', description: 'Frameworks for shifting opinions through evidence-based communication.', pillarSlug: 'strategy', branchSlug: 'public-opinion' },
          { id: '1-3-3', slug: 'trust-credibility', title: 'Trust and credibility', description: 'Building and maintaining institutional and personal credibility.', pillarSlug: 'strategy', branchSlug: 'public-opinion' },
        ],
      },
      {
        id: '1-4', slug: 'electoral-strategy', title: 'Electoral strategy', description: 'Frameworks specific to electoral competition and voter persuasion.',
        topics: [
          { id: '1-4-1', slug: 'targeting-strategy', title: 'Targeting strategy', description: 'Identifying winnable voters and priority geographies.', pillarSlug: 'strategy', branchSlug: 'electoral-strategy' },
          { id: '1-4-2', slug: 'vote-share-modelling', title: 'Vote share modelling', description: 'Projecting outcomes and identifying paths to winning margins.', pillarSlug: 'strategy', branchSlug: 'electoral-strategy' },
          { id: '1-4-3', slug: 'candidate-positioning', title: 'Candidate positioning', description: 'Building a distinct and credible candidate identity.', pillarSlug: 'strategy', branchSlug: 'electoral-strategy' },
        ],
      },
      {
        id: '1-5', slug: 'public-affairs-strategy', title: 'Public affairs strategy', description: 'Strategic frameworks for influencing policy and regulatory outcomes.',
        topics: [
          { id: '1-5-1', slug: 'stakeholder-engagement', title: 'Stakeholder engagement strategy', description: 'Mapping and sequencing stakeholder relationships for policy influence.', pillarSlug: 'strategy', branchSlug: 'public-affairs-strategy' },
          { id: '1-5-2', slug: 'legislative-timing', title: 'Legislative timing and windows', description: 'Identifying and exploiting policy windows for maximum impact.', pillarSlug: 'strategy', branchSlug: 'public-affairs-strategy' },
          { id: '1-5-3', slug: 'inside-outside-strategy', title: 'Inside-outside strategy', description: 'Combining direct lobbying with public pressure for policy change.', pillarSlug: 'strategy', branchSlug: 'public-affairs-strategy' },
        ],
      },
      {
        id: '1-6', slug: 'opposition-research', title: 'Opposition research and contrast', description: 'Researching opponents and building effective contrast communications.',
        topics: [
          { id: '1-6-1', slug: 'opposition-research-methods', title: 'Opposition research methods', description: 'Frameworks for systematic research into opponent records and vulnerabilities.', pillarSlug: 'strategy', branchSlug: 'opposition-research' },
          { id: '1-6-2', slug: 'contrast-messaging', title: 'Contrast messaging', description: 'Building honest, evidenced contrast that moves voters.', pillarSlug: 'strategy', branchSlug: 'opposition-research' },
          { id: '1-6-3', slug: 'vulnerability-assessment', title: 'Vulnerability assessment', description: 'Identifying your own campaign\'s weak points before opponents do.', pillarSlug: 'strategy', branchSlug: 'opposition-research' },
        ],
      },
      {
        id: '1-7', slug: 'narrative-storytelling', title: 'Narrative and storytelling', description: 'Strategic use of narrative to build campaign identity and voter connection.',
        topics: [
          { id: '1-7-1', slug: 'campaign-narrative', title: 'Campaign narrative', description: 'Building a coherent story that runs through all campaign communications.', pillarSlug: 'strategy', branchSlug: 'narrative-storytelling' },
          { id: '1-7-2', slug: 'story-collection', title: 'Story collection and production', description: 'Finding, developing, and deploying real stories from supporters and communities.', pillarSlug: 'strategy', branchSlug: 'narrative-storytelling' },
          { id: '1-7-3', slug: 'hero-journey', title: 'Hero and protagonist framing', description: 'Structuring campaign narratives around relatable protagonists.', pillarSlug: 'strategy', branchSlug: 'narrative-storytelling' },
        ],
      },
      {
        id: '1-8', slug: 'international-campaign-strategy', title: 'International campaign strategy', description: 'Strategy frameworks for cross-border and transnational campaigns.',
        topics: [
          { id: '1-8-1', slug: 'cross-border-strategy', title: 'Cross-border strategy coordination', description: 'Aligning campaign strategy across national contexts.', pillarSlug: 'strategy', branchSlug: 'international-campaign-strategy' },
          { id: '1-8-2', slug: 'eu-institutions-strategy', title: 'Strategy for EU institutions', description: 'Mapping and influencing the European Parliament, Commission, and Council.', pillarSlug: 'strategy', branchSlug: 'international-campaign-strategy' },
          { id: '1-8-3', slug: 'transnational-advocacy', title: 'Transnational advocacy', description: 'Building campaigns that operate effectively across multiple jurisdictions.', pillarSlug: 'strategy', branchSlug: 'international-campaign-strategy' },
        ],
      },
    ],
  },
  {
    id: '2',
    slug: 'research-data-intelligence',
    title: 'Research, Data and Intelligence',
    description: 'Voter analytics, polling and research, media monitoring, predictive modelling, and competitive intelligence.',
    accentColour: '#888780',
    branches: [
      {
        id: '2-1', slug: 'voter-analytics', title: 'Voter and candidate predictive analytics', description: 'Using data to predict voter behaviour and optimise campaign resource allocation.',
        topics: [
          { id: '2-1-1', slug: 'voter-modelling', title: 'Voter modelling and scoring', description: 'Building predictive models to identify persuadable and mobilisable voters.', pillarSlug: 'research-data-intelligence', branchSlug: 'voter-analytics' },
          { id: '2-1-2', slug: 'data-acquisition', title: 'Data acquisition and enrichment', description: 'Building and cleaning voter contact databases.', pillarSlug: 'research-data-intelligence', branchSlug: 'voter-analytics' },
          { id: '2-1-3', slug: 'predictive-modelling', title: 'Predictive modelling for campaigns', description: 'Machine learning and statistical approaches for campaign forecasting.', pillarSlug: 'research-data-intelligence', branchSlug: 'voter-analytics' },
          { id: '2-1-4', slug: 'lookalike-audiences', title: 'Lookalike audience building', description: 'Expanding targeting universes using known supporter profiles.', pillarSlug: 'research-data-intelligence', branchSlug: 'voter-analytics' },
        ],
      },
      {
        id: '2-2', slug: 'polling-research', title: 'Polling and research', description: 'Quantitative and qualitative research methods for campaign intelligence.',
        topics: [
          { id: '2-2-1', slug: 'survey-design', title: 'Survey design and methodology', description: 'Designing polls that yield actionable, unbiased data.', pillarSlug: 'research-data-intelligence', branchSlug: 'polling-research' },
          { id: '2-2-2', slug: 'focus-groups', title: 'Focus groups and qualitative research', description: 'Using qualitative methods to understand voter psychology and motivation.', pillarSlug: 'research-data-intelligence', branchSlug: 'polling-research' },
          { id: '2-2-3', slug: 'tracking-polls', title: 'Tracking polls and trend analysis', description: 'Monitoring opinion shifts over the course of a campaign.', pillarSlug: 'research-data-intelligence', branchSlug: 'polling-research' },
          { id: '2-2-4', slug: 'message-testing', title: 'Message testing', description: 'Rigorous testing of messages, frames, and creative concepts before deployment.', pillarSlug: 'research-data-intelligence', branchSlug: 'polling-research' },
        ],
      },
      {
        id: '2-3', slug: 'analytics-optimisation', title: 'Analytics and optimisation', description: 'Using data to improve campaign performance in real time.',
        topics: [
          { id: '2-3-1', slug: 'ab-testing', title: 'A/B and multivariate testing', description: 'Testing creative and messaging variants to optimise performance.', pillarSlug: 'research-data-intelligence', branchSlug: 'analytics-optimisation' },
          { id: '2-3-2', slug: 'conversion-optimisation', title: 'Conversion rate optimisation', description: 'Improving rates across email, digital ads, and donation flows.', pillarSlug: 'research-data-intelligence', branchSlug: 'analytics-optimisation' },
          { id: '2-3-3', slug: 'attribution-modelling', title: 'Attribution modelling', description: 'Understanding which channels and messages drive outcomes.', pillarSlug: 'research-data-intelligence', branchSlug: 'analytics-optimisation' },
        ],
      },
      {
        id: '2-4', slug: 'media-sentiment-monitoring', title: 'Media and sentiment monitoring', description: 'Tracking press, social, and stakeholder coverage in real time.',
        topics: [
          { id: '2-4-1', slug: 'social-listening', title: 'Social listening', description: 'Monitoring social media for sentiment, trends, and emerging issues.', pillarSlug: 'research-data-intelligence', branchSlug: 'media-sentiment-monitoring' },
          { id: '2-4-2', slug: 'press-monitoring', title: 'Press and broadcast monitoring', description: 'Tracking traditional media coverage and setting up alert systems.', pillarSlug: 'research-data-intelligence', branchSlug: 'media-sentiment-monitoring' },
          { id: '2-4-3', slug: 'narrative-tracking', title: 'Narrative tracking and analysis', description: 'Identifying how campaign and opponent narratives evolve over time.', pillarSlug: 'research-data-intelligence', branchSlug: 'media-sentiment-monitoring' },
          { id: '2-4-4', slug: 'sentiment-analysis', title: 'Sentiment analysis and NLP', description: 'Using computational methods to assess tone and theme at scale.', pillarSlug: 'research-data-intelligence', branchSlug: 'media-sentiment-monitoring' },
        ],
      },
      {
        id: '2-5', slug: 'competitive-intelligence', title: 'Competitive intelligence', description: 'Monitoring and analysing opponent and competitor activity.',
        topics: [
          { id: '2-5-1', slug: 'opponent-monitoring', title: 'Opponent monitoring', description: 'Systematic tracking of opponent communications and activities.', pillarSlug: 'research-data-intelligence', branchSlug: 'competitive-intelligence' },
          { id: '2-5-2', slug: 'ad-monitoring', title: 'Paid ad monitoring', description: 'Tracking competitor advertising across digital and offline channels.', pillarSlug: 'research-data-intelligence', branchSlug: 'competitive-intelligence' },
          { id: '2-5-3', slug: 'intelligence-briefings', title: 'Intelligence briefings and reporting', description: 'Structuring and delivering competitive intelligence to campaign leadership.', pillarSlug: 'research-data-intelligence', branchSlug: 'competitive-intelligence' },
        ],
      },
    ],
  },
  {
    id: '3',
    slug: 'narrative-messaging-argumentation',
    title: 'Narrative, Messaging and Argumentation',
    description: 'Message architecture, framing, argumentation, tone and voice, and story formats for campaigns.',
    accentColour: '#D4537E',
    isNew: true,
    branches: [
      {
        id: '3-1', slug: 'message-architecture', title: 'Message architecture', description: 'Building structured, coherent message systems that hold across audiences and channels.',
        topics: [
          { id: '3-1-1', slug: 'message-house', title: 'Message house', description: 'The foundational framework for building a structured campaign message hierarchy.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
          { id: '3-1-2', slug: 'main-message-central-claim', title: 'Main message and central claim', description: 'Crafting the single defining claim that anchors all campaign communications.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
          { id: '3-1-3', slug: 'emotional-rationale', title: 'Emotional rationale', description: 'Identifying the values and emotional drivers that make audiences care.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
          { id: '3-1-4', slug: 'proof-points-supporting-claims', title: 'Proof points and supporting claims', description: 'Building the evidence architecture that makes the central claim credible.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
          { id: '3-1-5', slug: 'call-to-action', title: 'Call to action', description: 'Designing asks that convert audience engagement into campaign action.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
          { id: '3-1-6', slug: 'message-hierarchy-across-audiences', title: 'Message hierarchy across audiences', description: 'Adapting the message house for different audience segments without losing coherence.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
          { id: '3-1-7', slug: 'localisation-adaptation', title: 'Localisation and adaptation', description: 'Translating messages across languages, cultures, and local contexts.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'message-architecture' },
        ],
      },
      {
        id: '3-2', slug: 'framing', title: 'Framing', description: 'Setting the interpretive context that shapes how audiences understand issues.',
        topics: [
          { id: '3-2-1', slug: 'issue-framing', title: 'Issue framing', description: 'Positioning issues in ways that favour your campaign\'s interpretation.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'framing' },
          { id: '3-2-2', slug: 'reframing-opponents', title: 'Reframing opponent narratives', description: 'Disrupting opponent frames and establishing your own interpretive lens.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'framing' },
          { id: '3-2-3', slug: 'values-framing', title: 'Values-based framing', description: 'Anchoring policy arguments in widely held values rather than technicalities.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'framing' },
          { id: '3-2-4', slug: 'metaphor-analogy', title: 'Metaphor and analogy in political communication', description: 'Using figurative language to make complex issues accessible and memorable.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'framing' },
        ],
      },
      {
        id: '3-3', slug: 'argumentation', title: 'Argumentation', description: 'Building logical, evidenced, persuasive arguments for policy and campaign use.',
        topics: [
          { id: '3-3-1', slug: 'argument-structure', title: 'Argument structure and logic', description: 'Designing arguments that are internally coherent and resistant to attack.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'argumentation' },
          { id: '3-3-2', slug: 'evidence-use', title: 'Using evidence in political communication', description: 'Selecting, citing, and communicating evidence for non-specialist audiences.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'argumentation' },
          { id: '3-3-3', slug: 'rebuttal-inoculation', title: 'Rebuttal and inoculation', description: 'Pre-empting and neutralising attacks before they land.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'argumentation' },
          { id: '3-3-4', slug: 'debate-argumentation', title: 'Debate and live argumentation', description: 'Argumentation techniques for structured debates and media appearances.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'argumentation' },
        ],
      },
      {
        id: '3-4', slug: 'tone-voice-language', title: 'Tone, voice and language', description: 'Defining and maintaining a consistent, authentic campaign voice.',
        topics: [
          { id: '3-4-1', slug: 'brand-voice', title: 'Brand voice and tone of voice', description: 'Defining the character and register of your campaign\'s communications.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'tone-voice-language' },
          { id: '3-4-2', slug: 'plain-language', title: 'Plain language and accessibility', description: 'Writing for comprehension across reading levels and backgrounds.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'tone-voice-language' },
          { id: '3-4-3', slug: 'language-sensitivity', title: 'Language sensitivity and inclusivity', description: 'Choosing language that reaches without alienating.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'tone-voice-language' },
          { id: '3-4-4', slug: 'multilingual-voice', title: 'Multilingual voice consistency', description: 'Maintaining tone and character across translations.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'tone-voice-language' },
        ],
      },
      {
        id: '3-5', slug: 'story-formats', title: 'Story formats', description: 'Format-specific guidance for producing impactful campaign content.',
        topics: [
          { id: '3-5-1', slug: 'short-form-story', title: 'Short-form story formats', description: 'Producing compelling campaign stories in 60–90 second formats.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'story-formats' },
          { id: '3-5-2', slug: 'long-form-narrative', title: 'Long-form narrative and documentary', description: 'Developing extended stories for video, audio, and written formats.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'story-formats' },
          { id: '3-5-3', slug: 'data-storytelling', title: 'Data storytelling', description: 'Making data-driven arguments emotionally engaging and visually compelling.', pillarSlug: 'narrative-messaging-argumentation', branchSlug: 'story-formats' },
        ],
      },
    ],
  },
  {
    id: '4',
    slug: 'communications-media',
    title: 'Communications and Media',
    description: 'Traditional media, press materials, spokesperson training, speechwriting, events, and crisis communications.',
    accentColour: '#EF9F27',
    branches: [
      {
        id: '4-1', slug: 'traditional-media', title: 'Traditional media', description: 'Working effectively with print, broadcast, and radio journalists.',
        topics: [
          { id: '4-1-1', slug: 'media-relations', title: 'Media relations and pitching', description: 'Building journalist relationships and placing stories effectively.', pillarSlug: 'communications-media', branchSlug: 'traditional-media' },
          { id: '4-1-2', slug: 'broadcast-strategy', title: 'Broadcast strategy', description: 'Planning and executing television and radio appearances.', pillarSlug: 'communications-media', branchSlug: 'traditional-media' },
          { id: '4-1-3', slug: 'editorial-relationships', title: 'Editorial relationships and opinion pieces', description: 'Securing op-eds and building relationships with editorial boards.', pillarSlug: 'communications-media', branchSlug: 'traditional-media' },
        ],
      },
      {
        id: '4-2', slug: 'press-materials', title: 'Press materials', description: 'Writing and producing materials for media use.',
        topics: [
          { id: '4-2-1', slug: 'press-releases', title: 'Press releases and statements', description: 'Writing releases that get read and quoted by journalists.', pillarSlug: 'communications-media', branchSlug: 'press-materials' },
          { id: '4-2-2', slug: 'media-kits', title: 'Media kits and briefing packs', description: 'Assembling comprehensive background materials for press use.', pillarSlug: 'communications-media', branchSlug: 'press-materials' },
          { id: '4-2-3', slug: 'q-and-a-documents', title: 'Q&A documents and lines to take', description: 'Preparing spokespeople with anticipated questions and approved answers.', pillarSlug: 'communications-media', branchSlug: 'press-materials' },
        ],
      },
      {
        id: '4-3', slug: 'spokesperson-media-training', title: 'Spokesperson and media training', description: 'Preparing individuals to represent a campaign in media settings.',
        topics: [
          { id: '4-3-1', slug: 'media-interview-prep', title: 'Media interview preparation', description: 'Systematic preparation for print, radio, and television interviews.', pillarSlug: 'communications-media', branchSlug: 'spokesperson-media-training' },
          { id: '4-3-2', slug: 'hostile-interview', title: 'Handling hostile interviews', description: 'Techniques for maintaining message discipline under adversarial questioning.', pillarSlug: 'communications-media', branchSlug: 'spokesperson-media-training' },
          { id: '4-3-3', slug: 'on-camera-performance', title: 'On-camera performance', description: 'Building confidence and credibility in video and television formats.', pillarSlug: 'communications-media', branchSlug: 'spokesperson-media-training' },
        ],
      },
      {
        id: '4-4', slug: 'speechwriting-rhetoric', title: 'Speechwriting and rhetoric', description: 'Producing speeches and public remarks that move audiences.',
        topics: [
          { id: '4-4-1', slug: 'speech-structure', title: 'Speech structure and construction', description: 'Building speeches from brief to delivery-ready script.', pillarSlug: 'communications-media', branchSlug: 'speechwriting-rhetoric' },
          { id: '4-4-2', slug: 'rhetorical-devices', title: 'Rhetorical devices and techniques', description: 'Using repetition, contrast, and rhythm to create memorable political language.', pillarSlug: 'communications-media', branchSlug: 'speechwriting-rhetoric' },
          { id: '4-4-3', slug: 'delivery-coaching', title: 'Delivery coaching', description: 'Coaching speakers on voice, pacing, presence, and audience connection.', pillarSlug: 'communications-media', branchSlug: 'speechwriting-rhetoric' },
        ],
      },
      {
        id: '4-5', slug: 'events-activations', title: 'Events and activations', description: 'Planning and executing campaign events and public activations.',
        topics: [
          { id: '4-5-1', slug: 'press-events', title: 'Press events and launches', description: 'Staging events that generate media coverage and set the narrative.', pillarSlug: 'communications-media', branchSlug: 'events-activations' },
          { id: '4-5-2', slug: 'rallies-public-events', title: 'Rallies and public events', description: 'Producing large-scale public campaign events.', pillarSlug: 'communications-media', branchSlug: 'events-activations' },
          { id: '4-5-3', slug: 'activation-strategy', title: 'Activation strategy', description: 'Creating moments that mobilise supporters and generate earned media.', pillarSlug: 'communications-media', branchSlug: 'events-activations' },
        ],
      },
      {
        id: '4-6', slug: 'crisis-communications', title: 'Crisis communications', description: 'Managing reputational and political crises through communications.',
        topics: [
          { id: '4-6-1', slug: 'crisis-response', title: 'Crisis response and rapid communications', description: 'Responding to breaking crises while maintaining message control.', pillarSlug: 'communications-media', branchSlug: 'crisis-communications' },
          { id: '4-6-2', slug: 'crisis-preparation', title: 'Crisis preparation and war-gaming', description: 'Preparing for crises before they happen.', pillarSlug: 'communications-media', branchSlug: 'crisis-communications' },
          { id: '4-6-3', slug: 'apology-correction', title: 'Apology and correction strategy', description: 'Managing situations where the campaign has made an error.', pillarSlug: 'communications-media', branchSlug: 'crisis-communications' },
        ],
      },
    ],
  },
  {
    id: '5',
    slug: 'digital-channels-content',
    title: 'Digital Channels and Content',
    description: 'Social media, short-form content, long-form digital, email and SMS, website infrastructure, creator economy, and digital fundraising.',
    accentColour: '#1D9E75',
    branches: [
      {
        id: '5-1', slug: 'social-media', title: 'Social media', description: 'Strategy and execution across social media platforms.',
        topics: [
          { id: '5-1-1', slug: 'platform-strategy', title: 'Platform strategy', description: 'Choosing and prioritising social platforms for campaign objectives.', pillarSlug: 'digital-channels-content', branchSlug: 'social-media' },
          { id: '5-1-2', slug: 'organic-social', title: 'Organic social content', description: 'Building non-paid presence and engagement across platforms.', pillarSlug: 'digital-channels-content', branchSlug: 'social-media' },
          { id: '5-1-3', slug: 'community-management', title: 'Community management', description: 'Engaging and moderating online communities around a campaign.', pillarSlug: 'digital-channels-content', branchSlug: 'social-media' },
          { id: '5-1-4', slug: 'social-compliance-eu', title: 'EU social media compliance', description: 'Complying with DSA, political ad transparency rules, and platform policies.', pillarSlug: 'digital-channels-content', branchSlug: 'social-media' },
        ],
      },
      {
        id: '5-2', slug: 'short-form-visual-content', title: 'Short-form and visual content', description: 'Producing video, graphics, and visual content for campaign use.',
        topics: [
          { id: '5-2-1', slug: 'video-production', title: 'Video production for campaigns', description: 'Producing campaign video content from brief to publication.', pillarSlug: 'digital-channels-content', branchSlug: 'short-form-visual-content' },
          { id: '5-2-2', slug: 'graphic-design', title: 'Graphic design and visual identity', description: 'Maintaining visual consistency across campaign materials.', pillarSlug: 'digital-channels-content', branchSlug: 'short-form-visual-content' },
          { id: '5-2-3', slug: 'infographics-data-viz', title: 'Infographics and data visualisation', description: 'Turning research into shareable visual formats.', pillarSlug: 'digital-channels-content', branchSlug: 'short-form-visual-content' },
        ],
      },
      {
        id: '5-3', slug: 'long-form-digital-content', title: 'Long-form digital content', description: 'Blogs, whitepapers, guides, and editorial content for campaign platforms.',
        topics: [
          { id: '5-3-1', slug: 'blog-editorial', title: 'Blog and editorial strategy', description: 'Using long-form content to build authority and search presence.', pillarSlug: 'digital-channels-content', branchSlug: 'long-form-digital-content' },
          { id: '5-3-2', slug: 'whitepapers-reports', title: 'Whitepapers and policy reports', description: 'Producing substantive documents that establish thought leadership.', pillarSlug: 'digital-channels-content', branchSlug: 'long-form-digital-content' },
          { id: '5-3-3', slug: 'seo-content', title: 'SEO and search content strategy', description: 'Optimising campaign content for search discovery.', pillarSlug: 'digital-channels-content', branchSlug: 'long-form-digital-content' },
        ],
      },
      {
        id: '5-4', slug: 'email-sms', title: 'Email and SMS', description: 'Building, managing, and optimising direct messaging channels.',
        topics: [
          { id: '5-4-1', slug: 'list-building-growth', title: 'List building and growth', description: 'Strategies for growing high-quality email and SMS subscriber lists.', pillarSlug: 'digital-channels-content', branchSlug: 'email-sms' },
          { id: '5-4-2', slug: 'email-deliverability', title: 'Email deliverability', description: 'Technical and content factors that affect inbox placement.', pillarSlug: 'digital-channels-content', branchSlug: 'email-sms' },
          { id: '5-4-3', slug: 'sms-compliance', title: 'SMS compliance', description: 'GDPR, ePrivacy, and consent requirements for campaign SMS in the EU.', pillarSlug: 'digital-channels-content', branchSlug: 'email-sms' },
          { id: '5-4-4', slug: 'fundraising-email-strategies', title: 'Fundraising email strategies', description: 'Writing and sequencing emails that convert readers into donors.', pillarSlug: 'digital-channels-content', branchSlug: 'email-sms' },
          { id: '5-4-5', slug: 'email-newsletter-copy', title: 'Email and newsletter copy', description: 'Writing compelling email content that builds loyalty and drives action.', pillarSlug: 'digital-channels-content', branchSlug: 'email-sms' },
        ],
      },
      {
        id: '5-5', slug: 'website-digital-infrastructure', title: 'Website and digital infrastructure', description: 'Campaign website strategy, CMS, and digital operations.',
        topics: [
          { id: '5-5-1', slug: 'campaign-website', title: 'Campaign website strategy', description: 'Building websites that convert visitors into supporters and donors.', pillarSlug: 'digital-channels-content', branchSlug: 'website-digital-infrastructure' },
          { id: '5-5-2', slug: 'cms-operations', title: 'CMS and content operations', description: 'Managing content publication at campaign pace.', pillarSlug: 'digital-channels-content', branchSlug: 'website-digital-infrastructure' },
          { id: '5-5-3', slug: 'digital-security', title: 'Digital security for campaign websites', description: 'Protecting campaign web infrastructure from interference.', pillarSlug: 'digital-channels-content', branchSlug: 'website-digital-infrastructure' },
        ],
      },
      {
        id: '5-6', slug: 'creator-influencer-economy', title: 'Creator and influencer economy', description: 'Working with content creators and influencers in campaign contexts.',
        topics: [
          { id: '5-6-1', slug: 'influencer-strategy', title: 'Influencer strategy for campaigns', description: 'Identifying and working with creators to extend campaign reach.', pillarSlug: 'digital-channels-content', branchSlug: 'creator-influencer-economy' },
          { id: '5-6-2', slug: 'influencer-compliance', title: 'Influencer disclosure and compliance', description: 'EU rules on advertising disclosure for political influencer partnerships.', pillarSlug: 'digital-channels-content', branchSlug: 'creator-influencer-economy' },
          { id: '5-6-3', slug: 'citizen-creator', title: 'Citizen creator and grassroots content', description: 'Enabling and amplifying supporter-created content.', pillarSlug: 'digital-channels-content', branchSlug: 'creator-influencer-economy' },
        ],
      },
      {
        id: '5-7', slug: 'digital-fundraising', title: 'Digital fundraising', description: 'Online donor acquisition, retention, and optimisation.',
        topics: [
          { id: '5-7-1', slug: 'online-donation-optimisation', title: 'Online donation optimisation', description: 'Improving conversion rates across donation pages and flows.', pillarSlug: 'digital-channels-content', branchSlug: 'digital-fundraising' },
          { id: '5-7-2', slug: 'recurring-giving', title: 'Recurring giving programmes', description: 'Building sustainable monthly donor bases.', pillarSlug: 'digital-channels-content', branchSlug: 'digital-fundraising' },
          { id: '5-7-3', slug: 'peer-to-peer-fundraising', title: 'Peer-to-peer fundraising', description: 'Enabling supporters to fundraise within their own networks.', pillarSlug: 'digital-channels-content', branchSlug: 'digital-fundraising' },
        ],
      },
    ],
  },
  {
    id: '6',
    slug: 'paid-media-advertising',
    title: 'Paid Media and Advertising',
    description: 'Paid digital advertising, offline advertising, advertising strategy, and ad compliance under EU transparency rules.',
    accentColour: '#0F6E56',
    isNew: true,
    branches: [
      {
        id: '6-1', slug: 'paid-digital-advertising', title: 'Paid digital advertising', description: 'Buying and optimising digital advertising across platforms.',
        topics: [
          { id: '6-1-1', slug: 'social-ads', title: 'Social media advertising', description: 'Running paid campaigns across Meta, X, LinkedIn, TikTok and other platforms.', pillarSlug: 'paid-media-advertising', branchSlug: 'paid-digital-advertising' },
          { id: '6-1-2', slug: 'programmatic-display', title: 'Programmatic and display advertising', description: 'Using programmatic buying for reach and retargeting.', pillarSlug: 'paid-media-advertising', branchSlug: 'paid-digital-advertising' },
          { id: '6-1-3', slug: 'search-advertising', title: 'Search advertising', description: 'Google and Bing search campaigns for campaign and advocacy objectives.', pillarSlug: 'paid-media-advertising', branchSlug: 'paid-digital-advertising' },
          { id: '6-1-4', slug: 'video-advertising', title: 'Video advertising', description: 'YouTube, connected TV, and streaming pre-roll campaigns.', pillarSlug: 'paid-media-advertising', branchSlug: 'paid-digital-advertising' },
        ],
      },
      {
        id: '6-2', slug: 'offline-advertising', title: 'Offline advertising', description: 'Out-of-home, print, and broadcast paid placements.',
        topics: [
          { id: '6-2-1', slug: 'out-of-home', title: 'Out-of-home advertising', description: 'Billboards, transit advertising, and public space placements for campaigns.', pillarSlug: 'paid-media-advertising', branchSlug: 'offline-advertising' },
          { id: '6-2-2', slug: 'broadcast-advertising', title: 'Broadcast advertising', description: 'Television and radio paid placements for political and public affairs campaigns.', pillarSlug: 'paid-media-advertising', branchSlug: 'offline-advertising' },
          { id: '6-2-3', slug: 'direct-mail', title: 'Direct mail', description: 'Physical mail as a campaign persuasion and mobilisation channel.', pillarSlug: 'paid-media-advertising', branchSlug: 'offline-advertising' },
        ],
      },
      {
        id: '6-3', slug: 'advertising-strategy', title: 'Advertising strategy', description: 'Planning and integrating paid media within a campaign strategy.',
        topics: [
          { id: '6-3-1', slug: 'media-planning', title: 'Media planning and buying strategy', description: 'Allocating paid media budgets across channels and audiences.', pillarSlug: 'paid-media-advertising', branchSlug: 'advertising-strategy' },
          { id: '6-3-2', slug: 'creative-strategy', title: 'Creative strategy for paid media', description: 'Developing ad creative that performs across formats and audiences.', pillarSlug: 'paid-media-advertising', branchSlug: 'advertising-strategy' },
          { id: '6-3-3', slug: 'ad-testing', title: 'Ad testing and creative optimisation', description: 'Systematic testing frameworks for paid media creative.', pillarSlug: 'paid-media-advertising', branchSlug: 'advertising-strategy' },
        ],
      },
      {
        id: '6-4', slug: 'ad-compliance-transparency', title: 'Ad compliance and transparency', description: 'Meeting EU and national requirements for political advertising transparency.',
        topics: [
          { id: '6-4-1', slug: 'eu-political-ad-transparency', title: 'EU political advertising transparency', description: 'Requirements of Regulation (EU) 2024/900 for ad labelling and disclosure.', pillarSlug: 'paid-media-advertising', branchSlug: 'ad-compliance-transparency' },
          { id: '6-4-2', slug: 'targeting-compliance', title: 'Targeting compliance under EU law', description: 'What EU law permits and prohibits in political ad targeting.', pillarSlug: 'paid-media-advertising', branchSlug: 'ad-compliance-transparency' },
          { id: '6-4-3', slug: 'ad-archives', title: 'Ad archives and transparency obligations', description: 'Maintaining records and complying with platform and regulatory ad archive requirements.', pillarSlug: 'paid-media-advertising', branchSlug: 'ad-compliance-transparency' },
        ],
      },
    ],
  },
  {
    id: '7',
    slug: 'fieldwork-organising-mobilisation',
    title: 'Fieldwork, Organising and Mobilisation',
    description: 'Voter contact, volunteer management, community organising, voter registration, and coalition logistics.',
    accentColour: '#BA7517',
    branches: [
      {
        id: '7-1', slug: 'voter-contact', title: 'Voter contact', description: 'Direct contact with voters through canvassing, phone, and text banking.',
        topics: [
          { id: '7-1-1', slug: 'door-to-door-canvassing', title: 'Door-to-door canvassing', description: 'Running effective face-to-face canvassing programmes.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-contact' },
          { id: '7-1-2', slug: 'phone-banking', title: 'Phone banking', description: 'Organising and optimising volunteer phone outreach.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-contact' },
          { id: '7-1-3', slug: 'relational-organising', title: 'Relational organising', description: 'Using personal networks for peer-to-peer voter contact.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-contact' },
          { id: '7-1-4', slug: 'text-banking', title: 'Text banking and peer-to-peer SMS', description: 'Compliant text outreach programmes for voter contact.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-contact' },
        ],
      },
      {
        id: '7-2', slug: 'volunteer-management', title: 'Volunteer management', description: 'Recruiting, training, and retaining campaign volunteers.',
        topics: [
          { id: '7-2-1', slug: 'volunteer-recruitment', title: 'Volunteer recruitment', description: 'Building a diverse, committed volunteer workforce.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'volunteer-management' },
          { id: '7-2-2', slug: 'volunteer-training', title: 'Volunteer training and onboarding', description: 'Getting volunteers ready to represent the campaign effectively.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'volunteer-management' },
          { id: '7-2-3', slug: 'volunteer-retention', title: 'Volunteer retention and culture', description: 'Keeping volunteers engaged and energised through long campaigns.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'volunteer-management' },
        ],
      },
      {
        id: '7-3', slug: 'community-organising', title: 'Community organising', description: 'Building power and presence in communities for sustained campaign impact.',
        topics: [
          { id: '7-3-1', slug: 'community-mapping', title: 'Community mapping and power analysis', description: 'Identifying community leaders, networks, and decision-making structures.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'community-organising' },
          { id: '7-3-2', slug: 'local-leaders', title: 'Working with local leaders', description: 'Identifying and partnering with community influencers and gatekeepers.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'community-organising' },
          { id: '7-3-3', slug: 'grassroots-coalition', title: 'Grassroots coalition building', description: 'Assembling and sustaining community coalitions around campaign goals.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'community-organising' },
        ],
      },
      {
        id: '7-4', slug: 'voter-registration-turnout', title: 'Voter registration and turnout', description: 'Programmes to register voters and maximise turnout on polling day.',
        topics: [
          { id: '7-4-1', slug: 'voter-registration-programmes', title: 'Voter registration programmes', description: 'Running systematic voter registration drives targeting priority communities.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-registration-turnout' },
          { id: '7-4-2', slug: 'gotv-strategy', title: 'Get out the vote strategy', description: 'Designing GOTV programmes that lift turnout among target constituencies.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-registration-turnout' },
          { id: '7-4-3', slug: 'polling-day-operations', title: 'Polling day operations', description: 'Managing campaign operations on election day for maximum effect.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'voter-registration-turnout' },
        ],
      },
      {
        id: '7-5', slug: 'events-coalition-logistics', title: 'Events and coalition logistics', description: 'Field event planning and coalition coordination.',
        topics: [
          { id: '7-5-1', slug: 'field-events', title: 'Field event planning', description: 'Organising town halls, community meetings, and field activations.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'events-coalition-logistics' },
          { id: '7-5-2', slug: 'coalition-coordination', title: 'Coalition coordination', description: 'Managing relationships and activities across allied organisations.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'events-coalition-logistics' },
          { id: '7-5-3', slug: 'logistics-operations', title: 'Logistics and field operations', description: 'Coordinating materials, transport, and field resources at scale.', pillarSlug: 'fieldwork-organising-mobilisation', branchSlug: 'events-coalition-logistics' },
        ],
      },
    ],
  },
  {
    id: '8',
    slug: 'policy-government-affairs',
    title: 'Policy and Government Affairs',
    description: 'Policy development, legislative affairs, government relations, regulatory affairs, think tanks, and international advocacy.',
    accentColour: '#185FA5',
    branches: [
      {
        id: '8-1', slug: 'policy-development', title: 'Policy development', description: 'Developing credible, communicable policy positions.',
        topics: [
          { id: '8-1-1', slug: 'policy-design', title: 'Policy design and development', description: 'Translating values and evidence into actionable policy proposals.', pillarSlug: 'policy-government-affairs', branchSlug: 'policy-development' },
          { id: '8-1-2', slug: 'policy-costing', title: 'Policy costing and impact assessment', description: 'Building credible economic and social impact analyses.', pillarSlug: 'policy-government-affairs', branchSlug: 'policy-development' },
          { id: '8-1-3', slug: 'consultation-response', title: 'Consultation and public engagement', description: 'Responding to public consultations and engaging in policy dialogue.', pillarSlug: 'policy-government-affairs', branchSlug: 'policy-development' },
        ],
      },
      {
        id: '8-2', slug: 'legislative-affairs', title: 'Legislative affairs', description: 'Working within and around legislative processes.',
        topics: [
          { id: '8-2-1', slug: 'legislative-process', title: 'Legislative process navigation', description: 'Understanding and exploiting legislative procedures at national and EU level.', pillarSlug: 'policy-government-affairs', branchSlug: 'legislative-affairs' },
          { id: '8-2-2', slug: 'amendment-strategy', title: 'Amendment strategy', description: 'Tabling and advocating for legislative amendments.', pillarSlug: 'policy-government-affairs', branchSlug: 'legislative-affairs' },
          { id: '8-2-3', slug: 'stakeholder-map-legislative', title: 'Legislative stakeholder mapping', description: 'Identifying key legislators, advisers, and influencers in a legislative process.', pillarSlug: 'policy-government-affairs', branchSlug: 'legislative-affairs' },
          { id: '8-2-4', slug: 'eu-legislative-process', title: 'EU legislative process', description: 'Navigating the trilogue, co-decision, and implementation processes.', pillarSlug: 'policy-government-affairs', branchSlug: 'legislative-affairs' },
        ],
      },
      {
        id: '8-3', slug: 'government-relations', title: 'Government relations', description: 'Building and managing relationships with government and its advisers.',
        topics: [
          { id: '8-3-1', slug: 'ministerial-engagement', title: 'Ministerial and official engagement', description: 'Accessing and influencing ministers, secretaries of state, and senior officials.', pillarSlug: 'policy-government-affairs', branchSlug: 'government-relations' },
          { id: '8-3-2', slug: 'civil-service-engagement', title: 'Civil service engagement', description: 'Working with officials across departments and agencies.', pillarSlug: 'policy-government-affairs', branchSlug: 'government-relations' },
          { id: '8-3-3', slug: 'special-advisers', title: 'Working with special advisers', description: 'Understanding and engaging the political adviser layer in government.', pillarSlug: 'policy-government-affairs', branchSlug: 'government-relations' },
        ],
      },
      {
        id: '8-4', slug: 'regulatory-affairs', title: 'Regulatory affairs', description: 'Engaging in regulatory processes and influencing rulemaking.',
        topics: [
          { id: '8-4-1', slug: 'regulatory-strategy', title: 'Regulatory strategy', description: 'Positioning organisations in regulatory processes for favourable outcomes.', pillarSlug: 'policy-government-affairs', branchSlug: 'regulatory-affairs' },
          { id: '8-4-2', slug: 'regulator-engagement', title: 'Regulator engagement', description: 'Building productive relationships with regulatory bodies.', pillarSlug: 'policy-government-affairs', branchSlug: 'regulatory-affairs' },
          { id: '8-4-3', slug: 'consultation-strategy', title: 'Regulatory consultation strategy', description: 'Responding to regulatory consultations strategically.', pillarSlug: 'policy-government-affairs', branchSlug: 'regulatory-affairs' },
        ],
      },
      {
        id: '8-5', slug: 'think-tanks-advocacy', title: 'Think tanks and advocacy', description: 'Using research institutions and civil society for policy influence.',
        topics: [
          { id: '8-5-1', slug: 'think-tank-strategy', title: 'Think tank engagement strategy', description: 'Working with research institutions to build policy credibility.', pillarSlug: 'policy-government-affairs', branchSlug: 'think-tanks-advocacy' },
          { id: '8-5-2', slug: 'coalition-advocacy', title: 'Coalition advocacy', description: 'Building multi-organisation campaigns around policy objectives.', pillarSlug: 'policy-government-affairs', branchSlug: 'think-tanks-advocacy' },
          { id: '8-5-3', slug: 'evidence-based-advocacy', title: 'Evidence-based advocacy', description: 'Using research and data to drive policy arguments.', pillarSlug: 'policy-government-affairs', branchSlug: 'think-tanks-advocacy' },
        ],
      },
      {
        id: '8-6', slug: 'international-multilateral-affairs', title: 'International and multilateral affairs', description: 'Engaging international institutions and multilateral policy processes.',
        topics: [
          { id: '8-6-1', slug: 'eu-institutions', title: 'EU institutions engagement', description: 'Navigating the European Parliament, Commission, and Council.', pillarSlug: 'policy-government-affairs', branchSlug: 'international-multilateral-affairs' },
          { id: '8-6-2', slug: 'un-multilateral', title: 'UN and multilateral bodies', description: 'Engaging the United Nations, Council of Europe, and other multilateral bodies.', pillarSlug: 'policy-government-affairs', branchSlug: 'international-multilateral-affairs' },
          { id: '8-6-3', slug: 'international-coalition', title: 'International coalition building', description: 'Building cross-border alliances for multilateral advocacy.', pillarSlug: 'policy-government-affairs', branchSlug: 'international-multilateral-affairs' },
        ],
      },
    ],
  },
  {
    id: '9',
    slug: 'technology-ai-infrastructure',
    title: 'Technology, AI and Infrastructure',
    description: 'Artificial intelligence, political technology, civic technology, data infrastructure, and cybersecurity.',
    accentColour: '#378ADD',
    branches: [
      {
        id: '9-1', slug: 'artificial-intelligence', title: 'Artificial intelligence', description: 'Using AI responsibly in campaign and public affairs contexts.',
        topics: [
          { id: '9-1-1', slug: 'ai-content-production', title: 'AI-assisted content production', description: 'Using AI tools to accelerate campaign content creation at scale.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'artificial-intelligence' },
          { id: '9-1-2', slug: 'ai-human-review', title: 'Human review of AI-generated content', description: 'Building workflows to ensure AI outputs meet political, legal, and editorial standards.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'artificial-intelligence' },
          { id: '9-1-3', slug: 'ai-targeting', title: 'AI in voter targeting and analytics', description: 'Machine learning applications for voter modelling and campaign optimisation.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'artificial-intelligence' },
          { id: '9-1-4', slug: 'synthetic-media', title: 'Synthetic media and deepfakes', description: 'Governance of AI-generated images, audio, and video in campaign contexts.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'artificial-intelligence' },
        ],
      },
      {
        id: '9-2', slug: 'political-technology', title: 'Political technology', description: 'Software tools and platforms built for campaign use.',
        topics: [
          { id: '9-2-1', slug: 'crm-voter-databases', title: 'CRM and voter databases', description: 'Selecting and operating campaign management and voter contact systems.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'political-technology' },
          { id: '9-2-2', slug: 'canvassing-apps', title: 'Canvassing and field apps', description: 'Digital tools for door-to-door and field campaign operations.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'political-technology' },
          { id: '9-2-3', slug: 'campaign-tech-stack', title: 'Campaign technology stack', description: 'Assembling and integrating the technology components of a modern campaign.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'political-technology' },
        ],
      },
      {
        id: '9-3', slug: 'civic-technology', title: 'Civic technology', description: 'Technology in service of democratic participation and civic engagement.',
        topics: [
          { id: '9-3-1', slug: 'participatory-platforms', title: 'Participatory platforms', description: 'Digital tools that enable citizen participation in policy and campaigns.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'civic-technology' },
          { id: '9-3-2', slug: 'transparency-tools', title: 'Transparency and accountability tools', description: 'Technology that supports democratic transparency.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'civic-technology' },
          { id: '9-3-3', slug: 'accessibility-technology', title: 'Accessibility and inclusion technology', description: 'Digital tools that widen participation across diverse communities.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'civic-technology' },
        ],
      },
      {
        id: '9-4', slug: 'public-affairs-technology', title: 'Public affairs technology', description: 'Technology tools designed for government relations and public affairs.',
        topics: [
          { id: '9-4-1', slug: 'legislative-monitoring', title: 'Legislative monitoring tools', description: 'Software for tracking bills, regulations, and committee activity.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'public-affairs-technology' },
          { id: '9-4-2', slug: 'stakeholder-mapping-tools', title: 'Stakeholder mapping tools', description: 'Platforms for identifying, tracking, and engaging political stakeholders.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'public-affairs-technology' },
          { id: '9-4-3', slug: 'pa-crm', title: 'Public affairs CRM', description: 'Contact management and relationship tracking for lobbying and government relations.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'public-affairs-technology' },
        ],
      },
      {
        id: '9-5', slug: 'data-infrastructure', title: 'Data infrastructure', description: 'Building and managing campaign data pipelines and warehouses.',
        topics: [
          { id: '9-5-1', slug: 'data-integration', title: 'Data integration and pipelines', description: 'Connecting campaign data sources for unified analytics.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'data-infrastructure' },
          { id: '9-5-2', slug: 'data-governance', title: 'Campaign data governance', description: 'Policies and systems for responsible data management.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'data-infrastructure' },
          { id: '9-5-3', slug: 'cloud-infrastructure', title: 'Cloud infrastructure for campaigns', description: 'Selecting and operating cloud services for campaign scale and resilience.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'data-infrastructure' },
        ],
      },
      {
        id: '9-6', slug: 'cybersecurity-digital-resilience', title: 'Cybersecurity and digital resilience', description: 'Protecting campaign systems, data, and communications from attack.',
        topics: [
          { id: '9-6-1', slug: 'campaign-cybersecurity', title: 'Campaign cybersecurity basics', description: 'Foundational security practices for campaign teams and staff.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'cybersecurity-digital-resilience' },
          { id: '9-6-2', slug: 'threat-modelling', title: 'Threat modelling for campaigns', description: 'Identifying and prioritising cybersecurity threats specific to political campaigns.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'cybersecurity-digital-resilience' },
          { id: '9-6-3', slug: 'incident-response', title: 'Incident response planning', description: 'Preparing for and responding to cybersecurity incidents.', pillarSlug: 'technology-ai-infrastructure', branchSlug: 'cybersecurity-digital-resilience' },
        ],
      },
    ],
  },
  {
    id: '10',
    slug: 'fundraising-finance-commercial',
    title: 'Fundraising, Finance and Commercial Operations',
    description: 'Campaign finance, fundraising strategy, donor communications, budget management, and vendor operations.',
    accentColour: '#639922',
    branches: [
      {
        id: '10-1', slug: 'campaign-finance', title: 'Campaign finance', description: 'Legal frameworks and practical management of campaign finances.',
        topics: [
          { id: '10-1-1', slug: 'campaign-finance-law', title: 'Campaign finance law', description: 'Understanding contribution limits, disclosure, and expenditure rules.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'campaign-finance' },
          { id: '10-1-2', slug: 'financial-compliance', title: 'Financial compliance and reporting', description: 'Meeting reporting obligations and maintaining clean accounts.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'campaign-finance' },
          { id: '10-1-3', slug: 'third-party-spending', title: 'Third-party and coordinated spending', description: 'Rules on spending by organisations affiliated with campaigns.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'campaign-finance' },
        ],
      },
      {
        id: '10-2', slug: 'fundraising-strategy', title: 'Fundraising strategy', description: 'Planning and executing fundraising across channels and donor segments.',
        topics: [
          { id: '10-2-1', slug: 'major-donor', title: 'Major donor fundraising', description: 'Identifying and cultivating high-value individual donors.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'fundraising-strategy' },
          { id: '10-2-2', slug: 'grassroots-fundraising', title: 'Grassroots and small-dollar fundraising', description: 'Building a broad base of small donors for financial and political credibility.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'fundraising-strategy' },
          { id: '10-2-3', slug: 'event-fundraising', title: 'Event fundraising', description: 'Producing fundraising events that generate revenue and donor relationships.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'fundraising-strategy' },
        ],
      },
      {
        id: '10-3', slug: 'donor-communications', title: 'Donor communications', description: 'Writing and managing communications that convert and retain donors.',
        topics: [
          { id: '10-3-1', slug: 'donor-acquisition-copy', title: 'Donor acquisition copy', description: 'Writing appeals that convert new donors across channels.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'donor-communications' },
          { id: '10-3-2', slug: 'donor-retention', title: 'Donor retention and stewardship', description: 'Maintaining donor relationships and reducing lapse rates.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'donor-communications' },
          { id: '10-3-3', slug: 'major-donor-comms', title: 'Major donor communications', description: 'Personalised communications for high-value donor relationships.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'donor-communications' },
        ],
      },
      {
        id: '10-4', slug: 'budget-financial-management', title: 'Budget and financial management', description: 'Planning and managing campaign budgets and cashflow.',
        topics: [
          { id: '10-4-1', slug: 'campaign-budgeting', title: 'Campaign budgeting', description: 'Building and managing budgets across a campaign lifecycle.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'budget-financial-management' },
          { id: '10-4-2', slug: 'cashflow-management', title: 'Cashflow management', description: 'Managing the timing mismatch between fundraising and expenditure.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'budget-financial-management' },
          { id: '10-4-3', slug: 'financial-reporting-internal', title: 'Internal financial reporting', description: 'Keeping campaign leadership informed on financial position in real time.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'budget-financial-management' },
        ],
      },
      {
        id: '10-5', slug: 'commercial-vendor-operations', title: 'Commercial and vendor operations', description: 'Managing suppliers, contracts, and commercial relationships.',
        topics: [
          { id: '10-5-1', slug: 'vendor-management', title: 'Vendor management', description: 'Selecting and managing campaign suppliers and agencies.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'commercial-vendor-operations' },
          { id: '10-5-2', slug: 'contract-management', title: 'Contract management', description: 'Negotiating and administering campaign contracts.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'commercial-vendor-operations' },
          { id: '10-5-3', slug: 'procurement-campaigns', title: 'Procurement for campaigns', description: 'Fast, compliant procurement for time-sensitive campaign needs.', pillarSlug: 'fundraising-finance-commercial', branchSlug: 'commercial-vendor-operations' },
        ],
      },
    ],
  },
  {
    id: '11',
    slug: 'governance-ethics-compliance',
    title: 'Governance, Ethics and Compliance — EU-First',
    description: 'EU political advertising regulation, GDPR, ePrivacy, EU AI Act, DSA, election law, lobbying registers, and compliance operations.',
    accentColour: '#E24B4A',
    isNew: true,
    branches: [
      {
        id: '11-1', slug: 'eu-political-advertising-regulation', title: 'EU political advertising regulation', description: 'Regulation (EU) 2024/900 and its implications for campaign teams.',
        topics: [
          { id: '11-1-1', slug: 'eu-political-ad-regulation-overview', title: 'Regulation (EU) 2024/900 overview', description: 'Key obligations, scope, and definitions under the EU political advertising regulation.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-political-advertising-regulation' },
          { id: '11-1-2', slug: 'ad-labelling-disclosure', title: 'Ad labelling and disclosure requirements', description: 'What EU law requires on political ad labels, sponsors, and funding disclosure.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-political-advertising-regulation' },
          { id: '11-1-3', slug: 'targeting-restrictions-eu', title: 'Targeting restrictions under EU law', description: 'What is prohibited and what is permitted in political ad targeting under EU rules.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-political-advertising-regulation' },
        ],
      },
      {
        id: '11-2', slug: 'eu-data-protection', title: 'EU data protection and privacy for political campaigns', description: 'GDPR obligations specific to political campaign data processing.',
        topics: [
          { id: '11-2-1', slug: 'gdpr-political-data', title: 'GDPR and political opinion data', description: 'Special category data rules for processing voter political opinions.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-data-protection' },
          { id: '11-2-2', slug: 'consent-lawful-basis', title: 'Lawful bases and consent in campaigns', description: 'Identifying and documenting the correct lawful basis for campaign data use.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-data-protection' },
          { id: '11-2-3', slug: 'dpia-campaigns', title: 'Data Protection Impact Assessments', description: 'When and how to conduct DPIAs for campaign data processing activities.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-data-protection' },
        ],
      },
      {
        id: '11-3', slug: 'eu-eprivacy-direct-marketing', title: 'EU ePrivacy, direct marketing and campaign communications', description: 'ePrivacy Directive and national rules on cookies, email, and SMS marketing.',
        topics: [
          { id: '11-3-1', slug: 'eprivacy-email-sms', title: 'ePrivacy rules for email and SMS', description: 'Consent requirements for electronic direct marketing in political campaigns.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-eprivacy-direct-marketing' },
          { id: '11-3-2', slug: 'cookies-tracking', title: 'Cookies, tracking, and campaign analytics', description: 'Compliant use of cookies and tracking on campaign websites.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-eprivacy-direct-marketing' },
          { id: '11-3-3', slug: 'cold-contact-rules', title: 'Cold contact and canvassing rules', description: 'What the ePrivacy framework permits for unsolicited political contact.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-eprivacy-direct-marketing' },
        ],
      },
      {
        id: '11-4', slug: 'eu-ai-act-synthetic-media', title: 'EU AI Act and synthetic media governance', description: 'AI Act obligations and synthetic media disclosure for political content.',
        topics: [
          { id: '11-4-1', slug: 'ai-act-political-use', title: 'EU AI Act implications for campaigns', description: 'How the AI Act applies to AI-generated political content and targeting.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-ai-act-synthetic-media' },
          { id: '11-4-2', slug: 'synthetic-media-disclosure', title: 'Synthetic media disclosure obligations', description: 'AI Act Article 50 requirements for labelling AI-generated campaign content.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-ai-act-synthetic-media' },
          { id: '11-4-3', slug: 'ai-governance-workflows', title: 'AI governance workflows for campaigns', description: 'Building internal processes to manage AI risk in campaign content production.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-ai-act-synthetic-media' },
        ],
      },
      {
        id: '11-5', slug: 'digital-services-act', title: 'Digital Services Act and platform governance', description: 'DSA obligations on platforms and how they affect political campaigns.',
        topics: [
          { id: '11-5-1', slug: 'dsa-platform-obligations', title: 'DSA obligations for very large platforms', description: 'How DSA rules on VLOPs affect political advertising and content moderation.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'digital-services-act' },
          { id: '11-5-2', slug: 'recommender-systems', title: 'Recommender systems and political content', description: 'DSA rules on algorithmic recommendation and political speech.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'digital-services-act' },
          { id: '11-5-3', slug: 'ad-transparency-dsa', title: 'Ad transparency under the DSA', description: 'DSA requirements for advertising transparency and access to ad repositories.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'digital-services-act' },
        ],
      },
      {
        id: '11-6', slug: 'eu-election-law', title: 'EU election law and European Parliament campaigns', description: 'Rules for campaigning in European Parliament elections across member states.',
        topics: [
          { id: '11-6-1', slug: 'ep-election-rules', title: 'European Parliament election rules', description: 'The regulatory framework for EU-wide electoral campaigning.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-election-law' },
          { id: '11-6-2', slug: 'cross-border-ep-campaigns', title: 'Cross-border EP campaign compliance', description: 'Operating across member states within the EP election legal framework.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-election-law' },
          { id: '11-6-3', slug: 'european-political-parties', title: 'European political parties and foundations', description: 'Rules governing pan-European political party activity and funding.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'eu-election-law' },
        ],
      },
      {
        id: '11-7', slug: 'national-election-law', title: 'National election law in EU Member States', description: 'National electoral law across EU member states.',
        topics: [
          { id: '11-7-1', slug: 'national-campaign-rules', title: 'National campaign rules overview', description: 'Comparing electoral campaign rules across key EU member states.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'national-election-law' },
          { id: '11-7-2', slug: 'blackout-periods', title: 'Blackout periods and campaign silence', description: 'Pre-election silence rules across EU member states.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'national-election-law' },
          { id: '11-7-3', slug: 'candidate-party-registration', title: 'Candidate and party registration', description: 'Registration requirements and deadlines across EU jurisdictions.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'national-election-law' },
        ],
      },
      {
        id: '11-8', slug: 'political-finance-party-funding', title: 'National political finance and party funding rules', description: 'Donation limits, reporting, and party funding across EU member states.',
        topics: [
          { id: '11-8-1', slug: 'donation-limits', title: 'Donation limits and prohibited donors', description: 'National rules on who can donate and how much.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'political-finance-party-funding' },
          { id: '11-8-2', slug: 'financial-disclosure', title: 'Financial disclosure and reporting', description: 'Reporting obligations for campaign spending and income.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'political-finance-party-funding' },
          { id: '11-8-3', slug: 'public-funding', title: 'Public funding of parties and campaigns', description: 'State funding mechanisms and eligibility rules across member states.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'political-finance-party-funding' },
        ],
      },
      {
        id: '11-9', slug: 'media-broadcast-neutrality', title: 'National media, broadcast and institutional neutrality rules', description: 'Rules on political access to broadcast media and institutional campaign restrictions.',
        topics: [
          { id: '11-9-1', slug: 'broadcast-access', title: 'Broadcast access and political advertising', description: 'Country-by-country rules on paid political advertising in broadcast media.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'media-broadcast-neutrality' },
          { id: '11-9-2', slug: 'equal-airtime', title: 'Equal airtime and balance rules', description: 'Rules requiring broadcasters to provide equitable access to political parties.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'media-broadcast-neutrality' },
          { id: '11-9-3', slug: 'institutional-neutrality', title: 'Institutional neutrality and government resources', description: 'Rules preventing use of government resources and infrastructure for campaign purposes.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'media-broadcast-neutrality' },
        ],
      },
      {
        id: '11-10', slug: 'lobbying-transparency-registers', title: 'Lobbying, public affairs and transparency registers in the EU', description: 'EU and national lobbying registers, disclosure, and transparency obligations.',
        topics: [
          { id: '11-10-1', slug: 'eu-transparency-register', title: 'EU Transparency Register', description: 'Obligations and practical guidance for registration with the EU Transparency Register.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'lobbying-transparency-registers' },
          { id: '11-10-2', slug: 'national-lobbying-registers', title: 'National lobbying registers', description: 'Country-by-country overview of lobbying registration requirements in EU member states.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'lobbying-transparency-registers' },
          { id: '11-10-3', slug: 'revolving-door', title: 'Revolving door and cooling-off rules', description: 'Post-employment restrictions for former officials moving into public affairs roles.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'lobbying-transparency-registers' },
        ],
      },
      {
        id: '11-11', slug: 'public-procurement-state-aid', title: 'Public procurement, state aid and institutional campaigns', description: 'Restrictions on the use of public resources in campaign and advocacy contexts.',
        topics: [
          { id: '11-11-1', slug: 'state-aid-campaigns', title: 'State aid and campaign activities', description: 'EU state aid rules and their implications for publicly funded campaign activities.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'public-procurement-state-aid' },
          { id: '11-11-2', slug: 'public-procurement-rules', title: 'Public procurement for campaign suppliers', description: 'When campaign procurement triggers public procurement obligations.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'public-procurement-state-aid' },
        ],
      },
      {
        id: '11-12', slug: 'ethics-democratic-integrity', title: 'Ethics and democratic integrity', description: 'Non-legal ethical standards and democratic integrity frameworks for campaigns.',
        topics: [
          { id: '11-12-1', slug: 'campaign-ethics-codes', title: 'Campaign ethics codes', description: 'Industry and self-regulatory codes of conduct for campaign practitioners.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'ethics-democratic-integrity' },
          { id: '11-12-2', slug: 'disinformation-integrity', title: 'Disinformation and democratic integrity', description: 'Commitments and frameworks for campaigning without disinformation.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'ethics-democratic-integrity' },
          { id: '11-12-3', slug: 'foreign-interference', title: 'Foreign interference and safeguarding', description: 'Identifying and defending against foreign interference in domestic campaigns.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'ethics-democratic-integrity' },
        ],
      },
      {
        id: '11-13', slug: 'compliance-operations', title: 'Compliance operations and approval workflows', description: 'Building internal compliance systems and content approval workflows.',
        topics: [
          { id: '11-13-1', slug: 'compliance-framework', title: 'Compliance framework for campaigns', description: 'Building a practical compliance system that campaigns can operate under pressure.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'compliance-operations' },
          { id: '11-13-2', slug: 'approval-workflows', title: 'Content approval workflows', description: 'Designing review and sign-off processes for campaign content and advertising.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'compliance-operations' },
          { id: '11-13-3', slug: 'compliance-training', title: 'Compliance training for campaign staff', description: 'Briefing staff on legal obligations relevant to their campaign role.', pillarSlug: 'governance-ethics-compliance', branchSlug: 'compliance-operations' },
        ],
      },
    ],
  },
  {
    id: '12',
    slug: 'international-regulation-comparative',
    title: 'International Regulation and Comparative Compliance',
    description: 'Campaign law and regulatory frameworks outside the EU — US, UK, Canada, and global platform rules — as comparative reference material.',
    accentColour: '#5F5E5A',
    branches: [
      {
        id: '12-1', slug: 'united-states', title: 'United States', description: 'US federal and state campaign finance, advertising, and data rules.',
        topics: [
          { id: '12-1-1', slug: 'fec-rules', title: 'FEC rules and campaign finance', description: 'Federal Election Commission requirements for campaign finance and disclosure.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-states' },
          { id: '12-1-2', slug: 'us-political-advertising', title: 'US political advertising rules', description: 'FCC, FEC, and platform rules for political advertising in the United States.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-states' },
          { id: '12-1-3', slug: 'us-data-privacy', title: 'US data privacy and voter data', description: 'State and federal privacy frameworks affecting voter data use.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-states' },
          { id: '12-1-4', slug: 'state-law-variation', title: 'State-level law variation', description: 'Key differences in campaign rules across US states.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-states' },
        ],
      },
      {
        id: '12-2', slug: 'united-kingdom', title: 'United Kingdom', description: 'UK election law, PPERA, ICO guidance, and Ofcom rules post-Brexit.',
        topics: [
          { id: '12-2-1', slug: 'ppera-overview', title: 'PPERA and campaign finance', description: 'Political Parties, Elections and Referendums Act 2000 and its implications.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-kingdom' },
          { id: '12-2-2', slug: 'uk-digital-advertising', title: 'UK digital political advertising', description: 'ICO and Electoral Commission guidance on digital political ads in the UK.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-kingdom' },
          { id: '12-2-3', slug: 'uk-data-protection', title: 'UK GDPR and political data', description: 'ICO guidance on processing political opinion data for campaigns.', pillarSlug: 'international-regulation-comparative', branchSlug: 'united-kingdom' },
        ],
      },
      {
        id: '12-3', slug: 'canada', title: 'Canada', description: 'Canadian federal election law and provincial campaign rules.',
        topics: [
          { id: '12-3-1', slug: 'canada-elections-act', title: 'Canada Elections Act', description: 'Federal rules on campaign finance, advertising, and third-party activity.', pillarSlug: 'international-regulation-comparative', branchSlug: 'canada' },
          { id: '12-3-2', slug: 'canada-digital-advertising', title: 'Canadian digital advertising rules', description: 'Transparency and disclosure requirements for online political advertising in Canada.', pillarSlug: 'international-regulation-comparative', branchSlug: 'canada' },
          { id: '12-3-3', slug: 'canada-pipeda', title: 'PIPEDA and political data', description: 'Canadian privacy law and its application to voter data processing.', pillarSlug: 'international-regulation-comparative', branchSlug: 'canada' },
        ],
      },
      {
        id: '12-4', slug: 'other-non-eu-jurisdictions', title: 'Other non-EU jurisdictions', description: 'Campaign law in Australia, New Zealand, and other democracies.',
        topics: [
          { id: '12-4-1', slug: 'australia-campaign-law', title: 'Australia', description: 'AEC rules and state-level campaign finance in Australia.', pillarSlug: 'international-regulation-comparative', branchSlug: 'other-non-eu-jurisdictions' },
          { id: '12-4-2', slug: 'new-zealand-campaign-law', title: 'New Zealand', description: 'Electoral Commission rules and the Electoral Act in New Zealand.', pillarSlug: 'international-regulation-comparative', branchSlug: 'other-non-eu-jurisdictions' },
          { id: '12-4-3', slug: 'emerging-democracies', title: 'Emerging democracy frameworks', description: 'Campaign regulation in developing democratic contexts.', pillarSlug: 'international-regulation-comparative', branchSlug: 'other-non-eu-jurisdictions' },
        ],
      },
      {
        id: '12-5', slug: 'global-platform-rules', title: 'Global platform rules', description: 'Meta, Google, X, TikTok, and LinkedIn policies on political advertising.',
        topics: [
          { id: '12-5-1', slug: 'meta-political-ads', title: 'Meta political advertising policy', description: 'Meta\'s rules on political ad authorisation, targeting, and transparency.', pillarSlug: 'international-regulation-comparative', branchSlug: 'global-platform-rules' },
          { id: '12-5-2', slug: 'google-political-ads', title: 'Google political advertising policy', description: 'Google\'s verification, targeting, and disclosure requirements for political ads.', pillarSlug: 'international-regulation-comparative', branchSlug: 'global-platform-rules' },
          { id: '12-5-3', slug: 'other-platform-policies', title: 'X, TikTok and LinkedIn policies', description: 'Political advertising and content policies across other major platforms.', pillarSlug: 'international-regulation-comparative', branchSlug: 'global-platform-rules' },
        ],
      },
    ],
  },
  {
    id: '13',
    slug: 'crisis-issues-disinformation',
    title: 'Crisis, Issues, Disinformation and Reputation',
    description: 'Crisis preparation, rapid response, countering disinformation, reputation management, and legal and reputational risk.',
    accentColour: '#A32D2D',
    isNew: true,
    branches: [
      {
        id: '13-1', slug: 'crisis-preparation', title: 'Crisis preparation', description: 'Building the systems and plans that enable effective crisis response.',
        topics: [
          { id: '13-1-1', slug: 'crisis-planning', title: 'Crisis planning and war-gaming', description: 'Anticipating and preparing for political, reputational, and communications crises.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'crisis-preparation' },
          { id: '13-1-2', slug: 'crisis-team-structure', title: 'Crisis team structure and roles', description: 'Assembling and briefing a crisis response team before a crisis occurs.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'crisis-preparation' },
          { id: '13-1-3', slug: 'dark-site-preparation', title: 'Dark site and content preparation', description: 'Pre-building crisis communication assets for rapid deployment.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'crisis-preparation' },
        ],
      },
      {
        id: '13-2', slug: 'rapid-response', title: 'Rapid response', description: 'Responding effectively to attacks, breaking news, and emerging issues.',
        topics: [
          { id: '13-2-1', slug: 'rapid-response-war-room', title: 'Rapid response war room', description: 'Setting up and operating a war room for real-time campaign response.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'rapid-response' },
          { id: '13-2-2', slug: 'real-time-monitoring', title: 'Real-time monitoring for rapid response', description: 'Systems for detecting emerging issues and attack narratives in real time.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'rapid-response' },
          { id: '13-2-3', slug: 'response-decision-tree', title: 'Response decision frameworks', description: 'Deciding whether, when, and how to respond to an attack or crisis.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'rapid-response' },
        ],
      },
      {
        id: '13-3', slug: 'disinformation-manipulation', title: 'Disinformation and manipulation', description: 'Detecting, countering, and reporting disinformation targeting a campaign.',
        topics: [
          { id: '13-3-1', slug: 'disinformation-detection', title: 'Disinformation detection', description: 'Identifying coordinated inauthentic behaviour and false narratives targeting a campaign.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'disinformation-manipulation' },
          { id: '13-3-2', slug: 'counter-disinformation', title: 'Counter-disinformation strategy', description: 'Responding to disinformation without amplifying it.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'disinformation-manipulation' },
          { id: '13-3-3', slug: 'prebunking-inoculation', title: 'Prebunking and inoculation', description: 'Proactively building resilience against disinformation before it spreads.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'disinformation-manipulation' },
          { id: '13-3-4', slug: 'reporting-manipulation', title: 'Reporting manipulation to platforms and authorities', description: 'Escalation pathways for reporting coordinated manipulation.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'disinformation-manipulation' },
        ],
      },
      {
        id: '13-4', slug: 'reputation-management', title: 'Reputation management', description: 'Managing long-term reputation through sustained communications strategy.',
        topics: [
          { id: '13-4-1', slug: 'reputation-building', title: 'Reputation building strategy', description: 'Building and maintaining political reputation over time.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'reputation-management' },
          { id: '13-4-2', slug: 'narrative-correction', title: 'Narrative correction and recovery', description: 'Recovering from reputational damage and establishing a new narrative.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'reputation-management' },
          { id: '13-4-3', slug: 'third-party-validation', title: 'Third-party validation', description: 'Using credible third parties to reinforce and repair reputation.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'reputation-management' },
        ],
      },
      {
        id: '13-5', slug: 'legal-reputational-risk', title: 'Legal and reputational risk', description: 'Managing the intersection of legal exposure and reputational impact.',
        topics: [
          { id: '13-5-1', slug: 'defamation-risk', title: 'Defamation risk in campaign communications', description: 'Understanding and avoiding defamation exposure in political content.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'legal-reputational-risk' },
          { id: '13-5-2', slug: 'legal-comms-coordination', title: 'Legal and communications coordination', description: 'Managing the tension between legal caution and communications imperatives.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'legal-reputational-risk' },
          { id: '13-5-3', slug: 'slapp-response', title: 'SLAPP suits and strategic litigation', description: 'Identifying and responding to litigation designed to silence campaigns.', pillarSlug: 'crisis-issues-disinformation', branchSlug: 'legal-reputational-risk' },
        ],
      },
    ],
  },
  {
    id: '14',
    slug: 'international-multilingual-campaigning',
    title: 'International, Multilingual Campaigning',
    description: 'Cross-border campaigns, multilingual strategy, diaspora communities, multilateral advocacy, and geopolitical communication.',
    accentColour: '#534AB7',
    branches: [
      {
        id: '14-1', slug: 'cross-border-campaigns', title: 'Cross-border campaigns', description: 'Running campaigns that operate effectively across national boundaries.',
        topics: [
          { id: '14-1-1', slug: 'cross-border-coordination', title: 'Cross-border coordination', description: 'Managing campaign teams and strategies across multiple national contexts.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'cross-border-campaigns' },
          { id: '14-1-2', slug: 'eu-wide-campaigns', title: 'EU-wide campaign design', description: 'Building campaigns that function coherently across EU member states.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'cross-border-campaigns' },
          { id: '14-1-3', slug: 'cultural-adaptation', title: 'Cultural adaptation', description: 'Adapting campaign content and approaches to different national cultures.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'cross-border-campaigns' },
        ],
      },
      {
        id: '14-2', slug: 'multilingual-strategy', title: 'Multilingual strategy', description: 'Building campaigns that work across languages without losing impact.',
        topics: [
          { id: '14-2-1', slug: 'translation-localisation', title: 'Translation and localisation', description: 'Translating campaign content while preserving meaning, tone, and impact.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'multilingual-strategy' },
          { id: '14-2-2', slug: 'multilingual-content-production', title: 'Multilingual content production', description: 'Workflows and systems for producing content efficiently in multiple languages.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'multilingual-strategy' },
          { id: '14-2-3', slug: 'language-equity', title: 'Language equity and minority languages', description: 'Including minority and regional language communities in campaign outreach.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'multilingual-strategy' },
        ],
      },
      {
        id: '14-3', slug: 'diaspora-transnational-communities', title: 'Diaspora and transnational communities', description: 'Engaging diaspora and transnational communities in political campaigns.',
        topics: [
          { id: '14-3-1', slug: 'diaspora-outreach', title: 'Diaspora outreach strategy', description: 'Designing outreach that speaks to diaspora community identity and interests.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'diaspora-transnational-communities' },
          { id: '14-3-2', slug: 'transnational-voter-registration', title: 'Transnational voter registration', description: 'Registering and mobilising voters who live outside their country of origin.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'diaspora-transnational-communities' },
          { id: '14-3-3', slug: 'diaspora-media', title: 'Diaspora and minority media', description: 'Working with community-specific media to reach diaspora audiences.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'diaspora-transnational-communities' },
        ],
      },
      {
        id: '14-4', slug: 'multilateral-advocacy', title: 'Multilateral advocacy', description: 'Advocacy at international institutions and multilateral bodies.',
        topics: [
          { id: '14-4-1', slug: 'un-advocacy', title: 'UN system advocacy', description: 'Engaging the UN General Assembly, Security Council, and specialised agencies.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'multilateral-advocacy' },
          { id: '14-4-2', slug: 'coe-osce-advocacy', title: 'Council of Europe and OSCE', description: 'Engaging European human rights and democratic governance institutions.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'multilateral-advocacy' },
          { id: '14-4-3', slug: 'multilateral-coalition', title: 'Multilateral coalition building', description: 'Assembling international coalitions for advocacy at multilateral bodies.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'multilateral-advocacy' },
        ],
      },
      {
        id: '14-5', slug: 'geopolitical-foreign-policy-communication', title: 'Geopolitical and foreign policy communication', description: 'Communicating on foreign policy and geopolitical issues in a campaign context.',
        topics: [
          { id: '14-5-1', slug: 'foreign-policy-messaging', title: 'Foreign policy messaging', description: 'Communicating complex foreign policy positions to domestic and international audiences.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'geopolitical-foreign-policy-communication' },
          { id: '14-5-2', slug: 'geopolitical-risk-comms', title: 'Geopolitical risk communications', description: 'Managing campaign communications during international crises and conflicts.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'geopolitical-foreign-policy-communication' },
          { id: '14-5-3', slug: 'eu-foreign-policy', title: 'EU foreign policy and CFSP', description: 'Communicating on EU foreign policy, CFSP, and European defence.', pillarSlug: 'international-multilingual-campaigning', branchSlug: 'geopolitical-foreign-policy-communication' },
        ],
      },
    ],
  },
  {
    id: '15',
    slug: 'training-operations-management',
    title: 'Training, Operations and Campaign Management',
    description: 'Campaign operations, spokesperson and skills training, internal communications, and knowledge management.',
    accentColour: '#534AB7',
    isNew: true,
    branches: [
      {
        id: '15-1', slug: 'campaign-operations', title: 'Campaign operations', description: 'Managing the operational infrastructure that keeps a campaign running.',
        topics: [
          { id: '15-1-1', slug: 'campaign-management', title: 'Campaign management and structure', description: 'Organising the human and operational resources of a campaign.', pillarSlug: 'training-operations-management', branchSlug: 'campaign-operations' },
          { id: '15-1-2', slug: 'project-management-campaigns', title: 'Project management for campaigns', description: 'Applying project management to the fast-moving campaign environment.', pillarSlug: 'training-operations-management', branchSlug: 'campaign-operations' },
          { id: '15-1-3', slug: 'decision-making-processes', title: 'Decision-making processes', description: 'Building clear decision-making structures for campaign teams under pressure.', pillarSlug: 'training-operations-management', branchSlug: 'campaign-operations' },
          { id: '15-1-4', slug: 'campaign-hr', title: 'Campaign HR and staff management', description: 'Recruiting, managing, and developing campaign staff.', pillarSlug: 'training-operations-management', branchSlug: 'campaign-operations' },
        ],
      },
      {
        id: '15-2', slug: 'training', title: 'Training', description: 'Developing the skills of campaign spokespeople, staff, and volunteers.',
        topics: [
          { id: '15-2-1', slug: 'media-interview-preparation', title: 'Media interview preparation', description: 'Systematic preparation frameworks for broadcast, print, and digital interviews.', pillarSlug: 'training-operations-management', branchSlug: 'training' },
          { id: '15-2-2', slug: 'debate-preparation', title: 'Debate preparation', description: 'Preparing candidates and spokespeople for structured electoral and policy debates.', pillarSlug: 'training-operations-management', branchSlug: 'training' },
          { id: '15-2-3', slug: 'public-speaking-rhetoric', title: 'Public speaking and rhetoric', description: 'Developing the public speaking skills of campaign principals and spokespeople.', pillarSlug: 'training-operations-management', branchSlug: 'training' },
          { id: '15-2-4', slug: 'message-discipline-training', title: 'Message discipline training', description: 'Training spokespeople to maintain message discipline under questioning.', pillarSlug: 'training-operations-management', branchSlug: 'training' },
          { id: '15-2-5', slug: 'difficult-question-handling', title: 'Difficult question handling', description: 'Techniques for handling hostile, loaded, or unexpected questions from journalists.', pillarSlug: 'training-operations-management', branchSlug: 'training' },
          { id: '15-2-6', slug: 'spokesperson-preparation', title: 'Spokesperson preparation', description: 'End-to-end preparation programmes for new and experienced campaign spokespeople.', pillarSlug: 'training-operations-management', branchSlug: 'training' },
        ],
      },
      {
        id: '15-3', slug: 'internal-communications', title: 'Internal communications', description: 'Keeping campaign teams aligned and informed.',
        topics: [
          { id: '15-3-1', slug: 'internal-briefings', title: 'Internal briefings and morning notes', description: 'Producing daily intelligence and briefing documents for campaign staff.', pillarSlug: 'training-operations-management', branchSlug: 'internal-communications' },
          { id: '15-3-2', slug: 'team-alignment', title: 'Team alignment and message discipline', description: 'Keeping all campaign staff on the same message and narrative.', pillarSlug: 'training-operations-management', branchSlug: 'internal-communications' },
          { id: '15-3-3', slug: 'remote-distributed-teams', title: 'Remote and distributed team communications', description: 'Managing communications across geographically dispersed campaign teams.', pillarSlug: 'training-operations-management', branchSlug: 'internal-communications' },
        ],
      },
      {
        id: '15-4', slug: 'knowledge-management', title: 'Knowledge management', description: 'Capturing, organising, and applying campaign knowledge.',
        topics: [
          { id: '15-4-1', slug: 'institutional-memory', title: 'Institutional memory', description: 'Capturing campaign learning to inform future campaigns.', pillarSlug: 'training-operations-management', branchSlug: 'knowledge-management' },
          { id: '15-4-2', slug: 'after-action-reviews', title: 'After-action reviews', description: 'Structured reflection on campaign activities to extract learning.', pillarSlug: 'training-operations-management', branchSlug: 'knowledge-management' },
          { id: '15-4-3', slug: 'knowledge-sharing', title: 'Knowledge sharing systems', description: 'Building systems for sharing expertise across a campaign organisation.', pillarSlug: 'training-operations-management', branchSlug: 'knowledge-management' },
        ],
      },
    ],
  },
  {
    id: '16',
    slug: 'measurement-evaluation-learning',
    title: 'Measurement, Evaluation and Learning',
    description: 'Campaign KPIs, media, digital, and field measurement, public affairs measurement, and learning frameworks.',
    accentColour: '#3B6D11',
    isNew: true,
    branches: [
      {
        id: '16-1', slug: 'campaign-kpis', title: 'Campaign KPIs', description: 'Defining and tracking the right metrics for campaign success.',
        topics: [
          { id: '16-1-1', slug: 'kpi-framework', title: 'KPI frameworks for campaigns', description: 'Building meaningful metric frameworks that link activity to strategic outcomes.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'campaign-kpis' },
          { id: '16-1-2', slug: 'goal-setting', title: 'Goal-setting and benchmarking', description: 'Setting evidence-based targets and benchmarks for campaign performance.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'campaign-kpis' },
          { id: '16-1-3', slug: 'reporting-dashboards', title: 'Reporting and dashboards', description: 'Communicating campaign performance to leadership in real time.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'campaign-kpis' },
        ],
      },
      {
        id: '16-2', slug: 'media-measurement', title: 'Media measurement', description: 'Measuring coverage, tone, and impact across traditional media.',
        topics: [
          { id: '16-2-1', slug: 'coverage-analysis', title: 'Coverage analysis', description: 'Assessing the volume, reach, and tone of press and broadcast coverage.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'media-measurement' },
          { id: '16-2-2', slug: 'sentiment-scoring', title: 'Sentiment scoring', description: 'Measuring the positivity or negativity of campaign media coverage.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'media-measurement' },
          { id: '16-2-3', slug: 'share-of-voice', title: 'Share of voice', description: 'Measuring campaign media presence relative to opponents and the wider news agenda.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'media-measurement' },
        ],
      },
      {
        id: '16-3', slug: 'digital-measurement', title: 'Digital measurement', description: 'Analytics across social, email, web, and paid media.',
        topics: [
          { id: '16-3-1', slug: 'social-analytics', title: 'Social media analytics', description: 'Measuring reach, engagement, and conversion across social platforms.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'digital-measurement' },
          { id: '16-3-2', slug: 'email-analytics', title: 'Email and SMS analytics', description: 'Open rates, click rates, and downstream conversion measurement.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'digital-measurement' },
          { id: '16-3-3', slug: 'web-analytics', title: 'Web and landing page analytics', description: 'Measuring traffic, behaviour, and conversion on campaign websites.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'digital-measurement' },
          { id: '16-3-4', slug: 'paid-media-measurement', title: 'Paid media measurement', description: 'Measuring reach, frequency, and conversion across paid media channels.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'digital-measurement' },
        ],
      },
      {
        id: '16-4', slug: 'field-measurement', title: 'Field measurement', description: 'Measuring voter contact, volunteer activity, and field programme outcomes.',
        topics: [
          { id: '16-4-1', slug: 'canvass-data', title: 'Canvass data and contact quality', description: 'Measuring the quality and outcomes of voter contact programmes.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'field-measurement' },
          { id: '16-4-2', slug: 'volunteer-metrics', title: 'Volunteer and organising metrics', description: 'Tracking volunteer recruitment, retention, and activity levels.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'field-measurement' },
          { id: '16-4-3', slug: 'field-programme-evaluation', title: 'Field programme evaluation', description: 'Assessing whether field activities are changing voter behaviour.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'field-measurement' },
        ],
      },
      {
        id: '16-5', slug: 'public-affairs-measurement', title: 'Public affairs measurement', description: 'Measuring influence and policy outcomes in government affairs.',
        topics: [
          { id: '16-5-1', slug: 'influence-measurement', title: 'Measuring influence on policy', description: 'Frameworks for assessing public affairs impact beyond activity metrics.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'public-affairs-measurement' },
          { id: '16-5-2', slug: 'stakeholder-relationship-metrics', title: 'Stakeholder relationship metrics', description: 'Assessing the depth and quality of government and stakeholder relationships.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'public-affairs-measurement' },
          { id: '16-5-3', slug: 'pa-reporting', title: 'Public affairs reporting to boards', description: 'Communicating public affairs outcomes to boards and senior leadership.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'public-affairs-measurement' },
        ],
      },
      {
        id: '16-6', slug: 'learning-optimisation', title: 'Learning and optimisation', description: 'Using measurement to continuously improve campaign performance.',
        topics: [
          { id: '16-6-1', slug: 'test-learn-optimise', title: 'Test, learn, and optimise cycles', description: 'Building structured learning loops into campaign operations.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'learning-optimisation' },
          { id: '16-6-2', slug: 'mid-campaign-review', title: 'Mid-campaign review and adjustment', description: 'Structured processes for reviewing and adjusting strategy mid-campaign.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'learning-optimisation' },
          { id: '16-6-3', slug: 'post-campaign-evaluation', title: 'Post-campaign evaluation', description: 'Comprehensive evaluation frameworks for capturing learning after a campaign.', pillarSlug: 'measurement-evaluation-learning', branchSlug: 'learning-optimisation' },
        ],
      },
    ],
  },
];
