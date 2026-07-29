import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { EditorHost } from '@/core'
import type { IGraphicElement } from '@/types'
import { useZoom } from '@/hooks/use-zoom'
import { cssColorVar } from '@/utils/css-var'
import {
  getElementOBBFromSource,
  obbToViewport,
  getSelectionUnionRect,
  rectToViewport,
  viewportToContent,
  formatRotationLabel,
  type ViewportTransform,
  type OBB,
} from '@/utils/transform-geometry'
import {
  TRANSFORM_OVERLAY_CONSTANTS as C,
  layoutAnchors,
  layoutRotateHandle,
  resolveEnabledAnchors,
  resolveShowRotate,
  hitTestTransformOverlay,
  cursorForHitZone,
  type AnchorId,
  type HitZone,
} from '@/utils/transform-overlay'
import type { SelectionPlugin } from '@/plugins/selection'
import type { ClipboardPlugin } from '@/plugins/clipboard'
import type { SnapPlugin } from '@/plugins/snap/snap'
import { BatchCommand, TransformElementCommand } from '@/commands'
import type { ElementDragEventData } from '@/types/event-data'

export interface OverlayAnchorView {
  id: string
  x: number
  y: number
  size: number
}

export interface OverlayViewModel {
  visible: boolean
  mode: 'single' | 'multi'
  border: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    stroke: string
    strokeWidth: number
  } | null
  anchors: OverlayAnchorView[]
  rotateHandle: { x: number; y: number; radius: number } | null
  rotateStem: { points: number[]; stroke: string; strokeWidth: number } | null
}

