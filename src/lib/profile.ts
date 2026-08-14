// Options for the onboarding profile form. Values are stored in the DB; labels
// are shown in the UI.

export const CAREER_STAGES = [
  { value: 'student', label: 'Student / recent graduate' },
  { value: 'early_career', label: 'Early-career professional (up to 3 years)' },
  { value: 'mid_career', label: 'Mid-career professional (3–7 years)' },
  { value: 'senior', label: 'Senior professional (7+ years)' },
  { value: 'leadership', label: 'Leadership / executive' },
  { value: 'other', label: 'Other' },
] as const;

export const ORGANISATION_TYPES = [
  { value: 'eu_institution', label: 'EU institution (Commission, Parliament, agencies)' },
  { value: 'national_institution', label: 'National, regional, local institution' },
  { value: 'private_sector', label: 'Private sector (company, consultancy, industry group)' },
  { value: 'academia', label: 'Academia / research' },
  { value: 'ngo', label: 'NGO / civil society' },
  { value: 'media', label: 'Media / communications / journalism' },
  { value: 'international_org', label: 'International organisation (UN, OECD, WTO, etc.)' },
  { value: 'think_tank', label: 'Think tank / policy institute' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'other', label: 'Other' },
] as const;

export const SELF_EMPLOYED = 'self_employed';

export const SKILLS = [
  { value: 'public_speaking', label: 'Public speaking and presentation' },
  { value: 'policy_drafting', label: 'Policy drafting and writing' },
  { value: 'fundraising', label: 'Fundraising and resource mobilisation' },
  { value: 'negotiation', label: 'Negotiation and mediation' },
  { value: 'social_media', label: 'Social media and digital campaigning' },
  { value: 'strategic_comms', label: 'Strategic communications' },
  { value: 'project_management', label: 'Project management for EU projects' },
  { value: 'ai_public_affairs', label: 'Artificial intelligence for public affairs' },
  { value: 'networking', label: 'Networking and stakeholder engagement' },
  { value: 'policy_comms', label: 'Policy communications' },
  { value: 'other', label: 'Other' },
] as const;

export type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  career_stage: string | null;
  organisation_type: string | null;
  current_employer: string | null;
  skills: string[] | null;
  email_opt_in: boolean | null;
};

export function isProfileComplete(p: Pick<ProfileRow, 'first_name' | 'last_name' | 'email'> | null): boolean {
  return !!(p && p.first_name && p.last_name && p.email);
}
