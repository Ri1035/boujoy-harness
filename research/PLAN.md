# Boujoy Harness 主题插件 — 调研结论与实施计划

> 状态：**待用户批准后开工**。本文只做计划与调研，未编写任何工程代码。
> 调研日期：本轮会话 | 目标环境：DSH `0.2.0-rc.2`（桌面版，profile=`desktop`）+ 独立开发 profile `web`
> 证据目录：`research/`（REPORT.md 为调研员原始报告，含全部代码片段）

---

## 第一部分：必须先纠正的 4 个认知

### 纠正 1：开屏动画不能只靠 client 半边（最重要）

`dsh-550c-boot` 作者用 CDP 实测的开机时序：

| 事件 | 时刻 |
|---|---|
| DSH 自带开机卡片 `[data-dsh-boot]`（"HARNESS / Loading plugins…"）出现 | **67 ms** |
| 我们的 client 插件求值、overlay 挂载 | **338 ms** |
| DSH 开机卡片被移除 | 517 ms |

**271ms 空窗期**：client 侧不管 z-index 调多高都盖不住，因为它根本还没执行。

→ **正解**：首帧由 **host 半边** 通过 `ctx.on('webserver/index-inject', table => ...)` 注入
`{kind:'style'}` + `{kind:'script'}`，紧跟 `<head>`，早于 shell 的 module script。

**已实测确认**：该事件在本实例存在 —
`'webserver/index-inject'(table: IndexInjection[]): void`，mode=emit。

### 纠正 2：`tapIndex` 在桌面端是死代码

官方 host `webServer` 服务确实提供 `tapIndex` / `applyIndexTaps` / `renderIndex`，
但**桌面主窗口走 `dsh-app://` 协议直读 SPA 的 index.html，从不调用 `renderIndex()`**。

→ 必须用 `webserver/index-inject`（浏览器 / 桌面主窗口 / 悬浮窗三端通用），**不要用 `tapIndex`**。
→ 注入行有**白名单校验**：未知 `kind` 会被 boot gate 直接 reject，可能把桌面端打进崩溃恢复页。只产出 `style` / `script`。

### 纠正 3：官方没有任何动效时长/缓动 token

实测扫描 `ui-theme` / `ui-conversation` / `ui-chat@0.2.0-rc.2` 三个 bundle，
`--dsh-*` / `--dsw-*` 中**不含** duration / ease / delay / timing / speed / motion 任何一项（空集）。

→ **所有动效节奏必须插件自带 CSS 变量**（例如 `--bj-dur-fast: 160ms`）。
→ 反过来这是好事：动效完全由我们定义，不会被官方主题带跑。
→ 官方自身动画可作风格基准：`hero-fish-swim`（1.6s ease-in-out infinite）、`input-pending`（opacity .35→1）、
`dsh-turn-preview-enter`、`dsh-turn-mark-busy`。
→ 官方只在 `@media (hover:hover) and (prefers-reduced-motion:no-preference)` 里开动画，**这是官方认可的无障碍写法，我们照做**。

### 纠正 4：`overrideTokens` 必须传双模式，且旧项目有"静默失效"陷阱

- `ctx.theme.overrideTokens(source, tokens)` 的 token 值**必须是 `{light, dark}` 对象**，传裸字符串会抛"教学错误"。
- **实测陷阱**：`dsh-endfield-ui` 的 `theme.css` 引用了 `--ds-transition-duration-slow` 和 `--ds-ease-in-out`
  （第 882 / 903 / 941 / 1724 行），但**全文件无定义**，官方包里也不存在 → 这些 transition 静默失效。
  **→ 可以借鉴它的动画，但绝不抄这两个变量名。**

---

## 第二部分：你的三个需求，拆成可验收的目标

你说"对视觉描述不准确、只看过视频"，所以下面把模糊描述翻译成可验收条目。
**每一项都需要你看实际效果后确认，我无法替你判断审美。**

### 需求 A：开屏动画