export function useTransformOverlay(host: EditorHost) {
  const selectedElements = ref<IGraphicElement[]>([])
  const tick = ref(0)

  const { contentX, contentY, zoom } = useZoom(host)

  const vp = () => ({ contentX: contentX.value, contentY: contentY.value, zoom: zoom.value })

  const overlay = computed<OverlayViewModel>(() => {
    void tick.value
    void contentX.value
    void contentY.value
    void zoom.value

    const elements = selectedElements.value
    if (elements.length === 0) {
      return {
        visible: false,
        mode: 'single',
        border: null,
        anchors: [],
        rotateHandle: null,
        rotateStem: null,
      }
    }

    const stroke = cssColorVar('--vkedit-color-primary', host.stageState.wrapperEl)
    const vp: ViewportTransform = {
      contentX: contentX.value,
      contentY: contentY.value,
      zoom: zoom.value,
    }

    if (elements.length === 1) {
      const el = elements[0]
      const node = getElementNode(el.id)
      const obb = getElementOBBFromSource(el, node)
      const obbVp = obbToViewport(obb, vp)

      const enabledAnchors = resolveEnabledAnchors(el)
      const showRotate = resolveShowRotate(el)

      const anchors = layoutAnchors(obbVp, enabledAnchors)
      const anchorViews: OverlayAnchorView[] = anchors.map((a) => ({
        id: a.id,
        x: a.x,
        y: a.y,
        size: C.ANCHOR_SIZE,
      }))

      let rotateHandleView: { x: number; y: number; radius: number } | null = null
      let rotateStemView: { points: number[]; stroke: string; strokeWidth: number } | null = null

      if (showRotate) {
        const rh = layoutRotateHandle(obbVp)
        const [TL, TR] = obbVp.corners
        const topMidX = (TL.x + TR.x) / 2
        const topMidY = (TL.y + TR.y) / 2
        rotateHandleView = {
          x: rh.x,
          y: rh.y,
          radius: C.ROTATE_HANDLE_RADIUS,
        }
        rotateStemView = {
          points: [topMidX, topMidY, rh.x, rh.y],
          stroke,
          strokeWidth: 1,
        }
      }

      return {
        visible: true,
        mode: 'single',
        border: {
          x: obbVp.corners[0].x,
          y: obbVp.corners[0].y,
          width: obbVp.width,
          height: obbVp.height,
          rotation: obbVp.rotation,
          stroke,
          strokeWidth: C.BORDER_STROKE_WIDTH,
        },
        anchors: anchorViews,
        rotateHandle: rotateHandleView,
        rotateStem: rotateStemView,
      }
    }

    const unionRect = getSelectionUnionRect(
      elements.map((e) => {
        const n = getElementNode(e.id)
        if (n) {
          return {
            x: n.x(),
            y: n.y(),
            width: e.width,
            height: e.height,
            rotation: n.rotation(),
            scaleX: n.scaleX(),
            scaleY: n.scaleY(),
          }
        }
        return {
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          scaleX: e.scaleX,
          scaleY: e.scaleY,
        }
      }),
    )
    if (!unionRect) {
      return {
        visible: false,
        mode: 'multi',
        border: null,
        anchors: [],
        rotateHandle: null,
        rotateStem: null,
      }
    }

    const rectVp = rectToViewport(unionRect, vp)

    return {
      visible: true,
      mode: 'multi',
      border: {
        x: rectVp.x,
        y: rectVp.y,
        width: rectVp.width,
        height: rectVp.height,
        rotation: 0,
        stroke,
        strokeWidth: C.BORDER_STROKE_WIDTH,
      },
      anchors: [],
      rotateHandle: null,
      rotateStem: null,
    }
  })

  const getElementNode = (id: string) => {
    try {
      return host.contentLayer?.getNode?.().findOne?.('#' + id) ?? null
    } catch {
      return null
    }
  }

  const refreshOverlay = () => {
    tick.value++
  }

  const handleSelectionChanged = (event: any) => {
    selectedElements.value = event.selection || []
  }

  const handleElementsAlign = () => {
    selectedElements.value = [...selectedElements.value]
  }

  const handleElementUpdated = () => {
    selectedElements.value = [...selectedElements.value]
  }

  const onDragMove = () => refreshOverlay()

  onMounted(() => {
    const selectionPlugin = host.getPlugin<SelectionPlugin>('selection-plugin')
    selectedElements.value = selectionPlugin.getSelectionElements()

    host.on('selection:changed', handleSelectionChanged)
    host.on('element:updated', handleElementUpdated)
    host.on('elements:align', handleElementsAlign)
    host.on('elements:distribute', handleElementsAlign)
    host.on('element:dragmove', onDragMove)
    host.on('element:dragstart', onDragMove)
    host.on('element:dragend', onDragMove)
    host.on('element:transformed', onDragMove)
    host.on('command:undone', onDragMove)
    host.on('command:redone', onDragMove)
    host.on('stage:mousemove', onStagePointerMove)
  })

  onUnmounted(() => {
    host.off('selection:changed', handleSelectionChanged)
    host.off('element:updated', handleElementUpdated)
    host.off('elements:align', handleElementsAlign)
    host.off('elements:distribute', handleElementsAlign)
    host.off('element:dragmove', onDragMove)
    host.off('element:dragstart', onDragMove)
    host.off('element:dragend', onDragMove)
    host.off('element:transformed', onDragMove)
    host.off('command:undone', onDragMove)
    host.off('command:redone', onDragMove)
    host.off('stage:mousemove', onStagePointerMove)
  })

  interface ResizeSession {
    kind: 'resize'
    element: IGraphicElement
    anchor: AnchorId
    oldAttrs: { x: number; y: number; width: number; height: number; rotation: number; scaleX: number; scaleY: number }
    startContent: { x: number; y: number }
    startOBB: { x: number; y: number; width: number; height: number; rotation: number }
  }

  interface RotateSession {
    kind: 'rotate'
    element: IGraphicElement
    oldAttrs: { x: number; y: number; width: number; height: number; rotation: number; scaleX: number; scaleY: number }
    center: { x: number; y: number }
    startPointerDeg: number
    startRotation: number
  }

  interface MoveSession {
    kind: 'move'
    elements: IGraphicElement[]
    startPositions: Map<string, { x: number; y: number }>
    startPointerContent: { x: number; y: number }
  }

  function canGroupMove(els: IGraphicElement[]): boolean {
    if (els.length === 0) return false
    return els.every((e) => e.draggable !== false && !e.locked)
  }

  let session: (ResizeSession | RotateSession | MoveSession) | null = null
  let _gestureStage: any = null
  let _lastMouseUpAltKey = false

  const cursor = ref<string>('default')

  const angleLabel = ref<{ x: number; y: number; text: string } | null>(null)

  function resizeWithAnchor(
    start: { x: number; y: number; width: number; height: number; rotation: number },
    anchor: AnchorId,
    pointerContent: { x: number; y: number },
    minSize: number,
  ): { x: number; y: number; width: number; height: number } {
    const rad = (start.rotation * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    const toLocal = (px: number, py: number) => {
      const dx = px - start.x
      const dy = py - start.y
      return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos }
    }

    const p = toLocal(pointerContent.x, pointerContent.y)
    let left = 0
    let top = 0
    let right = start.width
    let bottom = start.height

    const isCorner = anchor === 'top-left' || anchor === 'top-right' || anchor === 'bottom-left' || anchor === 'bottom-right'

    if (isCorner) {
      const ar = start.width / start.height
      let fx: number, fy: number, dx: number, dy: number
      switch (anchor) {
        case 'top-left':
          fx = start.width; fy = start.height; dx = -ar; dy = -1; break
        case 'top-right':
          fx = 0; fy = start.height; dx = ar; dy = -1; break
        case 'bottom-left':
          fx = start.width; fy = 0; dx = -ar; dy = 1; break
        case 'bottom-right':
          fx = 0; fy = 0; dx = ar; dy = 1; break
      }
      const vx = p.x - fx
      const vy = p.y - fy
      const denom = ar * ar + 1
      const t = Math.max(0, (vx * dx + vy * dy) / denom)
      const tMin = Math.max(minSize / ar, minSize)
      const tf = Math.max(t, tMin)
      left = Math.min(fx, fx + tf * dx)
      top = Math.min(fy, fy + tf * dy)
      right = Math.max(fx, fx + tf * dx)
      bottom = Math.max(fy, fy + tf * dy)
    } else {
      if (anchor.includes('left') || anchor === 'middle-left') left = p.x
      if (anchor.includes('right') || anchor === 'middle-right') right = p.x
      if (anchor.includes('top') || anchor === 'top-center') top = p.y
      if (anchor.includes('bottom') || anchor === 'bottom-center') bottom = p.y

      if (right - left < minSize) {
        if (anchor.includes('left') || anchor === 'middle-left') left = right - minSize
        else right = left + minSize
      }
      if (bottom - top < minSize) {
        if (anchor.includes('top') || anchor === 'top-center') top = bottom - minSize
        else bottom = top + minSize
      }
    }

    const x = start.x + left * cos - top * sin
    const y = start.y + left * sin + top * cos
    return { x, y, width: right - left, height: bottom - top }
  }

  function onOverlayPointerDown(e: any) {
    const els = selectedElements.value
    if (els.length === 0) return

    const stage = e.target?.getStage?.() ?? host.stage?.getNode?.() ?? host.stage
    const pointer = stage?.getPointerPosition?.()
    if (!pointer) return

    let zone: HitZone
    let showRotate = false
    let enabledAnchors: string[] | null = null
    let element: IGraphicElement | undefined
    let obbContent: OBB | undefined

    if (els.length === 1) {
      element = els[0]
      enabledAnchors = resolveEnabledAnchors(element)
      const canMove = element.draggable !== false && !element.locked
      showRotate = resolveShowRotate(element)
      if (!enabledAnchors && !canMove && !showRotate) return

      const node = getElementNode(element.id)
      obbContent = getElementOBBFromSource(element, node)
      const obbVp = obbToViewport(obbContent, vp())
      zone = hitTestTransformOverlay(pointer, {
        mode: 'single',
        bounds: obbVp,
        enabledAnchors,
        showRotate,
        canMove,
      })
    } else {
      const rect = overlay.value.border
      if (!rect) return
      const canMove = canGroupMove(els)
      zone = hitTestTransformOverlay(pointer, {
        mode: 'multi',
        bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        enabledAnchors: null,
        showRotate: false,
        canMove,
      })
    }

    if (zone.type === 'none') return

    e.cancelBubble = true

    if (zone.type === 'rotate') {
      _gestureStage = stage
      const center = { x: obbContent!.centerX, y: obbContent!.centerY }
      const pc = viewportToContent(pointer.x, pointer.y, vp())
      const startPointerDeg = (Math.atan2(pc.y - center.y, pc.x - center.x) * 180) / Math.PI
      session = {
        kind: 'rotate',
        element: element!,
        oldAttrs: {
          x: element!.x, y: element!.y,
          width: element!.width, height: element!.height,
          rotation: element!.rotation,
          scaleX: 1, scaleY: 1,
        },
        center,
        startPointerDeg,
        startRotation: element!.rotation,
      }
      window.addEventListener('mouseup', onWindowUp)
      window.addEventListener('mousemove', onWindowMove)
      return
    }

    if (zone.type === 'anchor') {
      _gestureStage = stage
      const startContent = viewportToContent(pointer.x, pointer.y, vp())
      session = {
        kind: 'resize',
        element: element!,
        anchor: zone.anchor,
        oldAttrs: {
          x: element!.x, y: element!.y,
          width: element!.width, height: element!.height,
          rotation: element!.rotation,
          scaleX: element!.scaleX, scaleY: element!.scaleY,
        },
        startContent,
        startOBB: {
          x: obbContent!.corners[0].x,
          y: obbContent!.corners[0].y,
          width: obbContent!.width,
          height: obbContent!.height,
          rotation: obbContent!.rotation,
        },
      }
      window.addEventListener('mouseup', onWindowUp)
      window.addEventListener('mousemove', onWindowMove)
      return
    }

    if (zone.type === 'move') {
      const pc = viewportToContent(pointer.x, pointer.y, vp())
      startMoveSession(pc)
    }
  }

  function onWindowMove(e: MouseEvent) {
    if (!session) return

    if (session.kind === 'move') {
      const s = session
      const stage = _gestureStage ?? host.stage?.getNode?.() ?? host.stage
      const pointer = stage?.getPointerPosition?.()
      if (!pointer) return
      const pc = viewportToContent(pointer.x, pointer.y, vp())
      const dx = pc.x - s.startPointerContent.x
      const dy = pc.y - s.startPointerContent.y

      // 1) 意图位置（未吸附）
      const intentPositions = new Map<string, { x: number; y: number }>()
      for (const el of s.elements) {
        const start = s.startPositions.get(el.id)!
        intentPositions.set(el.id, { x: start.x + dx, y: start.y + dy })
      }

      // 2) 吸附偏移（插件只算不写；无插件/关闭时为 0）
      let offsetX = 0
      let offsetY = 0
      try {
        const snapPlugin = host.getPlugin('snap-plugin') as SnapPlugin | undefined
        if (snapPlugin && typeof snapPlugin.resolveDragSnap === 'function') {
          const offset = snapPlugin.resolveDragSnap(s.elements, intentPositions)
          offsetX = offset.offsetX
          offsetY = offset.offsetY
        }
      } catch {
        // snap-plugin not installed
      }

      // 3) 单一写入口：model + node = intent + offset
      for (const el of s.elements) {
        const intent = intentPositions.get(el.id)!
        const nx = intent.x + offsetX
        const ny = intent.y + offsetY
        el.x = nx
        el.y = ny
        const node = getElementNode(el.id)
        if (node) {
          node.x(nx)
          node.y(ny)
        }
      }

      // 4) 先写位置再刷 Overlay（与吸附同帧）
      refreshOverlay()

      const mainEl = s.elements[0]
      const mainNode = getElementNode(mainEl.id)
      host.emit('element:dragmove', {
        element: mainEl,
        elementId: mainEl.id,
        target: mainNode,
        evt: e,
        source: 'transform-overlay',
        timestamp: Date.now(),
      } satisfies ElementDragEventData)
      return
    }

    if (session.kind === 'rotate') {
      const s = session
      const stage = _gestureStage ?? host.stage?.getNode?.() ?? host.stage
      const pointer = stage?.getPointerPosition?.()
      if (!pointer) return
      const pc = viewportToContent(pointer.x, pointer.y, vp())
      const deg = (Math.atan2(pc.y - s.center.y, pc.x - s.center.x) * 180) / Math.PI
      let newRot = s.startRotation + (deg - s.startPointerDeg)

      if (host.status.snapRotation) {
        newRot = Math.round(newRot / 5) * 5
      }

      const el = s.element
      const w = el.width * (el.scaleX || 1)
      const h = el.height * (el.scaleY || 1)
      const rad = (newRot * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const lx = w / 2
      const ly = h / 2
      const newX = s.center.x - (lx * cos - ly * sin)
      const newY = s.center.y - (lx * sin + ly * cos)

      el.rotation = newRot
      el.x = newX
      el.y = newY
      const node = getElementNode(el.id)
      if (node) {
        node.rotation(newRot)
        node.x(newX)
        node.y(newY)
      }

      angleLabel.value = {
        x: e.clientX + C.ANGLE_LABEL_OFFSET_X,
        y: e.clientY + C.ANGLE_LABEL_OFFSET_Y,
        text: formatRotationLabel(newRot),
      }
      cursor.value = 'grabbing'
      refreshOverlay()
      return
    }

    if (session.kind !== 'resize') return

    const stage = _gestureStage ?? host.stage?.getNode?.() ?? host.stage
    const pointer = stage?.getPointerPosition?.()
    if (!pointer) return

    const pc = viewportToContent(pointer.x, pointer.y, vp())
    const result = resizeWithAnchor(session.startOBB, session.anchor, pc, C.MIN_SIZE_PX)

    const el = session.element
    const node = getElementNode(el.id)
    el.width = result.width
    el.height = result.height
    el.x = result.x
    el.y = result.y
    el.scaleX = 1
    el.scaleY = 1
    if (node) {
      node.x(result.x)
      node.y(result.y)
      node.width(result.width)
      node.height(result.height)
      node.scaleX(1)
      node.scaleY(1)
    }
    refreshOverlay()
  }

  function onWindowUp(e: MouseEvent) {
    _lastMouseUpAltKey = e.altKey
    if (!session) return
    if (session.kind === 'move') endMove()
    else if (session.kind === 'resize') endResize()
    else if (session.kind === 'rotate') endRotate()
    session = null
    _gestureStage = null
    angleLabel.value = null
    cursor.value = 'default'
    window.removeEventListener('mouseup', onWindowUp)
    window.removeEventListener('mousemove', onWindowMove)
  }

  function endResize() {
    if (!session || session.kind !== 'resize') return
    const el = session.element
    const newAttrs = {
      x: el.x, y: el.y, width: el.width, height: el.height,
      scaleX: 1, scaleY: 1, rotation: el.rotation,
    }
    const old = session.oldAttrs
    const changed =
      newAttrs.x !== old.x || newAttrs.y !== old.y ||
      newAttrs.width !== old.width || newAttrs.height !== old.height
    if (changed) {
      host.executeCommand(new TransformElementCommand(host, el, old, newAttrs))
    }
  }

  function endRotate() {
    if (!session || session.kind !== 'rotate') return
    const el = session.element
    const newAttrs = {
      x: el.x, y: el.y, width: el.width, height: el.height,
      rotation: el.rotation, scaleX: 1, scaleY: 1,
    }
    const old = session.oldAttrs
    const changed = newAttrs.rotation !== old.rotation || newAttrs.x !== old.x || newAttrs.y !== old.y
    if (changed) {
      host.executeCommand(new TransformElementCommand(host, el, old, newAttrs))
    }
  }

  function startMoveSession(pointerContent: { x: number; y: number }) {
    const els = selectedElements.value.filter((e) => e.draggable !== false && !e.locked)
    if (!canGroupMove(selectedElements.value)) return

    const startPositions = new Map<string, { x: number; y: number }>()
    for (const e of els) {
      const node = getElementNode(e.id)
      startPositions.set(e.id, {
        x: node ? node.x() : e.x,
        y: node ? node.y() : e.y,
      })
    }
    session = {
      kind: 'move',
      elements: els,
      startPositions,
      startPointerContent: pointerContent,
    }
    _gestureStage = host.stage?.getNode?.() ?? host.stage
    window.addEventListener('mousemove', onWindowMove)
    window.addEventListener('mouseup', onWindowUp)
    const mainEl = session.elements[0]
    const mainNode = getElementNode(mainEl.id)
    host.emit('element:dragstart', {
      element: mainEl,
      elementId: mainEl.id,
      target: mainNode,
      evt: undefined,
      source: 'transform-overlay',
      timestamp: Date.now(),
    } satisfies ElementDragEventData)
  }

  function endMove() {
    if (!session || session.kind !== 'move') return

    if (_lastMouseUpAltKey) {
      const clipboard = host.getPlugin<ClipboardPlugin>('clipboard-plugin')
      if (clipboard && typeof clipboard.cloneElementsAt === 'function') {
        const releasePositions = new Map<string, { x: number; y: number }>()
        for (const e of session.elements) {
          releasePositions.set(e.id, { x: e.x, y: e.y })
        }
        for (const e of session.elements) {
          const start = session.startPositions.get(e.id)!
          e.x = start.x
          e.y = start.y
          const n = getElementNode(e.id)
          if (n) { n.x(start.x); n.y(start.y) }
        }
        const mainEl = session.elements[0]
        const mainStart = session.startPositions.get(mainEl.id)!
        const mainRelease = releasePositions.get(mainEl.id)!
        const deltaMM = {
          x: (mainRelease.x - mainStart.x) / host.status.dpm,
          y: (mainRelease.y - mainStart.y) / host.status.dpm,
        }
        clipboard.cloneElementsAt(session.elements, deltaMM)
      }
      return
    }

    const commands: TransformElementCommand[] = []
    for (const e of session.elements) {
      const start = session.startPositions.get(e.id)!
      const nx = e.x
      const ny = e.y
      if (nx === start.x && ny === start.y) continue
      commands.push(
        new TransformElementCommand(host, e, { x: start.x, y: start.y }, { x: nx, y: ny }),
      )
    }
    const mainEl = session.elements[0]
    const mainNode = getElementNode(mainEl.id)
    host.emit('element:dragend', {
      element: mainEl,
      elementId: mainEl.id,
      target: mainNode,
      evt: undefined,
      source: 'transform-overlay',
      timestamp: Date.now(),
    } satisfies ElementDragEventData)
    if (commands.length === 1) host.executeCommand(commands[0])
    else if (commands.length > 1) {
      host.executeCommand(new BatchCommand(host, commands, '\u591A\u9009\u62D6\u62FD'))
    }
  }

  const onOverlayPointerMove = () => {}
  const onOverlayPointerUp = () => {}

  function onStagePointerMove(e: any) {
    if (session) return
    const els = selectedElements.value
    if (els.length === 0) { cursor.value = 'default'; return }
    if (host.stageState.isPanning || host.stageState.spacePressed) { cursor.value = 'default'; return }

    const pointer = e.target?.getStage?.()?.getPointerPosition?.() ?? e.point
    if (!pointer) return

    if (els.length > 1) {
      const rect = overlay.value.border
      if (!rect) { cursor.value = 'default'; return }
      const canMove = canGroupMove(els)
      const zone = hitTestTransformOverlay(pointer, {
        mode: 'multi',
        bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        enabledAnchors: null,
        showRotate: false,
        canMove,
      })
      cursor.value = cursorForHitZone(zone, 0)
      return
    }

    if (els.length === 1) {
      const el = els[0]
      const node = getElementNode(el.id)
      const obbContent = getElementOBBFromSource(el, node)
      const obbVp = obbToViewport(obbContent, vp())
      const enabled = resolveEnabledAnchors(el)
      const canMove = el.draggable !== false && !el.locked
      const zone = hitTestTransformOverlay(pointer, {
        mode: 'single',
        bounds: obbVp,
        enabledAnchors: enabled,
        showRotate: true,
        canMove,
      })
      cursor.value = cursorForHitZone(zone, el.rotation)
    }
  }

  return {
    overlay,
    refreshOverlay,
    selectedElements,
    getElementNode,
    cursor,
    onOverlayPointerDown,
    onOverlayPointerMove,
    onOverlayPointerUp,
    onStagePointerMove,
    angleLabel,
  }
}
