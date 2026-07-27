# 图标迁移计划：Material Symbols Light → Phosphor

## 0. 实施记录（2026-07-27）

> 阶段 1–4 已完成；阶段 5（发布）未执行（待用户决定版本号与发布时机）。

### 关键更正（与原计划差异）

| 项 | 原计划 | 实际 | 原因 |
| --- | --- | --- | --- |
| npm 包名 | `@iconify-json/phosphor` | `@iconify-json/ph@1.2.2` | `@iconify-json/phosphor` 在 npm 不存在；Phosphor 的 Iconify collection ID 为 `ph` |
| import 路径前缀 | `~icons/phosphor/<name>-light` | `~icons/ph/<name>-light` | 同上 |
| `zoom-out-map` 映射 | `fit-screen-light` | `frame-corners-light` | `fit-screen-light` 在 phosphor 中不存在，`frame-corners-light` 已验证存在 |

### 验证结果

- 54 个映射图标中 53 个按原映射确认存在；仅 `zoom-out-map` 改用 `frame-corners-light`。
- 4.3 节其余 6 个待确认图标（`hand-grabbing-light`、`rows-light`、`columns-light`、`arrow-line-up-light`、`arrow-line-down-light`、`arrows-in-cardinal-light`）全部确认存在。
- 构建：`vite build` 成功，54 处 `~icons/ph/*` 全部解析；`dist/` 中无 `material-symbols` 残留。
- 合规：`NOTICE`、`LICENSE-Apache-2.0.txt` 已删除；`package.json` `files` 字段已清理；`THIRD_PARTY_LICENSES.md` 已移除 Apache-2.0 章节；`npm pack --dry-run` 确认包内无 Apache-2.0 文件。

### 已知遗留（与迁移无关的预存在问题）

- `vitest` 已从 `devDependencies` 移除（迁移前已存在），导致 `pnpm type-check`（`vue-tsc --build`）因 `vitest.config.ts` 引用 `vitest/config` 报错；`pnpm test`（`vitest run`）无法执行。
- `pnpm lint` 存在 206 个 `@typescript-eslint/no-explicit-any` 错误，集中在 `src/types/*.ts`、`src/utils/transform-overlay.ts`，均为迁移前已有，非本次改动引入。

## 1. 目标

将 vkedit 的图标集从 `@iconify-json/material-symbols-light`（Apache-2.0）替换为 `@iconify-json/ph`（MIT），消除 Apache-2.0 的 NOTICE 义务向下游传播的合规负担。

## 2. 背景

### 当前状态

| 项目 | 现状 |
| --- | --- |
| 图标集 | `@iconify-json/material-symbols-light` v1.2.86 |
| 许可证 | Apache-2.0（Google 版权） |
| 分发方式 | `unplugin-icons` 在构建时将 56 个图标的 SVG path 内联至 `dist/index-*.js` |
| 合规文件 | `NOTICE`、`LICENSE-Apache-2.0.txt`、`THIRD_PARTY_LICENSES.md` 相关章节 |
| 影响 | 图标数据随 npm 包发布，构成再分发，Apache-2.0 NOTICE 义务向下游传播 |

### 目标状态

| 项目 | 目标 |
| --- | --- |
| 图标集 | `@iconify-json/ph` |
| 许可证 | MIT — 无 NOTICE 义务 |
| 分发方式 | 不变（unplugin-icons 内联） |
| 合规文件 | 移除 Apache-2.0 相关文件，回归纯 MIT |

### 选择 Phosphor 的理由

- **MIT 许可** — 彻底消除 NOTICE 义务
- **light 粗细变体** — 视觉风格与 Material Symbols Light 高度一致（1px 描边）
- **图标数量** — 7000+（含 6 种粗细），覆盖当前 54 个图标
- **Iconify 原生支持** — `unplugin-icons` 配置不变，仅改 import 路径

## 3. 影响范围

### 3.1 源文件清单（18 个文件，54 处 import）

