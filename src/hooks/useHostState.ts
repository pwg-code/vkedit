//

import type { IEditorHost } from '@/types'
import { reactive } from 'vue'

export default function (host: IEditorHost) {
  const hostState = reactive(host.getState())
  return { hostState }
}