| 项 | 可验收标准 | 难度 |
|---|---|---|
| A1 | 从导航到首帧**不出现 DSH 的 "Loading plugins…" 卡片** | 中（必须 host 注入） |
| A2 | 开屏时长可配置（建议 2.5–3.5s），有明确退场动画 | 低 |
| A3 | **刷新/切会话不重复播放**（`sessionStorage` 去重） | 低（多数项目都没做） |
| A4 | 两条退出路径：应用就绪 / 失败态（spinner 消失）/ 绝对超时（12s） | 中 |
| A5 | `prefers-reduced-motion` 下自动降级 | 低 |
| A6 | 提供"跳过"或设置项关闭 | 低 |

### 需求 B：风格界面

| 项 | 可验收标准 | 难度 |
|---|---|---|
| B1 | 全量配色覆盖（明/暗双模式都无白底白字、无对比度不足） | 中 |
| B2 | 品牌字标替换（`sidebar.brand.mark` / `.name`） | 低 |
| B3 | 背景氛围层（网格/纹理/渐变，你自己的素材） | 低 |
| B4 | 圆角 / 阴影 / 毛玻璃质感（token 里没有的靠 C 层 CSS） | 中–高 |
| B5 | 字体接入（你的字体，需 `.woff2` + 授权确认） | 低 |

### 需求 C：对话动画（生态空白，从零做）

| 项 | 可验收标准 | 难度 |
|---|---|---|
| C1 | 助手消息入场动画（淡入 + 位移） | 中 |
| C2 | 流式输出过程中的节奏动效 | 中–高 |
| C3 | 工具调用卡片的展开/收起缓动 | 中 |
| C4 | 不以牺牲滚动跟随为代价（需处理官方 follow ledger 的误判） | 高 |

**⚠️ C4 是隐藏难点**：`dsh-web-scroll-flow` 作者记录了必须的两处补偿——
① 平滑滑行途中 `gap>25px` 的 scroll 事件会被官方 follow ledger **误判为读者输入**，需用 window 捕获阶段监听器抑制；
② 残留 lag 会让状态标签每行下沉几 px，需 rAF 打 `translateY(-min(lag, PIN_CAP))` 抵消。
**做对话动画必然会碰到这个管线**，必须留出调试时间。

---

## 第三部分：技术路线（A + B + 自写 C）

### 分层职责

| 层 | 手段 | 官方支持度 | 风险 |
|---|---|---|---|
| **A：主题 token** | `ctx.theme.overrideTokens(id, {light,dark})` 覆盖 `--dsw-alias-*`（约 130 个语义 token，实测总量 403 个 `--dsw-*`） | ✅ 完全官方 | 低 |
| **B：品牌与开屏** | ① host `webServer.register({kind:'prefix'})` 提供素材<br>② host `webserver/index-inject` 首帧<br>③ client `shell.overlay`（list，**click-through**）渲染正片 | ✅ 官方接缝 | 低–中 |
| **C：视觉语言** | 注入自有 CSS，**分级使用选择器**（见下） | ⚠️ 官方未承诺 | 中–高 |
| **C+：对话动画** | 轻量：命中官方 `data-*`；重度：注册 `conversation.chat.node`（keyed 替换） | ⚠️ 接缝存在但生态空白 | 中–高 |

### C 层的分级纪律（这是控制"会不会碎"的核心）

基于我对 `dsh-endfield-ui` 273 条 CSS 规则的实测分类：

| 允许等级 | 选择器类型 | 占比参考 | 说明 |
|---|---|---|---|
| ✅ **一级（放心用）** | 我们自己的类名（`bj-*`） | 46.5% | 我们 overlay 里的元素，完全归我们 |
| ✅ **二级（推荐）** | 官方 `data-*` 属性 | 26.4% | `[data-slot=...]`、`[data-chat-flow]`、`[data-content-phase]` 等，是官方自己输出的语义属性 |
| ⚠️ **三级（谨慎、集中管理）** | 原生标签 / `:has()` / `[role=]` | ~6% | 能用但易受结构变化影响，集中放一个文件便于修 |
| ❌ **禁止** | CSS Modules 哈希类（`.Mbwy4a_card`） | 4% | 随构建变化，必碎 |
| ❌ **禁止** | 第三方插件私有类名 / 属性 | — | `.shikitor-output`、`[data-dsh-better-sidebar]` 等 |
| ❌ **禁止** | 硬编码 `[aria-label="中文"]` | — | endfield 踩过：`button[aria-label="新建会话"]`，语言一换即碎 |
| ❌ **禁止** | `root` slot | — | 官方原文 "DO NOT register here"，会替换整个 AppFrame |

