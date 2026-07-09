import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      // 确保在库模式下正确处理宏
      reactivityTransform: true, // 如果使用 Vue 3.3+
      script: {
        defineModel: true, // 如果使用 defineModel

      },
      features: {
        propsDestructure: true,
        optionsAPI: true
      }
    }),
  ],
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
        // 关键：确保导出格式正确
        exports: 'named',
      },
    },
    emptyOutDir: false,
    // 关键：确保 CommonJS 和 ESM 都能正确使用
    sourcemap: true,
    minify: false, // 开发阶段可以关闭方便调试
  },
})