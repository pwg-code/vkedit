<template>
  <div class="vkedit-layer-panel" @contextmenu.prevent>
    <!-- 区块分隔标题 -->
    <div class="vkedit-layer-panel__header">
      <span class="vkedit-layer-panel__divider"></span>
      <span class="vkedit-layer-panel__title">图层管理</span>
      <span class="vkedit-layer-panel__divider"></span>
    </div>

    <!-- 空占位 -->
    <div v-if="elementsList.length === 0" class="vkedit-layer-panel__empty">
      当前画布没有图形元素
    </div>

    <!-- 图层列表（独立滚动） -->
    <div v-else ref="listRef" class="vkedit-layer-panel__list" @pointermove="onListPointerMove">
      <div v-if="dragOverIndex === 0" class="vkedit-layer-indicator vkedit-layer-indicator--top"></div>
      <div
        v-for="(el, index) in elementsList"
        :key="el.id"
        :data-id="el.id"
        class="vkedit-layer-row"
        :class="{
          'vkedit-layer-row--selected': isSelected(el.id),
          'vkedit-layer-row--hidden': !el.visible,
          'vkedit-layer-row--locked': el.locked,
          'vkedit-layer-row--dragging': draggingIds.includes(el.id),
        }"
        @click.stop="handleClick(el)"
        @dblclick.stop="handleDblClick(el)"
        @contextmenu.prevent.stop="openMenu($event, el)"
      >
        <div
          class="vkedit-layer-row__handle"
          title="拖动调整层级"
          @pointerdown.stop="startDrag(el, $event)"
        >
          <IconDragIndicator width="20" />
        </div>

        <component :is="getTypeIcon(el.type)" width="20" class="vkedit-layer-row__type" />

        <input
          v-if="renamingId === el.id"
          ref="renameInputEl"
          v-model="renameInput"
          class="vkedit-layer-row__rename-input"
          :maxlength="50"
          placeholder="留空将使用自动命名"
          @keydown.enter.prevent="commitRename"
          @keydown.escape.prevent="cancelRename"
          @blur="commitRename"
        />
        <span
          v-else
          class="vkedit-layer-row__name"
          :title="getDisplayName(el)"
          @dblclick.stop="startRenaming(el)"
        >{{ getDisplayName(el) }}</span>

        <div class="vkedit-layer-row__actions">
          <button
            class="vkedit-layer-row__btn"
            :class="{ 'vkedit-layer-row__btn--active': el.locked }"
            :title="el.locked ? '解锁' : '锁定'"
            @click.stop="toggleLock(el)"
          >
            <IconLock v-if="el.locked" width="26" />
            <IconLockOpenRight v-else width="26" />
          </button>
          <button
            class="vkedit-layer-row__btn"
            :class="{ 'vkedit-layer-row__btn--active': !el.visible }"
            :title="el.visible ? '隐藏' : '显示'"
            @click.stop="toggleVisible(el)"
          >
            <IconVisibility v-if="el.visible" width="26" />
            <IconVisibilityOff v-else width="26" />
          </button>
          <button
            class="vkedit-layer-row__btn"
            title="更多操作"
            @click.stop="openMenuBtn($event, el)"
          >
            <IconMoreVert width="26" />
          </button>
        </div>

        <div
          v-if="dragOverIndex === index + 1"
          class="vkedit-layer-indicator vkedit-layer-indicator--bottom"
        ></div>
      </div>
    </div>

    <!-- 右键/操作菜单 -->
    <teleport to="body">
      <div
        v-if="menu.open"
        class="vkedit-layer-menu"
        :style="{ left: `${menu.x}px`, top: `${menu.y}px` }"
        @click.stop
        @contextmenu.prevent.stop
      >
        <button class="vkedit-layer-menu__item" @click="menuAction('top')">
          <IconVerticalAlignTop width="16" />
          <span>置顶</span>
        </button>
        <button class="vkedit-layer-menu__item" @click="menuAction('up')">
          <IconArrowUpward width="16" />
          <span>上移一层</span>
        </button>
        <button class="vkedit-layer-menu__item" @click="menuAction('down')">
          <IconArrowDownward width="16" />
          <span>下移一层</span>
        </button>
        <button class="vkedit-layer-menu__item" @click="menuAction('bottom')">
          <IconVerticalAlignBottom width="16" />
          <span>置底</span>
        </button>
        <div class="vkedit-layer-menu__divider"></div>
        <button class="vkedit-layer-menu__item" @click="rename()">
          <IconEdit width="16" />
          <span>重命名</span>
        </button>
        <button class="vkedit-layer-menu__item" @click="duplicate()">
          <IconContentCopy width="16" />
          <span>复制</span>
        </button>
        <button class="vkedit-layer-menu__item" @click="remove()">
          <IconDelete width="16" />
          <span>删除</span>
        </button>
      </div>
    </teleport>

    <!-- 拖拽幽灵：跟随光标显示被拖元素的副本 -->
    <teleport to="body">
      <div
        v-if="dragGhost?.visible"
        class="vkedit-layer-ghost"
        :style="{ left: `${dragGhost.x}px`, top: `${dragGhost.y}px` }"
      >
        <component :is="getTypeIcon(dragGhost.type)" width="20" />
        <span class="vkedit-layer-ghost__name">{{ dragGhost.label }}</span>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { Component } from 'vue'
