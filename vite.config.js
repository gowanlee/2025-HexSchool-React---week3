import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 開發中、產品路徑
  base: process.env.NODE_ENV === 'production' ? '/2025-HexSchool-React---week3' : '/',
  plugins: [react()],
})
