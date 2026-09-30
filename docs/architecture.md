# architecture.md —— 架构与数据流说明

> 目标读者：准备动手改代码的人或 AI。**动手前必读。**
>
> 证据等级：**【实测】**= 本机/官方包验证过；**【引用】**= 参考项目说法；**【未确认】**= 待验证。

---

## 1. 全局定位

本项目是 **DSH 的一个 bundle 插件**，运行在 DSH 的两个半边：

```
┌──────────────────────────── DSH 进程 ────────────────────────────┐
│                                                                  │
│  ┌─── Host 半边（Node）──────────┐   ┌─── Client 半边（浏览器）──┐ │
│  │  index.js                     │   │  client.js                │ │
│  │  · webServer 素材路由          │   │  · theme.overrideTokens   │ │
│  │  · webserver/index-inject 首帧 │   │  · slots 注册 overlay     │ │
│  │                               │   │  · 注入 theme.css         │ │
│  └───────────────────────────────┘   └───────────────────────────┘ │
│              │                                     ▲              │
│              │ 静态素材 / 首帧注入行                 │ 页面加载后求值  │
│              └─────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

**关键点**：两个半边**职责不同、启动时机不同**。搞混这一点是本项目最大的技术陷阱。

---

## 2. 改造分层（A / B / C / C+）

| 层 | 手段 | 官方支持度 | 承载文件 |
|---|---|---|---|
| **A：主题 token** | `ctx.theme.overrideTokens()` | ✅ 完全官方 | `client.js` |
| **B：素材与浮层** | host 素材路由 + 首帧注入 + `shell.overlay` | ✅ 官方接缝 | `index.js` + `client.js` |
| **C：视觉覆盖** | 注入自有 CSS | ⚠️ 官方未承诺 | `theme.css`（分级见 `DESIGN.md` §4） |
| **C+：对话动画** | 官方 `data-*` 或注册 `conversation.chat.node` | ⚠️ 接缝存在但生态空白 | `client.js` + `theme.css` |

---

## 3. ⭐ 启动时序（本项目最关键的知识点）

### 3.1 实测时序【引用：dsh-550c-boot 作者 CDP 实测】

```
t=0ms     导航开始
          │
t=67ms    DSH 自带开机卡片 [data-dsh-boot] 出现（"HARNESS / Loading plugins…"）
          │  ⚠️ 此刻我们的 client.js 还没被执行
          │
t=271ms   ← ⚠️ 空窗期：client 侧无论 z-index 多高都盖不住
          │
t=338ms   我们的 client 插件求值完成，shell.overlay 挂载
          │
t=517ms   DSH 开机卡片被移除
```

### 3.2 结论：开屏必须双半边

| 半边 | 职责 | 时机 |
|---|---|---|
| **host** | 注入首帧遮罩（纯 CSS + 极简脚本） | 紧跟 `<head>`，**早于 shell 的 module script** |
| **client** | 渲染开屏正片（React 组件 + CSS 动画） | 338ms 后 |
| **host 注入的脚本** | 看门狗：检测应用就绪后退役首帧遮罩 | 持续轮询 |

### 3.3 首帧注入的正确写法【实测：事件存在于本实例】

```js
// index.js（host 半边）
export const name = 'boujoy-harness'
// 注意：不需要 inject 任何 service
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    // table: IndexInjection[]
    table.push({ kind: 'style', text: FIRST_FRAME_CSS })
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
  })
}
```

事件契约【实测】：`'webserver/index-inject'(table: IndexInjection[]): void`，mode = `emit`。

### 3.4 ⛔ 不要用 `tapIndex`

官方 host `webServer` 服务确实提供 `tapIndex` / `applyIndexTaps` / `renderIndex`，
但**桌面主窗口走 `dsh-app://` 协议直读 SPA 的 index.html，从不调用 `renderIndex()`**
→ `tapIndex` 在桌面端是**死代码**【引用：dsh-splash-screen README 的实测记录】。

### 3.5 ⛔ 注入行白名单

未知 `kind` 会被 boot gate **直接 reject**，可能把桌面端打进崩溃恢复页。
**只产出 `kind: 'style'` 和 `kind: 'script'`。**

### 3.6 看门狗的三条退出路径【引用：dsh-550c-boot】

```js
var card = document.querySelector('[data-dsh-boot]')
watch = setInterval(function () {
  if (card === null) { if (seen) end(); return }            // ① 卡片消失 = 应用已挂载
  seen = true
  if (card.querySelector('[data-dsh-boot-spinner]') === null) end()  // ② 掉 spinner = shell 失败态
}, 250)
setTimeout(end, 12000)                                       // ③ 绝对超时上限
window.__boujoyFirstFrame = { end: end }                     // client 就绪后可主动退役首帧
```

⚠️ 依赖 `[data-dsh-boot]` / `[data-dsh-boot-spinner]` 两个**未文档化的内部标记**。
若 DSH 改名，看门狗退化为"只能等 12s 超时"（不会崩，但体验变差）。**属可接受的降级**。

---

## 4. 运行时的三条数据流

### 4.1 素材流（host → 浏览器）

```
assets/ 目录
  │  readFileSync 启动时读入内存（白名单 Map）
  ▼
ctx.webServer.register({ kind: 'prefix', path: '/boujoy' })
  │  GET /boujoy/assets/xxx.woff2
  ▼
浏览器（<link> / <img> / @font-face）
```

