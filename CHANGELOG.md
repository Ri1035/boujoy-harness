# Changelog

本项目所有值得记录的变更都会写在这里。
格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循
[Semantic Versioning](https://semver.org/lang/zh-CN/)，但语义针对"界面框架插件"调整
（详见 [`docs/VERSIONING.md`](./docs/VERSIONING.md) §3）。

**分类说明**：`Added` 新增 ｜ `Changed` 变更 ｜ `Fixed` 修复 ｜
`Adapted` **适配 DSH 新版本**（本项目特有）｜ `Removed` 移除 ｜ `Security` 安全

---

## [Unreleased]

**状态**：规划与调研阶段。**工程代码 0 行**，因此没有可运行的变更。

### Added

- 建立项目文档体系（8 份）
  - `AGENTS.md` —— AI 协作入口：环境事实、8 条红线、技术框架、验证手段
  - `docs/TODO.md` —— 进度真相源：P0–P7 分期、阻塞项、决策记录（ADR）
  - `docs/DESIGN.md` —— 视觉规范：403 个 `--dsw-*` token 分层、选择器四级纪律、动效变量
  - `docs/project-overview.md` —— 目标拆解为可验收条目、范围与非范围
  - `docs/architecture.md` —— A/B/C 分层、271ms 启动时序、三条数据流、卸载契约
  - `docs/development.md` —— 工具链路径、命令、7 大类回归清单
  - `docs/component-api.md` —— 官方 API 实测契约 + 自有组件规划签名
  - `docs/user-guide.md` —— 用户手册
- 新增 `docs/asset-library.md` —— **素材库与自定义配置规范**（框架目标的核心设计）
  - 双目录优先级模型（`$DSH_HOME/boujoy/` 覆盖内置 `assets/`）
  - 配置文件完整字段草案（配色 / 动效 / 字体 / 素材 / 高级）
  - 素材替换清单与规格要求（logo / 字体 / 纹理 / 开屏）
  - 配置校验规则与失败降级行为
  - 安全模式（Safe Mode）设计
- 新增 `docs/features-customization.md` —— **高度自定义能力说明**
  - 12 项能力矩阵（11 项零代码）
  - 三个自定义深度层次
  - 引擎与内容分离的架构理由
- 新增 `docs/VERSIONING.md` —— **版本管理、兼容策略与变更日志规范**
  - DSH 版本节奏量化画像（49.6 天 / 29 个版本 / 平均 1.77 天）
  - dist-tags 陷阱（子包 `latest` 停在 `0.0.1-rc.1`）
  - 接缝风险分层表
  - 兼容策略四道防线
  - 本插件版本编号规则与兼容矩阵
  - 版本适配工作流
- 新增本文件 `CHANGELOG.md`

### Security

- 明确禁止将任何凭据写入仓库（见 `AGENTS.md` §7）。
  首次建仓过程使用一次性凭据传递，未落盘；已扫描确认提交内容不含 token 字面量。

### Adapted

- 记录当前验证基线：DSH `0.2.0-rc.2`（桌面版）。
  ⚠️ 尚未执行真实验证，矩阵行为空（见 `docs/VERSIONING.md` §4）。

### 调研发现（尚未产生代码变更）

- 确认官方**不维护 `CHANGELOG.md`**（仓库根 404），变更记录只在 **GitHub Releases**：
  tag 形如 `dsh-v0.2.0-rc.2`，中英双语，分类为「新增功能 / 问题修复 / 体验优化 / 其他变更」。
  机器可读入口：`https://github.com/deepseek-ai/deepseek-harness/releases.atom`
- 官方 release notes 中**两条直接压在本项目作业面上**（【实测】）：
  - `v0.2.0-rc.2`：「优化聊天耗时、过程信息、**字号和深色主题样式**，优化动画运行开销」
  - `v0.2.0-rc.1`：「优化**对话进行中和完成状态的实时动画**、用时信息、过程信息间距」
  > 这意味着 C 层 CSS 覆盖与对话动效是**官方正在主动演进的区域**，需按最高警戒级别对待。

---

## 版本历史

| 版本 | 日期 | 内容 |
|---|---|---|
| （未发布） | — | 规划与调研阶段 |

---

## 数据来源与说明

本文件中的技术数据（版本数量、发布间隔、dist-tags、许可）来自 npm registry 实际抓取，
抓取时间 **2026-09-30**。生态调研结论来源见 [`research/REPORT.md`](./research/REPORT.md)。

> ⚠️ DSH 处于 developer preview，官方明确声明会有破坏性变更。
> 本项目的兼容声明**只覆盖真实验证过的版本**，不做宽泛承诺。
