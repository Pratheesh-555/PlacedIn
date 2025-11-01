import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Optimize build for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react']
        }
      }
    },
    
    // Enable compression and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Optimize chunk size warning
    chunkSizeWarningLimit: 1000
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
  
  server: {
    host: '0.0.0.0', // Allow access from network (mobile devices)
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    },
    // Improve dev server performance
    hmr: {
      overlay: false
    }
  }
});