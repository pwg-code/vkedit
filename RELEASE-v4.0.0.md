# v4.0.0 Release Notes

**发布日期**: 2026-07-24

v4.0 对编辑器的 UI 外观、操作手感、插件开发体验进行全面升级，并大幅精简了包体积。

> ⚠️ 本次版本包含破坏性变更（样式变量、API 字段重命名），升级请参阅 [MIGRATION.md](./MIGRATION.md)。

---

## ✨ 新增功能

### 图层面板
现在可以在左侧边栏中查看和管理所有元素的层叠顺序：
- 支持**拖拽重排**、上移/下移/置顶/置底
- 每个元素可自定义**显示名称**（在属性面板中编辑）
- 面板宽度可拖拽调节
- 导入 JSON 后自动归一化 zIndex 保证视觉顺序正确

### 全新的变换控件
自研变换控件替换了 Konva 内置 Transformer：
- 选中边框、缩放锚点、旋转手柄全新设计，操作更跟手
- **旋转角度吸附** — 打开状态栏的吸附开关后旋转自动对齐 5° 增量
- Locked 元素禁止拖拽和变换

### UI / 主题更新
- **品牌色切换为 Teal** — 暗色 `--vkedit-palette-teal-500`、亮色 `--vkedit-palette-teal-600`
- **默认暗色主题** — 开箱即用深色界面，亮色主题通过 `data-vkedit-theme="light"` 切换
- **Design Token 体系** — 完整的 CSS 变量集（spacing、radius、font、shadow、elevation、z-index），覆盖品牌色只需修改 4-5 个变量
- **VkButton 六种变体** — primary / destructive / outline / secondary / ghost / link
- **图标升级** — 所有工具栏图标改为 Material Symbols Light 图标，更统一清晰
- 弹出菜单、颜色选择器等浮层组件自动继承主题色

### 元素操作优化
- **自动级联排列** — 新添加的元素按对角方向自动排列，不会重叠或超出画布
- 元素复制粘贴时自动重置命名状态

---

## ❌ 移除的插件

| 插件 | 影响 | 替代方案 |
|------|------|----------|
| **ChartPlugin**（ECharts 图表） | 不再内置图表功能 | 可自行按需引入 ECharts |
| **TablePlugin**（表格） | 不再内置表格元素 | 用矩形 + 文本组合模拟表格布局 |

如果你的项目用到了以上插件，升级后需要自行补充实现或调整方案。

---

## 🔧 主要变动

### 插件开发体验升级
自定义插件从继承 `BasePlugin` + 手动 emit 四条注册事件，改为继承 `GraphicPlugin<T>`，只需声明抽象属性即可完成注册，代码量减少约 60%。

### 字段重命名（需要手动改代码）
| 旧字段 | 新字段 | 影响范围 |
|--------|--------|----------|
| `element.transferable` | `element.resizable` | 旧 JSON 导入自动兼容 |
| `element.name` | `element.displayName` | 序列化字段同步更名 |
| `handlePMouseleave` | `handleMouseLeave` | 事件处理方法名修正 |

### 包体积变化

| 项目 | 变化 | 说明 |
|------|------|------|
| echarts 依赖 | ❌ 移除 | -~1.2 MB |
| exceljs 依赖 | ❌ 移除 | -~800 KB |
| 图表+表格插件代码 | 删除 17 个文件 / 1281 行 | — |
| 4 个 Manager 插件 | 合并为 1 个 `GraphicRegistryPlugin` | 减少 3 个插件实例，启动更快 |
| 自定义 SVG 图标 | 改用 `unplugin-icons` | 更小的图标加载方案 |

### 其他移除
- **画布预设切换器**（CanvasPresetSwitcher）— 功能已被模板系统替代
- **Excel 导入/导出** — 骨架代码（从未实现）
- **`declare module '@/types'` 声明合并** — 不必再手动编写模块合并声明

---

## 升级指引

1. **如果只使用内置插件（Rect/Text/Line/QrCode/Barcode）**：主要处理样式变量替换和字段重命名，详见 [MIGRATION.md](./MIGRATION.md) Step 1-2、样式章节
2. **如果自定义了插件**：需改为继承 `GraphicPlugin<T>`，详见 Step 6
3. **如果使用了 4 个 Manager 插件**：替换为 `GraphicRegistryPlugin`，详见 Step 3-4

---

**在线示例**: https://vkedit.org
**文档**: https://docs.vkedit.org
**反馈 Issues**: https://github.com/pwg-code/vkedit/issues
