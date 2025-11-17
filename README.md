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

## 🧩 插件开发指南（类型扩展）

VKEdit 在类型层使用可拓展的接口（例如 `EventMap`、`PluginMap`、`ElementTypeMap`），插件可以通过 TypeScript 的模块声明合并（module augmentation）在自己的实现或单独的 `types.d.ts` 中声明自己的事件和类型，而不会影响运行时。

下面给出推荐的做法和示例：

- 在插件目录下创建 `types.d.ts`（或在插件实现文件底部），只包含类型声明和 `declare module`，例如 `src/plugins/import/types.d.ts`：

```ts
import type { BaseEventData } from '@/types'

export interface ImportEventData extends BaseEventData {
  format: 'json' | 'excel' | string
  error?: any
}

declare module '@/types' {
  interface EventMap {
    'import:start': (payload: ImportEventData) => void
    'import:complete': (payload: ImportEventData) => void
    'import:error': (payload: ImportEventData) => void
  }
  interface PluginMap {
    'import-plugin': import('./import').ImportPlugin
  }
}
```

- 如果插件提供新的元素类型（比如 `rect`），可以在插件内声明元素映射，使 `elementManager.createElement('rect')` 自动推断具体返回类型：

```ts
// src/plugins/rect/types.d.ts
import type { RectElement } from './rect'

declare module '@/types' {
  interface ElementTypeMap {
    rect: RectElement
  }
}
```

- 在插件实现中仍可以使用运行时的事件发射/监听：

```ts
this.host.emit('import:start', { format: 'json', timestamp: Date.now(), source: 'import-plugin' })
this.host.on('import:complete', (payload) => { /* payload 已被推断为 ImportEventData */ })
```

- 调用 `getPlugin` 可以获得静态类型推断（前提是插件在 `PluginMap` 中声明）：

```ts
const importPlugin = host.getPlugin('import-plugin') // TS 会推断为 ImportPlugin
```

实现要点与注意事项：
- 类型声明文件仅用于类型推断（编译期），不会影响运行时行为。
- 推荐把 `types.d.ts` 放在插件目录内（例如 `src/plugins/<plugin>/types.d.ts`），便于随插件一起维护和发布。
- 如果多个插件或核心代码需要共享某些复杂事件数据类型，可以在 `src/types` 中保留通用的数据接口（例如 `BaseEventData`、`ElementEventData`），插件声明中复用这些类型。
- 避免在 `types.d.ts` 中引入复杂的运行时代码或产生循环引用；只导出/导入类型（`import type`）。

示例：把导出事件和 payload 放到导出插件的 `types.d.ts`

```ts
// src/plugins/export/types.d.ts
import type { BaseEventData } from '@/types'

export interface ExportEventData extends BaseEventData {
  format: 'png'|'jpeg'|'pdf'|'json'|'excel'|string
  error?: any
}

declare module '@/types' {
  interface EventMap {
    'export:start': (payload: ExportEventData) => void
    'export:complete': (payload: ExportEventData) => void
    'export:error': (payload: ExportEventData) => void
  }
}
```

如果你愿意，我可以把这一节整理成 `CONTRIBUTING.md` 的一部分，或为每个插件自动生成样板 `types.d.ts` 文件。

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
