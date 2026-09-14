'use client';

import { useState } from 'react';

// Copies a prompt block's text. If the browser blocks the clipboard, the
// prompt stays on screen as selectable text, so nothing is lost.
export default function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the text remains selectable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="flex-shrink-0 rounded-[2px] border border-[#EDE7DA]/40 px-2.5 py-1 text-xs font-semibold text-[#EDE7DA] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
    >
      {copied ? 'Copied' : 'Copy prompt'}
    </button>
  );
}
