# VKEdit

VKEdit 是一个基于 Vue 3 和 Konva.js 的插件设计器，提供了强大的图形编辑和设计功能。

## ✨ 特性

- 🎨 基于 Vue 3 和 Konva.js 构建
- 📦 支持多种图形元素（矩形、表格、文本等）
- 🛠️ 完整的图形编辑功能（变换、对齐等）
- 🎯 高度可定制的属性面板
- 🌗 支持亮色/暗色主题
- 💡 智能的命令系统
- 🚀 基于 TypeScript，提供完整类型支持

## 🚀 安装

```bash
pnpm add vkedit
```

## 🔨 使用

```typescript
import { createApp } from 'vue'
import VKEdit from 'vkedit'
import 'vkedit/dist/styles/index.css'

const app = createApp(App)
app.use(VKEdit)
app.mount('#app')
```

### 在组件中使用

```vue
<template>
  <vk-editor-host>
    <vk-editor></vk-editor>
  </vk-editor-host>
</template>
```

## 📝 配置要求

- Node.js: ^20.19.0 || >=22.12.0
- Vue: ^3.5.18
- Konva: ^10.0.2
- vue-konva: ^3.2.6

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建库
pnpm build

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📦 项目结构

```
src/
  ├── commands/        # 命令系统
  ├── components/      # UI组件
  ├── core/           # 核心功能
  ├── plugins/        # 插件系统
  ├── styles/         # 样式文件
  └── types/          # TypeScript 类型定义
```

## ✨ 插件系统

VKEdit 提供了丰富的插件系统，支持：

- 元素插件（矩形、表格、文本等）
- 图形类型插件
- 属性面板插件
- 工具栏插件
- 对齐功能插件

## 🎨 主题定制

VKEdit 使用 Tailwind CSS 进行样式管理，支持完整的主题定制：

- 支持亮色/暗色主题切换
- 可自定义颜色变量
- 响应式设计
- 动画效果支持

## 📄 许可证

[MIT](LICENSE)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。