import type { EditorHost } from '@/core'
import type { LayerManagerPlugin } from './layer-manager'
import type { IGraphicElement } from '@/types'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import type { SelectionPlugin, ClipboardPlugin } from '@/plugins'
import { RemoveElementCommand, BatchCommand } from '@/commands'
import { EventUtils } from '@/types/event-data'
import IconDragIndicator from '~icons/material-symbols-light/drag-indicator'
import IconMoreVert from '~icons/material-symbols-light/more-vert'
import IconVerticalAlignTop from '~icons/material-symbols-light/vertical-align-top'
import IconArrowUpward from '~icons/material-symbols-light/arrow-upward'
import IconArrowDownward from '~icons/material-symbols-light/arrow-downward'
import IconVerticalAlignBottom from '~icons/material-symbols-light/vertical-align-bottom'
import IconEdit from '~icons/material-symbols-light/edit'
import IconContentCopy from '~icons/material-symbols-light/content-copy'
import IconDelete from '~icons/material-symbols-light/delete'
import IconLock from '~icons/material-symbols-light/lock'
import IconLockOpenRight from '~icons/material-symbols-light/lock-open-right'
import IconVisibility from '~icons/material-symbols-light/visibility'
import IconVisibilityOff from '~icons/material-symbols-light/visibility-off'
import IconCircle from '~icons/material-symbols-light/circle'

const props = defineProps<{
  host: EditorHost
}>()

const elementsPlugin = props.host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
const layerPlugin = props.host.getPlugin('layer-manager-plugin') as LayerManagerPlugin
const selectionPlugin = props.host.getPlugin('selection-plugin') as SelectionPlugin
const clipboardPlugin = props.host.getPlugin('clipboard-plugin') as ClipboardPlugin

function getTypeIcon(type: string): Component {
  return elementsPlugin.getTypeMeta(type)?.iconComponent ?? IconCircle
}

const listRef = ref<HTMLElement | null>(null)
// 主动刷新触发器；监听相关事件后递增以让 computed 重新求值
const refreshKey = ref(0)
const bumpRefresh = () => {
  refreshKey.value++
}
// 拖拽期间内不刷新（避免重排序打断视觉指示）
const isDragging = ref(false)

const dragGhost = ref<{
  visible: boolean
  x: number
  y: number
  label: string
  type: string
} | null>(null)

// 行内重命名
const renamingId = ref<string | null>(null)
const renameInput = ref('')
const renameInputEl = ref<HTMLInputElement | null>(null)

// 显示列表：顶层在前（数组顺序自上而下 = zIndex 降序）
const elementsList = computed<IGraphicElement[]>(() => {
  void refreshKey.value
  return elementsPlugin.getOrderedElements()
})

