# component-api.md —— 组件 API 文档

> 本文件分两部分：
> **第一部分**是 DSH 官方 API 契约（本项目**调用**的），全部带实测签名；
> **第二部分**是本项目自有组件的 API（**尚未实现**，P0 之后补全真实签名）。
>
> 证据等级：**【实测】**= 在本机 DSH 0.2.0-rc.2 实例或官方包中验证；**【引用】**= 官方文档/参考项目。

---

# 第一部分：DSH 官方 API（本项目调用）

## 1. Client 侧服务

### 1.1 `ctx.theme` —— 主题服务【实测】

> 服务描述原文要点：`light`/`dark` 是内置的；第三方主题注册 **alias 层覆盖**；
> `overrideTokens` 在不触碰注册表的前提下叠加局部 token 层。

| 方法 | 签名 | 说明 |
|---|---|---|
| `getTheme` | `(): ThemeSnapshot` | 读取当前不可变主题快照 |
| `setTheme` | `(id: string): void` | **唯一的用户偏好写入口**；未注册 id 抛错 |
| `setFontSize` | `(px: number): void` | 正文字号，整数，范围 `FONT_SIZE_MIN..MAX`；越界或小数抛错 |
| `register` | `(definition: ThemeDefinition): () => void` | 注册主题；**重复 id 抛错**；返回 disposer |
| `overrideTokens` | `(source: string, tokens: ThemeTokenOverrides): () => void` | **本项目主要使用** |

**类型定义【实测】**：

```ts
interface ThemeDefinition {
  id: string
  colorScheme: 'light' | 'dark'
  tokens: ThemeTokens                       // Record<string, string>
}
type ThemeTokenOverrides = Record<string, ThemeTokenModes>
interface ThemeTokenModes { light: string; dark: string }   // ⚠️ 必须成对
interface ThemeSnapshot {
  preference: ThemePreference
  fontSize: number
  active: ThemeDefinition
  themes: readonly ThemeDefinition[]
  revision: number
}
```

**本项目用法**：

```ts
ctx.theme.overrideTokens('boujoy-harness', {
  '--dsw-alias-bg-base': { light: '#f7f5f0', dark: '#0b0d10' },
})
```

**注意事项**：
- ⚠️ 传裸字符串会抛**教学错误**——必须 `{ light, dark }` 对
- `overrideTokens` 再次以同一 `source` 调用会**替换该 source 的整个层并重新置顶**
- 返回的 disposer 只能移除**本次调用**创建的层；若该 source 已被重新覆盖，disposer 是 no-op

### 1.2 `ctx.theme` 相关事件【实测】

| 事件 | 签名 | 用途 |
|---|---|---|
| `theme/change` | `(snapshot: ThemeSnapshot): void` | 主题状态变化（偏好切换、注册表更新、`system` 下 OS 配色翻转） |

### 1.3 `ctx.slots` —— Slot 系统【实测】

| 方法 | 签名 |
|---|---|
| `register` | `SlotCore['register']` |
| `registerFactory` | `RegisterFactory` |
| `inject` | `(key: keyof SlotMap & string, callback: () => SlotInjectionEffect): () => void` |

**本项目用法**：

```ts
ctx.slots.inject('shell.overlay', () =>
  ctx.slots.register(
    { name: 'shell.overlay', id: 'boujoy-shell', order: 40, label: 'Boujoy shell' },
    ShellComponent,
  ),
)
```

**注册项字段**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | ✅ | 目标 slot 名 |
| `id` | string | ✅（list slot） | 列表项唯一标识 |
| `key` | string | ✅（keyed slot） | keyed 分发的 key |
| `order` | number | ❌ | 排序；值小的先渲染 |
| `label` | `string \| (() => string)` | ❌ | 可读标签 |
| `inject` | factory | ❌ | 功能私有注入点 |
| `store` | — | ❌ | 声明共享视图状态 |
| `locale` | namespace | ❌ | 提供 `t` 函数 |

### 1.4 `shell.overlay` slot 契约【实测官方原文】

> "Frame-wide floating layer, above every column and outside their scroll containers.
> **The layer itself is click-through — entries opt back into pointer events**,
> so an occupant never blocks the app underneath."
> "This is the **additive** seat for a frame-wide surface of your own:
> a fresh `id` is added beside the shipped entries instead of replacing them."

| 属性 | 值 |
|---|---|
| `kind` | `list`（**增量，不替换**） |
| `scope` | `root` |
| `replaceRisk` | `none` |
| 点击穿透 | ✅ 默认穿透，条目需自行 `pointer-events: auto` 才有交互 |
| 需要 props | `useResource`、`useWorkspaces`、`usePanelInfo`、`useSessions`、`useSessionStatus`、`useSessionRetainInfo` |

