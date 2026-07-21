/// <reference types="vite/client" />

declare module '~icons/*' {
  import type { Component } from 'vue'
  const component: Component
  export default component
}
