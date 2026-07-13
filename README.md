# vkedit

[![NPM Version](https://img.shields.io/npm/v/vkedit?style=flat-square)](https://www.npmjs.com/package/vkedit)
[![License](https://img.shields.io/npm/l/vkedit?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/node/v/vkedit?style=flat-square)](package.json)

基于 Vue 3 和 Konva.js 的图形编辑器插件库。采用插件化架构，适用于标签模板、二维码、条码、票据、名片、证书等设计场景。

**[English](README.en.md)**

---

![项目预览](./截图/image.png)

---

## 特性

- **插件化架构** — 核心功能与图形元素均以插件形式注册，按需启用
- **7 种图形元素** — 矩形、文本、线条、表格、二维码、条形码、图表（ECharts）
- **撤销/重做** — 基于命令模式，所有修改操作可逆
- **导入/导出** — JSON 序列化、PNG/JPG 图片、PDF 文档
- **对齐与分布** — 左/右/上/下/居中对齐、水平/垂直均分
- **标尺与缩放** — 毫米级精度标尺、可配置 DPM（每毫米点数）
- **事件驱动** — 类型安全的事件系统，插件间松耦合通信
- **TypeScript** — 完整类型定义，泛型推断插件与元素类型

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
  TablePlugin,
  QrcodePlugin,
  BarcodePlugin,
  ChartPlugin,
  LinePlugin,
} from 'vkedit'

const host = createEditorHost()

// 安装图形插件
host
  .installPlugin('rect-plugin', RectPlugin)
  .installPlugin('text-plugin', TextPlugin)
  .installPlugin('table-plugin', TablePlugin)
  .installPlugin('qr-plugin', QrcodePlugin)
  .installPlugin('barcode-plugin', BarcodePlugin)
  .installPlugin('chart-plugin', ChartPlugin)
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

### Vkedit 组件 Props

| Prop                | 类型         | 默认值 | 说明             |
| ------------------- | ------------ | ------ | ---------------- |
| `host`              | `EditorHost` | —      | 编辑器宿主实例   |
| `showToolbox`       | `boolean`    | `true` | 显示左侧工具箱   |
| `showPropertyPanel` | `boolean`    | `true` | 显示右侧属性面板 |
| `showToolbar`       | `boolean`    | `true` | 显示顶部工具栏   |

---

## 配置

### createEditorHost 选项

`createEditorHost(options)` 创建宿主实例并自动安装核心插件。可选插件通过以下选项控制：

| 选项                      | 类型      | 默认值  | 说明             |
| ------------------------- | --------- | ------- | ---------------- |
| `basePropertyPanel`       | `boolean` | `false` | 基础元素属性面板 |
| `baseCanvasPropertyPanel` | `boolean` | `true`  | 画布属性面板     |
| `exportPlugin`            | `boolean` | `true`  | 导出插件         |
| `previewPlugin`           | `boolean` | `true`  | 预览插件         |
| `importPlugin`            | `boolean` | `true`  | 导入插件         |

### 画布状态

通过 `host.setStatus()` 更新画布状态，支持部分更新：

```typescript
interface IEditorState {
  zoom: number         // 缩放级别
  currentTool: string  // 当前工具
  snapToGrid: boolean  // 网格吸附
  showGrid: boolean    // 网格显示
  width: number        // 画布宽度（像素）
  height: number       // 画布高度（像素）
  wmm: number          // 画布宽度（毫米）
  hmm: number          // 画布高度（毫米）
  dpm: number          // 每毫米点数（DPI / 25.4）
}
```

`width`/`height` 与 `wmm`/`hmm` 通过 `dpm` 自动换算。设置 `dpm` 会以当前毫米尺寸重新计算像素宽高。

---

## 插件列表

### 核心插件（createEditorHost 自动安装）

| 插件                         | 说明             |
| ---------------------------- | ---------------- |
| `ToolbarManagerPlugin`       | 顶部工具栏管理   |
| `GraphicToolManagerPlugin`   | 图形工具管理     |
| `GraphicManagerPlugin`       | 图形渲染管理     |
| `PropertyPanelManagerPlugin` | 属性面板动态渲染 |
| `ElementManagerPlugin`       | 元素生命周期管理 |
| `SelectionPlugin`            | 元素选择与多选   |
| `KeyDownPlugin`              | 键盘快捷键       |
| `SnapPlugin`                 | 网格吸附         |
| `ClipboardPlugin`            | 复制/剪切/粘贴   |
| `AlignPlugin`                | 对齐与分布       |
| `ContextMenuManagerPlugin`   | 右键菜单         |

### 功能插件（通过选项启用）

| 插件            | 选项            | 说明                        |
| --------------- | --------------- | --------------------------- |
| `ExportPlugin`  | `exportPlugin`  | 导出 JSON / PNG / JPG / PDF |
| `ImportPlugin`  | `importPlugin`  | 导入 JSON 文件              |
| `PreviewPlugin` | `previewPlugin` | 预览与打印预览              |

### 图形插件（手动安装）

| 插件            | 元素类型  | 说明                                |
| --------------- | --------- | ----------------------------------- |
| `RectPlugin`    | `rect`    | 矩形，支持填充、描边                |
| `TextPlugin`    | `text`    | 文本，支持字体、对齐、样式          |
| `LinePlugin`    | `line`    | 线条，支持颜色、宽度                |
| `TablePlugin`   | `table`   | 表格，支持行列、合并单元格、边框    |
| `QrcodePlugin`  | `qr`      | 二维码，支持前景/背景色             |
| `BarcodePlugin` | `barcode` | 条形码，支持 CODE128、EAN-13 等格式 |
| `ChartPlugin`   | `chart`   | 图表，基于 ECharts                  |

---

## 核心概念

### EditorHost

`EditorHost` 是编辑器的核心宿主类，管理插件、状态、命令和历史记录。通过 `createEditorHost()` 创建实例后，所有操作都围绕 `host` 进行。

### 插件系统

插件通过 `installPlugin` / `uninstallPlugin` / `getPlugin` 管理。插件需继承 `BasePlugin` 并实现 `onInstall()` 钩子。`getPlugin` 支持泛型推断：

```typescript
const rectPlugin = host.getPlugin('rect-plugin') // 自动推断为 RectPlugin
const exportPlugin = host.getPlugin('export-plugin')
```

### 命令模式

所有可撤销的操作通过命令实现。`executeCommand()` 执行命令并压入历史栈，`undo()` / `redo()` 在栈中导航：

```typescript
host.executeCommand(command)  // 执行并入栈
host.undo()                    // 撤销
host.redo()                    // 重做
```

### 事件系统

编辑器通过 `emit` / `on` / `off` 实现类型安全的事件通信：

```typescript
// 监听元素添加
host.on('element:added', (payload) => {
  console.log('元素已添加:', payload.element)
})

// 监听选择变化
host.on('selection:changed', (payload) => {
  console.log('选中元素:', payload.selection)
})
```

完整事件列表及自定义事件扩展请参阅 API 文档。

---

## 常用操作

### 导出 / 导入 JSON

```typescript
// 导出为 JSON 字符串
const json = host.toJSON()

// 从 JSON 字符串加载
host.loadJSON(json)
```

通过 ExportPlugin / ImportPlugin 可触发文件下载和文件选择：

```typescript
const exportPlugin = host.getPlugin('export-plugin')
exportPlugin.handleExportJSON()   // 下载 .json 文件
exportPlugin.handleExportImage()  // 下载 PNG 图片
exportPlugin.handleExportPdf()    // 下载 PDF 文档

const importPlugin = host.getPlugin('import-plugin')
importPlugin.handleImportJSON()   // 弹出文件选择器
```

### 撤销 / 重做

```typescript
host.undo()
host.redo()
```

### 监听事件

```typescript
host.on('selection:changed', (payload) => {
  console.log('选中元素 ID:', payload.selection)
})
```

### 添加元素（通过命令）

```typescript
import { AddElementCommand } from 'vkedit'

const elementManager = host.getPlugin('element-manager-plugin')
const element = elementManager.createElement('rect')
host.executeCommand(new AddElementCommand(host, element))
```

### 更新元素属性（通过命令）

```typescript
import { UpdatePropertyCommand } from 'vkedit'

host.executeCommand(
  new UpdatePropertyCommand(host, element, 'fill', 'red', 'blue')
)
```

### 批量操作

```typescript
import { BatchCommand, UpdatePropertyCommand } from 'vkedit'

const batch = new BatchCommand(host, [
  new UpdatePropertyCommand(host, el1, 'fill', 'red', 'blue'),
  new UpdatePropertyCommand(host, el2, 'fill', 'red', 'green'),
])
host.executeCommand(batch)
```

---

## 适用场景

| 场景         | 适用插件                         |
| ------------ | -------------------------------- |
| 标签模板设计 | 二维码、条形码、文本、矩形、表格 |
| 二维码设计   | 二维码、文本、矩形               |
| 条码设计     | 条形码、文本、线条               |
| 票据设计     | 表格、文本、矩形、线条           |
| 名片设计     | 文本、矩形、线条                 |
| 证书设计     | 文本、矩形、表格                 |
| 数据可视化   | 图表、文本、矩形                 |

---

## 可用命令

| 命令                        | 构造参数                                            | 说明                       |
| --------------------------- | --------------------------------------------------- | -------------------------- |
| `AddElementCommand`         | `(host, element)`                                   | 添加元素                   |
| `RemoveElementCommand`      | `(host, element)`                                   | 移除元素                   |
| `TransformElementCommand`   | `(host, element, oldState, newState)`               | 变换元素（位置/大小/旋转） |
| `UpdatePropertyCommand`     | `(host, element, propertyPath, oldValue, newValue)` | 更新属性                   |
| `BatchCommand`              | `(host, commands, description?)`                    | 批量命令                   |
| `AlignElementsCommand`      | `(host, alignment, elementIds)`                     | 对齐元素                   |
| `DistributeElementsCommand` | `(host, direction, elementIds)`                     | 分布元素                   |
| `ChangeLayerOrderCommand`   | `(host, elementId, direction)`                      | 调整图层顺序               |
| `ClearSelectionCommand`     | `(host)`                                            | 清空选择                   |

---

## 链接

- [npm](https://www.npmjs.com/package/vkedit)
- [GitHub Releases](https://github.com/pwg-code/vkedit/releases)
- [Vue.js](https://vuejs.org/)
- [Konva.js](https://konvajs.org/)
- [vue-konva](https://www.npmjs.com/package/vue-konva)

---

## License

[MIT](LICENSE)

---

## 联系方式

- **QQ**: 16871824
- **邮箱**: 168715824@qq.com

提供技术支持、功能定制、项目合作。

---

如果 vkedit 对您有帮助，欢迎请作者喝杯咖啡。

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="./截图/reward-alipay.png" width="200" alt="支付宝打赏" />
      <br>支付宝
    </td>
    <td align="center">
      <img src="./截图/reward-wechat.png" width="200" alt="微信打赏" />
      <br>微信
    </td>
  </tr>
</table>

</div>
