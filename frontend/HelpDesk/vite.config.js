import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),  
      },
    },
    server: {
      proxy: {
        "/api": {
          target: mode === "development"
            ? "https://e2425-wads-l4ccg1-server.csbihub.id"
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
