import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // macOS AppleDouble sidecar files (this repo lives on an exFAT/network
    // volume that generates them); already in .gitignore, ESLint's file
    // walk needs its own exclusion.
    "**/._*",
  ]),
]);

export default eslintConfig;
