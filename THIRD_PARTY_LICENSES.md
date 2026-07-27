# 第三方许可证声明

vkedit 使用了以下开源依赖。本文件依据各许可证要求列出其版权与许可信息。

## 运行时依赖（随 npm 包分发）

以下依赖会在安装 vkedit 时被引入，许可证均与 vkedit 的 MIT 许可证兼容。

| 依赖 | 版本 | 许可证 | 来源 |
| --- | --- | --- | --- |
| @vueuse/core | ^14.0.0 | MIT | https://github.com/vueuse/vueuse |
| jsbarcode | ^3.11.5 | MIT | https://github.com/lindell/JsBarcode |
| jspdf | ^3.0.3 | MIT | https://github.com/parallax/jsPDF |
| lodash | ^4.17.21 | MIT | https://github.com/lodash/lodash |
| qrcode | ^1.5.1 | MIT | https://github.com/soldair/node-qrcode |
| uuid | ^13.0.0 | MIT | https://github.com/uuidjs/uuid |

### Peer Dependencies（由宿主项目提供）

| 依赖 | 版本 | 许可证 | 来源 |
| --- | --- | --- | --- |
| konva | ^10.0.2 | MIT | https://github.com/konvajs/konva |
| vue | ^3.5.18 | MIT | https://github.com/vuejs/core |
| vue-konva | ^3.2.6 | MIT | https://github.com/konvajs/vue-konva |

## 开发依赖（不随 npm 包分发）

以下依赖仅用于开发与构建，不影响下游合规义务。其中 `@iconify-json/ph` 的图标 SVG 数据在构建时由 `unplugin-icons` 内联至 `dist/`，但因其同为 MIT 许可，不产生额外合规义务。

| 依赖 | 许可证 |
| --- | --- |
| @iconify-json/ph | MIT |
| @tsconfig/node22 | MIT |
| @types/lodash | MIT |
| @types/node | MIT |
| @types/qrcode | MIT |
| @vitejs/plugin-vue | MIT |
| @vue/eslint-config-prettier | MIT |
| @vue/eslint-config-typescript | MIT |
| @vue/tsconfig | MIT |
| eslint | MIT |
| eslint-plugin-vue | MIT |
| jiti | MIT |
| npm-run-all2 | MIT |
| prettier | MIT |
| primevue | MIT |
| sass-embedded | MIT |
| typescript | Apache-2.0 |
| unplugin-icons | MIT |
| vite | MIT |
| vite-plugin-css-injected-by-js | MIT |
| vite-plugin-dts | MIT |
| vite-plugin-vue-devtools | MIT |
| vue-tsc | MIT |

## 许可证全文

- MIT: https://opensource.org/license/mit/

> 注：`typescript` 为 Apache-2.0 许可，但属开发依赖，不随 npm 包分发，无需附带许可证全文。

---

本声明基于发布时已知的依赖信息。如发现遗漏或错误，请通过 [GitHub Issues](https://github.com/pwg-code/vkedit/issues) 报告。
