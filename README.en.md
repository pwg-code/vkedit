# vkedit

[![NPM Version](https://img.shields.io/npm/v/vkedit?style=flat-square)](https://www.npmjs.com/package/vkedit)
[![License](https://img.shields.io/npm/l/vkedit?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/node/v/vkedit?style=flat-square)](package.json)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-vkedit.org-orange?style=flat-square)](https://vkedit.org)

A visual canvas designer component built on Vue 3 and Konva.js. Features a plugin-based architecture for label, QR code, barcode, receipt, business card, and certificate template design and print layout.

**[中文](README.md)** | **[Live Demo](https://vkedit.org)** | **[Docs](https://docs.vkedit.org)**

---

![Project Preview](https://raw.githubusercontent.com/pwg-code/vkedit/main/截图/image.png)

---

## Features

- **Plugin-based architecture** - Core features and graphic elements are registered as plugins, enabled on demand
- **7 graphic element types** - Rectangle, text, line, table, QR code, barcode, chart (ECharts)
- **Undo / Redo** - Command pattern, all modifications are reversible
- **Import / Export** - JSON serialization, PNG/JPG images, PDF documents
- **Align & Distribute** - Left/right/top/bottom/center alignment, horizontal/vertical distribution
- **Ruler & Zoom** - Millimeter-precision ruler, configurable DPM (dots per millimeter)
- **Event-driven** - Type-safe event system for loosely coupled plugin communication
- **TypeScript** - Full type definitions with generic plugin and element type inference

---

## Installation

```bash
pnpm add vkedit vue konva vue-konva
```

vkedit declares `vue`, `konva`, and `vue-konva` as peerDependencies, which must be provided by the host project.

| Peer Dependency | Version  |
| --------------- | -------- |
| vue             | ^3.5.18  |
| konva           | ^10.0.2  |
| vue-konva       | ^3.2.6   |

Node.js requirement: `^20.19.0 || >=22.12.0`

---

## Quick Start

### 1. Configure entry file

Register VueKonva and import styles in `main.ts`:

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import 'vkedit/dist/vkedit.css'

const app = createApp(App)
app.use(VueKonva)
app.mount('#app')
```

### 2. Use the editor component

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

// Install graphic plugins
host
  .installPlugin('rect-plugin', RectPlugin)
  .installPlugin('text-plugin', TextPlugin)
  .installPlugin('table-plugin', TablePlugin)
  .installPlugin('qr-plugin', QrcodePlugin)
  .installPlugin('barcode-plugin', BarcodePlugin)
  .installPlugin('chart-plugin', ChartPlugin)
  .installPlugin('line-plugin', LinePlugin)

// Set canvas size (A4 paper, DPM = 8)
host.setStatus({
  dpm: 8,
  width: 210 * 8,
  height: 297 * 8,
  zoom: 0.4,
})
</script>
```

> For full tutorials, API docs, and online examples, visit [docs.vkedit.org](https://docs.vkedit.org).

---

## Theme & Styles

vkedit ships with a dark theme by default (`data-vkedit-theme="dark"`). Just import the CSS:

```ts
import 'vkedit/dist/vkedit.css'
```

Override the brand color on the editor root or a wrapper container:

```css
.vkedit-editor {
  --vkedit-color-primary: oklch(55% 0.18 260);
  --vkedit-color-primary-hover: oklch(65% 0.16 260);
  --vkedit-color-on-primary: oklch(99% 0 0);
}
```

See [MIGRATION.md](./MIGRATION.md) for the full variable list and breaking changes.

---

## Links

- [Website](https://vkedit.org)
- [Docs](https://docs.vkedit.org)
- [npm](https://www.npmjs.com/package/vkedit)
- [GitHub Releases](https://github.com/pwg-code/vkedit/releases)
- [Vue.js](https://vuejs.org/)
- [Konva.js](https://konvajs.org/)
- [vue-konva](https://www.npmjs.com/package/vue-konva)

---

## License

[MIT](LICENSE)

---

## Contact

- **QQ**: 16871824
- **Email**: 168715824@qq.com

Available for technical support, custom features, and project collaboration.

---

## Sponsor

If vkedit helps you, consider buying the author a coffee.

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/pwg-code/vkedit/main/截图/reward-alipay.png" width="200" alt="Alipay" />
      <br>Alipay
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/pwg-code/vkedit/main/截图/reward-wechat.png" width="200" alt="WeChat Pay" />
      <br>WeChat
    </td>
  </tr>
</table>

</div>
