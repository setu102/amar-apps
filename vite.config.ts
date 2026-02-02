
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // এটি যুক্ত করার ফলে আপনি public_html এর যেকোনো সাব-ফোল্ডারেও অ্যাপটি চালাতে পারবেন।
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  }
});
