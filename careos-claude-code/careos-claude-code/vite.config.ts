import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA disabled — service worker caching causes stale deploys
    // Re-enable when we have proper cache-busting strategy
    // VitePWA({ ... }),
  ],
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, 'src/client'),
      '@server': path.resolve(__dirname, 'src/server'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
    fs: {
      // Allow serving files from the real project dir when accessed via symlinks
      allow: ['/Users/blaine/Desktop/careos-claude-code', '/Users/blaine/CareOs', '/Users/blaine/Documents/GitHub/care-os', '/Users/blaine/care-os'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist/client',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: React core + React-dependent libs in ONE chunk
          // to avoid circular dependency (vendor-misc ↔ vendor-react)
          // react-query, react-router, scheduler all call React.createContext
          // at module init time and MUST load after React.
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@tanstack/react-query') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
          // App-core: stores, hooks, services — prevents circular chunks
          // (sharing components import hooks/stores which were landing in the
          //  entry chunk, creating vendor-misc ↔ vendor-react and
          //  feat-assessments ↔ feat-worker ↔ feat-onboarding cycles)
          if (id.includes('/client/stores/') || id.includes('/client/hooks/') || id.includes('/client/services/')) {
            return 'app-core';
          }
          // Shared components (non-sharing) get their own chunk
          if (id.includes('/client/components/') && !id.includes('/components/sharing/')) {
            return 'app-ui';
          }
          // Feature domain chunks — lazy-loaded per section
          if (id.includes('/features/onboarding/')) return 'feat-onboarding';
          if (id.includes('/features/acp/')) return 'feat-acp';
          if (id.includes('/features/timebank/')) return 'feat-timebank';
          if (id.includes('/features/admin/')) return 'feat-admin';
          if (id.includes('/features/worker/')) return 'feat-worker';
          if (id.includes('/features/conductor/')) return 'feat-conductor';
          if (id.includes('/features/billing/') || id.includes('/features/lmn/')) return 'feat-billing';
          if (id.includes('/features/assessments/')) return 'feat-assessments';
          if (id.includes('/features/public/')) return 'feat-public';
          if (id.includes('/features/sage/')) return 'feat-sage';
          if (id.includes('/features/messaging/')) return 'feat-messaging';
          if (id.includes('/features/wellness/')) return 'feat-wellness';
          if (id.includes('/legacy/')) return 'feat-legacy';
          if (id.includes('/components/sharing/')) return 'feat-sharing';
        },
      },
    },
  },
});