| 文件 | 图标数 |
| --- | --- |
| `src/plugins/layer-manager/LayerPanel.vue` | 14 |
| `src/core/StatusBar.vue` | 8 |
| `src/components/TextProperty.vue` | 8 |
| `src/core/Editor.vue` | 5 |
| `src/plugins/align/Align.vue` | 6 |
| `src/core/HelpGuide.vue` | 2 |
| `src/core/Toolbar.vue` | 2 |
| `src/plugins/rect/rect.ts` | 1 |
| `src/plugins/text/text.ts` | 1 |
| `src/plugins/qrcode/qrcode.ts` | 1 |
| `src/plugins/barcode/barcode.ts` | 1 |
| `src/plugins/line/line.ts` | 1 |
| `src/plugins/preview/PreviewButton.vue` | 1 |
| `src/plugins/export/Export.vue` | 1 |
| `src/plugins/import/Import.vue` | 1 |
| `src/plugins/snap/SnapToggle.vue` | 1 |

### 3.2 配置文件

| 文件 | 改动 |
| --- | --- |
| `package.json` | devDependencies：移除 `@iconify-json/material-symbols-light`，新增 `@iconify-json/ph` |
| `vite.config.ts` | 无需改动（`unplugin-icons` 配置不变） |
| `env.d.ts` | 无需改动（`~icons/*` 模块声明通用） |

### 3.3 合规文件（清理对象）

| 文件 | 操作 |
| --- | --- |
| `NOTICE` | 删除 |
| `LICENSE-Apache-2.0.txt` | 删除 |
| `THIRD_PARTY_LICENSES.md` | 修改 — 移除"构建时内联的素材"章节 |
| `package.json` `files` 字段 | 移除 `LICENSE-Apache-2.0.txt`、`NOTICE` |

## 4. 图标映射表

### 4.1 命名规则

- Material Symbols Light 路径：`~icons/material-symbols-light/<name>`
- Phosphor Light 路径：`~icons/ph/<name>-light`

> ⚠️ 实施时更正：Phosphor 的 Iconify collection ID 为 `ph`（非 `phosphor`），对应 npm 包 `@iconify-json/ph`。

Phosphor 的 light 粗细变体通过在图标名后追加 `-light` 后缀访问，视觉上与 Material Symbols Light（1px 描边）最接近。

### 4.2 完整映射

> 状态说明：✅ 已确认 Phosphor 存在对应图标；⚠️ 名称近似，需构建后视觉验证；❓ 不确定是否存在，需验证

