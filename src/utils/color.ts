// ====== utils/color.ts ======
// 与本期需求相关的颜色工具：HEX 校验、规范化、WCAG 2.x 对比度计算。

const HEX_FULL_REGEX = /^#[0-9a-fA-F]{6}$/

/**
 * 判断输入是否是完整的 #RRGGBB 形式的 HEX 颜色
 */
export function isFullHexColor(value: unknown): boolean {
  return typeof value === 'string' && HEX_FULL_REGEX.test(value)
}

/**
 * 将任意输入规范化为小写 #rrggbb 形式的 HEX 字符串
 * @returns 规范化结果；输入不是合法完整 HEX 时返回 null
 */
export function normalizeHex(value: unknown): string | null {
  if (!isFullHexColor(value)) return null
  return (value as string).toLowerCase()
}

/**
 * 将 #rrggbb 形式的字符串拆分成 r/g/b 三个 0-255 的整数分量
 */
export function hexToRgb(hex: unknown): { r: number; g: number; b: number } | null {
  if (!isFullHexColor(hex)) return null
  const value = hex as string
  return {
    r: parseInt(value.slice(1, 3), 16),
    g: parseInt(value.slice(3, 5), 16),
    b: parseInt(value.slice(5, 7), 16),
  }
}

/**
 * WCAG 2.x sRGB 相对亮度
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = channel(rgb.r)
  const g = channel(rgb.g)
  const b = channel(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG 2.x 对比度 = (较亮 + 0.05) / (较暗 + 0.05)
 */
export function contrastRatio(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

// 一组用于默认色板的常用色（覆盖品牌、警示、灰度等场景）
export const DEFAULT_SWATCHES: string[] = [
  '#000000',
  '#ffffff',
  '#7f7f7f',
  '#c0c0c0',
  '#1677ff',
  '#ff0000',
  '#ffa500',
  '#ffff00',
  '#00aa00',
  '#00bcd4',
  '#9c27b0',
  '#ff4081',
]

// 一组在视觉上具有代表性的预设饱和色板，供用户快速选择
export const PRESET_SWATCHES: string[] = [
  '#000000',
  '#404040',
  '#808080',
  '#bfbfbf',
  '#ffffff',
  '#ff0000',
  '#ff7f00',
  '#ffff00',
  '#7fff00',
  '#00ff00',
  '#00ff7f',
  '#00ffff',
  '#007fff',
  '#0000ff',
  '#7f00ff',
  '#ff00ff',
  '#ff007f',
  '#1677ff',
  '#722ed1',
  '#eb2f96',
  '#fa541c',
  '#faad14',
  '#52c41a',
  '#13c2c2',
]