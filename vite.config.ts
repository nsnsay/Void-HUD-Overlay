import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 将基础路径设置为子路径 '/overlay/'，确保资源指向 /overlay/assets
  base: '/overlay/',
  plugins: [
    vue(),
    vueDevTools(),
    svgLoader({
      defaultImport: 'component',
      svgo: true,
      svgoConfig: {
        // SVGO v3 插件配置不支持 active 字段，直接声明插件名称即可
        plugins: [{ name: 'removeViewBox' }],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      overlay: fileURLToPath(new URL('./src/Overlay', import.meta.url)),
    },
  },
  build: {
    outDir: '../manager/src/main/overlay/file',
  },
  server: {
    port: 5032,
  },
})
