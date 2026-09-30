# DESIGN.md —— 项目视觉规范

> 本文件定义 Boujoy Harness 的视觉体系。**改任何样式前先读这里**，改完同步回写。
>
> 证据等级标注：**【实测】**= 本机/官方包验证过；**【引用】**= 来自参考项目说法；**【未确认】**= 待验证。

---

## 1. 设计原则

1. **官方接缝优先** —— 能用 token 就不写 CSS，能用官方 `data-*` 就不用结构选择器。
2. **可逆** —— 卸载插件后界面必须完全恢复 DSH 原生外观，不留残渣。
3. **不牺牲功能** —— 动效不得阻塞交互；不覆盖会破坏滚动手感、焦点可见性、reduced-motion 行为。
4. **分级纪律** —— 见 §4。选择器的脆弱度是可量化的，按等级使用。
5. **动效自带节奏** —— 官方没有动效 token（见 §3.3），所有时长缓动由本项目定义。

---

## 2. 主题 token 体系

### 2.1 总量【实测】

对 `@deepseek-ai/dsh-client-ui-theme@0.2.0-rc.2` 实测扫描，共 **403 个 `--dsw-*` 变量**：

| 前缀 | 数量 | 用途 | 第三方是否应覆盖 |
|---|---|---|---|
| `--dsw-alias-*` | **107** | **语义层** | ✅ **只覆盖这层** |
| `--dsw-static-*` | 77 | 原始调色板 | ❌ 不碰 |
| `--dsw-font-*` | 182 | 字体阶梯 | ⚠️ 谨慎（见 §3.2） |
| `--dsw-specific-*` | 11 | 特定区域（侧栏等） | ✅ 可覆盖 |
| `--dsw-radius-*` | 6 | 圆角刻度 | ⚠️ 需与 §3.4 的规则配合 |
| `--dsw-elevation-*` | 5 | 抬升/阴影 | ⚠️ 需与官方 elevation 规范配合 |
| `--dsw-shadow-*` | 4 | 阴影 | ⚠️ 同上 |
| `--dsw-menu-*` | 2 | 菜单材质 | ❌ **官方明确禁止覆盖** |
| `--dsw-focus-*` | 2 | 焦点环 | ❌ 不碰（无障碍） |
| `--dsw-mask-*` | 1 | 遮罩 | ❌ 不碰 |
| `--dsw-corner-shape` | 1 | 超椭圆平滑 | ⚠️ 标 `@supports` 才安全 |

### 2.2 优先级最高的 15 个 alias token（改这些能覆盖约 80% 观感）

| Token | 作用 |
|---|---|
| `--dsw-alias-bg-base` | 应用底色 |
| `--dsw-alias-bg-layer-1` | 一级抬升面 |
| `--dsw-alias-bg-layer-2` | 二级嵌套面 |
| `--dsw-alias-bg-layer-3` | 三级面 |
| `--dsw-alias-bg-overlay` | 浮层/弹窗底 |
| `--dsw-alias-border-l1` | 一级细边框 |
| `--dsw-alias-border-l2` | 二级强边框 |
| `--dsw-alias-brand-primary` | 品牌主色 |
| `--dsw-alias-brand-text` | 品牌文字色 |
| `--dsw-alias-label-primary` | 主文字 |
| `--dsw-alias-label-secondary` | 次文字 |
| `--dsw-alias-label-tertiary` | 三级文字 |
| `--dsw-alias-state-error-primary` | 错误态 |
| `--dsw-alias-state-success-primary` | 成功态 |
| `--dsw-alias-state-warn-primary` | 警告态 |

另有区域专属：`--dsw-specific-sidebar-fill`（侧栏底色）等 11 个。

### 2.3 覆盖方式【实测 API】

```ts
// 必须传 { light, dark } 对 —— 传裸字符串会抛「教学错误」
const dispose = ctx.theme.overrideTokens('boujoy-harness', {
  '--dsw-alias-bg-base':   { light: '#f7f5f0', dark: '#0b0d10' },
  '--dsw-alias-brand-primary': { light: '#…', dark: '#…' },
})
// 返回 disposer；再次以同一 source 调用会替换整个层并重新置顶
```

- `source` 用包名，便于在 inspect 里辨认这个层来自谁。
- 分层叠加：后叠加的层按 token 逐个胜出；移除层即恢复。
- **不要用 `ctx.theme.register()`** 除非确实要新增一个可被用户选择的主题 id
  （那需要 `{id, colorScheme, tokens}` 且要让用户 `setTheme(id)` 才生效）。

---

## 3. 非颜色视觉属性

### 3.1 圆角【实测：有 token】

`--dsw-radius-{xs,sm,md,lg,xl,panel}` 共 6 个 + `--dsw-corner-shape`。

⚠️ 官方规范：`corner-shape: round` 必须与每个全圆角（`50%` / `100%` / pill）配对，
否则圆和胶囊会失去正圆弧。超椭圆平滑要用 `@supports (corner-shape: superellipse(1.5))` 包裹。

### 3.2 字体【实测：有 token】

`--dsw-font-family-brand`（官方内置 Montserrat，自带 OFL 授权 woff2）+ 182 个 `--dsw-font-*` 阶梯。

本项目接入自有字体时：
- 格式 **`.woff2`**（授权需确认，endfield 专门列了一节素材授权检查）
- 通过 host 素材路由提供：`/boujoy/assets/xxx.woff2`
- 用 `@font-face` 声明后，再覆盖 `--dsw-font-family-*`

### 3.3 动效【实测：官方无 token —— 这是关键事实】

实测扫描 `ui-theme` / `ui-conversation` / `ui-chat@0.2.0-rc.2` 三个 bundle，
`--dsh-*` / `--dsw-*` 中**不含** duration / ease / delay / timing / speed / motion 任何一项（**空集**）。