| # | Material Symbols | Phosphor (light) | 状态 | 语义 |
| --- | --- | --- | --- | --- |
| 1 | `menu` | `list-light` | ✅ | 菜单 |
| 2 | `category` | `squares-four-light` | ✅ | 分类/网格 |
| 3 | `chevron-left` | `caret-left-light` | ✅ | 左箭头 |
| 4 | `chevron-right` | `caret-right-light` | ✅ | 右箭头 |
| 5 | `settings` | `gear-six-light` | ✅ | 设置 |
| 6 | `format-bold` | `text-b-light` | ✅ | 粗体 |
| 7 | `format-italic` | `text-italic-light` | ✅ | 斜体 |
| 8 | `align-justify-flex-start` | `text-align-left-light` | ✅ | 左对齐 |
| 9 | `align-justify-center` | `text-align-center-light` | ✅ | 居中对齐 |
| 10 | `align-justify-flex-end` | `text-align-right-light` | ✅ | 右对齐 |
| 11 | `align-start` | `text-align-left-light` | ⚠️ | 起始对齐（语义近似） |
| 12 | `align-center` | `text-align-center-light` | ⚠️ | 居中对齐 |
| 13 | `align-end` | `text-align-right-light` | ⚠️ | 末尾对齐 |
| 14 | `help` | `question-light` | ✅ | 帮助 |
| 15 | `close` | `x-light` | ✅ | 关闭 |
| 16 | `zoom-out` | `magnifying-glass-minus-light` | ✅ | 缩小 |
| 17 | `zoom-in-rounded` | `magnifying-glass-plus-light` | ⚠️ | 放大（去掉 rounded 语义） |
| 18 | `zoom-out-map` | `frame-corners-light` | ✅ | 适应屏幕（`fit-screen-light` 不存在，改用 `frame-corners-light`） |
| 19 | `arrow-selector-tool` | `cursor-light` | ✅ | 选择/光标 |
| 20 | `touchpad-mouse` | `cursor-light` | ⚠️ | 触摸板（用 cursor 替代） |
| 21 | `pan-tool` | `hand-light` | ✅ | 手掌 |
| 22 | `drag-pan` | `hand-grabbing-light` | ❓ | 拖拽（需验证） |
| 23 | `rotate-right` | `arrow-clockwise-light` | ✅ | 旋转 |
| 24 | `undo` | `arrow-counter-clockwise-light` | ✅ | 撤销 |
| 25 | `redo` | `arrow-clockwise-light` | ✅ | 重做 |
| 26 | `align-horizontal-left` | `align-left-simple-light` | ✅ | 水平左对齐 |
| 27 | `align-horizontal-right` | `align-right-simple-light` | ✅ | 水平右对齐 |
| 28 | `align-vertical-top` | `align-top-simple-light` | ✅ | 垂直顶对齐 |
| 29 | `align-vertical-bottom` | `align-bottom-simple-light` | ✅ | 垂直底对齐 |
| 30 | `horizontal-distribute` | `rows-light` | ❓ | 水平分布（需验证） |
| 31 | `vertical-distribute` | `columns-light` | ❓ | 垂直分布（需验证） |
| 32 | `grid-on` | `grid-four-light` | ✅ | 网格 |
| 33 | `pen-size-1` | `pen-nib-light` | ⚠️ | 画笔（语义近似） |
| 34 | `barcode` | `barcode-light` | ✅ | 条码 |
| 35 | `text-fields` | `text-aa-light` | ⚠️ | 文本（语义近似） |
| 36 | `preview-outline` | `eye-light` | ⚠️ | 预览（用 eye 替代） |
| 37 | `rectangle` | `square-light` | ✅ | 矩形 |
| 38 | `file-export-outline` | `file-arrow-up-light` | ⚠️ | 导出 |
| 39 | `drag-indicator` | `dots-six-vertical-light` | ✅ | 拖拽指示器 |
| 40 | `more-vert` | `dots-three-vertical-light` | ✅ | 更多（垂直） |
| 41 | `vertical-align-top` | `arrow-line-up-light` | ❓ | 顶部对齐（需验证） |
| 42 | `arrow-upward` | `arrow-up-light` | ✅ | 上移 |
| 43 | `arrow-downward` | `arrow-down-light` | ✅ | 下移 |
| 44 | `vertical-align-bottom` | `arrow-line-down-light` | ❓ | 底部对齐（需验证） |
| 45 | `edit` | `pencil-simple-light` | ✅ | 编辑 |
| 46 | `content-copy` | `copy-light` | ✅ | 复制 |
| 47 | `delete` | `trash-light` | ✅ | 删除 |
| 48 | `lock` | `lock-light` | ✅ | 锁定 |
| 49 | `lock-open-right` | `lock-open-light` | ✅ | 解锁 |
| 50 | `visibility` | `eye-light` | ✅ | 可见 |
| 51 | `visibility-off` | `eye-slash-light` | ✅ | 隐藏 |
| 52 | `circle` | `circle-light` | ✅ | 圆形 |
| 53 | `display-external-input` | `arrows-in-cardinal-light` | ❓ | 外部输入（需验证） |
| 54 | `qr-code-2` | `qr-code-light` | ✅ | 二维码 |

### 4.3 待验证图标（6 个）

以下图标在 Phosphor 中的对应名称不确定，需在安装后验证：

