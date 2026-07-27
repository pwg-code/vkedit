# 贡献指南

感谢您对 vkedit 的关注！欢迎以任何形式参与项目。

## 行为准则

参与本项目即表示您同意遵守 [行为准则](CODE_OF_CONDUCT.md)。请在所有交流中保持尊重与友善。

## 如何贡献

### 报告问题

- 使用 [GitHub Issues](https://github.com/pwg-code/vkedit/issues) 提交问题。
- 提交前请先搜索是否已有相同问题，避免重复。
- 请提供：复现步骤、预期结果、实际结果、环境信息（Node.js 版本、浏览器、vkedit 版本）。

### 提交代码

1. Fork 本仓库。
2. 基于最新 `main` 分支创建特性分支：
   ```bash
   git checkout -b feat/your-feature
   ```
3. 安装依赖（需 pnpm 10+）：
   ```bash
   pnpm install
   ```
4. 编写代码，确保：
   - 通过类型检查：`pnpm type-check`
   - 通过 lint：`pnpm lint`
   - 通过测试：`pnpm test`
5. 提交代码，遵循 [约定式提交](https://www.conventionalcommits.org/zh-hans/) 规范：
   ```
   feat(plugin): 新增图表插件
   fix(host): 修复 loadJSON 后历史记录未清空的问题
   docs: 更新 README 示例
   refactor(utils): 重构对齐工具函数
   ```
6. 推送分支并提交 Pull Request。

### Pull Request 要求

- 一个 PR 只做一件事，保持改动聚焦。
- 如有新功能或破坏性变更，请先通过 Issue 讨论设计。
- 新增功能需附带测试。
- 公开 API 变更需更新类型定义与文档。

## 开发指引

### 项目结构

```
src/
├── commands/      # 命令模式（撤销/重做）
├── components/    # Vue 组件
├── core/          # 核心运行时（EditorHost）
├── hooks/         # 组合式函数
├── lib/           # 工具库
├── plugins/       # 内置插件
├── styles/        # 样式与设计令牌
├── types/         # 类型定义
└── utils/         # 通用工具
```

### 图形插件开发

继承 `GraphicPlugin<T>` 抽象基类实现自定义图形元素，详见 [文档](https://docs.vkedit.org)。

### 本地调试

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建库
pnpm build:playground # 构建 playground
```

## 许可证

提交的代码将在 [MIT 许可证](LICENSE) 下发布。提交即表示您同意以该许可发布您的贡献。
