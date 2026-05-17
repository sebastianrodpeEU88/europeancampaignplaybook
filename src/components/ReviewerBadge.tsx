import type { Reviewer } from '@/types/content';

function formatReviewDate(iso: string): string {
  const [year, month] = iso.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function ReviewerBadge({ reviewer }: { reviewer: Reviewer }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4 my-4">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-[#3B6D11]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-[#3B6D11] uppercase tracking-wide mb-0.5">
          Peer reviewed
        </p>
        <p className="text-sm font-medium text-[#1C1C1E]">{reviewer.name}</p>
        <p className="text-xs text-[#6B7280]">{reviewer.role}</p>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Reviewed {formatReviewDate(reviewer.reviewedOn)}
        </p>
      </div>
    </div>
  );
}
