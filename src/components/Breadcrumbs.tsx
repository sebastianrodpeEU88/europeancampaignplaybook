import Link from 'next/link';
import type { BreadcrumbItem } from '@/types/content';

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm font-mono text-[#7A6380]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-[#A896AC]">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-[#2B0A2E] font-medium line-clamp-1">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#2B0A2E] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
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