→ **本项目自带动效变量**（命名空间 `--bj-`）：

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

**官方自身动画可作风格基准【实测】**：`hero-fish-swim`（1.6s ease-in-out infinite）、
`input-pending`（opacity .35→1）、`dsh-turn-preview-enter`、`dsh-turn-mark-busy`。

⚠️ **反面教材**：`dsh-endfield-ui` 引用了 `--ds-transition-duration-slow` 和 `--ds-ease-in-out`
（theme.css 第 882/903/941/1724 行），但**全文件无定义、官方包也不存在** → 那些 transition 静默失效。
**绝不照抄这两个变量名。**

### 3.4 阴影与抬升【实测：有 token，但有配对规则】

可用：`--dsw-shadow-lv1/2/3`、`--dsw-elevation-stroke(-color)/panel/prominent/soft`。

官方规范（必须遵守）：
- 抬升面（菜单、弹窗、面板、浮动按钮、输入卡）设 `border: 0`，用 `box-shadow` 表达抬升
- **禁止把 `--dsw-alias-border-*` 边框和 elevation 阴影配对**——官方 elevation spec 会拒绝这种组合
- 状态色边框（如警告面板）保持真边框

### 3.5 菜单材质【禁止覆盖】

官方原文：feature 与 platform CSS **must not override** `--dsw-menu-surface-fill` 和
`--dsw-menu-backdrop-filter`。菜单必须用官方 `Menu` / `MenuSurface` 承载。

### 3.6 边框宽度【实测：官方固定】

中性色平面边框/分隔线统一 `0.5px`（Chromium 渲染为 1 设备像素）。
虚线装饰与状态色边框保持 1px。**ui-theme elevation spec 会拒绝更宽的中性实线边框**。

---

## 4. ⭐ 选择器分级纪律（本项目最重要的规范）

基于对 `dsh-endfield-ui` 273 条 CSS 规则的实测分类得出的量化依据：

| 等级 | 类型 | 占比参考 | 允许 | 说明 |
|---|---|---|---|---|
| **一级** | 自有类名（`bj-*`） | 46.5% | ✅ 放心用 | 我们 overlay 里的元素，完全归我们 |
| **二级** | 官方 `data-*` 属性 | 26.4% | ✅ 推荐 | 官方自己输出的语义属性，稳定契约 |
| **三级** | 原生标签 / `:has()` / `[role=]` | ~6% | ⚠️ 谨慎 | 集中放一个文件，便于版本升级时统一修 |
| **四级** | CSS Modules 哈希类 | 4% | ❌ 禁止 | 随构建变化，必碎 |
| **四级** | 第三方插件私有类名/属性 | — | ❌ 禁止 | `.shikitor-output`、`[data-dsh-better-sidebar]` |
| **四级** | 硬编码 `[aria-label="中文"]` | — | ❌ 禁止 | 语言一换即碎 |
| **四级** | `root` slot | — | ❌ 禁止 | 替换整个 AppFrame |

### 4.1 可用的官方 `data-*` 属性清单【实测确认存在于 0.2.0-rc.2】

| 属性 | 用途 |
|---|---|
| `data-slot="<slot名>"` | 标记 slot 宿主元素（如 `data-slot="sidebar"`） |
| `data-chat-flow` | 对话流容器 |
| `data-chat-flow-kind` | 对话流的节点类型 |
| `data-chat-node-key` | 单个对话节点 |
| `data-chat-turn` | 单个 turn |
| **`data-content-phase`** | **取值 `hero` / `active` / `settling` —— 做分阶段出现动画的黄金属性** |
| `data-conversation-scroll` | 对话滚动容器 |
| `data-follow-end` | 跟随到底部 |
| `data-composer-card` | 输入卡 |
| `data-turn-tail` | turn 尾部 |
| `data-turn-trigger` | turn 触发器 |
| `data-streaming` | 流式中 |
| `data-chat-running` | 运行中 |
| `data-shimmer-decoration` | 微光装饰 |
| `data-ds-dark-theme` | 暗色标记（在 `body` 上） |

### 4.2 三级选择器的收容规则

三级选择器**必须集中在单一文件**（计划：`src/client/overrides.tier3.css`），
文件头写明每个选择器的作用与最后验证版本，便于 DSH 升级时定点排查。

---

## 5. 视觉令牌命名规范

| 前缀 | 含义 |
|---|---|
| `--bj-*` | 本项目自定义 CSS 变量（动效、装饰尺寸、氛围参数） |
| `bj-`（类名） | 本项目自有元素的 class 前缀 |
| `--dsw-alias-*` | 只读/覆盖 DSH 语义 token |
| `--dsw-*`（其他） | 默认不碰 |

---

## 6. 无障碍要求（强制）

官方做法是唯一基准：**只在 `@media (hover:hover) and (prefers-reduced-motion:no-preference)` 里开动画。**

本项目强制：

- [ ] 所有动效包裹 `prefers-reduced-motion: no-preference`
- [ ] 开屏提供降级路径（reduced-motion 下直接跳过或最短化）
- [ ] 键盘焦点可见性不得被任何装饰覆盖
- [ ] 对比度：正文 ≥ 4.5:1，大字 ≥ 3:1（明暗两套都要验）
- [ ] 装饰性元素 `aria-hidden="true"`

---

## 7. 待填充（需要人类输入）

| 项 | 状态 |
|---|---|
| 主色 / 强调色具体色值 | ⏳ 待提供 |
| 风格定位（一句话） | ⏳ 待提供 |
| 品牌 logo / 字体 / 纹理素材 | ⏳ 待提供 |
| 开屏时长与是否可跳过 | ⏳ 待决策 |
| 明暗两套完整色板 | ⏳ 依赖以上 |
