import Link from 'next/link';
import type { BreadcrumbItem } from '@/types/content';

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-ink/60">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-ink/30">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-ink font-medium line-clamp-1">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-ink hover:underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
