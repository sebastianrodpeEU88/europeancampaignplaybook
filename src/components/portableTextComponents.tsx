import type { PortableTextComponents } from '@portabletext/react';

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-[#4A1F4D] leading-relaxed mb-4">{children}</p>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-[#2B0A2E] mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold text-[#2B0A2E] mt-5 mb-2">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[rgba(0,0,0,0.1)] pl-4 italic text-[#7A6380] my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-[#4A1F4D]">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-[#4A1F4D]">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="text-[#FF5B35] hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};