### 1.5 `conversation.chat.node` slot 契约【实测官方原文】

> "Final Chat node renderer, **keyed by `ChatNodeKind`**. The component receives
> the typed node, shared Chat actions, and Turn-data hook.
> **Reusing a key replaces that node renderer**; a kind with no occupant renders no row."

| 属性 | 值 |
|---|---|
| `kind` | `keyed` |
| `scope` | `session` |
| `replaceRisk` | `shadows-shipped-ui`（⚠️ 替换语义） |
| 已有 19 个 key | `assistant-step`、`user`、`tool-call`、`turn-tail`、`compaction`、`turn-process`、`turn-error`、`turn-max-tokens`、`command`、`command-input`、`context`、`manual-compaction`、`model-retry`、`question-reply`、`steering`、`system-prompt`、`turn-trigger`、`unknown`、`workflow-run` |

**ownerProps（`ChatNodeOwnerProps`）**：

```ts
interface ChatNodeOwnerProps {
  groupPart?: string
  cwd?: string | undefined
  openSkill: (name: string) => void
  openFile: (path: string, options?: OpenFileOptions) => void
  inspectCall: ((callId: ToolCallId) => void) | undefined
  forkAt: (seq: number) => void
  loadImage: MessageImageLoader
  renderMessageImages: RenderMessageImages
  fileMentions: (owner: TurnTailOwnerProps) => MarkdownFileMentions | undefined
  turnProcess?: TurnProcessOwnerProps | undefined
}
```

**standardProps**：`useResource`、`useWorkspaces`、`usePanelInfo`、`useSessions`、`useSessionStatus`、
`useSessionRetainInfo`、`useChat`、`useConversation`、`useInput`、`inputActions`、`useSession`、
`sessionId`、`useProjection`、`useTrajectory`

**slot 级注入面**：`ChatNodeInjected`（含 `useTurnData(key)`），hookContext 为 `ChatNodeHookContext`

### 1.6 `conversation.chat.turnTail` slot 契约【实测官方原文】

> "Ordered feature contributions **before a completed Turn's action row**.
> Each entry receives the Turn, closing sequence, and file opener.
> A fresh `id` adds an entry; entries without content return null."

| 属性 | 值 |
|---|---|
| `kind` | `list`（**纯增量**） |
| `scope` | `session` |
| `replaceRisk` | `none` |

### 1.7 其他与本项目相关的 slot【实测，完整 90 个】

| slot | kind | scope | 本项目用途 |
|---|---|---|---|
| `root` | single | root | ⛔ **禁止注册** |
| `shell.overlay` | list | root | ✅ 开屏正片 / 氛围层 |
| `shell.leading` | single | root | 窗口左上角 chrome 位 |
| `shell.quota-notice` | chain | root | — |
| `sidebar.brand.mark` | single | root | ✅ 品牌 logo（替换点） |
| `sidebar.brand.name` | single | root | ✅ 品牌名（替换点） |
| `sidebar` | single | root | ⚠️ 整列替换点，高风险 |
| `sidebar.panellist` | list | root | 全局面板图标（增量） |
| `sidebar.footer.action` | list | root | 侧栏底部动作（增量） |
| `conversation.chat.node` | keyed | session | ✅ 对话节点动画（路线 2） |
| `conversation.chat.turnTail` | list | session | ✅ turn 尾部动效（增量） |
| `conversation.chat.assistant-actions` | list | session | 助手消息动作（增量） |
| `conversation.session.header.actions` | list | session | 会话头动作（增量） |
| `conversation.composer.dock` | list | session | 输入卡下方氛围条 |
| `conversation.input.dock` | list | session | 输入卡上方全宽条目 |
| `conversation.hero.brand.mark` | single | root | 空白会话页品牌位 |
| `settings.section` | list | root | 新增设置页 |
| `settings.general.item` | list | root | 新增单个设置行 |
| `tool.call.toolview` | keyed | session | 工具卡片视图（keyed 替换/新增） |

> 完整清单用 `cordis_inspect_query`（client / Slots / `listSubTree`）实时查询。

### 1.8 Client 事件【实测】

| 事件 | 签名 |
|---|---|
| `connection/reset` | `(): void` |
| `locale/change` | `(snapshot: LocaleSnapshot): void` |
| `slots/changed` | `(key: string): void` |
| `theme/change` | `(snapshot: ThemeSnapshot): void` |

---

## 2. Host 侧 API

### 2.1 `ctx.webServer` —— 浏览器 HTTP 载体【实测】

