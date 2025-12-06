import { defineConfig } from 'vite'
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/icons/favicon.ico", "/icons/favicon-96x96.png", "/icons/apple-touch-icon.png", "/icons/web-app-manifest-192x192.png", "/icons/web-app-manifest-512x512.png"],
      manifest: {
        name: "Ranked",
        short_name: "Ranked",
        description: "Sistema de puntuación para actividades y rallys de campamento",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/favicon-96x96.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/apple-touch-icon.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],

})