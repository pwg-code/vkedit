import type { IEditorHost, IEditorPlugin, IGraphicType, IPluginTool } from '.'

export abstract class BasePlugin implements IEditorPlugin {
  [key: string]: any
  registerGraphicTypes?(): IGraphicType[] {
    throw new Error('Method not implemented.')
  }

  public abstract name: string
  public abstract version: string

  protected host: IEditorHost | null = null
  protected isActivate: boolean = false

  install(host: IEditorHost): void {
    this.host = host
    this.onInstall()
  }

  uninstall(): void {
    this.onUninstall()
    if (this.isActivate) {
      this.deactivate()
    }
    this.host = null
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
