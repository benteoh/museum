// next.config.ts
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import type { NextConfig } from 'next'

const withVanillaExtract = createVanillaExtractPlugin()

class VeliteWebpackPlugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(compiler: any) {
    let built = false
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (built) return
      built = true
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