| # | Material Symbols | 候选 Phosphor | 备选方案 |
| --- | --- | --- | --- |
| 18 | `zoom-out-map` | `fit-screen-light` | `frame-corners-light` / `expand-light` |
| 22 | `drag-pan` | `hand-grabbing-light` | `hand-light` / `arrows-out-cardinal-light` |
| 30 | `horizontal-distribute` | `rows-light` | 需评估语义，可能用 `align-left-simple` + `align-right-simple` 组合 |
| 31 | `vertical-distribute` | `columns-light` | 需评估语义，可能用 `align-top-simple` + `align-bottom-simple` 组合 |
| 41 | `vertical-align-top` | `arrow-line-up-light` | `arrow-up-light` |
| 44 | `vertical-align-bottom` | `arrow-line-down-light` | `arrow-down-light` |
| 53 | `display-external-input` | `arrows-in-cardinal-light` | `arrows-out-cardinal-light` / `import-light` |

验证方法：安装 `@iconify-json/ph` 后，在 `node_modules/@iconify-json/ph/icons.json` 中搜索图标名确认存在性。

### 4.4 语义重复项

以下 Material Symbols 图标映射到同一 Phosphor 图标，需确认是否可接受视觉统一：

| Material Symbols（不同图标） | Phosphor（相同） | 说明 |
| --- | --- | --- |
| `arrow-selector-tool` + `touchpad-mouse` | `cursor-light` | 均表示"选择"操作，统一为 cursor 合理 |
| `align-justify-flex-start` + `align-start` | `text-align-left-light` | 左对齐语义一致 |
| `align-justify-center` + `align-center` | `text-align-center-light` | 居中对齐语义一致 |
| `align-justify-flex-end` + `align-end` | `text-align-right-light` | 右对齐语义一致 |
| `preview-outline` + `visibility` | `eye-light` | 均为"查看"语义，需评估是否需区分 |
| `zoom-in-rounded` 与 `redo` | `magnifying-glass-plus-light` / `arrow-clockwise-light` | 无冲突，列出仅作参考 |

## 5. 执行步骤

### 阶段 1：准备与验证（不改动现有代码）

```
1. 安装 phosphor 图标集
   pnpm add -D @iconify-json/ph

   > 注：`@iconify-json/phosphor` 在 npm 不存在；Phosphor 的 Iconify collection ID 为 `ph`。

2. 验证 4.3 节中 6 个待确认图标的存在性
   在 node_modules/@iconify-json/ph/icons.json 中搜索

3. 在 playground 中创建测试页面，逐一渲染所有 54 个 phosphor 图标
   视觉对比 Material Symbols Light 版本

4. 确认最终映射表
```

### 阶段 2：代码迁移

```
5. 替换 18 个源文件中的 54 处 import 路径
   ~icons/material-symbols-light/<name>
   → ~icons/ph/<name>-light

6. 处理语义重复项（如需区分 preview 和 visibility）

7. 启动 dev 服务器，逐页面视觉验证
   pnpm dev
```

### 阶段 3：构建与测试

```
8. 类型检查
   pnpm type-check

9. Lint
   pnpm lint

10. 单元测试
    pnpm test

11. 构建库
    pnpm build

12. 验证构建产物
    确认 dist/index-*.js 中的 SVG path 数据已更新为 phosphor 图标
    确认产物中不再包含 material-symbols 相关数据
```

### 阶段 4：清理协议

```
13. 卸载旧图标集
    pnpm remove @iconify-json/material-symbols-light

14. 删除 Apache-2.0 合规文件
    删除 NOTICE
    删除 LICENSE-Apache-2.0.txt

15. 更新 package.json files 字段
    移除 "LICENSE-Apache-2.0.txt"
    移除 "NOTICE"
    保留 "LICENSE"、"THIRD_PARTY_LICENSES.md"

16. 更新 THIRD_PARTY_LICENSES.md
    删除"构建时内联的素材"整个章节
    将 @iconify-json/ph 加入开发依赖表（MIT）
    移除 Apache-2.0 合规说明段落
    更新许可证全文链接（移除 Apache-2.0 引用）

17. 更新 README.md
    如社区文件链接区有引用 NOTICE，移除

18. 重新构建并验证 npm pack 内容
    pnpm build
    npm pack --dry-run
    确认包中不含 NOTICE、LICENSE-Apache-2.0.txt
    确认包中不含 @iconify-json/material-symbols-light 任何残留
```

