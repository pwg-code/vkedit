//

import type { IEditorHost } from '@/types'
import { reactive } from 'vue'

export function useHostState(host: IEditorHost) {
  const hostState = reactive(host.getState())
  return { hostState }
}
