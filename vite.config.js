import react from '@vitejs/plugin-react'
import path from 'path'
import flowbiteReact from "flowbite-react/plugin/vite";
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), flowbiteReact(), tailwindcss(),],
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    historyApiFallback: true,
  }
})