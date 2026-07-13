import type { Author } from '@/types/content';

export default function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-6 my-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm select-none"
          style={{ backgroundColor: author.avatarColour }}
          aria-hidden="true"
        >
          {author.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#2B0A2E]">{author.name}</p>
          <p className="text-sm text-[#7A6380]">{author.role}</p>
          <p className="text-xs text-[#A896AC]">
            {author.organisation} · {author.country}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#4A1F4D] leading-relaxed">{author.bio}</p>

      {/* Expertise chips */}
      {author.expertise.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {author.expertise.map((area) => (
            <span
              key={area}
              className="rounded-full bg-[rgba(0,0,0,0.05)] px-2.5 py-0.5 text-xs text-[#7A6380]"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      {/* Disclosure */}
      <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
        <p className="text-xs font-medium text-[#A896AC] uppercase tracking-wide mb-1">
          Disclosure
        </p>
        <p className="text-xs text-[#A896AC] leading-relaxed">{author.disclosure}</p>
      </div>

      {/* Links */}
      {author.links.length > 0 && (
        <div className="mt-3 flex gap-3">
          {author.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="text-xs text-[#FF5B35] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
              rel="noopener noreferrer"
            >
              {link.label} →
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
