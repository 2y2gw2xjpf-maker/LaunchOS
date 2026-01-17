import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core - kept together to avoid circular deps
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Animation library
          'framer-motion': ['framer-motion'],

          // Charts library (large)
          'recharts': ['recharts'],

          // Drag and drop
          'dnd-kit': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],

          // Supabase SDK
          'supabase': ['@supabase/supabase-js'],

          // Icons
          'icons': ['lucide-react'],
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js',
    ],
  },
});