onMounted(() => {
  props.host.on('element:added', bumpRefresh)
  props.host.on('element:removed', bumpRefresh)
  props.host.on('elements:reorder', bumpRefresh)
  props.host.on('elements:layer', bumpRefresh)
  props.host.on('element:updated', bumpRefresh)
  props.host.on('selection:changed', bumpRefresh)
  props.host.on('host:status-restored', bumpRefresh)
  document.addEventListener('pointerup', endDrag, { passive: true })
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  props.host.off('element:added', bumpRefresh)
  props.host.off('element:removed', bumpRefresh)
  props.host.off('elements:reorder', bumpRefresh)
  props.host.off('elements:layer', bumpRefresh)
  props.host.off('element:updated', bumpRefresh)
  props.host.off('selection:changed', bumpRefresh)
  props.host.off('host:status-restored', bumpRefresh)
  document.removeEventListener('pointerup', endDrag)
  document.removeEventListener('click', closeMenu)
})

function getDisplayName(el: IGraphicElement): string {
  return layerPlugin.getElementDisplayName(el)
}

// ---------- 选中联动 ----------
function isSelected(id: string): boolean {
  return selectionPlugin.getSelectionElementIds().includes(id)
}
function selectSingle(el: IGraphicElement) {
  // 复用 selection-plugin 已有 API：清空再设置 + 主动 emit 让面板刷新
  selectionPlugin.clearSelection()
  selectionPlugin.selectElementByIds([el.id])
  props.host.emit('selection:changed', {
    ...EventUtils.createBaseEventData('layer-panel'),
    selection: selectionPlugin.getSelectionElements(),
  })
}

function handleClick(el: IGraphicElement) {
  if (dragJustEnded.value) return
  if (!el.visible) {
    // 隐藏元素：仅更新选中态，不强制把它加进 transformer 节点
    selectionPlugin.clearSelection()
    selectionPlugin.selectElementByIds([el.id])
    props.host.emit('selection:changed', {
      ...EventUtils.createBaseEventData('layer-panel'),
      selection: selectionPlugin.getSelectionElements(),
    })
    return
  }
  selectSingle(el)
}

function handleDblClick(el: IGraphicElement) {
  // 双击 = 选中 + 模拟画布双击，便于宿主/属性面板感知
  selectSingle(el)
  props.host.emit('stage:dblclick', {
    point: { x: 0, y: 0 },
    target: null,
    currentTarget: null,
    pointerId: -1,
    type: 'dblclick',
    evt: new MouseEvent('dblclick'),
    element: el,
    elementId: el.id,
    ...EventUtils.createBaseEventData('layer-panel'),
  })
}

// ---------- 锁定 / 可见性 ----------
function toggleLock(el: IGraphicElement) {
  el.updateProperty(props.host, 'locked', el.locked, !el.locked)
  // emit element:locked-change 通知外部
  props.host.emit('element:locked-change', {
    element: el,
    elementId: el.id,
    ...EventUtils.createBaseEventData('layer-panel'),
  })
  bumpRefresh()
}
function toggleVisible(el: IGraphicElement) {
  el.updateProperty(props.host, 'visible', el.visible, !el.visible)
  props.host.emit('element:visibility-change', {
    element: el,
    elementId: el.id,
    ...EventUtils.createBaseEventData('layer-panel'),
  })
  bumpRefresh()
}

// ---------- 拖拽调整层级 ----------
// 拖拽中的元素 id 集合（支持多选组拖）
const draggingIds = ref<string[]>([])
// 插入指示线目标位置：0..元素总数（dragOverIndex=N 表示置底）
const dragOverIndex = ref<number | null>(null)
const dragJustEnded = ref(false)

