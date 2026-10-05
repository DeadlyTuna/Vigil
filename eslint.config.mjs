import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-three-fiber code mutates materials, lights and meshes inside useFrame on purpose;
    // the React Compiler "immutability" rule is written for ordinary components and flags every one of those.
    files: ['components/bench/**/*.{ts,tsx}'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "_archive/**",
  ]),
]);

export default eslintConfig;
