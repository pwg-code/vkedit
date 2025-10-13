module.exports = {
  content: ['./index.html','./src/**/*.{vue,js,ts,jsx,tsx}'], // 扫描组件和 TS 文件以生成样式
  theme: {
    extend: {}, // 可以在这里扩展主题
  },
  plugins: [], // 如果需要使用 Tailwind 插件可以在这里添加
}