// 单拖时记录该元素；多拖时按 selection 已选集，组内按显示顺序保持
function startDrag(el: IGraphicElement, evt: PointerEvent) {
  // 锁定元素仍允许拖动调整层级（按计划 §4 #4）
  evt.preventDefault()
  isDragging.value = true
  dragJustEnded.value = false
  const selectionIds = selectionPlugin.getSelectionElementIds()
  if (selectionIds.includes(el.id) && selectionIds.length > 1) {
    // 多选拖拽：取出 selection 中当前在显示列表内的元素，按显示顺序保持
    const set = new Set(selectionIds)
    draggingIds.value = elementsList.value.filter((e) => set.has(e.id)).map((e) => e.id)
  } else {
    draggingIds.value = [el.id]
  }
  // 立即计算初始插入位置
  updateDragOverIndex(evt.clientY)
  // 持续监听全局 pointermove 以更新指示
  document.addEventListener('pointermove', onGlobalPointerMove)

  // 初始化拖拽幽灵
  if (draggingIds.value.length > 0) {
    const primaryId = draggingIds.value[0]
    const primary = elementsList.value.find((e) => e.id === primaryId)
    if (primary) {
      dragGhost.value = {
        visible: true,
        x: evt.clientX + 12,
        y: evt.clientY + 4,
        label: getDisplayName(primary),
        type: primary.type,
      }
    }
  }
}

function onGlobalPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  if (dragGhost.value) {
    dragGhost.value = {
      ...dragGhost.value,
      x: e.clientX + 12,
      y: e.clientY + 4,
    }
  }
  updateDragOverIndex(e.clientY)
}

function onListPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  updateDragOverIndex(e.clientY)
}

function updateDragOverIndex(clientY: number) {
  const rows = listRef.value?.querySelectorAll('.vkedit-layer-row') ?? []
  if (rows.length === 0) {
    dragOverIndex.value = 0
    return
  }
  for (let i = 0; i < rows.length; i++) {
    const r = (rows[i] as HTMLElement).getBoundingClientRect()
    if (clientY < r.top + r.height / 2) {
      dragOverIndex.value = i
      return
    }
  }
  dragOverIndex.value = rows.length
}

function endDrag() {
  if (!isDragging.value) return
  document.removeEventListener('pointermove', onGlobalPointerMove)
  const draggedIds = draggingIds.value
  const overIndex = dragOverIndex.value
  isDragging.value = false
  draggingIds.value = []
  dragOverIndex.value = null
  dragGhost.value = null

  if (draggedIds.length === 0 || overIndex === null) {
    return
  }

  // 计算新顺序：从当前显示列表中移除 dragged，按 dragOverIndex 推算插入槽位
  const currentIds = elementsList.value.map((e) => e.id)
  const draggedSet = new Set(draggedIds)
  // 在 dragOverIndex 之前有多少"非拖拽"元素 → 这就是 remaining 中的插入位置
  let insInRem = 0
  for (let i = 0; i < overIndex; i++) {
    if (!draggedSet.has(currentIds[i])) insInRem++
  }
  const remaining = currentIds.filter((id) => !draggedSet.has(id))
  const newOrder = [...remaining.slice(0, insInRem), ...draggedIds, ...remaining.slice(insInRem)]

  // 与原顺序相同时不入栈
  const same = newOrder.length === currentIds.length && newOrder.every((id, i) => id === currentIds[i])
  if (!same) {
    layerPlugin.reorder(newOrder)
  }

  // 用于阻止 click 事件覆盖选择切换
  dragJustEnded.value = true
  setTimeout(() => (dragJustEnded.value = false), 50)
}

// ---------- 右键/操作菜单 ----------
const menu = ref<{ open: boolean; x: number; y: number; element: IGraphicElement | null }>({
  open: false,
  x: 0,
  y: 0,
  element: null,
})

function openMenu(evt: MouseEvent, el: IGraphicElement) {
  menu.value = { open: true, x: evt.clientX, y: evt.clientY, element: el }
}
function openMenuBtn(evt: MouseEvent, el: IGraphicElement) {
  // "⋯" 按钮下方弹层
  const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect()
  menu.value = {
    open: true,
    x: rect.right,
    y: rect.bottom + 4,
    element: el,
  }
}
function closeMenu() {
  menu.value.open = false
}

