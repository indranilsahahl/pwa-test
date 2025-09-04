import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

// vite.config.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: { cleanupOutdatedCaches: true },
      manifest: {
        name: 'EsAttendance',
        short_name: 'ESAttendance',
        description: 'Eye Space Attendance System App deployed on Netlify',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        version: "2.12.1",
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
  host: true,
  port: 5173,
  allowedHosts: ["esattendance.loca.lt"]
  }

})
