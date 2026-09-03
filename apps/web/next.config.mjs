import createMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@workspace/ui", "@workspace/compositions"],
  experimental: {
    // Persist Turbopack's compiled-module cache to .next between builds, so
    // repeat builds skip recompiling unchanged code (the ~78s compile is the
    // bottleneck for this large composition graph). Dev caching is already on
    // by default in Next 16; this opts the production build in too.
    turbopackFileSystemCacheForBuild: true,
    // @hugeicons/core-free-icons is a 59MB package whose barrel re-exports
    // ~13k icons; almost every component imports a couple of icons through it,
    // which drags the whole barrel into each module's compile. This rewrites
    // those imports to the per-icon files.
    optimizePackageImports: ["@hugeicons/core-free-icons"],
  },
  serverExternalPackages: [
    "@remotion/bundler",
    // @remotion/renderer is a native Node package: it require()s
    // platform-specific compositor binaries at runtime. Bundling it makes
    // Turbopack try (and fail) to resolve every platform's binary statically,
    // so it must be externalized and loaded from node_modules at runtime.
    "@remotion/renderer",
    // @remotion/lambda ships native/AWS deps; the /api/render/lambda routes
    // only use the lightweight `@remotion/lambda/client` entry, but externalize
    // the package so Turbopack doesn't try to bundle its native side.
    "@remotion/lambda",
    "@remotion/tailwind-v4",
    "@tailwindcss/webpack",
    "@tailwindcss/node",
    "@tailwindcss/oxide",
    "lightningcss",
    "esbuild",
  ],
  // The /api/render-bundle route lazily writes a webpack bundle to
  // ../remotion/build/ at request time. Without these excludes, Next.js
  // traces references into that directory during build and Vercel tries
  // to lstat hashed font/asset files that don't exist yet (build-time
  // ENOENT). Excluding the runtime-generated build dir from the trace
  // keeps the deploy succeeding.
  outputFileTracingExcludes: {
    "*": [
      "../remotion/build/**",
      "../../apps/remotion/build/**",
    ],
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}]],
  },
})

export default withMDX(nextConfig)
