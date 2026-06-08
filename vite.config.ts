import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({ tsconfigPath: './tsconfig.build.json' }), // 自动生成 .d.ts
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'Vkedit', // 全局变量名（UMD）
      fileName: (format) => `vkedit.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      // 不把这些运行时依赖打包进库，让使用方提供它们（作为 peerDependencies）
      // external: ['vue', 'konva', 'vue-konva', /^(.*\.(css|scss|sass))$/],
      external: ['vue', 'konva', 'vue-konva', 'pinia'],
    },
    cssCodeSplit: false,
  },
})
