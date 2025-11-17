


/**
 * 可扩展的元素类型映射（插件可以通过模块声明合并来为此接口添加新类型）
 * 示例：在某个插件中扩展`ElementTypeMap`
 * - `declare module '@/types' {`
 * - `interface ElementTypeMap {`
 * - `yourType: YourElement}`
 * - `}`
 * - 然后你就可以这样使用它了：
 * - const el = elementManager.createElement('yourType') // el 的类型被推断为 YourElement
 */
export interface ElementTypeMap {}

