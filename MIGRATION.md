# MIGRATION GUIDE

## v3.x → v4.0

v4.0 对图形插件链路进行了全面重构，引入了 `GraphicPlugin<T>` 抽象基类和 `GraphicRegistryPlugin` 统一注册中心，同时清理了大量旧架构代码。请按以下步骤完成迁移。

---

### Step 1: `transferable` → `resizable`

```diff
// v3.x
- interface IGraphicElement {
-   transferable: boolean
- }
- element.transferable = true

// v4.0
+ interface IGraphicElement {
+   resizable: boolean
+ }
+ element.resizable = true
```

**旧 JSON 兼容**：`BaseGraphicElement.deserialize()` 在读取 `resizable` 字段失败时会回退到 `transferable`，因此 v3.x 导出的 JSON 仍可正常导入，无需手动修改文件。

---

### Step 2: `element.name` → `element.displayName`

```diff
// v3.x
- element.name = '我的矩形'
- const n = element.name

// v4.0
+ element.displayName = '我的矩形'
+ const n = element.displayName
```

`LayerManagerPlugin` 的自动命名逻辑 (`getElementDisplayName`) 已同步更新为读取 `displayName`。序列化输出字段也对应更名。

---

### Step 3: 旧插件 key 更换对照表

`GraphicRegistryPlugin` 统一使用 `KebabCase<type>` 作为注册 key，与之前各 Manager 插件的 key 含义一致，但以下 key 需要留意：

| v3.x key | v4.0 key | 说明 |
|---|---|---|
| `graphic-manager-plugin` | — | 已删除，改用 `GraphicRegistryPlugin` |
| `graphic-tool-manager-plugin` | — | 已删除，改用 `GraphicRegistryPlugin` |
| `element-manager-plugin` | — | 已删除，改用 `GraphicRegistryPlugin` |
| `property-panel-manager-plugin` | — | 已删除，改用 `GraphicRegistryPlugin` |

不再通过 `host.getPlugin('element-manager-plugin')` 获取各 Manager，改为：

```diff
// v3.x
- const elePlugin = host.getPlugin('element-manager-plugin')
- elePlugin.addElement(el)
- elePlugin.getAllElements()

// v4.0
+ const registry = host.getPlugin('graphic-registry-plugin')
+ registry.addElement(el)
+ registry.getAllElements()
```

---

### Step 4: 删除 `declare module '@/types'` 模块声明合并

v3.x 中每个插件需要在自身文件中通过模块声明合并来扩展 `PluginMap` 和 `ElementTypeMap`：

```typescript
// v3.x - 需要手动声明
declare module '@/types' {
  interface PluginMap {
    'rect-plugin': RectPlugin
  }
}
declare module '@/types' {
  interface ElementTypeMap {
    rect: RectElement
  }
}
```

v4.0 中**外部插件不再需要**自己编写 `declare module '@/types'` 声明合并（`GraphicPlugin<T>` 的抽象属性已替代 `ElementTypeMap` 的功能），因此请删除你自己的项目代码中所有 `declare module '@/types' { interface ElementTypeMap ... }` 以及不必要的 `declare module '@/types' { interface PluginMap ... }` 代码块。

`ElementTypeMap` 已完全移除，`PluginMap` / `ElementTypeMap` 的独立类型文件（`src/types/plugin-map.ts`、`src/types/element-type-map.ts`）也一并删除。框架内部插件仍通过声明合并维护 `PluginMap` 以保证 `installPlugin`/`getPlugin` 的类型推断，但外部消费者无需再自行编写。

---

### Step 5: 插件安装链变化

**create-host.ts**（或用户的宿主创建代码）中的核心插件安装链需要更新：

```diff
// v3.x
- host
-   .installPlugin('graphic-manager-plugin', GraphicManagerPlugin)
-   .installPlugin('graphic-tool-manager-plugin', GraphicToolManagerPlugin)
-   .installPlugin('property-panel-manager-plugin', PropertyPanelManagerPlugin)
-   .installPlugin('element-manager-plugin', ElementManagerPlugin)

// v4.0 - 只用安装 GraphicRegistryPlugin
+ import { GraphicRegistryPlugin } from '@/plugins'
+ host.installPlugin('graphic-registry-plugin', GraphicRegistryPlugin)
```

图形插件（Rect / Text / Line / Qrcode / Barcode）的注册方式不变，仍通过 `host.installPlugin()` 安装：

```diff
host
  .installPlugin('graphic-registry-plugin', GraphicRegistryPlugin)
  .installPlugin('rect-plugin', RectPlugin)    // 不变
  .installPlugin('text-plugin', TextPlugin)    // 不变
  .installPlugin('line-plugin', LinePlugin)    // 不变
  .installPlugin('qr-plugin', QrcodePlugin)    // 不变
  .installPlugin('barcode-plugin', BarcodePlugin) // 不变
```

---

### Step 6: 自定义图形插件改造

如果项目中有基于 v3.x `BasePlugin` + 手动 emit 四事件的自定义图形插件，请改为继承 `GraphicPlugin<T>`：

