// next.config.ts
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import type { NextConfig } from 'next'

const withVanillaExtract = createVanillaExtractPlugin()

// Project page served at https://benteoh.github.io/museum/ — assets must be
// prefixed. Only applied for production builds so `next dev` stays at root.
const basePath = process.env.NODE_ENV === 'production' ? '/museum' : ''

// Module-scoped so it's shared across Next.js's client and server webpack compilers
let veliteBuilt = false

class VeliteWebpackPlugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (veliteBuilt) return
      veliteBuilt = true
      const { build } = await import('velite')
      await build({ watch: compiler.options.mode === 'development' })
    })
  }
}

const nextConfig: NextConfig = {
  // Static export to plain HTML/CSS/JS for GitHub Pages (no Node server).
  output: 'export',
  basePath,
  // Resolve /route -> /route/index.html so hard refreshes don't 404 on GH Pages.
  trailingSlash: true,
  // next/image's default optimizer needs a server; disable it for export.
  images: { unoptimized: true },
  // Exposed to client code so hand-written asset URLs can be prefixed (see lib/asset.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

export default withVanillaExtract(nextConfig)
