import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Separate vendor libraries into their own chunk
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase the chunk size limit to suppress warnings
  },
});