import Link from 'next/link';
import type { BreadcrumbItem } from '@/types/content';

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-[#6B7280]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-[#9CA3AF]">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-[#1C1C1E] font-medium line-clamp-1">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#1C1C1E] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] rounded"
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
