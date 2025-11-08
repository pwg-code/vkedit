//

import type { EditorHost } from '@/core'
import { reactive } from 'vue'

export function useHostState(host: EditorHost) {
  const hostState = reactive(host.getState())
  return { hostState }
}
