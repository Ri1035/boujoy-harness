# asset-library.md —— 素材库与自定义配置规范

> **本项目从"一个主题"升级为"可自定义的界面框架"的核心规范。**
> 目标：用户**不改一行代码**，只通过替换文件夹内容 + 改一个配置文件，就能完全改变外观。
>
> 状态：**设计已定，尚未实现**（P0 之后落地）。带 ⚠️ 标记的条目需实现时验证。

---

## 1. 设计目标

| 目标 | 说明 |
|---|---|
| **零代码自定义** | 用户只碰素材文件夹和配置文件，不碰 JS/CSS |
| **可替换** | 换掉 logo / 字体 / 背景即换一套外观 |
| **可覆盖** | 内置默认值可被用户文件逐项覆盖，未覆盖的走默认 |
| **可校验** | 配置错误要给人话报错，而不是静默失效或白屏 |
| **可回退** | 任何用户文件损坏都不应让界面崩，自动降级到内置默认 |
| **不被升级冲掉** | 用户自定义目录独立于插件包，升级插件不覆盖用户数据 |

---

## 2. 目录布局

### 2.1 两个目录，一份优先级

```
① 插件内置默认（随包分发，升级时被覆盖）
   <插件包>/assets/

② 用户自定义（独立目录，插件升级不动它）
   $DSH_HOME/boujoy/
```

**解析优先级**（高 → 低）：

| 优先级 | 来源 | 说明 |
|---|---|---|
| 1 | `$DSH_HOME/boujoy/` | 用户自定义，**最高** |
| 2 | 插件包内 `assets/` | 内置默认，兜底 |

**逐项覆盖语义**：用户的 `logo.svg` 覆盖内置 logo，但用户没有的 `texture.png` 仍用内置的。
不是"整目录替换"，而是"同名文件覆盖"。

### 2.2 用户目录结构

```
$DSH_HOME/boujoy/
├── boujoy.config.yml          # 主配置（颜色、动效、开关）⚠️ 文件名待定
├── assets/                    # 素材替换（同名覆盖内置）
│   ├── logo.svg               # 品牌字标（侧栏 + 开屏）
│   ├── logo-mark.svg          # 折叠态小图标
│   ├── favicon.png            # 可选
│   ├── fonts/
│   │   ├── brand.woff2        # 品牌字体（标题）
│   │   └── text.woff2         # 正文字体（可选）
│   ├── textures/
│   │   ├── background.png     # 背景氛围图
│   │   ├── grid.svg           # 网格纹理
│   │   └── noise.png          # 噪点（可选）
│   └── boot/                  # 开屏专用素材
│       ├── center.png         # 开屏中心图（可选）
│       └── ring.svg           # 环形装饰（可选）
└── overrides.css              # 高级：自定义 CSS（可选，逃生舱）
```

> `assets/` 下**只有被引用的文件名有效**，多余文件被忽略（不报错）。

---

## 3. 主配置文件

### 3.1 格式

YAML（与 DSH 自身配置文件一致，用户已熟悉）。⚠️ 具体文件名与位置需实现时确定，
候选：`$DSH_HOME/boujoy/boujoy.config.yml`。

### 3.2 完整字段草案

```yaml
# ============================================================
# Boujoy Harness 自定义配置
# 所有字段均可省略，省略即使用内置默认值
# ============================================================

# ---------- 元信息 ----------
version: 1                      # 配置格式版本，用于将来兼容迁移
name: "My Harness"              # 显示的产品名（侧栏字标 + 开屏）
subtitle: "LOCAL AGENT OPS"     # 开屏副标题（可选）

# ---------- 配色 ----------
# 只写你要改的；未写的用内置默认
# 每个色值会同时用于明暗两套（除非分别指定）
colors:
  brand: "#3ba7ff"              # 品牌主色 → --dsw-alias-brand-primary
  accent: "#ffd166"             # 强调色（可选，用于装饰）
  # 细粒度覆盖：直接写 token 名（可选，高级用法）
  tokens:
    --dsw-alias-bg-base:        { light: "#f7f5f0", dark: "#0b0d10" }
    --dsw-alias-bg-layer-1:     { light: "#ffffff", dark: "#14181d" }
    --dsw-alias-label-primary:  { light: "#1a1a1a", dark: "#e8eaed" }

# ---------- 动效 ----------
motion:
  enabled: true                 # 总开关（系统 reduced-motion 仍优先）
  splash:                       # 开屏
    enabled: true
    duration: 3.0               # 秒，建议 2.5–3.5
    skippable: true             # 是否提供"跳过"
    playOncePerSession: true    # 每个页面会话只播一次
  conversation:                 # 对话动效
    enabled: true
    messageEnter: 240           # 消息入场时长 ms
    toolCardEase: 160           # 工具卡片缓动 ms
  ambience:                     # 常驻氛围动画
    enabled: true
    intensity: 0.6              # 0–1，装饰强度

# ---------- 字体 ----------
fonts:
  brand: "assets/fonts/brand.woff2"     # 相对 boujoy/ 目录
  text:  "assets/fonts/text.woff2"      # 可选
  fontSize: 14                          # 正文字号 10–22 整数

# ---------- 素材 ----------
assets:
  logo: "assets/logo.svg"               # 相对 boujoy/ 目录
  logoMark: "assets/logo-mark.svg"
  background: "assets/textures/background.png"
  grid: "assets/textures/grid.svg"
  bootCenter: "assets/boot/center.png"

# ---------- 高级 ----------
advanced:
  customCss: "overrides.css"    # 逃生舱：会被注入到页面
  debug: false                  # 输出详细日志到浏览器控制台
```

