import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    server: {
      proxy: {
        "/api": {
          target: mode === "development"
            ? "http://localhost:3000"
            : "https://e2425-wads-l4ccg1-server.csbihub.id",
          changeOrigin: true,
          secure: mode !== "development",
          ws: true,
        },
        "/service": {
          target: mode === "development"
            ? "http://localhost:3000"
            : "https://e2425-wads-l4ccg1-server.csbihub.id",
          changeOrigin: true,
          secure: mode !== "development",
          ws: true,
        },
      },
    },
    build: {
      outDir: "dist",
    },
    plugins: [react(), tailwindcss()],
  }
})
