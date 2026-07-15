// Line icons from public/brand/framework-{diagnose,decide,move}.svg — used
// for the diagnose / decide / move sequence (BRAND-SYSTEM.md §2, §8).
type Step = 'diagnose' | 'decide' | 'move';

export default function FrameworkIcon({ step, className }: { step: Step; className?: string }) {
  const common = {
    viewBox: '0 0 128 128',
    className,
    role: 'img' as const,
    'aria-hidden': true as const,
  };

  if (step === 'diagnose') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="square" strokeLinejoin="miter">
        <circle cx="70" cy="55" r="30" />
        <path d="m48 77-28 28" />
      </svg>
    );
  }

  if (step === 'decide') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={7} strokeLinejoin="miter">
        <circle cx="64" cy="64" r="45" />
        <path fill="currentColor" stroke="none" fillRule="evenodd" d="m91 37-17 37-37 17 17-37Zm-28 20-7 15 15-7 7-15Z" />
      </svg>
    );
  }

  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="square" strokeLinejoin="miter">
      <path d="M25 103 103 25M57 25h46v46" />
    </svg>
  );
}
