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

- 🆕 `HANDOFF.md` —— **转手文档**（换设备 / 换会话继续用）
  - 自包含：30 秒接手指南、环境事实、17 条关键决策、**六个必须知道的技术事实**
  - 换设备后需重新确认的清单、下一步该做什么、11 项阻塞、协作约定、已踩过的 11 个坑
- 🆕 `skills/boujoy-theme-setup/SKILL.md` —— **Agent 适配能力**（随插件分发）
  - **自动触发**：description 写成列举式触发条件（外观/主题/换肤/品牌/logo/配色/字体/背景/开屏/inbox）
  - 含 10 项素材槽位精简表、判断线索、7 步工作流、格式处理、边界与禁区
- 🆕 **槽位全量清单**（`docs/asset-library.md` §3）—— 用户要求"把可自定义的元素组件全部写出来"
  - 🟢 内容级 **34 项**（14 个颜色 token + 20 个素材槽位）
  - 🟡 样式级 **13 项**（需 C 层 CSS）
  - 🔵 结构级 **30 项**（需注册 slot / 写组件）
  - ⛔ 明确不可自定义 **5 类**（写进红线）
  - 每项标注稳定性（S/M/X），并提供「最小可用六项集合」
- 🆕 槽位规格做成**单一数据源** `plugin/lib/slots.js`（Agent 依据 / doctor 校验器 / 文档共用）
- **文档体系（第一批，8 份）**
  - `AGENTS.md` —— AI 协作入口：环境事实、12 条红线、技术框架、验证手段
  - `docs/TODO.md` —— 进度真相源：P0–P7 分期、阻塞项、决策记录（ADR）
  - `docs/DESIGN.md` —— 视觉规范：403 个 `--dsw-*` 变量分层、选择器四级纪律、动效变量
  - `docs/project-overview.md` —— 目标拆解为可验收条目、范围与非范围
  - `docs/architecture.md` —— A/B/C 分层、271ms 启动时序、三条数据流、卸载契约
  - `docs/development.md` —— 工具链路径、命令、7 大类回归清单
  - `docs/component-api.md` —— 官方 API 实测契约 + 自有组件规划签名
  - `docs/user-guide.md` —— 用户手册
- **文档体系（第二批，4 份）**
  - `docs/asset-library.md` —— 素材库与自定义配置规范（后续重写为 Agent 适配版）
  - `docs/features-customization.md` —— 高度自定义能力说明
  - `docs/VERSIONING.md` —— 版本管理、兼容策略与变更日志规范
  - `CHANGELOG.md` —— 本文件

### Changed

- **用户侧接口从"同名覆盖"改为"素材收件箱 + Agent 适配"**
  - 原设计要求用户知道槽位名、正确命名、懂格式、写配置
  - 新设计：用户只把素材丢进 `$DSH_HOME/boujoy/inbox/`（文件名随意），由 Agent 完成适配
- **产品定位澄清**：默认主题是主产品，自定义框架是留给别人的空间
  - 三档体验（默认 / 换素材 / 精调），前两档**都不需要读文档**
  - 顺序纪律：P1–P3 先做好默认主题，P3.5 才做适配能力
- `docs/asset-library.md` 整体重写为 Agent 适配版（§0–§12），并修正章节编号

- 建立项目文档体系（8 份）
  - `AGENTS.md` —— AI 协作入口：环境事实、12 条红线、技术框架、验证手段
  - `docs/TODO.md` —— 进度真相源：P0–P7 分期、阻塞项、决策记录（ADR）
  - `docs/DESIGN.md` —— 视觉规范：403 个 `--dsw-*` 变量分层、选择器四级纪律、动效变量
  - `docs/project-overview.md` —— 目标拆解为可验收条目、范围与非范围
  - `docs/architecture.md` —— A/B/C 分层、271ms 启动时序、三条数据流、卸载契约
  - `docs/development.md` —— 工具链路径、命令、7 大类回归清单
  - `docs/component-api.md` —— 官方 API 实测契约 + 自有组件规划签名
  - `docs/user-guide.md` —— 用户手册
- `docs/asset-library.md` —— 素材库与自定义配置规范
- `docs/features-customization.md` —— 高度自定义能力说明
- `docs/VERSIONING.md` —— 版本管理、兼容策略与变更日志规范
- 本文件 `CHANGELOG.md`

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
