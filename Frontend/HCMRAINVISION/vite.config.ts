import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Get base path for GitHub Pages deployment
 * @returns Base path string for the repository
 */
const getBasePath = (): string => {
  // Repository name: HcmcRainVision.Frontend
  const REPO_NAME = 'HcmcRainVision.Frontend'  
  
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    // If repo name is username.github.io, use root path
    if (repoName.includes('.github.io')) {
      return '/'
    }
    // Otherwise use repo name as base path
    return `/${repoName}/`
  }
  
  // For local development, use repo name as base path
  // This ensures consistency between dev and production
  return `/${REPO_NAME}/`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: getBasePath(),
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
})
