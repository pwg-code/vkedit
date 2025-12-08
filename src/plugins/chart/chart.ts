import { BasePlugin } from '../../types/base-plugin'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'

import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import type { EditorHost } from '@/core'
import type { EChartsOption } from 'echarts'

export interface ChartOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'candlestick'
  chartData?: any
  chartOptions?: EChartsOption
}

export class ChartElement extends BaseGraphicElement {
  public type = 'chart'
  public chartOptions: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true,
        symbol: 'none',
      },
    ],
  }

  constructor(host: EditorHost, options: Partial<ChartOptions> = {}) {
    super(host, {
      xmm: options.xmm ?? 5,
      ymm: options.ymm ?? 5,
      wmm: options.wmm ?? 50,
      hmm: options.hmm ?? 30,
      rotation: options.rotation,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      visible: options.visible,
      locked: options.locked,
      draggable: options.draggable,
      transferable: options.transferable,
    })
    this.chartOptions = options.chartOptions ?? this.chartOptions
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.chartOptions = data.chartOptions
  }

  serialize() {
    return {
      ...super.serialize(),
      chartOptions: this.chartOptions,
    }
  }
}

export class ChartPlugin extends BasePlugin {
  public name = 'chart-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return

    this.host.emit('graphic-tool:registered', {
      type: 'chart',
      render: () => Tool,
      source: 'chart-plugin-on-install',
      timestamp: Date.now(),
    })

    this.host.emit('graphic:registered', {
      type: 'chart',
      render: () => Shape,
      source: 'chart-plugin-on-install',
      timestamp: Date.now(),
    })

    this.host.emit('property-panel:registered', {
      graphicTypes: ['chart'],
      render: () => PropertyPanel,
      source: 'chart-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })

    this.host.emit('element:registered', {
      type: 'chart',
      createElement: () => new ChartElement(this.host),
      source: 'chart-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}
