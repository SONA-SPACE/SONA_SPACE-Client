import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          // Markdown first: react-markdown also contains "react" and would otherwise land in
          // vendor-react, dragging the chat-only markdown chunk into every page's initial load.
          if (
            id.includes('react-markdown') ||
            id.includes('remark') ||
            id.includes('rehype') ||
            id.includes('micromark') ||
            id.includes('unified') ||
            id.includes('mdast') ||
            id.includes('hast') ||
            id.includes('unist') ||
            id.includes('vfile') ||
            id.includes('entities')
          ) {
            return 'vendor-markdown'
          }

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react'
          }

          if (
            id.includes('antd') ||
            id.includes('@ant-design') ||
            id.includes('rc-') ||
            id.includes('@rc-component')
          ) {
            return 'vendor-antd'
          }

          if (id.includes('socket.io-client') || id.includes('engine.io-client') || id.includes('socket.io-parser')) {
            return 'vendor-socket'
          }

          if (id.includes('swiper')) {
            return 'vendor-swiper'
          }

          if (id.includes('axios')) {
            return 'vendor-http'
          }

          // Motion is loaded on demand, so keep it out of the residual vendor chunk the entry imports
          if (id.includes('/gsap/')) {
            return 'vendor-gsap'
          }

          return 'vendor'
        },
      },
    },
  },
})
