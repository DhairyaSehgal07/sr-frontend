import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    // exceljs ships as one ~930 KB module; it is lazy-loaded on report export only.
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
            },
            {
              name: 'chart-vendor',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 35,
            },
            {
              name: 'excel-vendor',
              test: /[\\/]node_modules[\\/]exceljs[\\/]/,
              priority: 35,
            },
            {
              name: 'zod-vendor',
              test: /[\\/]node_modules[\\/]zod[\\/]/,
              priority: 35,
            },
            {
              name: 'tanstack-vendor',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 30,
            },
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](@radix-ui|radix-ui|lucide-react|@base-ui)[\\/]/,
              priority: 25,
            },
            {
              name: 'date-vendor',
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              priority: 20,
            },
            {
              name: 'dnd-vendor',
              test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 0,
              maxSize: 400_000,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
