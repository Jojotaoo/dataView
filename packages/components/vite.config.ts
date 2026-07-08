import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DemoComponents',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'echarts',
        'vue-echarts',
        '@vueuse/core',
        'axios',
        'lodash-es',
        'dayjs',
        'element-plus',
        'vuedraggable',
        '@element-plus/icons-vue',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          echarts: 'echarts',
          'vue-echarts': 'VueECharts',
        },
      },
    },
  },
})
