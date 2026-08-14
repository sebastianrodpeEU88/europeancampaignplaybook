import type { Author } from '@/types/content';

export default function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="rounded-[2px] border border-rule/20 bg-paper p-6 my-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center bg-ink text-[#EDE7DA] font-semibold text-sm select-none"
          aria-hidden="true"
        >
          {author.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink">{author.name}</p>
          <p className="text-sm text-ink/60">{author.role}</p>
          {(author.organisation || author.country) && (
            <p className="text-xs text-ink/45">
              {[author.organisation, author.country].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink/80 leading-relaxed">{author.bio}</p>

      {/* Expertise chips */}
      {author.expertise.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {author.expertise.map((area) => (
            <span
              key={area}
              className="rounded-[2px] bg-ink/5 px-2.5 py-0.5 text-xs text-ink/70"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      {/* Disclosure */}
      <div className="mt-4 pt-4 border-t border-rule/15">
        <p className="text-xs font-medium text-ink/45 uppercase tracking-wide mb-1">
          Disclosure
        </p>
        <p className="text-xs text-ink/45 leading-relaxed">{author.disclosure}</p>
      </div>

      {/* Links */}
      {author.links.length > 0 && (
        <div className="mt-3 flex gap-3">
          {author.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="text-xs text-ink underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
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