- 必须 `ctx.effect(() => ctx.webServer.register(...), 'label')` 包起来（HMR 安全）
- **白名单查表**：`Map.get(pathname)` 未命中直接 404 —— 天然防路径穿越
- 已实测同类实现可行【引用：endfield `index.js` 61 行】

### 4.2 样式流（client → DOM）

```
client.js apply()
  ├─ ctx.theme.overrideTokens('boujoy-harness', { light, dark })   ← A 层
  └─ 注入 <link href="/boujoy/theme.css">                          ← C 层
        └─ 官方没提供注入 CSS 的 API，走 document.head.appendChild
           ⚠️ 必须自己做去重 + ctx.effect 卸载时移除
```

### 4.3 浮层流（client → slot 系统）

```
client.js apply()
  └─ ctx.slots.inject('shell.overlay', () =>
       ctx.slots.register({ name: 'shell.overlay', id: 'boujoy-shell', order: … }, Component))
```

`shell.overlay` 契约【实测官方原文】：

- `kind: 'list'`、`scope: 'root'`
- **click-through**："The layer itself is click-through — entries opt back into pointer events"
  → 条目自己设 `pointer-events`，要交互（如跳过按钮）就在按钮上重新开启
- 支持 `order` 排序；标准 cordis effect，卸载即摘除

### 4.4 对话动画（client → 对话节点）

两条路线：

**路线 1（轻量）**：CSS 命中官方 `data-*` 属性
```
[data-content-phase="hero"]     → 入场动画
[data-content-phase="active"]   → 稳定态
[data-content-phase="settling"] → 收束动画
[data-chat-node-key]            → 单节点定位
```
零功能风险，可随时关掉。

**路线 2（重度）**：`ctx.slots.register({ name: 'conversation.chat.node', key: 'assistant-step' }, ...)`
官方原文："**Reusing a key replaces that node renderer**"
→ 需自己渲染整个节点，把 markdown / 图片 / 复制 / 反馈等行为全部接回。
**15 个调研项目中无人使用，无先例。**

---

## 5. 插件生命周期与卸载

```
Loader 挂载插件行
  │
  ├─ host: apply(ctx) → 注册素材路由 + index-inject 监听器
  │         └─ ctx.effect(...) 保证卸载时路由被摘除
  │
  └─ client: apply(ctx)
            ├─ theme.overrideTokens → 返回 disposer
            ├─ slots.register       → cordis effect
            └─ 注入的 <link>         → 必须挂在 ctx.effect 里移除
```

**卸载验收标准**：卸载后 `dsh web` 完全恢复原生外观，
无残留 `<link>`、无 404 素材请求、无残留 DOM 属性（如 `body[data-boujoy-*]`）。

---

## 6. profile 与组合层

```
$DSH_HOME/profiles/web/
├── package.json           # dsh.profile.bundles 有序列表
├── cordis.patch.yml       # 用户自己的补丁层（在 bundle 层之后应用）
└── pnpm-workspace.yaml
```

**层顺序**【引用：官方 publish.md】：

1. `dsh.profile.bundles` 列出的各 bundle patch，按列表顺序（先 `@deepseek-ai/dsh-base`）
2. profile 自己的 `cordis.patch.yml`
3. `$DSH_HOME/cordis.patch.yml`（跨 profile 共享）
4. 每个 `--patch` overlay（按 argv 顺序）

**后应用层按行胜出**，且**patch 替换整行 `config`，不做深合并**
→ 覆盖官方行必须重述该行全部 key。

### 6.1 两个 profile 的差异

| | `desktop`（用户在用） | `web`（开发沙盒） |
|---|---|---|
| 管理方 | Electron 应用独占，**CLI 拒绝操作** | CLI 可管理 |
| bundles | base、web-app、agent-team、auto-review、voice-input | base、web-app |
| 界面 | 与 web **完全相同**（同一批 `dsh-client-ui-*`） | 相同 |

> 这意味着一套主题插件**两个 profile 都能用**，不需要写两遍。

---

## 7. 目录结构规划

```
boujoy-harness/
├── README.md
├── AGENTS.md
├── docs/                    # 文档（已建立）
├── research/                # 调研资料（已建立）
└── plugin/                  # P0 建立
    ├── package.json
    ├── cordis.patch.yml
    ├── index.js             # host：素材路由 + 首帧注入
    ├── client.js            # client：token + overlay + CSS 注入 + 对话动画
    ├── theme.css            # A/C 层样式
    ├── overrides.tier3.css  # 三级选择器收容文件（见 DESIGN.md §4.2）
    ├── first-frame.js       # 首帧注入的 CSS/JS 字符串（host 用）
    └── assets/
        ├── logo.svg
        ├── fonts/*.woff2
        └── textures/*
```

---

## 8. 已知架构约束

| 约束 | 影响 |
|---|---|
| 动效无官方 token | 必须自带 `--bj-*` 变量 |
| `overrideTokens` 需 `{light,dark}` 对 | 少一个模式会在该模式下裸奔 |
| patch 整行替换 | 覆盖官方行要重述全部 key |
| 新插件首次需重启进程 | `window.__DSH_BOOT__` 名册在进程内缓存 |
| client 侧 inspect 需要活动页面 | 无页面时查询会超时 |
| 注入行白名单 | 未知 kind 会导致桌面端崩溃恢复页 |
| `[data-dsh-boot]` 未文档化 | 改名则看门狗降级（不崩） |
