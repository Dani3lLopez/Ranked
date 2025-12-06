import { defineConfig } from 'vite'
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "/icons/favicon.ico",
        "/icons/apple-touch-icon.png",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png"
      ],

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
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },

      // IMPORTANTE: necesario para iOS y Safari
      workbox: {
        navigateFallback: "/index.html"
      }
    })
  ],
})
