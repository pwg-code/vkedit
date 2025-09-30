<template>
  <v-stage
    :config="stageSize"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @click="handleStageClick"
    ref="stageRef"
  >
    <v-layer ref="layerRef">
      <v-rect
        v-for="(rect, i) in rectangles"
        :key="i"
        :config="{
          ...rect,
          name: 'rect', // 与纯JavaScript版本的逻辑相匹配非常重要
          draggable: true
        }"
        @dragend="(e) => handleDragEnd(e, i)"
        @transformend="(e) => handleTransformEnd(e, i)"
        ref="rectRefs"
      />
      <v-transformer
        ref="transformerRef"
        :config="{
          boundBoxFunc: (oldBox, newBox) => {
            // 限制调整大小
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          },
        }"
      />
      <v-rect
        v-if="selectionRectangle.visible"
        :config="{
          x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
          y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
          width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
          height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
          fill: 'rgba(0,0,255,0.5)'
        }"
      />
    </v-layer>
  </v-stage>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue';

const stageSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const rectangles = ref([
  {
    x: 60,
    y: 60,
    width: 100,
    height: 90,
    fill: 'red',
    id: 'rect1',
    rotation: 0,
  },
  {
    x: 250,
    y: 100,
    width: 150,
    height: 90,
    fill: 'green',
    id: 'rect2',
    rotation: 0,
  },
]);

const selectedIds = ref([]);
const rectRefs = ref([]);
const transformerRef = ref(null);
const stageRef = ref(null);
const layerRef = ref(null);
const isSelecting = ref(false);
const selectionRectangle = reactive({
  visible: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
});

// 计算旋转矩形边界框的辅助函数
const degToRad = (angle) => (angle / 180) * Math.PI;

const getCorner = (pivotX, pivotY, diffX, diffY, angle) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

const getClientRect = (element) => {
  const { x, y, width, height, rotation = 0 } = element;
  const rad = degToRad(rotation);

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// 当选择变化时更新变换器节点
watch(selectedIds, () => {
  if (!transformerRef.value) return;
  
  const nodes = selectedIds.value.map(id => {
    return rectRefs.value.find(ref => ref.getNode().attrs.id === id)?.getNode();
  }).filter(Boolean);
  
  transformerRef.value.getNode().nodes(nodes);
});

const handleStageClick = (e) => {
  // 如果正在用矩形选择，则不做任何操作
  if (selectionRectangle.visible) {
    return;
  }

  // 如果点击空白区域 - 移除所有选择
  if (e.target === e.target.getStage()) {
    selectedIds.value = [];
    return;
  }

  // 如果点击的不是我们的矩形则不做任何操作
  if (!e.target.hasName('rect')) {
    return;
  }
  
  const clickedId = e.target.attrs.id;
  
  // 检查我们是否按下了shift或ctrl？
  const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
  const isSelected = selectedIds.value.includes(clickedId);

  if (!metaPressed && !isSelected) {
    // 如果没有按下任何键且节点未被选中
    // 仅选择一个
    selectedIds.value = [clickedId];
  } else if (metaPressed && isSelected) {
    // 如果我们按下了键且节点已被选中
    // 我们需要将其移除选择：
    selectedIds.value = selectedIds.value.filter(id => id !== clickedId);
  } else if (metaPressed && !isSelected) {
    // 将节点添加到选择中
    selectedIds.value = [...selectedIds.value, clickedId];
  }
};

const handleMouseDown = (e) => {
  // 如果在任何形状上按下鼠标，则不做任何操作
  if (e.target !== e.target.getStage()) {
    return;
  }
  
  // 开始选择矩形
  isSelecting.value = true;
  const pos = e.target.getStage().getPointerPosition();
  selectionRectangle.visible = true;
  selectionRectangle.x1 = pos.x;
  selectionRectangle.y1 = pos.y;
  selectionRectangle.x2 = pos.x;
  selectionRectangle.y2 = pos.y;
};

const handleMouseMove = (e) => {
  // 如果没有开始选择，则不做任何操作
  if (!isSelecting.value) {
    return;
  }
  
  const pos = e.target.getStage().getPointerPosition();
  selectionRectangle.x2 = pos.x;
  selectionRectangle.y2 = pos.y;
};

const handleMouseUp = () => {
  // 如果没有开始选择，则不做任何操作
  if (!isSelecting.value) {
    return;
  }
  
  isSelecting.value = false;
  
  // 在超时内更新可见性，以便我们可以在点击事件中检查
  setTimeout(() => {
    selectionRectangle.visible = false;
  });

  const selBox = {
    x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
    y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
    width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
    height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
  };

  const selected = rectangles.value.filter(rect => {
    // 检查矩形是否与选择框相交
    return Konva.Util.haveIntersection(selBox, getClientRect(rect));
  });
  
  selectedIds.value = selected.map(rect => rect.id);
};

const handleDragEnd = (e, index) => {
  const rects = [...rectangles.value];
  rects[index] = {
    ...rects[index],
    x: e.target.x(),
    y: e.target.y(),
  };
  rectangles.value = rects;
};

const handleTransformEnd = (e, index) => {
  const node = rectRefs.value[index].getNode();
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  node.scaleX(1);
  node.scaleY(1);
  
  const rects = [...rectangles.value];
  rects[index] = {
    ...rects[index],
    x: node.x(),
    y: node.y(),
    width: Math.max(5, node.width() * scaleX),
    height: Math.max(node.height() * scaleY),
    rotation: node.rotation(),
  };
  rectangles.value = rects;
};
</script>
