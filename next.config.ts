// next.config.ts
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import type { NextConfig } from 'next'

const withVanillaExtract = createVanillaExtractPlugin()

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
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

export default withVanillaExtract(nextConfig)
