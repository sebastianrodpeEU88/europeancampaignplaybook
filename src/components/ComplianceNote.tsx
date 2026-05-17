import type { ComplianceNote } from '@/types/content';

export default function ComplianceNoteBox({ note }: { note: ComplianceNote }) {
  return (
    <aside
      aria-label="Compliance note"
      className="rounded-xl border-l-4 border-[#EF9F27] bg-[#FFFBF0] p-5 my-6"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 text-[#EF9F27] flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#92400E] uppercase tracking-wide mb-2">
            Compliance note — accurate as of {note.accurateAsOf}
          </p>
          <p className="text-sm font-medium text-[#1C1C1E] mb-1">
            Jurisdiction: {note.jurisdiction}
          </p>
          {note.regulations.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-[#6B7280] mb-1">Applicable regulations:</p>
              <ul className="space-y-0.5">
                {note.regulations.map((reg) => (
                  <li key={reg} className="text-xs text-[#374151]">
                    {reg}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {note.reviewTrigger && (
            <p className="text-xs text-[#6B7280] border-t border-[rgba(0,0,0,0.08)] pt-2 mt-2">
              <span className="font-medium">Review trigger: </span>
              {note.reviewTrigger}
            </p>
          )}
          <p className="text-xs text-[#9CA3AF] mt-2 italic">
            This note does not constitute legal advice. Campaign teams should obtain
            jurisdiction-specific advice from a qualified legal professional.
          </p>
        </div>
      </div>
    </aside>
  );
}
