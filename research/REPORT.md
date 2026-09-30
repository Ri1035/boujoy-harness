# DSH 主题/UI 改造插件生态 — 源码级调研

调研时间基准：本次会话。所有 star/license/推送时间 = 本次会话直接调用 GitHub REST API 读取（标注「实际抓取」）。
DSH 版本事实来自 npm registry 实测：`dist-tags` = `{alpha: 0.1.7-alpha.2, latest: 0.2.0-rc.2, next: 0.2.0-rc.2}`。

---

## 0. 方法学与可信度标注

| 证据等级 | 含义 |
|---|---|
| **A 实际抓取** | 本次会话用 HTTP 直接取回文件/API 响应并读取内容 |
| **B 搜索结果摘要** | 仅搜索条目标题/描述，未取回正文 |

**未能确认的事项（不编造）**：
- 任务描述称 `rison114514/dsh-endfield-ui` 是 MIT。GitHub API 对该仓库返回 `license: null`（仓库根目录无 LICENSE 文件被识别）。README 内可能自称 MIT，但**「MIT」这一点本次未能确认为仓库级 license**。
- 本地 checkout 实际路径不是 `D:\soft\DSH\resources\app.asar\dsh`（该路径不存在），而是 `D:\soft\DSH\resources\app.asar.unpacked\dsh`，且其中**只有 `node_modules`**（含 `node-pty`、`sherpa-onnx` 等原生模块），**没有** DSH 的 client 前端源码。因此本报告 DSH 侧 API 事实全部改由 **npm 上的官方包**取证（等级 A），比本地 checkout 更权威。
- `cordis_inspect_query` 的 client 平台查询（Theme.listTokens / Slots.listSubTree）**全部超时失败**（无活动页面）。故 slot/token 清单不用 Inspect，改用官方包内**生成的目录文件**（等级 A，且是 Inspect 的数据源本身）。
- 「用户只看过视频的两个项目」——用户未给出项目名，**无法定位，未调研**。

---

## A. 主题/UI 项目清单

数据列若标 `-` 表示 GitHub API 未返回（非「无」）。「改了什么」列我按实际读到的源码归类。

### A1. 开屏/开机动画（splash / boot）

