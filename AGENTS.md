# AGENTS.md

## Project Operating Rules

This repository contains the AI Budget Battle product.

Before making changes, agents should treat the product design document and technical stack document as the source of truth for product scope, UX direction, architecture, and implementation choices.

写任何代码前，必须完整阅读 memory-bank/design-document.md 和 memory-bank/tech-stack.md。

每一次项目改动完成后都必须自动更新 memory-bank，不需要用户再次提醒。项目改动包括但不限于代码、UI、样式、文案、测试、配置、依赖、路由、数据模型、provider、部署配置和文档本身。

- 每完成一个任务或一次用户反馈修复，必须更新 `memory-bank/progress.md`，记录改动内容、验证结果、未完成事项和下一步状态。
- 每完成一个功能、架构边界、文件职责变化、数据流变化、provider 变化、UI 结构变化或里程碑，必须更新 `memory-bank/architecture.md`。
- 如果产品原则、用户体验约束、任务范围或后续计划发生变化，必须同步更新 `memory-bank/design-document.md` 或 `memory-bank/implementation-plan.md` 中对应内容。
- 如果只是很小的视觉/文案修复，也至少要在 `memory-bank/progress.md` 追加简短记录。
