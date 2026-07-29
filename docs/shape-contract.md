# Shape 组件开发契约

> 适用于 vkedit 插件体系中的 Shape 组件。  
> 版本：1.0 · 关联改造：T01–T07

---

## 1. 职责

Shape 组件是**纯渲染组件**，职责仅限于：

- 接收 `element` 数据，将其映射为 Konva 节点树
- 声明 `host` 引用，供上层框架使用

Shape **不处理任何用户交互**（拖拽、缩放、旋转等）。所有交互由 `TransformOverlay` 配合 `use-content-layer` / `use-transform-overlay` 统一处理。

---

## 2. 必传 Props

通过 `ShapeProps<T>` 接口声明（`src/types/shape-props.ts`）：

```ts
import type { EditorHost } from '@/core'
import type { IGraphicElement } from '@/types/base'

export interface ShapeProps<T extends IGraphicElement = IGraphicElement> {
  element: T
  host: EditorHost
}
```

| Prop      | 类型                        | 说明                       |
|-----------|-----------------------------|----------------------------|
| `element` | `T extends IGraphicElement` | 图形数据实例               |
| `host`    | `EditorHost`                | 编辑器宿主实例，供框架使用 |

---

## 3. 禁止事项

| 禁止行为 | 说明 |
|----------|------|
| `v-bind="$attrs"` | 之前用于向下透传 Konva drag 事件，T01 改造后不再需要 |
| 在 Shape 内实现拖拽逻辑 | 拖拽由 `use-content-layer` 统一绑定，Shape 不应自行处理 `dragstart` / `dragmove` / `dragend` |
| 修改 `element` 上的 Konva config 相关属性 | Shape 是消费方，不应写回 config 属性；属性更新通过 `host.executeCommand` 在插件逻辑中完成 |

---

## 4. 推荐做法

- 通过 `element.config` 获取 Konva 节点配置（已包含 `id`、`x`、`y`、`width`、`height`、`rotation`、`scaleX`、`scaleY`、`visible`、`draggable`）
- 如果包含子节点（如 `v-group`），使用 `:config` 传递配置
- 组件名统一为 `Shape.vue`，放在对应插件目录下
- Props 声明使用 `export interface Props extends ShapeProps<XxxElement> {}` 模式
- 模板内仅使用 Konva 标签（`v-rect`、`v-group`、`v-circle` 等），不掺杂交互逻辑

---

## 5. Props 声明模板

```ts
import type { ShapeProps } from '@/types/shape-props'
import type { MyElement } from './my-plugin'

export interface Props extends ShapeProps<MyElement> {}

const { element, host } = defineProps<Props>()
```

---

## 6. 典型模板示例

### 单一节点 Shape

```vue
<template>
  <v-rect :config="element.config" />
</template>

<script setup lang="ts">
import type { ShapeProps } from '@/types/shape-props'
import type { RectElement } from './rect'

export interface Props extends ShapeProps<RectElement> {}

const { element } = defineProps<Props>()
</script>
```

### 多子节点 Shape（group）

```vue
<template>
  <v-group :config="element.groupConfig">
    <v-rect :config="element.visibleRectConfig" />
    <v-rect :config="element.hitRectConfig" />
  </v-group>
</template>

<script setup lang="ts">
import type { ShapeProps } from '@/types/shape-props'
import type { LineElement } from './line'

export interface Props extends ShapeProps<LineElement> {}

const { element } = defineProps<Props>()
</script>
```

---

## 7. 注册 Shape

在插件中通过继承 `GraphicPlugin<T>` 并设置 `shapeComponent` 字段完成注册：

```ts
import { GraphicPlugin } from '@/types/graphic-plugin'
import Shape from './Shape.vue'

export class MyPlugin extends GraphicPlugin<MyElement> {
  public name = 'my-plugin'
  public version = '1.0.0'
  public graphicType = 'my-type'
  public graphicElement = MyElement
  public shapeComponent = Shape
}
```

插件的 `onActivate` 会自动 emit `graphic:registered` 事件，`GraphicRegistryPlugin` 监听该事件完成注册。Shape 组件不应直接调用 `register()`。

---

## 8. 关于 draggable

| 字段 | 作用 | 编辑态值 |
|------|------|----------|
| `element.draggable`（业务字段） | 控制该元素**是否允许被变换层（TransformOverlay）移动** | 保持不变（由用户/插件控制） |
| `element.config.draggable`（Konva 配置） | Konva 原生拖拽开关 | **固定为 `false`**（由 `BaseGraphicElement.config` getter 强制执行） |

业务字段 `element.draggable` 不影响 Konva 原生拖拽；它参与 `canGroupMove` 判断（见 `use-transform-overlay.ts:282`）：

```ts
function canGroupMove(els: IGraphicElement[]): boolean {
  if (els.length === 0) return false
  return els.every((e) => e.draggable !== false && !e.locked)
}
```

---

## 9. 事件通信

Shape 组件**无需自行 emit 拖拽事件**。拖拽流程由 `use-content-layer` 在 `ContentLayer.vue` 上统一绑定 Konva 的 `dragstart` / `dragmove` / `dragend` 事件，并通过 `host.emit` 广播 `element:dragstart` / `element:dragmove` / `element:dragend` 事件供其他插件（如 snap、TransformOverlay）消费。

事件载荷类型（定义于 `src/types/event-map.ts`）：

```ts
'element:dragstart': (payload: ElementDragEventData) => void
'element:dragmove': (payload: ElementDragEventData) => void
'element:dragend': (payload: ElementDragEventData) => void
```

---

## 10. 参考实现

| 插件 | Shape 路径 | 结构 |
|------|-----------|------|
| rect | `src/plugins/rect/Shape.vue` | 单 `v-rect` |
| line | `src/plugins/line/Shape.vue` | `v-group` + 子节点 |
| text | `src/plugins/text/Shape.vue` | 单 `v-text` |
| qrcode | `src/plugins/qrcode/Shape.vue` | `v-group` + 子节点 |
| barcode | `src/plugins/barcode/Shape.vue` | `v-group` + 子节点 |