| 方法 | 签名 | 本项目用途 |
|---|---|---|
| `register` | `(route: WebRoute): () => void` | ✅ **素材路由** |
| `registerUpgrade` | `(route: WebUpgradeRoute): () => void` | — |
| `registerFallback` | `(handler: WebRoute['handler']): () => void` | 兜底（SPA dist server 占用，勿动） |
| `tapIndex` | `(transform: (html: string) => string): () => void` | ⛔ **桌面端死代码，勿用** |
| `applyIndexTaps` | `(html: string): string` | — |
| `collectIndexInjections` | `(): IndexInjection[]` | — |
| `renderIndex` | `(html: string): string` | — |

**`WebRoute` 结构【实测】**：

```ts
interface WebRoute {
  kind: 'exact' | 'prefix'
  path: string
  handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
}
```

**本项目用法**：

```ts
export const name = 'boujoy-harness'
export const inject = ['webServer']

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/boujoy',
    handler(req, res) {
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
      const file = ASSETS.get(pathname)          // Map 白名单，天然防穿越
      if (file === undefined) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Not found')
        return
      }
      res.writeHead(200, {
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': String(file.body.byteLength),
        'Content-Type': file.contentType,
      })
      res.end(file.body)
    },
  }), 'boujoy-harness: static assets')
}
```

> 注册顺序不影响请求（命名路由必须互不相同）；重复路径抛错。
> 路由注册是组合级契约，冲突即配置错误。

### 2.2 `webserver/index-inject` 事件【实测 —— 开屏关键】

```ts
'webserver/index-inject'(table: IndexInjection[]): void   // mode = emit
```

> 服务事件描述："Collect the structured index injection table."
> 每次 emit 时订阅者推入当前行（读取实时状态：模块图、主题偏好）。

**`IndexInjection` 类型【实测】**：

```ts
type IndexInjection =
  | { kind: 'global'; name: string; value: unknown }
  | { kind: 'script'; placement: IndexInjectionPlacement; text: string }
  | { kind: 'script-src'; placement: IndexInjectionPlacement; src: string }
  | { kind: 'script-preload'; src: string }
  | { kind: 'style'; text: string }
  | { kind: 'html'; placement: IndexInjectionPlacement; html: string }

type IndexInjectionPlacement = 'head' | 'body'
```

**本项目用法**：

```ts
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: FIRST_FRAME_CSS })
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
  })
}
```

**注意事项**：
- 不需要 `inject` 任何 service
- 渲染位置**紧跟 `<head>`**，早于 shell 的 module script
- ⚠️ **白名单校验**：未知 `kind` 会被 boot gate 直接 reject，可能把桌面端打进崩溃恢复页
  → **只产出 `style` 和 `script`**

### 2.3 `webserver/index-inject` 之外的相关事件【实测】

| 事件 | 签名 |
|---|---|
| `app-boot/config-reload` | `(): void` —— profile patch 被重读进运行树 |
| `hmr/reload` | `(reloads: Map<Plugin, Reload>): void` |

---

## 3. 官方 `data-*` 属性（CSS 选择器用）【实测确认存在于 0.2.0-rc.2】

| 属性 | 用途 |
|---|---|
| `data-slot="<slot名>"` | slot 宿主元素（如 `data-slot="sidebar"`） |
| `data-content-phase` | **取值 `hero` / `active` / `settling`** |
| `data-chat-flow` | 对话流容器 |
| `data-chat-flow-kind` | 对话流节点类型 |
| `data-chat-node-key` | 单个对话节点 |
| `data-chat-turn` | 单个 turn |
| `data-chat-running` | 运行中 |
| `data-conversation-scroll` | 对话滚动容器 |
| `data-follow-end` | 跟随到底部 |
| `data-composer-card` | 输入卡 |
| `data-turn-tail` | turn 尾部 |
| `data-turn-trigger` | turn 触发器 |
| `data-streaming` | 流式中 |
| `data-shimmer-decoration` | 微光装饰 |
| `data-ds-dark-theme` | 暗色标记（在 `body`） |
| `data-dsh-boot` | ⚠️ DSH 开机卡片（未文档化，看门狗用） |
| `data-dsh-boot-spinner` | ⚠️ 开机卡片内 spinner（未文档化） |

---

## 4. 主题 token 变量

**总量 403 个 `--dsw-*`【实测】**，分层见 [`DESIGN.md`](./DESIGN.md) §2。

**本项目自带动效变量**（官方无此类 token）：

```css
:root {
  --bj-dur-instant: 90ms;
  --bj-dur-fast:    160ms;
  --bj-dur-normal:  240ms;
  --bj-dur-slow:    420ms;
  --bj-ease-out:    cubic-bezier(.16, 1, .3, 1);
  --bj-ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --bj-ease-wipe:   cubic-bezier(.75, 0, .18, 1);
}
```

---

# 第二部分：本项目自有组件 API

