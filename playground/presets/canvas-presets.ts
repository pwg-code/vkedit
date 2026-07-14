export interface CanvasPreset {
  key: string
  name: string
  width: number // mm
  height: number // mm
  dpm: number
}

export const canvasPresets: CanvasPreset[] = [
  { key: 'a4-portrait', name: 'A4 竖版', width: 210, height: 297, dpm: 8 },
  { key: 'a5-portrait', name: 'A5 竖版', width: 148, height: 210, dpm: 8 },
  { key: 'business-card', name: '名片', width: 90, height: 54, dpm: 8 },
  { key: 'label', name: '标签', width: 40, height: 30, dpm: 8 },
  { key: 'receipt', name: '票据', width: 80, height: 100, dpm: 8 },
  { key: 'certificate', name: '证书（A4 横版）', width: 297, height: 210, dpm: 8 },
]