```diff
// v3.x
- import { BasePlugin } from '@/types/base-plugin'
- export class MyPlugin extends BasePlugin {
-   name = 'my-plugin'
-   version = '1.0.0'
-   protected onInstall() {
-     this.host.emit('graphic-tool:registered', { type: 'my', render: () => Tool })
-     this.host.emit('graphic:registered', { type: 'my', render: () => Shape })
-     this.host.emit('property-panel:registered', { graphicTypes: ['my'], render: () => Panel })
-     this.host.emit('element:registered', { type: 'my', createElement: () => new MyElement(this.host) })
-   }
- }

// v4.0
+ import { GraphicPlugin } from '@/types/graphic-plugin'
+ export class MyPlugin extends GraphicPlugin<MyElement> {
+   name = 'my-plugin'
+   version = '1.0.0'
+   graphicType = 'my'
+   graphicElement = MyElement
+   shapeComponent = Shape
+   toolComponent = Tool
+   propertyPanels = [{ graphicTypes: ['my'], render: () => Panel }]
+ }
```

---

### Summary

| 变更项 | 操作 |
|---|---|
| `transferable` → `resizable` | 源码全局查找替换；旧 JSON 自动兼容 |
| `element.name` → `element.displayName` | 源码全局查找替换 |
| 四个旧 Manager 插件 | 替换为 `GraphicRegistryPlugin` |
| `declare module '@/types' { interface PluginMap/ElementTypeMap }` | 删除所有声明块 |
| 自定义图形插件 | 改为继承 `GraphicPlugin<T>` |
| `handlePMouseleave` | 已全局更名为 `handleMouseLeave`（无需操作） |

---

## v4.x 样式系统（Design Token）迁移

v4.x 引入了完整的 Design Token 体系，废弃了大量旧版颜色变量，并重新组织了主题系统。

### 主题

- 编辑器根节点上通过 `data-vkedit-theme` 属性控制主题：`class="vkedit-editor" data-vkedit-theme="dark"`（默认）
- 可选 `light`（完整语义值，当前无 UI 切换入口，仅通过 Data Attribute 启用）
- **已移除** `body:has(.vkedit-editor)` 深色覆盖方案，请改用 `data-vkedit-theme`

### 宿主覆盖变量

以下变量定义在 `.vkedit-editor, [data-vkedit-theme='dark']` 和 `[data-vkedit-theme='light']` 下，宿主可提高选择器优先级覆盖：

```css
.vkedit-editor,
[data-vkedit-theme='dark'] {
  --vkedit-color-primary: oklch(70% 0.14 185);       /* 品牌色 */
  --vkedit-color-primary-hover: oklch(78% 0.12 185);
  --vkedit-color-on-primary: oklch(14% 0 0);
  --vkedit-color-canvas-area: oklch(20% 0.015 265);
  --vkedit-color-surface: oklch(26% 0.012 260 / 0.92);
  --vkedit-color-border: oklch(100% 0 0 / 0.09);
  --vkedit-color-text: oklch(86% 0.005 260);
  --vkedit-color-text-muted: oklch(58% 0.005 260);
  --vkedit-radius-md: 0.375rem;
  --vkedit-font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
```

### 变量对照表（旧 → 新）

| 旧变量 | 新变量 | 说明 |
|---|---|---|
| `--vkedit-color-white` | `--vkedit-palette-neutral-0` / `--vkedit-color-on-danger` | 原纯白变量，改用 palette 或语义 token |
| `--vkedit-color-neutral-*`（旧有级但不全） | `--vkedit-palette-neutral-*` | 统一 palette 阶梯（0～950） |
| `--vkedit-color-red-500/600` | `--vkedit-color-danger` / `--vkedit-color-danger-hover` | 语义化 |
| `--vkedit-color-gray-*` | —（删除） | 不再有灰色阶梯，改语义 token |
| `--vkedit-color-bg-dark` | `--vkedit-color-surface-solid` | 重命名且语义化 |
| `--vkedit-color-bg-dark-hover` | `--vkedit-color-bg-hover` | 重命名 |
| `--vkedit-color-bg-dark-active` | `--vkedit-color-bg-active` | 重命名 |
| `--vkedit-color-border-dark` | `--vkedit-color-border` | 不再区分 dark |
| `--vkedit-color-border-dark-hover` | `--vkedit-color-border-strong` | 语义化 |
| `--vkedit-color-text-dark` | `--vkedit-color-text` | 不再区分 dark |
| `--vkedit-color-text-dark-secondary` | `--vkedit-color-text-secondary` | 不再区分 dark |
| `--vkedit-color-panel-bg` | 保留名（值改为语义引用） | 保留兼容 |
| `--vkedit-color-toolbar-bg` | 保留名 | 保留兼容 |
| `--vkedit-color-canvas-area` | 保留名 | 保留兼容 |
| `--vkedit-blur-panel` | 保留名 | 保留兼容 |
| `--vkedit-shadow-panel` | 保留名 | 保留兼容 |

### 组件变更

- **`VkButton`**：新增 `variant="primary"`（使用 `--vkedit-color-primary` / `--vkedit-color-on-primary`），同时支持 `destructive`、`outline`、`secondary`、`ghost`、`link` 等变体
- **Teleport 浮层**：`VkDropdown`、`VkColorPicker` 等使用 Teleport 的弹出层组件会自动携带 `data-vkedit-theme` 属性，确保浮层在 DOM 外也能继承正确的主题变量
- **VkButton 变体对照**：

| variant | 背景 | 文字色 | 悬停效果 |
|---|---|---|---|
| `default` | `--vkedit-color-bg-active` | `--vkedit-color-text` | `--vkedit-color-bg-hover` |
| `primary` | `--vkedit-color-primary` | `--vkedit-color-on-primary` | `--vkedit-color-primary-hover` |
| `destructive` | `--vkedit-color-danger` | `--vkedit-color-on-danger` | `--vkedit-color-danger-hover` |
| `ghost` | transparent | `--vkedit-color-text` | `--vkedit-color-bg-hover` |
