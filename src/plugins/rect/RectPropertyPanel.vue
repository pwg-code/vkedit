<template>
  <div class="rect-property-panel">
    <h3>矩形属性</h3>

    <div class="property-group">
      <label>位置</label>

      <div class="property-row">
        <ElInputNumber label="X" :value="element.x" @change="updateProperty('x', $event)" />

        <ElInputNumber label="Y" :value="element.y" @change="updateProperty('y', $event)" />
      </div>
    </div>

    <div class="property-group">
      <label>尺寸</label>

      <div class="property-row">
        <ElInputNumber
          label="宽度"
          :value="element.width"
          @change="updateProperty('width', $event)"
        />

        <ElInputNumber
          label="高度"
          :value="element.height"
          @change="updateProperty('height', $event)"
        />
      </div>
    </div>

    <div class="property-group">
      <label>外观</label>

      <ColorInput label="填充颜色" :value="element.fill" @change="updateProperty('fill', $event)" />

      <ElColorPickerPanel
        label="边框颜色"
        :value="element.stroke"
        @change="updateProperty('stroke', $event)"
      />

      <ElInputNumber
        label="边框宽度"
        :value="element.strokeWidth"
        @change="updateProperty('strokeWidth', $event)"
      />

      <ElInputNumber
        label="圆角半径"
        :value="element.cornerRadius"
        @change="updateProperty('cornerRadius', $event)"
      />
    </div>

    <div class="property-group">
      <label>变换</label>

      <ElInputNumber
        label="旋转角度"
        :value="element.rotation"
        @change="updateProperty('rotation', $event)"
      />

      <div class="property-row">
        <ElInputNumber
          label="缩放X"
          :value="element.scaleX"
          @change="updateProperty('scaleX', $event)"
        />

        <ElInputNumber
          label="缩放Y"
          :value="element.scaleY"
          @change="updateProperty('scaleY', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RectElement } from './RectPlugin'
import { ElButton, ElInputNumber, ElColorPickerPanel } from 'element-plus'

interface Props {
  element: RectElement
}

const props = defineProps<Props>()

const updateProperty = (property: string, value: any) => {
  // 发送属性更新事件
  // 这里应该通过host的命令系统执行更新
}
</script>

<style scoped>
.rect-property-panel {
  padding: 12px;
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: block;

  font-weight: bold;

  margin-bottom: 8px;

  color: #2c3e50;
}

.property-row {
  display: flex;

  gap: 8px;
}
</style>
