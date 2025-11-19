import type { IEditorPlugin } from '.'
import { type EditorHost } from '@/core'

export abstract class BasePlugin implements IEditorPlugin {
  public abstract name: string
  public abstract version: string

  protected host?: EditorHost
  protected isActivate: boolean = false

  install(host: EditorHost): void {
    this.host = host
    this.onInstall()
  }

  uninstall(): void {
    this.onUninstall()
    if (this.isActivate) {
      this.deactivate()
    }
    this.host = undefined
  }

  activate(): void {
    if (!this.isActivate && this.host) {
      this.isActivate = true
      this.onActivate()
    }
  }

  deactivate(): void {
    if (this.isActivate && this.host) {
      this.isActivate = false
      this.onDeactivate()
    }
  }

  // 生命周期钩子
  protected onInstall(): void {}
  protected onUninstall(): void {}
  protected onActivate(): void {}
  protected onDeactivate(): void {}
}
