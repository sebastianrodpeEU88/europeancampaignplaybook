// Permanent redirects from the old site's URLs (2020-2025 platform) to the
// closest page on the current site. Those pages still carry inbound links and
// search history; a redirect passes that on where a 404 throws it away.
//
// Loaded by next.config.ts. Sources match case-insensitively, and the first
// matching rule wins, so specific entries sit above the pattern fallbacks at
// the bottom. Never add a source that is also a live route: redirects run
// before pages, so it would hide the page.
//
// Inventory: Wayback Machine archive of campaignplaybook.eu, September 2026.

const STRATEGY = '/taxonomy/strategy';
const DIGITAL_CHANNELS = '/taxonomy/digital-channels-content';
const FUNDRAISING = '/taxonomy/fundraising-finance-commercial';

const mapped: [string, string[]][] = [
  // Election nights and campaign-insider talks on national campaigns
  [STRATEGY, [
    '/201206_romania_election',
    '/210124_europeanelectionnight_portuguese_presidential_election',
    '/210317_europeanelectionnight_dutch_general_election',
    '/210328_europeanelectionnight_bulgarian_parliamentary_election',
    '/210506_europeanelectionnight_uk_local_election',
    '/210913_europeanelectionnight_norway',
    '/210926_europeanelectionnight_gemrna_federal_election',
    '/220403_europeanelectionnight_hungary',
    '/220404_thedayafter_hungary',
    '/240611_afterelection',
    '/250523_romania',
    '/210707_eucampaigninsider_modern_political_campaigns_with_michael_cohen',
    '/210916_eucampaigninsider_campaign_against_authoritarians_hungary',
    '/211014_meettheinsider_the_campaign_in_poland',
    '/211118_eucampaigninsider_poland',
    '/us_election_night_2020',
    '/a_victory_for_europe_in_france',
    '/tags/030522_a_victory_for_europe_in_france',
  ]],
  ['/taxonomy/policy-government-affairs', ['/201204_campaigning_to_governing', '/tags/government']],
  ['/topics/public-opinion-research', [
    '/2011_uselection_polls',
    '/240531_lunch_opinion',
    '/240607_lunch_opinium',
    '/240705_lunch_polls',
    '/240906_lunch_polls',
  ]],
  ['/trends', [
    '/2025_trends',
    '/210108_digitalfridaylunch_european_campaigning_2021',
    '/240614_global_trends',
    '/250123_policycommstrends',
    '/250123_policycommstrends2',
  ]],
  ['/trends/2026-3-the-eu-bubble-continues-to-run-on-small-circles', [
    '/201211_how_to_influence_the_eu_bubble',
    '/210326_fridaydigitallunch_bursttheeububble',
  ]],
  ['/trends/2026-6-linkedin-remains-the-centre-of-gravity-for-the-eu-bubble', [
    '/240322_linkedin',
    '/240913_lunch_topvoice',
  ]],
  // Networking drinks, breakfasts and the mentorship programme
  ['/community', [
    '/220531_spring_drinks_bursting_the_eu_bubble_in_2024',
    '/220713_summer_drinks_mentorship',
    '/221207_christmas_drinks',
    '/230427_springdrinks',
    '/240206_breakfast',
    '/250625_afterwork',
    '/first_campaignpro_mentorship_program_event',
    '/get_involved',
  ]],
  ['/topics/press-monitoring', ['/20240119_lunch_and_learn']],
  ['/topics/media-relations', [
    '/211029_network_public_relations',
    '/240126_best_of_working_with_the_media',
    '/blog_the_playbook_on_public_relations',
    '/playbook_on_building_strong_media_relations_in_the_eu_bubble',
  ]],
  ['/topics/campaign-narrative', ['/20231120_lunchandlearn']],
  ['/articles/how-to-tell-better-stories-about-europe-without-slipping-into-spin', [
    '/210122_fridaydigitallunch_how_to_re_brand_europe',
  ]],
  ['/taxonomy/research-data-intelligence', ['/210115_fridaydigitallunch_the_future_of_data_driven_campaigns_in_europe']],
  ['/topics/relational-organising', ['/210205_fridaydigitallunch_digital_organising_in_europe']],
  ['/articles/community-building-in-europe', [
    '/211125_campaignworkshop_building_movements',
    '/221011_building_movements',
    '/221201_community_building_eu_projects',
    '/blog_building_movements_in_a_digital_age',
  ]],
  ['/topics/platform-strategy', [
    '/210219_fridaydigitallunch_networking_on_clubhouse',
    '/240223_lunch_twitch',
    '/240404_tiktok',
    '/blog_twitch_three_reasons_to_join',
    '/posts/lets-write-the-playbook-on-communicating-on-threads-together-how-do-you-intend-to-use-it',
  ]],
  ['/topics/campaign-tech-stack', ['/210226_fridaydigitallunch_advocacytech_in_europe']],
  ['/topics/audience-segmentation', ['/210312_fridaydigitallunch_european_audience']],
  ['/topics/opponent-monitoring', ['/210528_fridaydigitallunch_know_your_adversary_how_the_far_right_profits_from_fear']],
  ['/topics/eu-institutions', ['/210604_fridaydigitallunch_a_closer_look_conference', '/future_of_europe']],
  ['/articles/eu-political-advertising-what-campaign-teams-need-to-know', [
    '/210611_fridaydigitallunch_political_advertising_playbook',
  ]],
  ['/topics/social-listening', ['/210722_warroom_escucha_social_esp']],
  ['/topics/organic-social', ['/211007_networkandlearn_roberto_tomasi']],
  [FUNDRAISING, [
    '/211028_campaignworkshop_digital_fundraising',
    '/220126_eucampaigninsider_digitalfundraising',
    '/blog_playbook_digital_fundraising',
  ]],
  ['/topics/programmatic-display', [
    '/211112_eucampaigninsider_programmatic_ads',
    '/blog_the_playbook_on_programmatic_advertising',
  ]],
  ['/topics/geopolitical-risk-comms', ['/220310_network_learn_communicating_war']],
  [DIGITAL_CHANNELS, [
    '/220322_campaigninsider_podcasting_step_1',
    '/220331_eucampaigninsider_podcast_step_2',
    '/220408_eucampaigninsider_podcast_step3',
    '/2203_playbook_on_podcasting_1_original_concept',
    '/2402315_lunch_podcast',
    '/250207_lunch_podcasting',
    '/tags/social_media',
  ]],
  ['/topics/cross-border-ep-campaigns', [
    '/220525_a_playbook_for_the_2024_european_elections',
    '/tags/a_playbook_for_the_2024_european_elections_blog',
    '/how_engage_europe_youth_ahead_of_2024_european_elections',
  ]],
  ['/topics/targeting-strategy', ['/220927_targeting_beyond_social_media_ads']],
  ['/topics/video-production', ['/250626_lunch_video']],
  ['/topics/creative-strategy', ['/blog_3_lessons_on_running_creative_campaigns', '/tags/creativity']],
  ['/topics/social-ads', ['/blog_quick_guide_on_social_media_advertising']],
  ['/topics/influencer-strategy', ['/followeu']],
  ['/articles/campaign-planning', ['/planning_to_launch']],
  ['/authors/brett-kobie', ['/240426_brett_kobie']],
  ['/ai-insights', ['/ai_for_advocacy_campaigns_the_playbook']],
  ['/playbook', ['/playbook_step1_structure']],
  ['/articles', [
    '/220405_paulnolan_making_your_voice_heard_in_politics',
    '/blog',
    '/search',
    '/charity_starts_at_home',
    '/does_your_campaign',
    '/blog_the_cause_needs_to_come_first',
  ]],
  ['/events', [
    '/lunch_and_learn_with_paolo_ganino',
    '/lunch_learn_ukranian_resistance',
    '/old_240503_lunchandlearn',
    '/old_ai_for_advocacy',
    '/faq',
    '/questions',
  ]],
  // Old site pages
  ['/contributors', ['/about', '/who_we_are', '/who_we_are2']],
  ['/consultancy', [
    '/contact',
    '/contact_us',
    '/work_with_us',
    '/2203_partner_of_the_month_bullemedia',
    '/blog_2111_partner_cambuidlr',
    '/analytical_data_featured',
    '/nationbuilder_certified_featured',
    '/nationbuilder_implementation_support',
    '/technology_solutions',
    '/technology_strategy',
    '/technology_strategy_featured',
  ]],
  ['/subscribe', ['/join', '/join_old', '/donate']],
  ['/privacy', ['/privacy_policy', '/privacy_policy_old', '/legal_notice']],
  ['/cookies', ['/cookie_declaration', '/cookies_policy']],
  ['/', ['/hero_text', '/tags/campaigners']],
];

// Anything from the old site not listed above, by URL shape.
const fallbacks: [string, string][] = [
  ['/:slug(\\d{4,6}_bootcamp.*)', '/digital-bootcamp'],
  ['/:slug(\\d{4}_careers_.*)', '/contributors'],
  // Dated event pages: lunch & learns, masterclasses, AI sessions, info sessions
  ['/:slug(\\d{4,8}_.*)', '/events'],
  ['/:slug(blog_.*)', '/articles'],
  ['/tags/:tag(.*_rsvp)', '/events'],
  ['/tags/:tag*', '/articles'],
  ['/posts/:id*', '/articles'],
  ['/collections/:id*', '/articles'],
  ['/members/:id*', '/community'],
];

export const legacyRedirects = [
  ...mapped.flatMap(([destination, sources]) => sources.map((source) => [source, destination] as const)),
  ...fallbacks,
].map(([source, destination]) => ({ source, destination, permanent: true as const }));
