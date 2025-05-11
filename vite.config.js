import react from '@vitejs/plugin-react'
import path from 'node:path'
import flowbiteReact from "flowbite-react/plugin/vite";
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), flowbiteReact(),],
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