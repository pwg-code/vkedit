/**
 * PluginMap 保持为空接口，具体插件应在各自实现文件中用模块声明合并（declare module '@/types'）来扩展。
 * 例如在 `src/plugins/rect/rect.ts` 中添加：
 *
 * declare module '@/types' {
 *   interface PluginMap {
 *     'rect-plugin': RectPlugin
 *   }
 * }
 */
export interface PluginMap {}