function menuAction(direction: 'up' | 'down' | 'top' | 'bottom') {
  const el = menu.value.element
  menu.value.open = false
  if (!el) return
  layerPlugin.moveLayer(el.id, direction)
}

function duplicate() {
  const el = menu.value.element
  menu.value.open = false
  if (!el) return
  // 复用 clipboard 机制：先复制再粘贴，新副本 zIndex 自动置顶
  clipboardPlugin.copy([el])
  clipboardPlugin.paste()
}

function remove() {
  const el = menu.value.element
  menu.value.open = false
  if (!el) return
  // 多选时一次性删除批量入栈为一条 BatchCommand
  const selection = selectionPlugin.getSelectionElements()
  const targets = selection.length > 0 && selection.some((e) => e.id === el.id) ? selection : [el]
  const cmds = targets.map((e) => new RemoveElementCommand(props.host, e))
  if (cmds.length === 1) {
    props.host.executeCommand(cmds[0])
  } else {
    props.host.executeCommand(new BatchCommand(props.host, cmds, `批量删除 ${cmds.length} 个元素`))
  }
}

function rename() {
  const el = menu.value.element
  menu.value.open = false
  if (!el) return
  startRenaming(el)
}

function startRenaming(el: IGraphicElement) {
  renamingId.value = el.id
  renameInput.value = layerPlugin.getElementDisplayName(el)
  nextTick(() => {
    renameInputEl.value?.focus()
    renameInputEl.value?.select()
  })
}

function commitRename() {
  if (!renamingId.value) return
  const element = elementsList.value.find((e) => e.id === renamingId.value)
  if (!element) {
    renamingId.value = null
    return
  }
  const raw = renameInput.value.trim()
  const next = raw.length === 0 ? null : raw.slice(0, 50)
  if (element.displayName !== next) {
    element.updateProperty(props.host, 'displayName', element.displayName, next)
  }
  renamingId.value = null
}

function cancelRename() {
  renamingId.value = null
}
</script>

<style scoped lang="scss">
.vkedit-layer-panel {
  display: flex;
  flex-direction: column;
  gap: var(--vkedit-spacing-xs);
  color: var(--vkedit-color-text-dark);
  font-size: var(--vkedit-font-size-xs);
  user-select: none;
  position: relative;
}

.vkedit-layer-panel__header {
  display: flex;
  align-items: center;
  gap: var(--vkedit-spacing-sm);
  padding: var(--vkedit-spacing-xs) 0;
  color: var(--vkedit-color-text-dark-secondary);
}

.vkedit-layer-panel__title {
  font-size: var(--vkedit-font-size-xs);
  font-weight: var(--vkedit-font-weight-bold);
  white-space: nowrap;
}

.vkedit-layer-panel__divider {
  flex: 1;
  height: 1px;
  background: var(--vkedit-color-border-dark);
}

.vkedit-layer-panel__empty {
  padding: var(--vkedit-spacing-md) var(--vkedit-spacing-sm);
  color: var(--vkedit-color-text-dark-secondary);
  text-align: center;
  font-size: var(--vkedit-font-size-xs);
  opacity: 0.6;
}

.vkedit-layer-panel__list {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

.vkedit-layer-row {
  display: flex;
  align-items: center;
  gap: var(--vkedit-spacing-sm);
  height: 36px;
  padding: 0 var(--vkedit-spacing-sm);
  border-radius: var(--vkedit-radius-sm);
  cursor: pointer;
  position: relative;
  transition: background 100ms ease, transform 200ms ease;

  &:hover {
    background: var(--vkedit-color-bg-dark-hover);
  }

  &--selected {
    outline: 1px solid var(--vkedit-color-border-dark-hover);
    background: var(--vkedit-color-bg-dark-active);
  }

  &--hidden {
    opacity: 0.5;
  }

  &--locked .vkedit-layer-row__handle {
    color: var(--vkedit-color-text-dark-secondary);
  }

  &--dragging {
    opacity: 0.5;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45));
  }
}

