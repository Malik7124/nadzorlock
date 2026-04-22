import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ВАЖНО: base должен совпадать с именем репозитория на GitHub.
// Если репозиторий называется nadzorlock → '/nadzorlock/'.
// Если будешь выкладывать как user.github.io (основной сайт пользователя) → '/'.
export default defineConfig({
  plugins: [react()],
  base: '/nadzorlock/',
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
  },
})
