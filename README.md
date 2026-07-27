# vkedit

[![NPM Version](https://img.shields.io/npm/v/vkedit?style=flat-square)](https://www.npmjs.com/package/vkedit)
[![License](https://img.shields.io/npm/l/vkedit?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/node/v/vkedit?style=flat-square)](package.json)
[![在线示例](https://img.shields.io/badge/在线示例-vkedit.org-orange?style=flat-square)](https://vkedit.org)

基于 Vue 3 与 Konva.js 的可视化画布设计器组件，采用插件化架构，适用于标签、二维码、条码、票据、名片、证书等模板设计与打印排版场景。

**[English](README.en.md)** | **[在线示例](https://vkedit.org)** | **[文档](https://docs.vkedit.org)**

---

![项目预览](https://raw.githubusercontent.com/pwg-code/vkedit/main/截图/image.png?v=3)

---

## 特性

- **插件化架构** - 核心功能与图形元素均以插件形式注册，按需启用；`GraphicPlugin<T>` 抽象基类简化自定义插件开发
- **5 种图形元素** - 矩形、文本、线条、二维码、条形码
- **撤销/重做** - 基于命令模式，所有修改操作可逆
- **导入/导出** - JSON 序列化、PNG/JPG 图片、PDF 文档
- **对齐与分布** - 左/右/上/下/居中对齐、水平/垂直均分
- **标尺与缩放** - 毫米级精度标尺、可配置 DPM（每毫米点数）
- **事件驱动** - 类型安全的事件系统，插件间松耦合通信
- **TypeScript** - 完整类型定义，泛型推断插件与元素类型
- **设计令牌系统** - 两层架构（Palette + Semantic），完整 CSS 变量覆盖 spacing、radius、font、shadow、elevation、z-index
- **主题系统** - 默认暗色主题，亮色主题通过 `data-vkedit-theme` 切换；Teleport 浮层主题继承；`resolveVkeditTheme()` 工具函数
- **VkButton 多变体** - primary、destructive、outline、secondary、ghost、link

---

## 安装

```bash
pnpm add vkedit vue konva vue-konva
```

vkedit 将 `vue`、`konva`、`vue-konva` 作为 peerDependencies，需由宿主项目提供。

| Peer Dependency | 版本    |
| --------------- | ------- |
| vue             | ^3.5.18 |
| konva           | ^10.0.2 |
| vue-konva       | ^3.2.6  |

Node.js 要求：`^20.19.0 || >=22.12.0`

---

## 快速上手

### 1. 配置入口文件

在 `main.ts` 中注册 VueKonva 并引入样式：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import 'vkedit/dist/vkedit.css'

const app = createApp(App)
app.use(VueKonva)
app.mount('#app')
```

### 2. 使用编辑器组件

```vue
<template>
  <Vkedit :host="host" />
</template>

<script setup lang="ts">
import { createEditorHost, Vkedit } from 'vkedit'
import {
  RectPlugin,
  TextPlugin,
  QrcodePlugin,
  BarcodePlugin,
  LinePlugin,
} from 'vkedit'

const host = createEditorHost()

// 安装图形插件
host
  .installPlugin('rect-plugin', RectPlugin)
  .installPlugin('text-plugin', TextPlugin)
  .installPlugin('qr-plugin', QrcodePlugin)
  .installPlugin('barcode-plugin', BarcodePlugin)
  .installPlugin('line-plugin', LinePlugin)

// 设置画布尺寸（A4 纸张，DPM = 8）
host.setStatus({
  dpm: 8,
  width: 210 * 8,
  height: 297 * 8,
  zoom: 0.4,
})
</script>
```

> 完整教程、API 文档与在线示例请访问 [docs.vkedit.org](https://docs.vkedit.org)。

---

## 主题与样式

vkedit 内置完整的设计令牌（Design Token）体系。暗色主题为默认值（`data-vkedit-theme="dark"`），引入 CSS 后即刻生效：

```ts
import 'vkedit/dist/vkedit.css'
```

覆盖品牌色（挂载在编辑器根或包裹容器上）：

```css
.vkedit-editor {
  --vkedit-color-primary: oklch(70% 0.14 185);
  --vkedit-color-primary-hover: oklch(78% 0.12 185);
  --vkedit-color-on-primary: oklch(14% 0 0);
}
```

令牌体系分两层：
- **Palette**（`:root`）— 颜色原始阶梯（neutral、teal、danger 等）以及非颜色尺度（spacing、radius、font、shadow、elevation、z-index）
- **Semantic**（主题选择器）— 引用 palette 的语义变量，分别定义 `data-vkedit-theme="dark"`（默认）与 `data-vkedit-theme="light"` 两套映射

完整变量列表与破坏性变更说明见 [MIGRATION.md](./MIGRATION.md)。

---

## 链接

- [官网](https://vkedit.org)
- [文档](https://docs.vkedit.org)
- [npm](https://www.npmjs.com/package/vkedit)
- [GitHub Releases](https://github.com/pwg-code/vkedit/releases)
- [Vue.js](https://vuejs.org/)
- [Konva.js](https://konvajs.org/)
- [vue-konva](https://www.npmjs.com/package/vue-konva)

---

## License

[MIT](LICENSE)

---

## 社区

- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全政策](SECURITY.md)
- [第三方许可证声明](THIRD_PARTY_LICENSES.md)

---

## 联系方式

- **QQ**: 16871824
- **邮箱**: 168715824@qq.com

提供技术支持、功能定制、项目合作。
