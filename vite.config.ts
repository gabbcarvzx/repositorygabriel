import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()], build: { rollupOptions: { input: { main: 'index.html', pt: 'pt/index.html', en: 'en/index.html' } } } });
