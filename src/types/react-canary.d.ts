// Activates @types/react's canary typings project-wide — needed for the
// <ViewTransition> component (runtime comes from Next's vendored React,
// which the App Router aliases `react` to; the stable react package on
// disk doesn't export it).
/// <reference types="react/canary" />
