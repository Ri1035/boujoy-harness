# Boujoy Harness

> DSH（DeepSeek Harness）的主题插件 —— 开屏动画 · 风格界面 · 对话动画

![status](https://img.shields.io/badge/status-planning-orange)
![dsh](https://img.shields.io/badge/DSH-0.1.7--rc.2%20%E2%86%92%200.2.0--rc.2-blue)

## 这是什么

Boujoy Harness 是一个 **DSH Web/桌面端的界面主题插件**。它不修改 DSH 任何一行核心源码，
而是通过 DSH 官方的 Cordis 插件体系（bundle + slot 系统 + theme token）实现对界面的改造。

目标效果：

- **开屏动画** —— 从应用启动到界面就绪的完整片头，且不露出 DSH 自带的 Loading 卡片
- **风格界面** —— 品牌配色、字体、字标、背景氛围、圆角与材质
- **对话动画** —— 助手消息入场、流式输出节奏、工具卡片缓动

## 当前状态

**📋 规划与调研阶段 —— 尚未编写任何工程代码。**

已完成：

- ✅ DSH 侧能力边界实测（90 个 slot、403 个 `--dsw-*` token、可用的官方 `data-*` 属性）
- ✅ 生态调研：15+ 个 DSH 主题/开屏项目，含动画实现的源码级证据
- ✅ 技术路线与分期计划、风险登记册 → 见 [`docs/`](./docs)

未完成：

- ⏳ 品牌素材与配色方向（等待提供）
- ⏳ 第二个参考项目的确认
- ⏳ 对话动画路线选择（轻量 / 重度）

## 文档导航

| 文档 | 用途 |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | **AI 协作入口** —— 接手本项目请先读这份 |
| [`docs/project-overview.md`](./docs/project-overview.md) | 项目整体概述：目标、范围、不做什么 |
| [`docs/architecture.md`](./docs/architecture.md) | 架构与数据流：A/B/C 分层、启动时序、插件运行时 |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | 视觉规范：token 体系、动效变量、选择器分级纪律 |
| [`docs/TODO.md`](./docs/TODO.md) | 任务、优先级、开发进度 —— **跨会话续作用的进度真相源** |
| [`docs/development.md`](./docs/development.md) | 开发环境、执行命令、回归测试清单 |
| [`docs/component-api.md`](./docs/component-api.md) | 可用的官方 API 契约 + 本项目自有组件 API |
| [`docs/user-guide.md`](./docs/user-guide.md) | 用户使用手册（不读代码即可操作） |

## 快速开始（尚未可用）

> 本项目还没有可安装的产物。以下命令是**计划的最终形态**，当前执行会失败。

```bash
# 目标：一条命令安装
dsh plugin --profile web add <包名或 tgz 路径>

# 然后正常启动
dsh web
```

## 关键约束（一图说明为什么这个项目不简单）

```
导航开始
  │
  ├─ 67ms    DSH 自带开机卡片 [data-dsh-boot] 出现
  │          └─ 此时 client 插件还没执行，z-index 再高也盖不住
  │
  ├─ 271ms   ← 这段空窗期只能靠 host 半边注入首帧来覆盖
  │
  ├─ 338ms   我们的 client 插件求值、shell.overlay 挂载
  │
  └─ 517ms   DSH 开机卡片被移除

（时序数据来源：dsh-550c-boot 作者的 CDP 实测）
```

## 许可

待定。**注意**：本项目参考的 `dsh-endfield-ui` 仓库 GitHub API 返回 `license: null`，
因此其代码**只读不抄**。主骨架取自 `dsh-550c-boot`（MIT）。