| 项目 | ⭐ | License | 最后推送 | 兼容 DSH | 改了什么 | 开屏动画 | 对话动画 |
|---|---|---|---|---|---|---|---|
| [yannicksong0106/dsh-550c-boot](https://github.com/yannicksong0106/dsh-550c-boot) | 21 | MIT | 2026-09-30 | **`>=0.2.0-rc.1`**（`dsh.engines.dsh`，实测仅验 rc.1） | **双层**：host 半边走 `webserver/index-inject` 注入首帧；client 半边 Shadow DOM 挂载整段动画 + 设置行 | ✅ 完整片头（含跳过、两段式退场、看门狗） | ❌ |
| [52baihehhh-ai/dsh-splash-screen](https://github.com/52baihehhh-ai/dsh-splash-screen) | 0 | MIT | 2026-09-29 | **未声明**（`dsh.engines` 无；仅 `dsh.client.immediately: true`） | host 注入封面行 + client 注册 `shell.overlay`；canvas 点阵粒子 | ✅ 两阶段 canvas 动画 | ❌ |
| [yanglingrise/dsh-erii-boot-splash](https://github.com/yanglingrise/dsh-erii-boot-splash) | 0 | MIT | 2026-08-22 | **未声明**（host 半边是空 `apply(){}`） | 仅 client：注入 `<style>` + 注册 `shell.overlay` | ✅ 纯 CSS keyframes + React 计时器 | ❌ |
| [Ln1m/dsh-host-splash](https://github.com/Ln1m/dsh-host-splash) | 0 | MIT | 2026-09-29 | 未确认 | 桌面 WebView2 启动片头层 | ✅（但**仓库已 archived**） | ❌ |

### A2. 整体风格/主题（token + CSS 覆盖）

| 项目 | ⭐ | License | 最后推送 | 兼容 DSH | 视觉风格 | 改了什么 | 对话动画 |
|---|---|---|---|---|---|---|---|
| [ymh0000123/dsh-theme-endfield](https://github.com/ymh0000123/dsh-theme-endfield) | 108 | MIT | 2026-09-27 | 目标 **0.1.7-rc.1**；双 seam 回落旧版 | 终末地官网风：奶油纸底/墨黑/信号黄/全直角工业编辑风 | token 覆盖 + `ctx.configForms`/`ctx.settings` 双通道设置 | 未确认 |
| [rison114514/dsh-endfield-ui](https://github.com/rison114514/dsh-endfield-ui) | 74 | **API 返回 null（未确认）** | 2026-09-03 | **DSH `0.1.2-alpha.5`** + `dsh-better-sidebar 0.18.0-alpha.0` | 终末地工业风 workbench | **全都有**：token 覆盖 + `shell.overlay` overlay + `theme.css` 强覆盖 DSH 组件 + 布局替换 | ✅ 有（boot） |
| [WYH66666666/DSH-Transparent-UI-Plugin](https://github.com/WYH66666666/DSH-Transparent-UI-Plugin) | 409 | AGPL-3.0 | 2026-08-22 | 未确认 | 玻璃质感：顶栏/侧栏/输入框/统计行/轨迹视图磨砂 | CSS 覆盖已有组件 + 设置卡片调参 | 未确认 |
| [NoNameLeGo/dsh-catppuccin-theme](https://github.com/NoNameLeGo/dsh-catppuccin-theme) | 49 | MIT | 2026-09-28 | **`>=0.1.5-rc.1`**；实测 `0.1.7-rc.1`/`rc.2` | Catppuccin 四变体 + 可开关玻璃 | token 覆盖 + CSS；**「兼容模式靠类名子串与语义属性」** | 未确认 |
| [webkubor/dsh-bloom-theme](https://github.com/webkubor/dsh-bloom-theme) | 47 | MIT | 2026-09-29 | 未确认 | Bloom 莫兰迪，OKLCH 调色，明暗双主题 | token 覆盖 | 未确认 |
| [d-dev0101/open-sea-skin](https://github.com/d-dev0101/open-sea-skin) | 380 | MIT | 2026-09-11 | 未确认 | 海洋皮肤，实时波浪/日落/玻璃 可调 | token + 动态背景 | 未确认 |
| [RevolutionLA/dsh-dream-skin](https://github.com/RevolutionLA/dsh-dream-skin) | 196 | MIT | 2026-09-29 | 未确认 | 8 套 Mirage 主题 + 壁纸 + 主题包导入导出 | token + 壁纸层 | 未确认 |
| [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) | 2296 | **NOASSERTION（非标准）** | 2026-09-30 | 未确认 | 鲸鱼娘皮肤系列 | 未确认（未读源码） | 未确认 |
| [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | 8193 | Apache-2.0 | 2026-09-30 | 未确认 | 插件/皮肤聚合生态（任务板、git graph、桌宠、token 统计） | 未确认（未读源码） | 未确认 |
| [01Virex/dsh-status-rotator](https://github.com/01Virex/dsh-status-rotator) | 93 | MIT | 2026-09-29 | 未确认 | 状态行 1063 条梗 + 打字机 + 炫彩渐变 + 弹幕 | 覆盖状态行组件 | 未确认（描述含「打字机」） |

### A3. 对话/消息动效

| 项目 | ⭐ | License | 最后推送 | 兼容 DSH | 改了什么 | 对话动画 |
|---|---|---|---|---|---|---|
| [TYOPXN360/dsh-web-scroll-flow](https://github.com/TYOPXN360/dsh-web-scroll-flow) | 0 | **无 license（API null）** | 2026-08-28 | `dsh.client.inject` 声明依赖 `dsh-client-ui-conversation` 等 | 注册 `conversation.composer.dock` + `settings.section`；CSS 打标 + rAF | ✅ 滚动跟随/橡皮筋/逐行揭示（**非逐字**） |
| [Kr-ATG/dsh-chat-plus](https://github.com/Kr-ATG/dsh-chat-plus) | 0 | **无 license（API null）** | 2026-09-28 | 未确认 | 回合呈现聚合 chip / 步骤卡 / 活动抽屉（README 自称零源码改动） | 未确认（未读源码） |

**依赖第三方包**：`rison114514/dsh-endfield-ui` 实测依赖 `dsh-better-sidebar`、`dsh-shikitor`（见其 `cordis.patch.yml`）。其余项目的第三方依赖本次**未逐一核实**。

---

## B. 动画实现的源码级证据

### B1. 开屏动画：三种成熟度不同的做法

#### (a) 纯 CSS 时间轴 —— `dsh-endfield-ui`（最简单，最好抄）

证据：[theme.css](https://github.com/rison114514/dsh-endfield-ui/blob/main/endfield-ui-plugin/theme.css)（本次实际抓取 62271B）

整段片头是**一层固定定位的 div + 一条 CSS keyframes 时间轴**，零 JS 计时器：

```css
.ef-boot {
  position: fixed; inset: 0; z-index: 9999;
  pointer-events: none !important;          /* 不挡交互 */
  background: #060708;
  animation: ef-boot-dismiss 3.22s cubic-bezier(.75,0,.18,1) forwards;
}
.ef-boot-count::after { content: "000";
  animation: ef-boot-numbers 2.38s steps(1, end) forwards; }   /* 数字跳表 */
.ef-boot-progress i { animation: ef-progress 2.35s cubic-bezier(.16,.82,.2,1) both; }
.ef-boot-wipe { transform: translateX(-101%);
  animation: ef-yellow-wipe .7s 2.48s cubic-bezier(.75,0,.18,1) forwards; }  /* 斜切滑幕 */
.ef-boot-character { animation: ef-character-reveal 1.45s .28s cubic-bezier(.18,.8,.2,1) both; }

@keyframes ef-boot-dismiss {           /* 退场：clip-path 左收 */
  0%, 87% { opacity: 1; visibility: visible; clip-path: inset(0 0 0 0); }
  100%    { opacity: 1; visibility: hidden;  clip-path: inset(0 0 0 100%); }
}
@keyframes ef-progress { from{transform:scaleX(0)} 32%{transform:scaleX(.18)} 58%{transform:scaleX(.53)} to{transform:scaleX(1)} }
@keyframes ef-boot-numbers {
  0%{content:"000"} 12%{content:"011"} 27%{content:"029"} 43%{content:"047"}
  59%{content:"068"} 77%{content:"087"} 100%{content:"100"} }
```

- **时长/退场**：总 3.22s；退场用 `clip-path` 从左收 + `visibility:hidden` 保位。
- **是否避免刷新重复播放**：**没有**。没有 `sessionStorage`/`localStorage` 门控 —— **每次刷新都重播**。
- **无障碍**：有 `@media (prefers-reduced-motion: reduce)`，把 `animation-duration` 压到 `.01s`。
- **React 侧**只负责渲染静态 DOM：`BootSequence()` 返回 `.ef-boot` 树（client.js:215–252），动画全在 CSS。

> ⚠️ **发现一处真实的坑**：该 CSS 用 `var(--ds-transition-duration-slow)` / `var(--ds-ease-in-out)`，但我在这份 `theme.css` 里**搜不到这两个变量的定义**，在官方 `dsh-client-ui-theme`/`conversation`/`chat` 包里也**不存在**（实测 `NOT FOUND`）。若确实无定义，这些 `transition` 会因无效值而**静默失效**。可直接借鉴其动画，但别照抄这两个变量名。

#### (b) React 计时器 + CSS keyframes —— `dsh-erii-boot-splash`（结构最干净，推荐当骨架）

证据：[lib/client.js](https://github.com/yanglingrise/dsh-erii-boot-splash/blob/main/lib/client.js)（实际抓取 6506B，全文仅 125 行）

- **样式注入**：`document.createElement("style")`，打 `tag.dataset.plugin`，append 到 `document.head`，并在 `ctx.effect` 里 `tag.remove()` 卸载（client.js:28–30, 107–110）。
- **keyframes 就在 JS 字符串里**：

```js
"@keyframes esb-fall{0%{transform:translateY(-6vh) rotate(0deg)}100%{transform:translateY(108vh) rotate(380deg)}}",
"@keyframes esb-sway{0%,100%{margin-left:0}50%{margin-left:34px}}",
"@keyframes esb-bar{0%{width:4%}60%{width:72%}100%{width:96%}}",
".esb-root{...;transition:opacity .8s ease;...}",
".esb-root.esb-out{opacity:0}",
".esb-petal{...;animation-name:esb-fall,esb-sway;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite}",
```

- **退场由 React 计时器驱动**，动画本身是 CSS：

```js
react.useEffect(() => {
  const t1 = setTimeout(() => setOut(true), 2800);   // 加 .esb-out → opacity 过渡 .8s
  const t2 = setTimeout(() => setGone(true), 3700);  // 卸载
  return () => { clearTimeout(t1); clearTimeout(t2); };
}, []);
if (gone) return null;
```

- **每片花瓣的时长/延迟是逐元素 inline style**，不是写死的 CSS：`animationDuration: p.dur+"s, "+(p.dur*1.6)+"s"`。
- **避免刷新重复播放**：**没有**（每次刷新重播）。
- **注册方式**（关键接口）：

```js
const inject = ["slots"];
function apply(ctx) {
  document.head.appendChild(tag);
  ctx.effect(() => () => { tag.remove(); });
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay", id: "erii-boot-splash", order: 9999,
  }, () => react.createElement(Splash)));
}
```

- **该项目的 host 半边是空的**：`lib/index.js` 全文 `function apply() {}`。

#### (c) 双层架构（host 首帧 + client 正片）—— `dsh-550c-boot`（**技术上限最高**）

证据：[docs/ARCHITECTURE.md](https://github.com/yannicksong0106/dsh-550c-boot/blob/main/docs/ARCHITECTURE.md)、[lib/index.js](https://github.com/yannicksong0106/dsh-550c-boot/blob/main/lib/index.js)（实际抓取）

**核心发现：只走 slot 的开屏动画永远盖不住 DSH 自己的开机卡片。** 作者的实测时序（CDP 在页面脚本前预注入探针，从导航起算）：

| 事件 | 时刻 |
|---|---|
| DSH boot card（`[data-dsh-boot]`，"HARNESS / Loading plugins…"）出现 | 67 ms |
| 本插件遮罩挂载（client 半边求值） | 338 ms |
| DSH boot card 被移除 | 517 ms |

> **中间 271ms 是客户端插件怎么调 z-index 都盖不住的。**

因此正确解法是把**首帧交给 host 半边**，在文档还没解析完时就铺满：

```js
// lib/index.js — host 半边，实测可用的官方事件
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style',  text: FIRST_FRAME_CSS })
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
  })
}
```

首帧 CSS 就一行 `::before` 铺底色 + `z-index`：

```js
'html.dsh550c-first::before{content:"";position:fixed;inset:0;background:#050403;' +
'z-index:2147482000;pointer-events:none}'
```

注入脚本（同步、在 `<head>` 解析期执行）自己带**三条退出路径**——这是防「黑屏卡死」的关键：

```js
var card = document.querySelector("[data-dsh-boot]");
watch = setInterval(function(){
  if (card === null) { if (seen) end(); return }          // 卡片消失 = 应用挂载
  seen = true;
  if (card.querySelector("[data-dsh-boot-spinner]") === null) end()  // 卡片掉了 spinner = shell 自己的失败态
}, 250);
setTimeout(end, 12000);   // 12s 绝对上限
window.__dsh550cFirstFrame = { end: end };   // client 半边挂载后同步退役首帧
```

其余可复用要点：
- **Shadow DOM 隔离**：原页面 CSS 有 `.w`/`.ln`/`.dt`/`.sect` 这类极通用类名，放进宿主文档会污染 DSH；Shadow DOM 让原样式表原样生效且零泄漏。构建期把 `html,body`/`:root`/`body::before` → `:host`。
- **两段式退场（不是一次性 cross-fade）**：内容 200ms 淡到透明 → 延迟 200ms 再 420ms 淡出黑底，总 620ms。理由：一次性淡出会把结尾那枚高对比 logo 的灰色幽灵盖在已加载的对话页上（作者用逐帧截图量到过）。
- **设置项联动**：注入脚本自己读 `localStorage['dsh-550c-boot:mode']`，为 `'off'` 时直接 `return`，连一张黑屏都不出现。

#### (d) canvas 点阵 —— `dsh-splash-screen`

证据：[src/splash.js](https://github.com/52baihehhh-ai/dsh-splash-screen/blob/main/src/splash.js)（38076B）、README（实际抓取）

- 本体 **vanilla + canvas**，不接触 React，只暴露 `globalThis.__DSH_SPLASH__ = { createSplash, destroySplash }`；同一份代码被内联进「注入脚本」和 client 两处。
- A 段：canvas 点阵把文字拆成粒子，先弥散再收敛成 `DEEPSEEK → HARNESS → DSH`；每颗点按**贪心最近邻**重组（带占用去重）。
- **唯一的「避免重复播放」实现**（README 实测描述）：**只播一次** —— 同一页面会话内只播一次（`sessionStorage`）。重开窗口 / 重启应用会重新播放。
- 跳过：点击 / 任意键 / 触屏 / 滚轮 / SKIP 按钮；**跳过不是硬切**，先 180ms 收束再走同一条 600ms 滑幕。
- 无障碍：容器 `role="progressbar"` + `aria-valuenow`，状态变化 `aria-live`，尊重 `prefers-reduced-motion`（退化为静态终帧 + 900ms 后交接）。
- host 半边三条退出路径：client 挂载时主动摘除、`#root` 出现真实内容时兜底摘除、**3.5 秒硬超时**强制摘除。
- **明确点名不用 `tapIndex`**（见 C 节）。

### B2. 对话动画

**结论：本轮调研的项目里，没有任何一个注册 `conversation.chat.node` 或 `conversation.chat.turnTail`。**（等级 A，基于实际源码搜索）

#### (a) `dsh-web-scroll-flow` —— 纯 CSS 打标 + rAF，靠官方 data 属性

证据：[lib/client.js](https://github.com/TYOPXN360/dsh-web-scroll-flow/blob/main/lib/client.js)（实际抓取 40383B）

它注册的 slot 是 **`conversation.composer.dock`**（无可见 UI，靠它在会话滚动容器内拿到位置）和 `settings.section`：

```js
ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
  name: "conversation.composer.dock", ...
```

它**没有**用 `@keyframes` 做逐字/淡入。全部动效是：

```css
[data-conversation-scroll][data-scroll-flow]{scroll-behavior:smooth}
[data-conversation-scroll][data-scroll-flow] [data-follow-end]{scroll-behavior:auto}
[data-conversation-scroll][data-scroll-flow] [data-chat-flow]>[role=status]{order:1}
@media (prefers-reduced-motion:reduce){
  [data-conversation-scroll][data-scroll-flow]{scroll-behavior:auto}}
```

即：给自己打上 `data-scroll-flow` 后，用 CSS 把**官方已有滚动写入**从「瞬跳」变成「平滑」。
另一个滚动条（折叠 Think 的 `[data-follow-end]` 横向跟随）因为写入间隔约 3 帧、短于浏览器最小动画时长，改用 **rAF 逐帧缓动**：

```js
const observer = new MutationObserver((entries) => { ... });   // 观察流式 DOM
raf = requestAnimationFrame(tick);                              // 逐帧缓动 scrollLeft
```

还有两处**必须的补偿**（作者写在注释里，说明这是真踩过的坑）：
1. 平滑滑行途中 `gap > 25px` 的 scroll 事件会被官方 follow ledger 误判为读者输入 → 用 **`window` 捕获阶段监听器**抑制这些 glide-progress 事件。
2. 滑行残留 lag 会让运行中状态标签每行下沉几 px → 用 rAF 给标签打 `translateY(-min(lag, PIN_CAP))` 抵消（不动 scrollTop）。

> ⚠️ **命名纠正**：仓库描述写「流式逐字打字机」，但读到的实现是「组体逐行揭示 / revealThinkBodyLines」，**不是逐字符打字机**。不要按「逐字」预期抄它。

#### (b) MutationObserver 观察流式 DOM —— 这是当前生态的通用手段

`dsh-endfield-ui` 也用同一套（client.js:110, 158, 204）：

```js
const mutationObserver = new MutationObserverClass(checkLayout)
const documentObserver = new MutationObserver((records) => {
  for (const record of records) record.addedNodes.forEach(scan)
})
documentObserver.observe(document.body, { childList: true, subtree: true })
```

### B3. 官方 slot 体系之外的「Hack」清单

`dsh-endfield-ui` 是 hack 的集中样本（client.js 实测）：

| 行 | 写法 | 性质 |
|---|---|---|
| 106–107 | `target.querySelector('.shikitor-output')` / `.shikitor-output-lines` | 依赖第三方插件（dsh-shikitor）**私有类名** |
| 120 | `lineStack.querySelectorAll('.shikitor-output-line')` | 同上 |
| 745 | `'div[style*="width"]:has(button[aria-label="新建标签页"]), [data-dsh-panel-host]'` | **属性/内联样式选择器 + 中文 aria-label + `:has()`**，最脆弱的一条 |
| 634 | `'aria-label': '编辑 Goal'` | 中文 aria-label 硬编码 |
| 767 | `querySelectorAll('[data-dsh-better-sidebar], [data-dsh-panel-host]')` | 依赖 better-sidebar 的私有属性 |
| 825, 838 | `document.querySelector(rootSelector)` / `querySelectorAll(portalSelector)` | 观察 portal 容器 |

`dsh-catppuccin-theme` README 自述其兼容模式「靠**类名子串与语义属性**给宿主与第三方插件的悬浮面加玻璃，不需要任何插件配合」——同类 hack，但覆盖面更广。

**反例（值得学习）**：`dsh-web-scroll-flow` 用的是**官方 data 属性**，我已在官方包里验证存在（见 C 节），属于「官方接缝」而非 hack。

---

## C. DSH 侧的能力边界（全部等级 A）

DSH client 事实来源：`@deepseek-ai/dsh-cordis-client-runner@0.2.0-rc.2` 的 `lib/client.js`（内含**生成的 Slot 目录**）与其 `lib/types/client/slot-catalog.d.ts`，以及 `@deepseek-ai/dsh-client-ui-theme@0.2.0-rc.2`。

### C1. 可用于注入全屏动画层的 slot —— `shell.overlay`

实测 slot 目录里 `shell.overlay` 的官方 contract 原文：

> `kind: "list"`, `scope: "root"`, `declaredBy: "an entry in 'ui-layout' ..."`
>
> 「Frame-wide floating layer, above every column and outside their scroll containers. Deliberately generic and unowned by any feature: a badge, a toast stack or a status pill all belong here, and entries order among themselves. **The layer itself is click-through — entries opt back into pointer events — so an occupant never blocks the app underneath.**」
>
> 「This is the **additive** seat for a frame-wide surface of your own: a fresh `id` is added beside the shipped entries instead of replacing them.」

- **click-through**：✅ 层本身穿透。**但注意**：`register` 的条目要自己决定 — `endfield` 的写法是在自己的根节点上 `pointer-events: none !important`（theme.css:1225），`erii` 也在 `.esb-root` 上写 `pointer-events:none`。要交互（如 SKIP 按钮）就在按钮上重新开启。
- **stacking**：`register` 支持 `order` 选项（实测写法 `order: -100`、`order: 9999`、`order: 30`），entries 之间自行排序。
- **生命周期**：`ctx.slots.inject('shell.overlay', () => ctx.slots.register({...}, Comp))` 是标准的 cordis effect 语义 —— 插件卸载即摘除条目。
- **官方明确警告不要用 `root`**：

> 「DO NOT register here. This is a single slot, so a second entry does not sit beside the frame — it shadows it... **For a surface of your own that floats over the whole app, register into `shell.overlay` instead.**」

**Slot 目录实测规模：90 个 slot**（用生成目录逐条统计）。与动画/主题最相关的：

| slot | kind | scope |
|---|---|---|
| `shell.overlay` | list | root |
| `shell.leading` | single | root |
| `root` | single | root（**勿用**） |
| `main` | keyed | root |
| `conversation.chat.node` | **keyed** | session |
| `conversation.chat.turnTail` | list | session |
| `conversation.chat.assistant-actions` | list | session |
| `conversation.chat.commandview` | keyed | session |
| `conversation.view` | list | session |
| `conversation.session.header.corner` | single | session |
| `conversation.composer` | **chain** | session |
| `conversation.composer.dock` | list | session |
| `conversation.hero.brand.mark` | single | root |
| `conversation.hero.agentPreset` | single | session-maybe |
| `tool.call.toolview` | keyed | session |
| `settings.section` | list | root |
| `sidebar.brand.mark` / `sidebar.brand.name` | single | root |

### C2. 「对话节点自定义渲染」接缝 —— **存在，可用**

`conversation.chat.node` 官方 contract 原文：

> 「Final Chat node renderer, **keyed by `ChatNodeKind`**. The component receives the typed node, shared Chat actions, and Turn-data hook. **Reusing a key replaces that node renderer**; a kind with no occupant renders no row.」

`conversation.chat.turnTail` 原文：

> 「Ordered feature contributions **before a completed Turn's action row**. Each entry receives the Turn, closing sequence, and file opener. A fresh `id` adds an entry; entries without content return null.」

**结论**：这是**官方支持**的对话节点自定义渲染接缝，完全可以用来做消息动效——但代价是你要**自己渲染整个节点**（keyed 是替换语义，不是包装语义）。本轮调研的 15 个项目里**无人使用**，属于生态空白。

**更轻量的官方动画接缝**（我实测这些 data 属性确实由官方包输出）：
`data-chat-flow`、`data-chat-flow-kind`、`data-chat-node-key`、`data-chat-turn`、`data-conversation-scroll`、`data-follow-end`、`data-turn-tail`、`data-content-phase`、`data-streaming`、`data-chat-running`、`data-turn-trigger`、`data-shimmer-decoration`。

其中 `data-content-phase` 的实测取值为 **`hero` / `active` / `settling`** —— 对「消息出现/稳定」分阶段做动画非常有用。

### C3. 主题 token 完整清单

**实测提取出 403 个 `--dsw-*` 名**（正则扫 `dsh-client-ui-theme/lib/client.js`）。分层：

| 前缀 | 数量级 | 用途 |
|---|---|---|
| `--dsw-alias-*` | ~130 | **语义层，第三方主题应覆盖的就是这一层** |
| `--dsw-static-*` | ~190 | 原始调色板（blue/neutral/deepseek/red/green/amber 等） |
| `--dsw-font-*` | ~70 | 字体阶梯（每组含 `-font-family/-size/-weight/-style/-line-height`） |
| `--dsw-radius-*` | 6 | `xs/sm/md/lg/xl/panel` |
| `--dsw-shadow-lv*` | 3+ | `lv1/lv2/lv3` + `lv1-blur` |
| `--dsw-elevation-*` | 5 | `stroke`/`stroke-color`/`panel`/`prominent`/`soft` |
| `--dsw-focus-ring-*` | 2 | `color` / `width`（标准 2px） |
| `--dsw-corner-shape` | 1 | **非颜色的圆角定制** |

**`--dsw-alias-*` 完整清单**（实际提取）：`bg-base`, `bg-layer-1/2/3`, `bg-mask-1/2/3`, `bg-mask-drop`, `bg-mask-photo`, `bg-module-platform`, `bg-multi-select`, `bg-overlay`, `bg-skeleton`, `bg-document-preview`, `bg-document-selection`, `border-inverted`, `border-inverted2`, `border-l1..l4`, `border-l2-darkmode-thin`, `brand-primary`, `brand-primary-invert`, `brand-text`, `button-contrast-fill`, `button-elevated-fill`, `button-floating-fill/-hover`, `button-ghost-active-border/-fill/-hover`, `button-info-fill/-hover`, `button-primary-fill/-hover/-dimmed`, `button-tool-bar-fill/-fill-invisible/-hover`, `code-diff-added/-deleted`, `file-diff-{added,deleted}-{bg,gutter,marker}`, `interactive-bg-active/-hover/-hover-accent/-hover-danger/-hover-solid`, `label-primary/-dimmed/-inverted/-foreground/-bluish/-caption/-secondary/-tertiary`, `label-deep-diving`, `label-deep-diving-shimmer`, `label-shimmer`, `label-document-preview`, `link`, `markdown-citation`, `markdown-code-block`, `markdown-code-block-banner`, `markdown-code-segment-selected/-unselected`, `markdown-inline-code`, `markdown-placeholder`, `markdown-tag`, `menu-group-header-fill`, `menu-icon`, `onboarding-accent`, `onboarding-card-fill`, `onboarding-checkbox-border`, `onboarding-secondary-fill`, `scrollbar-bg-l1/-l2`, `scrollbar-hover-l1/-l2`, `settings-card-fill/-stroke`, `state-business-primary/-tertiary`, `state-error-primary/-secondary`, `state-idle-primary`, `state-success-primary/-secondary/-tertiary`, `state-warn-primary/-secondary/-tertiary/-label`, `switch-thumb`, `toast-bg`, `toast-label`, `tooltip-bg`, `tooltip-key-bg`, `turn-trigger-bg`, `turn-trigger-bg-hover`。

**非颜色的可定制项（除颜色外）**：
- ✅ **圆角**：`--dsw-radius-{xs,sm,md,lg,xl,panel}`，另有 `--dsw-corner-shape`（`@supports (corner-shape: superellipse(1.5))` 下的平滑圆角）。
- ✅ **阴影/抬升**：`--dsw-shadow-lv1/2/3`、`--dsw-elevation-stroke(-color)`、`--dsw-elevation-panel/prominent/soft`。
- ✅ **字体**：完整 `--dsw-font-*` 阶梯 + `--dsw-font-family-brand`（内置 Montserrat，`brand-font.css` 自带 OFL 授权的 woff2）。
- ✅ **毛玻璃**：`--dsw-menu-backdrop-filter`、`--dsw-mask-blur`。
- ✅ **动效相关的内容字号**：`ctx.theme.setFontSize(px)`，10–22 整数，默认 14。
- ❌ **没有官方动画时长/缓动 token**。我扫遍 theory/conversation/chat 三个 bundle，`--dsh-*`/`--dsw-*` 里**不含** `duration`/`ease`/`delay`/`timing`/`speed`/`motion` 任何一项（实测空集）。**动效时长必须插件自定义。**
- ✅ 官方自己**有**动画，可作为风格基准：`pXSMma_hero-fish-swim`（1.6s ease-in-out infinite）、`uV2eYG_input-pending`（opacity .35→1）、`eGxaPq_dsh-turn-preview-enter`、`eGxaPq_dsh-turn-mark-busy`；且官方在 `@media (hover:hover) and (prefers-reduced-motion:no-preference)` 里才开动画——**这是官方认可的无障碍写法**。

**主题注册/覆盖 API**（`dsh-client-ui-theme` 官方 d.ts 实测）：
```ts
ctx.theme.register({ id, colorScheme: 'light'|'dark', tokens: Record<string,string> })  // 注册整主题，重复 id 抛错
ctx.theme.overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void
//   ThemeTokenOverrides = Record<string, { light: string; dark: string }>   ← 两种模式都必填
```
⚠️ **官方明确**：`overrideTokens` 传**裸字符串会抛「教学错误」**——必须给 `{light, dark}` 对。`endfield` 的用法是 `ctx.theme.overrideTokens('@rison/dsh-endfield-ui', tokens)`。

### C4. `webServer.tapIndex` vs `webserver/index-inject`

**两者都真实存在**，但**有一个实测的致命区别**。

官方 host Service 实测签名：
```
webServer: register(route) / registerUpgrade(route) / registerFallback(handler)
           tapIndex(transform: (html: string) => string): () => void
           applyIndexTaps(html) / collectIndexInjections() / renderIndex(html)
```

**但 `dsh-splash-screen` README 明确记录了为什么不用 `tapIndex`**（实际抓取）：

> **为什么不 use `tapIndex`**：桌面版主窗口走 `dsh-app://` 协议直读 SPA 的 `index.html`，**从不调用 `renderIndex()`**，所以 `tapIndex` 在桌面端是**死代码**；结构化注入行由桌面主进程经 IPC 下发给渲染进程解释执行，浏览器 / 桌面主窗口 / 悬浮窗三个表面都能拿到。

**正确做法：`webserver/index-inject`**（`dsh-550c-boot` host 半边实测可用）：
```js
ctx.on('webserver/index-inject', (table) => {
  table.push({ kind: 'style',  text: '...' })
  table.push({ kind: 'script', placement: 'head', text: '...' })
})
```
- 这是**普通 composition 事件**，**不需要 inject 任何 service**（`dsh-550c-boot` 的 `apply` 完全没 inject）。
- 注入行渲染位置：**紧跟 `<head>`**，早于 shell 的 module script。
- ⚠️ **注入行有白名单校验**：未知 `kind` 会被 boot gate **直接 reject**，把桌面端打进崩溃恢复页。只产出 `style` / `script` 两种最稳的行。

---

## D. 结论与建议

### D1. 「开屏动画 + 风格界面 + 对话动画」的现实技术路线

| 需求 | 官方支持程度 | 路线 |
|---|---|---|
| **风格界面** | ✅ **完全官方** | `ctx.theme.overrideTokens()` 覆盖 `--dsw-alias-*`；再注入一份 CSS 覆盖官方组件选择器（官方组件普遍带 `data-*` 稳定属性，优先用它们）；圆角/阴影/毛玻璃都有官方 token |
| **开屏动画** | ⚠️ **半官方：需要 host+client 双半边，且要用非 slot 路径** | host 半边 `ctx.on('webserver/index-inject')` 铺首帧（唯一能盖住 DSH boot card 的办法）；client 半边渲染正片 + `shell.overlay` 或直接命令式挂 `document.body` |
| **对话动画** | ⚠️ **官方接缝存在但生态空白** | 轻量：CSS 命中官方 `data-*` 属性 + `prefers-reduced-motion` 门控。重度：注册 `conversation.chat.node`（keyed 替换语义，需自己渲染整个节点） |

**哪些必须 hack**：
1. 想早于 DSH boot card（`[data-dsh-boot]`）出现 → **必须**用 `webserver/index-inject`，纯 client 方案在 271ms 窗口内无论如何都会漏出卡片。
2. 想动效命中「已有消息节点」而非自己渲染 → 会依赖官方 `data-*` 属性（这些是稳定的，不算脏 hack）或**第三方插件私有类名**（`.shikitor-output`、`[data-dsh-better-sidebar]`、中文 `aria-label`、`div[style*="width"]:has(...)`）——后者才是真 hack，会随第三方插件改版而碎。
3. **动效时长/缓动没有官方 token**，必须自带 CSS 变量。

**必须自己实现、官方不给的三件事**：
- 刷新去重（`sessionStorage` 门控）——`endfield`/`erii` 都没做，只有 `dsh-splash-screen` 做了。
- 首帧看门狗（卡片消失 / 卡片掉 spinner / 绝对超时）——防黑屏卡死。
- `prefers-reduced-motion` —— 官方自身遵循，建议跟随（`endfield` 做了，`dsh-erii-boot-splash` **没做**）。

### D2. 最值得作为工程骨架复用的项目（抄结构，不抄风格）

1. **`yannicksong0106/dsh-550c-boot`** — ⭐**首选**。
   理由：它是唯一把「boot card 时序问题」量化并解决的项目；**host+client 双半边职责划分清晰**；`webserver/index-inject` 用法是可直接复制的正确写法；看门狗三条退出路径齐全；Shadow DOM 隔离方案解决「通用类名污染宿主」；两段式退场有实测依据。[docs/ARCHITECTURE.md](https://github.com/yannicksong0106/dsh-550c-boot/blob/main/docs/ARCHITECTURE.md) 本身就是一份可读的设计文档。
   ⚠️ 风险：它只声明 `>=0.2.0-rc.1`，且在 `package.json` 里带了一个 `ajv` 依赖和自研 extract/build 脚本，骨架比看起来重。

2. **`yanglingrise/dsh-erii-boot-splash`** — ⭐**最小可读模板**。
   理由：全文 125 行，`<style>` 注入 + `ctx.effect` 卸载 + `shell.overlay` 注册 + React 计时器退场，四件事各占一小段，**当作「client 半边怎么写」的 Hello World 最合适**。适合先照它跑通，再补 host 半边。
   ⚠️ 缺 `prefers-reduced-motion`，无去重，`order:9999` 硬编码。

3. **`52baihehhh-ai/dsh-splash-screen`** — 缺点的**教科书级反面 + 正面混合体**。
   正面：唯一做了「只播一次」（`sessionStorage`）、唯一明确写下「为什么不用 tapIndex」、三条退出路径、无障碍语义完整。反面：仓库 0 star、`client.js`/`index.js` 都是 90KB+ 构建产物（`src/splash.js` 40KB 才是源码），可读性差。
   适用：**抄它的「去重策略 + 无障碍 + 退出路径」清单**，不要抄它的构建链。

4. **`rison114514/dsh-endfield-ui`** — 抄「风格界面怎么做」的结构。
   理由：`index.js` 是一份极标准的**静态素材路由**实现（`webServer.register({kind:'prefix', path:'/endfield-ui', handler})` + 一张 content-type 表 + `readFileSync`），可直接复用；`client.js` 展示了 token 覆盖 + overlay 注册 + MutationObserver 的完整组合。
   ⚠️ **但它是旧版（0.1.2-alpha.5），且 hack 密度最高、缺 license**。当**参考**而非骨架。

5. **`TYOPXN360/dsh-web-scroll-flow`** — 抄「动效如何与官方滚动/流式管线共存」的经验。
   理由：它是唯一**只用官方 data 属性**做动效的项目，且把两个必须的补偿（捕获阶段事件抑制、标签 pin）连原因一起写清了。做任何流式期动效都会遇到同样问题。
   ⚠️ 无 license、0 star。

### D3. 各项目在 DSH `0.2.0-rc.2`（当前 latest）上的风险

**先说结论：没有任何一个项目在本次调研中声明支持 `0.2.0-rc.2`。** 声明里的最高验证版本是 `0.2.0-rc.1`（`dsh-550c-boot`）。

| 项目 | 声明 | 在 0.2.0-rc.2 上的判断 | 风险点 |
|---|---|---|---|
| `dsh-550c-boot` | `>=0.2.0-rc.1` | **大概率可运行** | 风险最低。但作者只实测 rc.1；依赖的 `[data-dsh-boot]` / `[data-dsh-boot-spinner]` 是**未文档化的内部标记**，若 0.2.0-rc.2 改名则看门狗失效（会退化为 12s 上限，不会崩） |
| `dsh-splash-screen` | 未声明 dsh 版本 | **不确定** | 用 `dsh.client.immediately: true` —— 该字段我在官方 `dsh-web-app` patch 里见到 `immediately: true` 的用法，但未在此版本逐一验证语义 |
| `dsh-catppuccin-theme` | `>=0.1.5-rc.1`，实测最高 `0.1.7-rc.2` | **有真实风险** | README **自己承认**跨了两代 settings seam：`≤0.1.6-alpha.2` 旧通道 vs `≥0.1.7-alpha.1` 的 `configForms`。0.2.0-rc.2 未在其验证矩阵内（其 `dsh.compatibility.dshReleases` 只到 `0.1.7-rc.1`） |
| `dsh-theme-endfield` | 目标 `0.1.7-rc.1`，双 seam 回落 | **有风险** | 旧回落路径依赖 `ctx.settings.register` + `ctx.settingsScope`，而它自己记录「**DSH 0.1.7-rc.1 换掉了整套 settings API**」→ 0.2.0 上旧通道大概率已死，只剩 configForms 一条路 |
| `dsh-endfield-ui` | **`0.1.2-alpha.5`** | **大概率不可直接运行** | 版本差距最大（0.1.2 → 0.2.0）。且强绑定 `dsh-better-sidebar 0.18.0-alpha.0` 与 `dsh-shikitor` 的**私有 DOM**（`.shikitor-output*`）。better-sidebar 现已是 3907 star / 2026-09-28 推送，0.18.0-alpha.0 期间几乎肯定已变 |
| `dsh-web-scroll-flow` | 只声明 `dsh.client.inject`（无版本） | **相对乐观** | 因为它只用官方 `data-conversation-scroll` / `data-follow-end` / `data-chat-flow` —— 这些**我在 0.2.0-rc.2 的官方包里实测存在**。风险在于 `[role=status]` 与 25px 阈值这类行为细节 |
| `dsh-erii-boot-splash`、`dsh-chat-plus`、`dsh-status-rotator`、其余皮肤类 | 未声明 | **不确定** | 未声明 = 无兼容承诺 |

**通用风险点（对所有主题插件）**：
1. **两代 settings API 断层**。`0.1.7-rc.1` 换掉了整套 settings API（有项目文档明确记载）。任何带设置页的插件，若只实现了旧通道，在 0.2.0 上设置会失效。
2. **`overrideTokens` 的强制双模式**。传裸字符串会抛错。旧插件若有裸字符串写法，在新版会直接失败。
3. **`tapIndex` 在桌面端是死代码**。任何用 `tapIndex` 注入的插件在 DSH Desktop 上都看不到效果（浏览器版正常）。
4. **`root` slot 的遮蔽陷阱**。用 `root` 注册会**替换整个 AppFrame**，页面只剩你的组件。
5. **第三方插件私有 DOM 契约**。跨版本最容易碎的一环。

**建议的验证顺序**（成本从低到高）：先在 0.2.0-rc.2 上装 `dsh-550c-boot`（最可能直接可用）→ 再装 `dsh-web-scroll-flow`（验证官方 data 属性仍稳定）→ 再试 `dsh-catppuccin-theme`（验证 settings seam 是否已断）→ `dsh-endfield-ui` 只读源码不指望能跑。

---

## 附：本次使用的可复现取证命令（等级 A）

```powershell
# DSH 版本与 dist-tags
Invoke-RestMethod https://registry.npmjs.org/@deepseek-ai/dsh | Select -Expand dist-tags

# Slot 目录（90 条）+ shell.overlay / conversation.chat.node 官方 contract
#   包：@deepseek-ai/dsh-cordis-client-runner@0.2.0-rc.2 → lib/client.js
#   （另有 lib/types/client/slot-catalog.d.ts 说明它是 cordis_inspect what:"client" 的数据源）

# --dsw-* token 清单（403 个）
#   包：@deepseek-ai/dsh-client-ui-theme@0.2.0-rc.2 → lib/client.js

# 官方动画 data 属性 + keyframes
#   包：@deepseek-ai/dsh-client-ui-conversation / dsh-client-ui-chat@0.2.0-rc.2 → lib/client.js

# 仓库元数据
Invoke-RestMethod https://api.github.com/repos/<owner>/<repo>
```