> ⚠️ **状态：尚未实现（工程代码 0 行）。**
> 以下为 P0 之后要实现的**规划签名**，实现后必须回来替换为真实签名并补充示例。
> 命名遵循 `AGENTS.md` 与 `DESIGN.md` §5 的规范（类名前缀 `bj-`，变量前缀 `--bj-`）。

## 5. Host 半边（`index.js`）

### 5.1 插件元数据（规划）

```ts
export const name = 'boujoy-harness'
export const inject = ['webServer']
export function apply(ctx: Context): void
```

### 5.2 素材路由表（规划）

| 路由 | 内容类型 | 说明 |
|---|---|---|
| `GET /boujoy/theme.css` | `text/css; charset=utf-8` | 主样式表 |
| `GET /boujoy/assets/<name>` | 按扩展名 | logo / 纹理 / 图片 |
| `GET /boujoy/assets/fonts/<name>.woff2` | `font/woff2` | 字体 |

- 实现方式：启动时 `readFileSync` 进内存 `Map`，白名单查表
- 响应头：`Cache-Control`、`Content-Length`、`Content-Type`
- 未命中 → `404 text/plain`

### 5.3 首帧注入（规划）

```ts
const FIRST_FRAME_CSS: string      // 首帧遮罩样式（纯 CSS，覆盖 [data-dsh-boot]）
const FIRST_FRAME_SCRIPT: string   // 看门狗脚本（三条退出路径）
```

看门狗导出的全局句柄（规划）：

```ts
window.__boujoyFirstFrame = {
  end: () => void   // client 就绪后主动退役首帧
}
```

## 6. Client 半边（`client.js`）

### 6.1 `apply`（规划）

```ts
export const inject = ['slots', 'theme']
export function apply(ctx: ClientContext): void
```

职责：
1. `ctx.theme.overrideTokens('boujoy-harness', tokens)` —— A 层
2. 注入 `<link href="/boujoy/theme.css">`（**带去重**，`ctx.effect` 卸载时移除）
3. `ctx.slots.inject('shell.overlay', ...)` 注册开屏与氛围层
4. （可选）注册对话动效相关 slot 或 CSS

### 6.2 主题 token 表（规划）

```ts
const TOKENS: ThemeTokenOverrides = {
  '--dsw-alias-bg-base':       { light: '#…', dark: '#…' },
  '--dsw-alias-bg-layer-1':    { light: '#…', dark: '#…' },
  // … 覆盖 DESIGN.md §2.2 的 15 个核心 token + 状态色
}
```

### 6.3 开屏组件（规划）

```tsx
interface BootScreenProps {
  onDone: () => void
}
function BootScreen({ onDone }: BootScreenProps): JSX.Element
```

| 行为 | 说明 |
|---|---|
| 播放 | 挂载后按 CSS 时间轴播放 |
| 去重 | 读 `sessionStorage`，本页面会话内已播过则直接 `onDone()` |
| 跳过 | 提供跳过按钮；**按钮需自行开启 `pointer-events`**（overlay 默认穿透） |
| 退场 | 两段式：内容淡出 → 延迟 → 底幕淡出 |
| 降级 | `prefers-reduced-motion` 下最短化或跳过 |

### 6.4 氛围层组件（规划）

```tsx
interface AmbienceLayerProps {
  reducedMotion: boolean
}
function AmbienceLayer(props: AmbienceLayerProps): JSX.Element
```

- 纯装饰，根节点 `aria-hidden="true"`、`pointer-events: none`
- 常驻循环动画（扫描线 / 呼吸 / 漂移）
- `reducedMotion` 时关闭循环动画

## 7. 样式文件（规划）

| 文件 | 职责 |
|---|---|
| `theme.css` | A/C 层：token 消费、自有元素样式、动效定义 |
| `overrides.tier3.css` | **三级选择器收容文件**（原生标签 / `:has()` / `[role=]`），文件头写明每个选择器的作用与最后验证版本 |
| `first-frame.css` | 首帧遮罩（由 host 作为字符串注入，不打成文件） |

## 8. 待补全清单

实现后必须回到本文件补上：

- [ ] `index.js` 的真实导出与 Config schema
- [ ] 素材路由的完整清单与 content-type 映射
- [ ] `FIRST_FRAME_CSS` / `FIRST_FRAME_SCRIPT` 的真实内容与看门狗参数
- [ ] `TOKENS` 完整色板（依赖品牌素材）
- [ ] `BootScreen` 真实 props 与时长参数
- [ ] `AmbienceLayer` 真实 props
- [ ] 对话动效组件（若走路线 2，需完整记录 `conversation.chat.node` 渲染器契约）
- [ ] 所有组件的使用示例
