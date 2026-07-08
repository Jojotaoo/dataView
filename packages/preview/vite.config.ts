import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DemoPreview',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'vue',
        'jojotaoo_components',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