**实测可用的官方 `data-*` 属性清单**（已确认在 0.2.0-rc.2 官方包中存在）：
`data-chat-flow`、`data-chat-flow-kind`、`data-chat-node-key`、`data-chat-turn`、
`data-conversation-scroll`、`data-follow-end`、`data-turn-tail`、`data-turn-trigger`、
**`data-content-phase`（取值 `hero` / `active` / `settling` — 做分阶段出现动画极其好用）**、
`data-streaming`、`data-chat-running`、`data-shimmer-decoration`。

### 对话动画的两条路线（需你选，风险差很多）

**路线 1（轻量、推荐先做）**：只用官方 `data-*` + CSS transition/animation
- 优点：不替换任何官方渲染，零功能损失，可随时关掉
- 缺点：动效表达力受限（只能改外观，不能改结构）

**路线 2（重度）**：注册 `conversation.chat.node` 的某个 key（如 `assistant-step`）
- 官方原文："**Reusing a key replaces that node renderer**"
- 优点：能完全接管消息渲染，做真正的自定义动效/结构
- 缺点：**我们得自己渲染整个节点**，官方消息的所有行为（markdown、图片、复制、反馈按钮）都要自己接回来，逐版本跟进
- 15 个调研项目里**无人使用**，无先例可抄

---

## 第四部分：工程骨架来源（搬结构，不搬风格）

### ⚠️ 先说一个法律前提

**`dsh-endfield-ui` 的 MIT 无法确认**：GitHub API 对该仓库返回 `license: null`（根目录无被识别的 LICENSE 文件）。
→ **不要直接复制它的代码**。可以做"读源码学结构"，但落笔必须自己写。

### 推荐骨架（按优先级）

| 用途 | 来源 | License | 为什么 |
|---|---|---|---|
| **主骨架：开屏 + 首帧 + 看门狗** | `yannicksong0106/dsh-550c-boot` | MIT ✅ | 唯一量化并解决"271ms 空窗"的项目；host/client 职责划分清晰；三条看门狗退出路径齐全；Shadow DOM 隔离；`ARCHITECTURE.md` 本身是设计文档 |
| **最小可读模板（先跑通）** | `yanglingrise/dsh-erii-boot-splash` | MIT ✅ | 125 行内含"`<style>` 注入 + `ctx.effect` 卸载 + `shell.overlay` 注册 + 计时器退场"四件事 |
| **去重 + 无障碍 + 退出路径清单** | `52baihehhh-ai/dsh-splash-screen` | MIT ✅ | 唯一做刷新去重的项目；唯一写下"为什么不用 tapIndex" |
| **素材路由结构** | 参考 endfield `index.js` 的**模式**（自己写） | 未确认 ⚠️ | `webServer.register({kind:'prefix'})` + content-type 表 + `readFileSync` 白名单 |
| **动效与官方滚动管线共存的两处补偿** | `TYOPXN360/dsh-web-scroll-flow` | 无 license ⚠️ | 读它的注释学经验，别抄代码 |

**结论**：主骨架用 **550c-boot（MIT）**，最小模板用 **erii-boot-splash（MIT）**，
endfield 与 scroll-flow **只读不抄**。

---

## 第五部分：分期计划

| 期 | 产出 | 你能验收什么 | 预估 |
|---|---|---|---|
| **P0** | 隔离开发环境 + 素材路由 + token 骨架装进 `web` profile | 浏览器里能打开，配色出现变化 | 1 天 |
| **P1** | A 层：全量 token（明暗双模式）+ 字体 + 品牌字标 | 整体换色，字标变 Boujoy | 1 天 |
| **P2** | B 层：host 首帧注入 + 开屏动画（含去重/看门狗/降级） | **启动不再看到 DSH Loading 卡片**，开屏动画完整 | 1–2 天 |
| **P3** | B 层：背景氛围层 + HUD 装饰（用你的素材） | 有 Boujoy 的"氛围世界" | 1–2 天 |
| **P4** | C 层一级/二级选择器：圆角、阴影、材质、侧栏几何 | 控件手感不再是 DSH 原样 | 2–3 天 |
| **P5** | 对话动画（先路线 1，视效果决定是否上路线 2） | 消息/工具卡片有动效 | 2–4 天 |
| **P6** | 回归：明暗/跟随系统、窄窗、刷新不重复、卸载干净、reduced-motion | 一份验收清单全过 | 1–2 天 |
| **P7**（可选） | 注册进 `desktop` profile | 你现在这个窗口也能看到 | 0.5 天 |

