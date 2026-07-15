// Inline (not <img src>) so `currentColor` picks up an ancestor's text
// colour — this is how the six locked series colours and the paper-reverse
// treatment are achieved with one set of paths, matching
// public/brand/ecp-move-mark.svg exactly (BRAND-SYSTEM.md §4: full mark /
// direction arrow / pixel field are the only three legitimate component
// levels). Below 48px, always use `variant="arrow"` — never shrink the
// full mark (BRAND-SYSTEM.md §4).
type MoveMarkVariant = 'full' | 'arrow' | 'field';

export default function MoveMark({
  variant = 'full',
  className,
  title,
  animate = false,
}: {
  variant?: MoveMarkVariant;
  className?: string;
  title?: string;
  // Entrance motion (field → pulses → arrow) for the full mark's first
  // paint, e.g. the homepage hero. CSS-only so it degrades to the
  // completed mark with no animation under prefers-reduced-motion
  // (BRAND-SYSTEM.md §11) — see .move-mark-animate in globals.css.
  animate?: boolean;
}) {
  const a11yProps = title
    ? { role: 'img' as const, 'aria-label': title }
    : { role: 'img' as const, 'aria-hidden': true as const };

  if (variant === 'arrow') {
    return (
      <svg viewBox="0 0 96 96" fill="currentColor" className={className} {...a11yProps}>
        <path d="M10 66 28 84 62 50v25h24V10H21v24h25z" />
      </svg>
    );
  }

  if (variant === 'field') {
    return (
      <svg viewBox="0 0 160 160" fill="currentColor" className={className} {...a11yProps}>
        <rect x="8" y="136" width="12" height="12" />
        <rect x="42" y="149" width="11" height="11" />
        <rect x="77" y="132" width="11" height="11" />
        <rect x="27" y="107" width="11" height="11" />
        <rect x="61" y="117" width="10" height="10" />
        <rect x="96" y="100" width="10" height="10" />
        <rect x="45" y="80" width="10" height="10" />
        <rect x="78" y="90" width="10" height="10" />
        <rect x="109" y="71" width="10" height="10" />
        <rect x="64" y="54" width="9" height="9" />
        <rect x="93" y="62" width="9" height="9" />
        <rect x="123" y="44" width="9" height="9" />
        <rect x="84" y="30" width="9" height="9" />
        <rect x="112" y="36" width="8" height="8" />
        <rect x="136" y="20" width="8" height="8" />
        <rect x="103" y="8" width="8" height="8" />
        <rect x="127" y="12" width="7" height="7" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 256 256"
      fill="currentColor"
      className={animate ? `move-mark-animate ${className ?? ''}` : className}
      {...a11yProps}
    >
      <g id="pixel-field">
        <rect x="24" y="222" width="12" height="12" />
        <rect x="58" y="235" width="11" height="11" />
        <rect x="93" y="218" width="11" height="11" />
        <rect x="43" y="193" width="11" height="11" />
        <rect x="77" y="203" width="10" height="10" />
        <rect x="112" y="186" width="10" height="10" />
        <rect x="61" y="166" width="10" height="10" />
        <rect x="94" y="176" width="10" height="10" />
        <rect x="125" y="157" width="10" height="10" />
        <rect x="80" y="140" width="9" height="9" />
        <rect x="109" y="148" width="9" height="9" />
        <rect x="139" y="130" width="9" height="9" />
        <rect x="100" y="116" width="9" height="9" />
        <rect x="128" y="122" width="8" height="8" />
        <rect x="152" y="106" width="8" height="8" />
        <rect x="119" y="94" width="8" height="8" />
        <rect x="143" y="98" width="7" height="7" />
      </g>
      <g id="momentum-pulses">
        <rect x="110" y="128" width="10" height="22" transform="rotate(-45 115 139)" />
        <rect x="129" y="109" width="11" height="23" transform="rotate(-45 134.5 120.5)" />
        <rect x="148" y="89" width="12" height="25" transform="rotate(-45 154 101.5)" />
      </g>
      <path id="direction-arrow" d="M166 67 184 85 214 55v27h24V14h-68v24h28z" />
    </svg>
  );
}