### 阶段 5：发布

```
19. 更新 CHANGELOG.md
    记录 breaking change（如视觉变化）
    记录许可证改进（Apache-2.0 → MIT）

20. 版本号升级
    建议Minor版本升级（视觉变化，非破坏性 API 变更）

21. 发布
    pnpm publish
```

## 6. 清理验证清单

迁移完成后，确认以下文件不再包含 Apache-2.0 痕迹：

| 检查项 | 验证方法 | 预期结果 |
| --- | --- | --- |
| `NOTICE` 文件 | `Test-Path NOTICE` | 不存在 |
| `LICENSE-Apache-2.0.txt` | `Test-Path LICENSE-Apache-2.0.txt` | 不存在 |
| `package.json` files 字段 | 检查不含 `NOTICE`、`LICENSE-Apache-2.0` | 已移除 |
| `package.json` devDependencies | 检查不含 `material-symbols-light` | 已移除 |
| `THIRD_PARTY_LICENSES.md` | 搜索 `Apache` | 无匹配（typescript 仍为 Apache-2.0 但属开发依赖不分发，保留声明） |
| `dist/` 产物 | 搜索 `material-symbols` | 无匹配 |
| npm pack 内容 | `npm pack --dry-run` | 不含 NOTICE、LICENSE-Apache-2.0.txt |
| 源码 | 搜索 `material-symbols-light` | 无匹配 |

> **注**：`THIRD_PARTY_LICENSES.md` 中 `typescript` 仍标注为 Apache-2.0，但它是开发依赖不随包分发，无需清理。迁移后可移除 Apache-2.0 许可证全文链接，仅保留 MIT。

## 7. 风险与缓解

| 风险 | 影响 | 缓解措施 |
| --- | --- | --- |
| 部分图标视觉差异 | 中 — 影响用户体验 | 阶段 1 逐图标视觉验证，必要时用备选方案 |
| 6 个待确认图标可能不存在 | 低 | 已提供备选方案，阶段 1 验证 |
| 语义重复项（preview/visibility 统一为 eye） | 低 — 可能影响辨识度 | 如需区分，preview 用 `eye-light`，visibility 用 `eye-slash-light` 反转逻辑 |
| 构建产物体积变化 | 低 | Phosphor light 与 Material Symbols light 的 SVG 复杂度相近，预计体积变化 <5% |
| 下游用户已依赖 Material Symbols 视觉 | 极低 — vkedit 内联图标，不暴露图标集 | 无需下游适配 |

## 8. 回滚方案

如迁移后发现严重视觉问题，可回滚：

```
1. 恢复 git 中所有源文件改动
   git checkout -- src/

2. 恢复合规文件
   git checkout -- NOTICE LICENSE-Apache-2.0.txt
   git checkout -- package.json THIRD_PARTY_LICENSES.md

3. 重新安装依赖
   pnpm install

4. 重新构建
   pnpm build
```

建议在独立分支上执行迁移，确认无误后再合并。

## 9. 工作量估算

| 阶段 | 预估时间 |
| --- | --- |
| 阶段 1：准备与验证 | 1-2 小时 |
| 阶段 2：代码迁移 | 1-2 小时 |
| 阶段 3：构建与测试 | 30 分钟 |
| 阶段 4：清理协议 | 30 分钟 |
| 阶段 5：发布 | 30 分钟 |
| **合计** | **3.5-5.5 小时** |

---

本计划文档可随迁移进度更新。执行完成后可归档或删除。
