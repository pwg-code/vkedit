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

v4.0 中此模式已废弃，插件类型由 `GraphicPlugin<T>` 的抽象属性和 `GraphicRegistryPlugin` 统一管理。**只需删除所有 `declare module '@/types' { interface PluginMap ... }` 和 `declare module '@/types' { interface ElementTypeMap ... }` 代码块**。

`PluginMap` / `ElementTypeMap` 类型文件（`src/types/plugin-map.ts`、`src/types/element-type-map.ts`）本身也已删除。

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
