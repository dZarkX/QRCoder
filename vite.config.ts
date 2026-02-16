import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/popup.html'),
        options: path.resolve(__dirname, 'src/options/options.html'),
        background: path.resolve(__dirname, 'src/background/background.ts'),
        content: path.resolve(__dirname, 'src/content/content.ts')
      },
      output: {
        entryFileNames: (chunkInfo: { name: string }) => {
          // Keep stable names for MV3.
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames: (assetInfo) => {
          // Flatten HTML files to root
          if (assetInfo.name?.endsWith('.html')) {
            const name = assetInfo.name.replace(/^src\//, '').replace(/\/[^/]+$/, '');
            return `${name}.html`;
          }
          // CSS and other assets to assets/
          return 'assets/[name][extname]';
        }
      }
    }
  }
});