.vkedit-layer-row__handle {
  display: flex;
  align-items: center;
  cursor: grab;
  color: var(--vkedit-color-text-dark-secondary);
  &:hover {
    color: var(--vkedit-color-text-dark);
  }
}

.vkedit-layer-row__type {
  flex-shrink: 0;
  color: var(--vkedit-color-text-dark-secondary);
}

.vkedit-layer-row__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--vkedit-font-size-xs);
}

.vkedit-layer-row__rename-input {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 4px;
  background: var(--vkedit-color-bg-dark-active);
  border: 1px solid var(--vkedit-color-border-dark-hover);
  border-radius: var(--vkedit-radius-sm);
  color: var(--vkedit-color-text-dark);
  font-size: var(--vkedit-font-size-xs);
  outline: none;
}

.vkedit-layer-row__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 100ms ease;
  .vkedit-layer-row:hover &,
  .vkedit-layer-row--selected & {
    opacity: 1;
  }
}

.vkedit-layer-row__btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--vkedit-radius-sm);
  cursor: pointer;
  color: var(--vkedit-color-text-dark-secondary);
  &:hover {
    background: var(--vkedit-color-bg-dark-hover);
    color: var(--vkedit-color-text-dark);
  }
  &--active {
    color: var(--vkedit-color-text-dark);
  }
}

/* 拖拽指示线 */
.vkedit-layer-indicator {
  position: absolute;
  left: var(--vkedit-spacing-sm);
  right: var(--vkedit-spacing-sm);
  height: 2px;
  border-radius: 1px;
  background: var(--vkedit-color-border-dark-hover);
  box-shadow: 0 0 6px var(--vkedit-color-border-dark-hover);
  z-index: 2;
  pointer-events: none;
  animation: vkedit-layer-indicator-fade-in 120ms ease-out;
}
.vkedit-layer-indicator--top {
  top: 0;
}
.vkedit-layer-indicator--bottom {
  bottom: 0;
}

@keyframes vkedit-layer-indicator-fade-in {
  from { opacity: 0; transform: scaleX(0.4); }
  to   { opacity: 1; transform: scaleX(1); }
}

/* 右键/操作菜单（teleport 到 body） */
.vkedit-layer-menu {
  position: fixed;
  z-index: 1000;
  min-width: 140px;
  padding: 4px;
  background: var(--vkedit-color-panel-bg);
  backdrop-filter: var(--vkedit-blur-panel);
  -webkit-backdrop-filter: var(--vkedit-blur-panel);
  border: 1px solid var(--vkedit-color-border-dark);
  border-radius: var(--vkedit-radius-sm);
  box-shadow: var(--vkedit-shadow-panel);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vkedit-layer-menu__item {
  display: flex;
  align-items: center;
  gap: var(--vkedit-spacing-sm);
  padding: 8px var(--vkedit-spacing-sm);
  background: transparent;
  border: none;
  border-radius: var(--vkedit-radius-sm);
  cursor: pointer;
  color: var(--vkedit-color-text-dark);
  font-size: var(--vkedit-font-size-xs);
  text-align: left;
  &:hover {
    background: var(--vkedit-color-bg-dark-hover);
  }
}

.vkedit-layer-menu__divider {
  height: 1px;
  margin: 2px 0;
  background: var(--vkedit-color-border-dark);
}

/* 拖拽幽灵 */
.vkedit-layer-ghost {
  position: fixed;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: var(--vkedit-spacing-sm);
  height: 32px;
  padding: 0 var(--vkedit-spacing-sm);
  min-width: 160px;
  max-width: 280px;
  background: var(--vkedit-color-panel-bg);
  backdrop-filter: var(--vkedit-blur-panel);
  -webkit-backdrop-filter: var(--vkedit-blur-panel);
  border: 1px solid var(--vkedit-color-border-dark-hover);
  border-radius: var(--vkedit-radius-sm);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.45);
  color: var(--vkedit-color-text-dark);
  font-size: var(--vkedit-font-size-xs);
  pointer-events: none;
  user-select: none;
  transform: translateY(-50%);
  transition: opacity 100ms ease;
}

.vkedit-layer-ghost__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>