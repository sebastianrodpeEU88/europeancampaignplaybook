import type { Reviewer } from '@/types/content';

function formatReviewDate(iso: string): string {
  const [year, month] = iso.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function ReviewerBadge({ reviewer }: { reviewer: Reviewer }) {
  return (
    <div className="flex items-start gap-3 rounded-[2px] border border-rule/20 border-l-4 border-l-ink bg-paper p-4 my-4">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-ink" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-0.5">
          Peer reviewed
        </p>
        <p className="text-sm font-medium text-ink">{reviewer.name}</p>
        <p className="text-xs text-ink/60">{reviewer.role}</p>
        <p className="text-xs text-ink/45 mt-1">
          Reviewed {formatReviewDate(reviewer.reviewedOn)}
        </p>
      </div>
    </div>
  );
}