### 3.3 校验规则

| 情况 | 行为 |
|---|---|
| 字段缺失 | 用默认值，不报错 |
| 字段类型错（如 `duration: "abc"`） | **报错并指出行号**，该字段用默认值，其余照常生效 |
| 颜色值格式错 | 同上 |
| 数值越界（如 `fontSize: 99`） | 钳制到合法范围并 warn |
| 引用的素材文件不存在 | warn 并回退到内置同名素材；若无内置则用纯色块 |
| 整个文件 YAML 语法错 | **不加载用户配置，全部走内置默认**，并在界面显示一次性提示 |
| `version` 高于支持的版本 | warn，尽量按已知字段加载 |

**核心原则：配置问题绝不能导致白屏或黑屏。**

---

## 4. 素材替换清单

| 文件名 | 类型 | 用途 | 建议规格 |
|---|---|---|---|
| `logo.svg` | SVG | 侧栏展开态字标、开屏品牌 | 矢量优先，宽高比约 4:1 |
| `logo-mark.svg` | SVG | 侧栏折叠态图标 | 正方形，建议 24×24 viewBox |
| `favicon.png` | PNG | 浏览器标签图标（可选） | 32×32 或 64×64 |
| `fonts/*.woff2` | WOFF2 | 品牌/正文字体 | 必须 woff2；授权需自行确认 |
| `textures/background.png` | PNG/JPG | 背景氛围图 | ≤1920×1080，注意文件体积 |
| `textures/grid.svg` | SVG | 网格纹理（平铺） | 建议 64×64 tile |
| `textures/noise.png` | PNG | 噪点叠加（可选） | 128×128 可平铺 |
| `boot/center.png` | PNG/SVG | 开屏中心图 | 透明底，≤800px |
| `boot/ring.svg` | SVG | 环形装饰 | 正方形，用于旋转动画 |

**格式要求**：
- SVG：不要写死 `width`/`height`（用 `viewBox`），便于自适应
- 字体：**只支持 `.woff2`**（体积与兼容性最优）；其他格式需先转换
- 位图：建议先压缩，背景图控制在 500KB 以内

---

## 5. 变量体系（用户可改的 CSS 变量）

用户改颜色有两条路：改 `colors` 字段（简单），或直接写 token（高级）。
二者最终都落到 CSS 变量上。

### 5.1 一类：DSH 语义 token（被我们覆盖）

见 [`DESIGN.md`](./DESIGN.md) §2.2 实测确认的 14 个核心 token（全部为颜色）。
**只覆盖 `--dsw-alias-*` 层**，不动 `--dsw-static-*`。

### 5.2 二类：本项目自有变量（`--bj-*`）

用户可通过 `colors.accent`、`motion.*` 间接影响，也可在 `overrides.css` 里直接改：

```css
:root {
  /* 动效（官方无此类 token，因此由本项目定义） */
  --bj-dur-instant: 90ms;
  --bj-dur-fast:    160ms;
  --bj-dur-normal:  240ms;
  --bj-dur-slow:    420ms;
  --bj-ease-out:    cubic-bezier(.16, 1, .3, 1);
  --bj-ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --bj-ease-wipe:   cubic-bezier(.75, 0, .18, 1);

  /* 装饰尺寸 */
  --bj-splash-duration: 3s;
  --bj-ambience-intensity: 0.6;
  --bj-grid-size: 64px;
}
```

`motion.duration` 等配置项最终会被翻译成这些变量。

---

## 6. 加载与生效流程（设计）

```
插件启动（host 半边）
  │
  ├─ 1. 读 $DSH_HOME/boujoy/boujoy.config.yml
  │     ├─ 不存在 → 全用内置默认（首次安装的正常路径）
  │     └─ 存在 → 解析 + 校验 → 与默认值合并
  │
  ├─ 2. 扫描素材目录，建立"有效素材清单"
  │     用户目录优先，缺失项回退内置
  │
  ├─ 3. 素材路由暴露出去（webServer.register）
  │     GET /boujoy/assets/<name>       → 用户或内置的实际文件
  │     GET /boujoy/theme.css           → 由配置生成或内置 + 用户 overrides.css 拼接
  │     GET /boujoy/config.json         → 配置的运行时视图（供 client 读取）
  │
  └─ 4. client 半边读取 config.json
        ├─ theme.overrideTokens() 应用颜色
        ├─ 注入 <link href="/boujoy/theme.css">
        └─ 按 motion 配置驱动开屏与对话动效
```

