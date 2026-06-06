// lib/content/index.ts
// Re-exports Velite's generated output. .velite/ is generated at build time.
// Run `pnpm build` or `pnpm dev` to generate before importing in tests.
export { projects } from '../.velite'
