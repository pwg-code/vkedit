import { describe, expect, it, vi } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import type { IEditorPlugin } from '@/types/base'
import type { PluginLoadedPayload } from '@/types/event-data'

describe('plugin:loaded 事件', () => {
  it('安装成功时先发 plugin:registered 再发 plugin:loaded，payload 正确', () => {
    const host = new EditorHost()
    const order: string[] = []
    const loadedSpy = vi.fn<(payload: PluginLoadedPayload) => void>()

    host.on('plugin:registered', () => order.push('registered'))
    host.on('plugin:loaded', (payload) => {
      order.push('loaded')
      loadedSpy(payload)
    })

    class MyPlugin implements IEditorPlugin {
      public name = 'my-plugin'
      public version = '1.0.0'
      install(): void {}
      uninstall(): void {}
    }

    host.installPlugin('my-plugin', MyPlugin)

    expect(order).toEqual(['registered', 'loaded'])
    expect(loadedSpy).toHaveBeenCalledTimes(1)
    const payload = loadedSpy.mock.calls[0]![0]
    expect(payload.name).toBe('my-plugin')
    expect(payload.source).toBe('EditorHost.installPlugin')
    expect(payload.plugin).toBeInstanceOf(MyPlugin)
    expect(typeof payload.timestamp).toBe('number')
  })

  it('install() 抛错时不发 plugin:loaded（也不发 plugin:registered）', () => {
    const host = new EditorHost()
    const loadedSpy = vi.fn()
    const registeredSpy = vi.fn()

    host.on('plugin:loaded', loadedSpy)
    host.on('plugin:registered', registeredSpy)

    class BadInstallPlugin implements IEditorPlugin {
      public name = 'bad-install'
      public version = '1.0.0'
      install(): void {
        throw new Error('install failed')
      }
      uninstall(): void {}
    }

    expect(() => host.installPlugin('bad-install', BadInstallPlugin)).toThrow('install failed')
    expect(loadedSpy).toHaveBeenCalledTimes(0)
    expect(registeredSpy).toHaveBeenCalledTimes(0)
  })

  it('activate() 抛错时不发 plugin:loaded', () => {
    const host = new EditorHost()
    const loadedSpy = vi.fn()

    host.on('plugin:loaded', loadedSpy)

    class BadActivatePlugin implements IEditorPlugin {
      public name = 'bad-activate'
      public version = '1.0.0'
      install(): void {}
      uninstall(): void {}
      activate(): void {
        throw new Error('activate failed')
      }
    }

    expect(() => host.installPlugin('bad-activate', BadActivatePlugin)).toThrow('activate failed')
    expect(loadedSpy).toHaveBeenCalledTimes(0)
  })
})
