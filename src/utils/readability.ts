// ====== utils/readability.ts ======
// 二维码/条码可读性判定：基于 WCAG 2.x 的相对亮度与对比度公式。

import { computed, type ComputedRef } from 'vue'
import {
  contrastRatio,
  hexToRgb,
  isFullHexColor,
  relativeLuminance,
} from './color'

export const READABILITY_WARNING_TEXT =
  '当前前景色与背景色的明暗关系或对比度可能导致码无法识别，请使用实际设备扫码确认。'

export const READABILITY_CONTRAST_THRESHOLD = 4.5

/**
 * 判定给定前景色与背景色组合是否会触发可读性风险提示。
 * - 前景亮度 >= 背景亮度 ⇒ 必然触发
 * - 前景更暗但对比度 < 4.5 ⇒ 触发
 * - 前景更暗且对比度 >= 4.5 ⇒ 不触发
 */
export function shouldWarnReadability(fg: string, bg: string): boolean {
  if (!isFullHexColor(fg) || !isFullHexColor(bg)) return true
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  if (!fgRgb || !bgRgb) return true

  const fgLum = relativeLuminance(fgRgb)
  const bgLum = relativeLuminance(bgRgb)
  if (fgLum >= bgLum) return true
  return contrastRatio(fgRgb, bgRgb) < READABILITY_CONTRAST_THRESHOLD
}

export interface UseReadabilityWarningInput {
  foreground: ComputedRef<string> | { value: string }
  background: ComputedRef<string> | { value: string }
}

/**
 * 在属性面板中使用的可读性风险提示组合式：返回文案（无风险时为空字符串）
 */
export function useReadabilityWarning(input: UseReadabilityWarningInput): ComputedRef<string> {
  return computed(() => {
    const fg = input.foreground.value
    const bg = input.background.value
    return shouldWarnReadability(fg, bg) ? READABILITY_WARNING_TEXT : ''
  })
}