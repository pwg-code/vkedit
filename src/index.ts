import type { App } from 'vue'
import Vkedit from './core/Editor.vue'
import './styles/tailwind.css'
import 'element-plus/dist/index.css'

export * from './types'
export * from './core/EditorHost'

export function install(app: App) {
  app.component('Vkedit', Vkedit)
}

export { Vkedit }
