'use client';

import { useState } from 'react';
import { saveProfile } from '@/lib/profile-actions';
import {
  CAREER_STAGES,
  ORGANISATION_TYPES,
  SKILLS,
  SELF_EMPLOYED,
  type ProfileRow,
} from '@/lib/profile';

const labelCls = 'block text-sm font-medium text-ink mb-1';
const inputCls =
  'w-full rounded-[2px] border border-rule/30 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink';

export default function ProfileForm({
  initial,
  defaultEmail,
  next,
  showError,
}: {
  initial: ProfileRow | null;
  defaultEmail: string;
  next: string;
  showError: boolean;
}) {
  const [orgType, setOrgType] = useState(initial?.organisation_type ?? '');
  const selectedSkills = new Set(initial?.skills ?? []);

  return (
    <form action={saveProfile} className="space-y-6">
      <input type="hidden" name="next" value={next} />

      {showError && (
        <p className="rounded-[2px] border border-rule/30 bg-ink/[0.03] px-3 py-2 text-sm text-ink/70">
          Please fill in your first name, last name, and email.
        </p>
      )}

      {/* Required */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelCls}>First name *</label>
          <input id="first_name" name="first_name" required defaultValue={initial?.first_name ?? ''} className={inputCls} />
        </div>
        <div>
          <label htmlFor="last_name" className={labelCls}>Last name *</label>
          <input id="last_name" name="last_name" required defaultValue={initial?.last_name ?? ''} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className={labelCls}>Email *</label>
        <input id="email" name="email" type="email" required defaultValue={initial?.email ?? defaultEmail} className={inputCls} />
      </div>

      <div className="pt-2 border-t border-rule/15" />
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Optional — helps us tailor things</p>

      <div>
        <label htmlFor="phone" className={labelCls}>Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={initial?.phone ?? ''} className={inputCls} />
      </div>

      <div>
        <label htmlFor="career_stage" className={labelCls}>Career stage</label>
        <select id="career_stage" name="career_stage" defaultValue={initial?.career_stage ?? ''} className={inputCls}>
          <option value="">Select…</option>
          {CAREER_STAGES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="organisation_type" className={labelCls}>Type of organisation</label>
        <select
          id="organisation_type"
          name="organisation_type"
          value={orgType}
          onChange={(e) => setOrgType(e.target.value)}
          className={inputCls}
        >
          <option value="">Select…</option>
          {ORGANISATION_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {orgType !== SELF_EMPLOYED && (
        <div>
          <label htmlFor="current_employer" className={labelCls}>Current employer</label>
          <input id="current_employer" name="current_employer" defaultValue={initial?.current_employer ?? ''} className={inputCls} />
        </div>
      )}

      <div>
        <span className={labelCls}>Skills you want to grow in the next year</span>
        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {SKILLS.map((o) => (
            <label key={o.value} className="flex items-start gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                name="skills"
                value={o.value}
                defaultChecked={selectedSkills.has(o.value)}
                className="mt-0.5 h-4 w-4 rounded-[2px] border-rule/40 text-navy focus-visible:ring-ink"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-rule/15" />
      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input
          type="checkbox"
          name="email_opt_in"
          defaultChecked={initial?.email_opt_in ?? false}
          className="mt-0.5 h-4 w-4 rounded-[2px] border-rule/40 text-navy focus-visible:ring-ink"
        />
        <span>Keep me posted — subscribe me to European Campaign Playbook email communications (you can unsubscribe anytime).</span>
      </label>

      <button
        type="submit"
        className="w-full rounded-[2px] bg-navy px-4 py-3 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      >
        Save and continue
      </button>
    </form>
  );
}
