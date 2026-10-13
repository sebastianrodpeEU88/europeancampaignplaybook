// Feedback left after the workshops. Most are public LinkedIn recommendations
// and carry the person's name. In-house client feedback is published only with
// the client's agreement and anonymised to an organisation descriptor, which
// goes in `name` because that is the line the card shows in bold. Shared by the
// /ai-insights feedback wall and the /events page. To add another: drop a new
// entry at the top (newest first).
export type Testimonial = { quote: string; name: string; role: string; date: string };

export const TESTIMONIALS: Testimonial[] = [
  {
    // In-house training for a client who asked not to be named.
    quote:
      'I can say that we enjoyed the training a lot and the learning was impressive. I think Sebastian managed to get our levels and the topics of interest exactly right.',
    name: 'European financial institution',
    role: 'Luxembourg, in-house team training',
    date: 'Oct 2026',
  },
  {
    quote:
      'It explains the fundamentals clearly and makes AI feel approachable rather than distant or complicated, which I think gives people the confidence to get started. It has given me a useful foundation that I can also apply when helping my own team learn about AI.',
    name: 'Maria Coronada Rodriguez Medina',
    role: 'GIRP, European Healthcare Distribution Association',
    date: 'Oct 2026',
  },
  {
    quote:
      'I attended the workshop led by Sebastián, which I would for sure recommend. I found his systemic approach to storytelling and narrative very useful for my PA work, and I will certainly use the prompts he shared.',
    name: 'Martin Orešić',
    role: 'Account Director, Hanbury Strategy',
    date: 'Sep 2025',
  },
  {
    quote:
      'What I really appreciated was his practical and engaging approach: combining solid communication theory with real campaign examples, the use of AI as a tool for creativity and strategy, and clear reasoning behind why certain narratives work (or don’t). Very useful and insightful for communication experts in Brussels!',
    name: 'Roberta Fadda',
    role: 'Communication Specialist & Multimedia Producer',
    date: 'Sep 2025',
  },
  {
    quote:
      'One of the most hands-on sessions I’ve joined in a long time. From building your first campaign to diving deep into agents and automation, the day was packed with practical insights. I especially loved the part on creating your own AI agent for policy, comms, or strategy.',
    name: 'Philippe Bossin',
    role: 'Digital Organizer & Strategic Communications',
    date: 'Jul 2025',
  },
  {
    quote:
      'I would highly recommend Sebastián’s training on AI for Advocacy. Very comprehensive, with clear presentations on how AI works, plus tips and tricks on prompts and using ChatGPT for communications campaigns. Thank you for helping comms professionals stay updated!',
    name: 'Barbara Vanotti',
    role: 'Communications Manager, TEPSA',
    date: 'Jun 2024',
  },
  {
    quote:
      'I followed a course on AI for advocacy by Sebastián and I can only comment positively. His sessions were clear, engaging, practical and insightful. The language was adapted and I learned a lot, so thank you for that!',
    name: 'Catarina Moleiro',
    role: 'Policy & Communications Officer, Coimbra Group',
    date: 'May 2024',
  },
  {
    quote:
      'Lo recomiendo sin duda: ofrece herramientas que agilizan y aportan un gran valor añadido al trabajo cotidiano. El contenido es muy dinámico. Mi visión sobre la IA cambió drásticamente. Un acierto cursarlo.',
    name: 'Candela González-Alemán Martínez',
    role: 'Public Affairs, Agrifood & Sustainability',
    date: 'Apr 2024',
  },
  {
    quote:
      'A very comprehensive training on AI tools for public affairs, for those starting to get in contact with this technology. Totally recommended!',
    name: 'Adrian Blazquez',
    role: 'Consultant, Schuman Associates',
    date: 'Apr 2024',
  },
  {
    quote:
      'Very interesting training on Artificial Intelligence, and well managed. Highly recommendable!',
    name: 'César González de Miguel',
    role: 'Director, EFFAB',
    date: 'Apr 2024',
  },
];
