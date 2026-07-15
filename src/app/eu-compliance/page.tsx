import type { Metadata } from 'next';
import Container from '@/components/Container';
import ComplianceNoteBox from '@/components/ComplianceNote';
import type { ComplianceNote } from '@/types/content';

export const metadata: Metadata = {
  title: 'eu compliance',
  description: 'A practitioner reference for EU political advertising regulation, GDPR, the EU AI Act, the Digital Services Act, national election law, and lobbying transparency rules.',
};

const SECTIONS: {
  id: string;
  title: string;
  body: string[];
  note?: ComplianceNote;
}[] = [
  {
    id: 'introduction',
    title: 'Introduction and scope',
    body: [
      'This reference page provides a practitioner overview of the EU legal framework governing political campaigning, advertising, data use, and lobbying. It covers EU-level instruments — regulations and directives that apply across all 27 member states — alongside a summary of national-level rules in key member states. The two layers always apply together: EU law sets a floor, and national law may add requirements on top of it.',
      'Where EU compliance topics are covered on this platform, both EU-level law and the applicable national Member State rules are relevant. Campaign teams should not assume that EU-wide compliance is sufficient — each member state in which you campaign may impose additional requirements that go beyond the EU baseline. This page provides a starting framework, not a jurisdiction-specific legal analysis.',
      'This page does not constitute legal advice. Campaign teams should obtain jurisdiction-specific advice from a qualified legal professional before taking any action based on the information here.',
    ],
  },
  {
    id: 'political-advertising',
    title: 'EU political advertising — Regulation (EU) 2024/900',
    body: [
      'Regulation (EU) 2024/900 on the transparency and targeting of political advertising entered into force in April 2024 and applies from October 2025. It is the most significant piece of EU legislation specifically governing political communications, and it applies to a wide range of organisations — not only political parties, but any entity paying for communications that are "liable to influence" voters or that relate to policy positions or political issues.',
      'The regulation requires that all political advertisements carry a transparency label identifying the sponsor, funder, and targeting parameters used. Publishers, including digital platforms, bear obligations alongside advertisers. The regulation prohibits targeting based on special category personal data under GDPR Article 9, including inferred political opinions.',
      'Member states have discretion to impose additional requirements in areas the regulation does not harmonise. Campaign teams operating in multiple member states should check for national implementing measures that may go beyond the EU baseline.',
    ],
    note: {
      accurateAsOf: 'May 2026',
      jurisdiction: 'EU-wide',
      regulations: ['Regulation (EU) 2024/900 on the transparency and targeting of political advertising'],
      reviewTrigger: 'Review when the European Commission publishes delegated acts or implementing regulations, when the EDPB publishes updated guidance on the interaction with GDPR, or when national implementing measures are adopted.',
    },
  },
  {
    id: 'gdpr-eprivacy',
    title: 'GDPR and ePrivacy',
    body: [
      'The General Data Protection Regulation (Regulation (EU) 2016/679) applies to all processing of personal data in EU member states. For political campaigns, the most significant provisions are those covering special category data under Article 9. Political opinions constitute special category data and attract stricter conditions for lawful processing. In most EU member states, the lawful basis for processing political opinion data is either explicit consent or a derogation specifically authorised by national law for political activities.',
      'The ePrivacy Directive (Directive 2002/58/EC) governs electronic communications, including email marketing, SMS campaigns, cookies, and tracking technologies. For political campaigns, the most relevant provisions concern direct marketing by electronic means — which requires prior consent from the recipient in most EU member states. National implementation varies significantly: some member states apply the opt-in requirement to all electronic marketing, while others maintain limited exceptions for existing relationships.',
      'The interaction between GDPR and Regulation (EU) 2024/900 is significant: the political advertising regulation\'s prohibition on targeting using inferred political opinion data reinforces GDPR Article 9\'s restrictions, but the two instruments operate through different enforcement mechanisms. GDPR violations are enforced by national data protection authorities; violations of the political advertising regulation may attract separate sanctions.',
    ],
    note: {
      accurateAsOf: 'May 2026',
      jurisdiction: 'EU-wide',
      regulations: [
        'Regulation (EU) 2016/679 (GDPR), Articles 4, 6, 7, 9',
        'Directive 2002/58/EC (ePrivacy Directive)',
      ],
      reviewTrigger: 'Review when the ePrivacy Regulation (currently in trilogue) is adopted, or when the EDPB publishes updated guidance on political data processing.',
    },
  },
  {
    id: 'ai-act',
    title: 'EU AI Act and synthetic media',
    body: [
      'The EU Artificial Intelligence Act (Regulation (EU) 2024/1689) entered into force in August 2024 and applies progressively, with the most relevant provisions for political campaigns applying from August 2026. The AI Act creates a risk-based framework for AI systems: higher-risk uses attract stricter obligations, including requirements for human oversight, transparency, and accuracy.',
      'Article 50 of the AI Act creates transparency obligations for AI systems that generate "synthetic content" — including text, images, audio, and video — that is "likely to be perceived as authentic." For political campaigns, this provision requires that AI-generated content be labelled as machine-generated in a machine-readable format. The obligation applies where the content is likely to be seen as authentic, which encompasses most professionally produced AI campaign content.',
      'The AI Act\'s interaction with political content is particularly significant because political opinion is a sensitive area of application under the regulation. AI systems used to target political content to individuals based on profiling may be subject to the high-risk requirements of Annex III, depending on their design and application.',
    ],
    note: {
      accurateAsOf: 'May 2026',
      jurisdiction: 'EU-wide',
      regulations: [
        'Regulation (EU) 2024/1689 (EU AI Act), Article 50',
        'EU AI Act, Annex III (high-risk AI systems)',
      ],
      reviewTrigger: 'Review when the European AI Office publishes guidance on Article 50 implementation, or when national market surveillance authorities issue enforcement guidance for political applications.',
    },
  },
  {
    id: 'dsa',
    title: 'Digital Services Act and platform governance',
    body: [
      'The Digital Services Act (Regulation (EU) 2022/2065) establishes obligations for online intermediaries and platforms operating in the EU, with particularly significant requirements for "very large online platforms" (VLOPs) — platforms with more than 45 million active monthly users in the EU. Most major social media platforms used for political advertising are designated as VLOPs.',
      'The DSA imposes obligations on VLOPs that directly affect political campaigning: ad transparency requirements that allow users to see all advertising a platform is serving, including political ads; ad repository obligations that give researchers and journalists access to political advertising data; recommender system transparency obligations; and restrictions on using sensitive personal data (including political opinions) for advertising targeting.',
      'For campaign teams, the DSA\'s most immediately relevant obligation is the ad repository requirement: major platforms must maintain publicly accessible repositories of all political advertisements, including targeting information. This obligation is independent of Regulation (EU) 2024/900, though the two instruments overlap significantly in their disclosure requirements for political advertising.',
    ],
    note: {
      accurateAsOf: 'May 2026',
      jurisdiction: 'EU-wide',
      regulations: [
        'Regulation (EU) 2022/2065 (Digital Services Act), Articles 26, 39',
        'European Commission Decision on VLOP designation (March 2024)',
      ],
      reviewTrigger: 'Review when the European Commission issues enforcement decisions against designated VLOPs, or when the DSA Delegated Regulation on ad repositories is published.',
    },
  },
  {
    id: 'national-election-law',
    title: 'National Member State election law',
    body: [
      'EU-level regulation does not harmonise national electoral law. Each EU member state maintains its own rules on election campaign finance, candidate and party registration, campaign silence periods, access to broadcast media, and the content of campaign materials. These national rules apply in addition to EU-level instruments — they are not replaced by EU law, and in many areas they are more restrictive.',
      'Key areas of national variation include: campaign spending limits (which vary significantly between member states, with some imposing strict per-candidate limits and others regulating at party level); campaign silence periods before polling day (ranging from 24 hours to several days, during which electoral campaigning is prohibited); rules on campaign materials (including requirements for sponsorship disclosure on printed materials that go beyond EU-level digital advertising requirements); and restrictions on foreign funding and foreign involvement in campaigns.',
      'Campaign teams operating in multiple EU member states must map and comply with the national rules of each state in which they are active, in addition to EU-level requirements. Where EU law and national law appear to conflict, EU law generally prevails — but this principle requires careful legal analysis, as the relationship between the EU political advertising regulation and national electoral law raises complex questions of competence that have not yet been fully resolved.',
    ],
  },
  {
    id: 'lobbying-transparency',
    title: 'Lobbying and transparency registers',
    body: [
      'The European Union operates a Transparency Register that covers organisations engaged in advocacy and lobbying activity at EU level. Registration is mandatory for organisations that seek to engage directly with EU institutions on policy matters, and the register requires disclosure of the organisation\'s identity, interests, financial information, and staff engaged in lobbying. The EU Transparency Register covers the European Parliament, the European Commission, and the Council of the EU.',
      'Separately from the EU Transparency Register, many EU member states operate national lobbying registers with varying scope and requirements. France, Ireland, Lithuania, and several other member states have statutory lobbying registers with mandatory registration and disclosure requirements. Germany, the Netherlands, and other member states are at various stages of implementing or strengthening national lobbying transparency rules. The requirements differ significantly between member states in terms of who must register, what must be disclosed, and the enforcement regime.',
      'Post-employment restrictions ("revolving door" rules) apply to former EU officials and many national-level officials. The EU Transparency Register operates in conjunction with a code of conduct for former commissioners and staff, which restricts lobbying activity for a period after leaving EU institutions. National rules vary, with some member states imposing cooling-off periods of up to two years for senior officials.',
    ],
    note: {
      accurateAsOf: 'May 2026',
      jurisdiction: 'EU-wide',
      regulations: [
        'Interinstitutional Agreement on the EU Transparency Register (2021)',
        'Various national lobbying register statutes (France: Loi Sapin II; Ireland: Regulation of Lobbying Act 2015)',
      ],
      reviewTrigger: 'Review when the EU Transparency Register Regulation is adopted (currently under negotiation), or when national lobbying register requirements are updated.',
    },
  },
  {
    id: 'international-comparison',
    title: 'International comparison — reference only',
    body: [
      'This section provides a comparative reference to political advertising and campaign regulation in non-EU jurisdictions. It is provided for comparative and educational purposes only. Non-EU frameworks are not the default compliance logic for campaigns operating in the EU — EU law and applicable national Member State law govern those campaigns. The information below is intended to help practitioners understand how EU rules compare with approaches elsewhere, not to provide compliance guidance for non-EU campaigns.',
      'United States: The Federal Election Commission (FEC) regulates federal campaign finance, while state-level rules vary significantly. US law does not regulate digital political advertising at the federal level to the same extent as the EU\'s political advertising regulation. The US approach to data privacy in political contexts is fragmented, with no federal equivalent to GDPR, though some states (notably California) have adopted comprehensive privacy legislation.',
      'United Kingdom: Post-Brexit, the UK operates under its own electoral law framework (PPERA) and the UK GDPR. The ICO has issued specific guidance on the use of personal data in political campaigns. The UK\'s approach to political advertising transparency has been subject to ongoing review, with proposals for a statutory digital imprint regime and greater disclosure of online campaign spending.',
      'Canada: The Canada Elections Act regulates federal campaign finance and advertising, with mandatory disclosure requirements for political advertising and restrictions on foreign funding. The Office of the Commissioner of Canada Elections enforces these rules. Canadian digital political advertising is subject to transparency requirements under the Elections Modernisation Act 2018.',
    ],
  },
];

