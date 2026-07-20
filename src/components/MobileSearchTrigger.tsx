'use client';

// A plain client-component button so Header (an async Server Component)
// can offer a search entry point on touch devices, where ⌘K isn't
// reachable. Dispatches the same event CommandPalette listens for.
export default function MobileSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
      className="flex items-center gap-2 rounded-[2px] px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
    >
      <svg className="h-4 w-4 text-[#EDE7DA]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      Search
    </button>
  );
}