**核心部分（P0–P3）约 5–7 天出可用 1.0；含 C 层与对话动画约 10–14 天。**

---

## 第六部分：风险登记册

| # | 风险 | 影响 | 应对 |
|---|---|---|---|
| R1 | **没有任何项目支持 0.2.0-rc.2**（最高验证到 rc.1） | 参考实现可能直接跑不起来 | 只搬结构自己写；每步在隔离 `web` profile 验证 |
| R2 | 开屏 271ms 空窗漏出 DSH boot card | 开屏"不干净" | host `index-inject` 首帧（已确认事件存在） |
| R3 | 注入行白名单拒绝未知 `kind` | 桌面端可能进崩溃恢复页 | 只用 `style` / `script` |
| R4 | 对话动画干扰官方滚动跟随 | 流式输出时滚动乱跳 | 预留 P5 调试时间；参考 scroll-flow 的两处补偿 |
| R5 | 刷新重复播放开屏 / 重复注入 `<link>` | 观感 bug | `sessionStorage` 去重 + 注入去重 |
| R6 | CSS 选择器随版本碎 | 升级后界面崩 | 三级纪律 + 集中管理三级选择器 |
| R7 | 素材/字体授权 | 无法公开分发 | 你提供素材时确认授权；字体转 `.woff2` |
| R8 | 动效无官方 token | 无法跟主题联动 | 自带 `--bj-*` 动效变量 |
| R9 | 改坏你正在用的桌面端 | 影响工作 | **全程在隔离 `web` profile + 独立端口**，不碰 `desktop` |

---

## 第七部分：需要你提供 / 决策的事项

### 必须提供
1. **素材**：logo（SVG/透明 PNG 优先）、字体文件（`woff2` 最佳）、背景/纹理图 → 放一个目录路径告诉我就行
2. **视觉定位**：主色 + 强调色的具体色值；一句话风格定义（如"深空工业 / 冷冽精密 / 温暖纸感"）
3. **品牌文案**：开屏上要显示的产品名、副标题、版本号等文字

### 必须决策
4. **第二个参考项目是哪个？** 我至今未收到你指定。候选：
   - `LaplaceYoung/dsh-qq2006`（QQ2006 皮肤）
   - `WYH66666666/DSH-Transparent-UI-Plugin`（玻璃质感，**AGPL-3.0**）
   - `hunter118/dsh-s7r`（macOS System 7）
   - `AKS1st/dock`（VSCode 式外壳）
   - 或直接给我视频标题/链接
5. **对话动画走路线 1 还是路线 2？**（建议先 1）
6. **只做 `web` 还是同时上 `desktop`？**
7. **开屏时长**与**是否需要"跳过"按钮**
8. **自用还是分发？**（决定是否从第一天按可发布标准做：隔离测试、版本约束、素材许可、README）

### 可选（能显著降低返工）
9. 若你能**实际体验一次参考项目的效果**（我可以帮你装进隔离 profile），比看视频准确得多——视频可能来自不同版本或经过剪辑。

---

## 附：本轮调研的取证可复现方式

- DSH 版本：`Invoke-RestMethod https://registry.npmjs.org/@deepseek-ai/dsh`
- Slot 目录（90 条）+ contracts：`@deepseek-ai/dsh-cordis-client-runner@0.2.0-rc.2`
- token 清单（403 个 `--dsw-*`）：`@deepseek-ai/dsh-client-ui-theme@0.2.0-rc.2`
- 官方 `data-*` 与 keyframes：`@deepseek-ai/dsh-client-ui-chat` / `-conversation@0.2.0-rc.2`
- 仓库元数据：`https://api.github.com/repos/<owner>/<repo>`
- 本实例实测：`cordis_inspect_query`（host/Event 已确认 `webserver/index-inject`；client/Slots 已确认 90 slot）