export default function EuCompliancePage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Page header */}
          <div className="mb-10">
            <h1 className="display text-3xl text-ink mb-3">eu compliance reference</h1>
            <p className="text-ink/60 leading-relaxed max-w-2xl">
              A practitioner reference for the EU legal framework governing political campaigning.
              This page does not constitute legal advice — it is an educational resource for
              campaign practitioners. Obtain jurisdiction-specific legal advice before taking
              any compliance decisions.
            </p>
          </div>

          {/* Anchor navigation */}
          <nav aria-label="Page sections" className="rounded-[2px] border border-rule/20 bg-paper p-4 mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
              Jump to section
            </p>
            <ol className="space-y-1">
              {SECTIONS.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-ink underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
                  >
                    {i + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-16">
            {SECTIONS.map((section, i) => (
              <section key={section.id} id={section.id} aria-labelledby={`heading-${section.id}`}>
                <h2
                  id={`heading-${section.id}`}
                  className="display text-xl text-ink mb-4"
                >
                  {i + 1}. {section.title}
                </h2>
                {section.note && <ComplianceNoteBox note={section.note} />}
                {section.body.map((para, j) => (
                  <p key={j} className="text-ink/80 leading-relaxed mb-4">
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-rule/15">
            <p className="text-xs text-ink/45 leading-relaxed" role="note">
              This page provides practitioner education and editorial resources. It does not
              constitute legal advice. Campaign teams should obtain jurisdiction-specific advice
              from a qualified legal professional before publication, targeting, advertising,
              or deployment. EU law and applicable national Member State rules apply together
              — EU-level compliance alone is not sufficient.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
