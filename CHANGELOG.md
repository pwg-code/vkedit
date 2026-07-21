# Changelog

## [4.0.0] - 2026-07-21

### Added

- **`GraphicPlugin<T>` 抽象基类** — 新增统一插件基类，子类只需声明 `graphicType`、`graphicElement`、`shapeComponent`、`toolComponent`、`propertyPanels` 等抽象属性，即可在 `onActivate`/`onDeactivate` 中自动完成图形组件、工具栏、属性面板、元素构造器的注册与注销，无需手动 emit 四条事件。
- **`GraphicRegistryPlugin` 统一注册中心** — 替代原有的 GraphicManagerPlugin、GraphicToolManagerPlugin、ElementManagerPlugin、PropertyPanelManagerPlugin，集中管理所有图形类型、工具栏、属性面板、元素构造器的注册与查询。

### Changed

- **字段重命名：`transferable` → `resizable`** — `IGraphicElement` 接口及 `BaseGraphicElement` 实现中的可缩放标记字段统一更名为 `resizable`，语义更准确。
- **字段重命名：`element.name` → `element.displayName`** — 元素自定义显示名称字段从 `name` 改为 `displayName`，`LayerManagerPlugin` 的自动命名逻辑同步更新。
- **Rect / Text / Line / Qrcode / Barcode 插件重构** — 五个图形插件从继承 `BasePlugin` + 手动 emit 四条注册事件，改为继承 `GraphicPlugin<T>`，通过抽象属性声明式注册。
- **方法重命名：`handlePMouseleave` → `handleMouseLeave`** — 统一鼠标离开事件处理方法命名，消除拼写不一致。
- **`EditorHost` 泛型简化** — `installPlugin` / `getPlugin` / `uninstallPlugin` 方法移除对 `PluginMap` 的泛型依赖，改为运行时 string 键 + 显式泛型重载。

### Deprecated

- **`declare module '@/types'` 模块声明合并模式** — 基于 `PluginMap` / `ElementTypeMap` 空接口 + `declare module` 的插件类型注册机制不再推荐使用，改为由 `GraphicPlugin<T>` 及 `GraphicRegistryPlugin` 统一管理类型信息。

### Removed

- **删除 `GraphicManagerPlugin`**（`src/plugins/graphic-manager/`）— 功能由 `GraphicRegistryPlugin` 替代。
- **删除 `GraphicToolManagerPlugin`**（`src/plugins/graphic-tool-manager.ts`）— 功能由 `GraphicRegistryPlugin` 替代。
- **删除 `ElementManagerPlugin`**（`src/plugins/element-manager.ts`）— 功能由 `GraphicRegistryPlugin` 替代。
- **删除 `PropertyPanelManagerPlugin`**（`src/plugins/property-panel-manager/`）— 功能由 `GraphicRegistryPlugin` 替代。
- **删除 `PluginMap` 类型文件**（`src/types/plugin-map.ts`）— 不再需要模块声明合并模式。
- **删除 `ElementTypeMap` 类型文件**（`src/types/element-type-map.ts`）— 不再需要模块声明合并模式。
- **删除 `BaseGraphicType` 类型文件**（`src/types/base-graphic-type.ts`）— 由 `GraphicPlugin<T>` 替代。
- **清理死代码** — 移除 EditorHost 及各个插件中因旧架构残留的临时变量、未使用 imports 及已注释代码块。

### Fixed

- **`create-host.ts`** — 修复核心插件安装链，移除已删除的四个旧 Manager 插件引用，替换为 `GraphicRegistryPlugin`。
