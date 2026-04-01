import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isShareBuild = mode === 'share'

  return {
    base: './',
    build: {
      assetsInlineLimit: isShareBuild ? Number.MAX_SAFE_INTEGER : undefined,
      cssCodeSplit: !isShareBuild,
      outDir: isShareBuild ? 'dist-share' : 'dist',
    },
    publicDir: isShareBuild ? false : 'public',
    plugins: [
      react(),
      tailwindcss(),
      ...(isShareBuild ? [viteSingleFile()] : []),
    ],
  }
})