### 6.1 热更新（⚠️ 需实现时验证）

理想行为：用户改 `boujoy.config.yml` 或换掉 logo 后，**刷新页面即生效**，无需重启 DSH。

- 素材路由每次请求实时读盘（或带短缓存）即可实现"换图刷新即变"
- 配置的读取时机与缓存策略需验证
- 若 DSH 的 HMR 不监听到该目录，则退化为"重启生效"——**这属于可接受降级**

### 6.2 素材路由的安全要求 ⚠️ 这是本项目最大的安全风险点

**关键事实**【调研】：用 `ctx.webServer.register()` 注册的**自定义路由不会自动继承**
DSH 的鉴权、Host/Origin 栅栏、CORS 和 TLS。因此路由 handler 必须自己处理。

| # | 要求 | 说明 |
|---|---|---|
| 1 | **路径穿越防护** | 只允许 `boujoy/` 目录内的文件；规范化后校验前缀，拒绝 `..` |
| 2 | **扩展名白名单** | 只暴露 `svg / png / jpg / jpeg / webp / woff2 / css` |
| 3 | **不暴露配置文件** | `.yml` / `.json` 配置文件本身不通过路由暴露（含用户路径等隐私） |
| 4 | **Host / Origin 校验** ⚠️ | handler 必须先调 **`ctx.connection.requestRejection(req)`**；返回拒绝值时直接结束响应 |
| 5 | **正确的 `Content-Type`** | 按扩展名给，不按用户输入推断 |
| 6 | **`Cache-Control`** | 素材可长缓存；配置文件与 `config.json` 用 `no-store` |
| 7 | **大小限制** | 拒绝异常大的文件（防止用户误放巨型素材拖垮服务） |

**背景（这条要求从哪来的）**【调研】：

- DSH `0.1.5` 起 web carrier 引入**浏览器会话鉴权**：启动打印 `?token=<launch-token>`，
  带 token 访问根路径会 303 并种下 `dsh-auth-<sha256(authority)>` cookie；
  **无 token 无 cookie 一律 401（纯文本）**。
- 该 cookie 是 **`SameSite=Strict`** → 跨站 iframe 场景下用不了。
- **自定义路由不在这套保护内**，必须自己补上。

> 这也解释了我们此前实测到的现象：直接 `Invoke-WebRequest http://127.0.0.1:19387/`
> 得到 **401**。那是宿主自己的鉴权在起作用，**不是我们的路由**——
> 我们的路由若不自己校验，就会成为一个绕过鉴权的口子。

---

## 7. 错误处理与降级（核心可靠性要求）

| 故障 | 降级行为 |
|---|---|
| 配置文件语法错 | 全部走内置默认，界面顶部一次性提示 |
| 单个字段非法 | 该字段用默认，其余生效 |
| 素材文件损坏/非法 | 回退内置同名素材；再无则隐藏该元素 |
| 字体加载失败 | 回退 `--dsw-font-family-*` 的官方字体 |
| 首帧注入失败 | 退回纯 client 开屏（会漏 271ms，但功能正常） |
| **DSH 版本不兼容** | **进入安全模式**：只应用 token，不注入 CSS、不播动画（见 [`VERSIONING.md`](./VERSIONING.md)） |

**总原则：宁可少效果，绝不让界面不可用。**

---

## 8. 安全模式（Safe Mode）

当检测到 DSH 版本超出已知兼容范围时，或连续启动失败时：

```
① 只应用主题 token（A 层，风险最低）
② 不注入自定义 CSS（C 层，最容易碎）
③ 不播放开屏与对话动画
④ 在设置/控制台输出一次性提示，说明原因与如何关闭安全模式
```

触发条件（草案）：

- `package.json` 中声明的兼容范围不匹配当前 DSH 版本，或
- 用户配置显式开启 `advanced.safeMode: true`，或
- 上一轮启动发生致命错误（记录在 `$DSH_HOME/boujoy/.state.json`）

---

## 9. 实现待办

- [ ] 确定配置文件名与格式（YAML vs JSON）
- [ ] 配置 schema 定义与校验实现（含行号报错）
- [ ] 素材目录扫描与优先级合并
- [ ] 素材路由（含路径穿越防护、扩展名白名单）
- [ ] 配置 → CSS 变量 → token 的转换链
- [ ] 配置 → client 的运行时视图（`config.json`）
- [ ] 热更新/刷新生效验证
- [ ] 安全模式触发与恢复
- [ ] `overrides.css` 逃生舱
- [ ] 示例素材包（供用户照抄改）
- [ ] 用户文档（`user-guide.md` 需新增章节）
