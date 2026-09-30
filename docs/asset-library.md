# asset-library.md —— 素材库规范（Agent 适配版）

> **核心设计变更**：不再要求用户"按模板填素材"，而是**用户只收集素材，由 Agent 读取并适配**。
>
> 状态：**设计已定，尚未实现**（P0 之后落地）。标 ⚠️ 的条目需实现时验证。

---

## 0. 一句话说明职责划分

| 角色 | 负责 |
|---|---|
| **用户** | 收集素材，丢进一个文件夹。**不需要知道任何槽位名、格式约定或配置语法** |
| **Agent** | 看素材 → 判断每张图/字体该放哪 → 生成配置 → 校验 → 报告 |
| **插件引擎** | 提供槽位规格、校验器、诊断命令、加载与降级 |

**用户的心智负担应该是"我准备了一些图"，而不是"我得知道 `boot/ring.svg` 是干什么的"。**

---

## 1. 三个层次，由易到难

```
层次 1（默认，零操作）
   装上插件 → 直接得到一套完整的 Boujoy 主题
   用户什么都不用做

层次 2（推荐，低摩擦）
   用户把素材丢进 $DSH_HOME/boujoy/inbox/
   对 Agent 说："用这些素材给我配一套外观"
   → Agent 完成全部适配，用户只看结果

层次 3（高级，保留）
   用户想手改 → 有完整配置文件与 `overrides.css`
   面向愿意读文档的人，不是必经之路
```

**关键**：层次 1 必须是"默认就好看"，否则产品不成立。
框架能力是**留给别人的空间**，不是**要求用户的作业**。

---

## 2. 用户侧接口：一个"素材收件箱"

```
$DSH_HOME/boujoy/
├── inbox/              ← ★ 用户只需要管这个目录
│   ├── 任意文件名.png      用户随便命名，甚至不命名（IMG_0001.png 也行）
│   ├── 某个logo.svg       格式不限（png / jpg / svg / webp / woff2）
│   ├── 字体.otf           ⚠️ 非 woff2 由 Agent 提示转换
│   └── 背景图.jpg
├── assets/             ← Agent 适配后的产物（可读可改，但不建议手写）
│   ├── logo.svg
│   ├── fonts/brand.woff2
│   ├── textures/background.png
│   └── boot/ring.svg
└── boujoy.config.yml   ← Agent 生成的配置（用户可手改，但不是必须）
```

**用户唯一的必做动作：把文件放进 `inbox/`。**

> 文件名不需要正确。Agent 会看内容而不是看名字。
> 这是与"同名覆盖"设计的根本区别——**匹配判断从用户转移到了 Agent**。

---

## 3. ⭐ 槽位规格（Agent 的适配依据）

这是**本文件最重要的一张表**。它是 Agent 做匹配判断的唯一依据，
也是插件校验器（`doctor`）的数据源。

| # | 槽位 ID | 用途 | 必需 | 建议格式 | 建议尺寸/约束 | 判断线索（给 Agent） |
|---|---|---|---|---|---|---|
| 1 | `logo` | 侧栏展开态字标、开屏品牌 | ✅ | SVG 优先 | 宽高比约 4:1 | 通常是**横向文字型**标识，含产品名 |
| 2 | `logoMark` | 侧栏折叠态小图标 | ❌ | SVG 优先 | 正方形 | **只有一个图形符号**、无文字，或 logo 的方形变体 |
| 3 | `favicon` | 浏览器标签图标 | ❌ | PNG | 32/64 正方形 | 极小方图 |
| 4 | `fontBrand` | 标题/品牌字体 | ❌ | **WOFF2** | — | 字体文件；⚠️ 非 woff2 需转换 |
| 5 | `fontText` | 正文字体 | ❌ | **WOFF2** | — | 同上 |
| 6 | `textureBackground` | 背景氛围图 | ❌ | PNG/JPG | ≤1920×1080，建议 ≤500KB | **大尺寸、无透明通道、构图完整** |
| 7 | `textureGrid` | 网格纹理（平铺） | ❌ | SVG 优先 | 建议 64×64 tile | **无背景色的线框图案**，可无缝平铺 |
| 8 | `textureNoise` | 噪点叠加 | ❌ | PNG | 128×128 可平铺 | 细密颗粒、低对比 |
| 9 | `bootCenter` | 开屏中心图 | ❌ | PNG/SVG | 透明底，≤800px | 主体居中、**透明背景**、常为角色/纹章 |
| 10 | `bootRing` | 开屏环形装饰 | ❌ | SVG | 正方形、居中 | 圆环/齿轮/仪表类图形，将用于旋转动画 |

**辅助信息（不是槽位，但 Agent 需要在配置里产出）**：

| 项 | 说明 | 来源 |
|---|---|---|
| `colors.brand` | 品牌主色 | 从 logo 提取主色，或用户指定 |
| `colors.accent` | 强调色 | 从素材配色提取 |
| `name` | 产品名 | 从 logo 文字识别，或问用户 |
| `subtitle` | 副标题 | 通常由 Agent 拟一个符合风格的短句 |

### 3.1 判断原则（写给 Agent）

1. **先看内容，不看文件名**。`IMG_2384.png` 完全可能是 logo。
2. **透明通道是强信号**：有 alpha 通道 → 更可能是 logo / 图标 / 开屏元素；无 alpha → 更可能是背景。
3. **尺寸是强信号**：小于 128px 且正方形 → 图标类；大于 1024px → 背景类。
4. **SVG 多为矢量标识或纹理**：看是否含文字（`<text>` 或字形路径）区分 logo / logoMark。
5. **字体文件必须验证**：非 `.woff2` 时不能直接用（见 §5），要提示用户或尝试转换。
6. **拿不准就问，不要瞎猜**：给出候选与理由让用户确认，比默默塞错位置好。
7. **允许留空**：没有的槽位就空着，引擎会回退内置默认。

---

## 4. Agent 适配工作流

```
① 扫描 inbox/
     └─ 列出所有文件：类型、尺寸、是否有 alpha 通道、SVG 是否含文字

② 逐个匹配到 §3 的槽位
     └─ 用判断线索（§3.1），产出：{ 源文件 → 槽位, 置信度, 理由 }

③ 处理低置信项
     ├─ 置信度低 → 向用户确认（给候选与理由）
     └─ 无法匹配 → 报告"这个文件我没找到合适位置"，不要硬塞

④ 生成产物
     ├─ 把文件复制/转换到 assets/<槽位路径>
     └─ 生成 boujoy.config.yml

⑤ 提取配色
     └─ 从 logo/素材提取主色 → colors.brand / accent

⑥ 校验
     └─ 运行 doctor（见 §6），确认无缺失/格式错/超限

⑦ 报告
     └─ 逐项说明：配了什么、留空了什么、需要用户决定的还有什么
```

**要求 Agent 遵守**：

- ✅ **幂等**：重复运行不产生重复文件或冲突（先比对内容哈希）
- ✅ **可回滚**：改动前备份现有 `assets/` 与配置（或写进 `.history/`）
- ✅ **不覆盖用户手改**：若某槽位已由用户手工指定，默认跳过并提示
- ❌ **不要伪造素材**：没有就不配，不要生成占位图冒充
- ❌ **不要改 `inbox/`**：那是用户的原始素材，只读

---

## 5. 格式问题与处理

| 情况 | 处理 |
|---|---|
| 字体是 `.ttf` / `.otf` | **不能直接用**（引擎只支持 woff2）。Agent 应：① 提示用户；② 若环境有转换工具则转换；③ 否则先用官方字体并在报告里说明 |
| 图片是 `.webp` | 支持；但若用于 `favicon` 建议转 PNG |
| SVG 写死了 `width`/`height` | 建议改为只留 `viewBox`（否则无法自适应）；Agent 可自动改写 |
| 图片过大（背景 >500KB） | 提示用户压缩，或 Agent 尝试压缩后写入（保留原文件在 inbox） |
| 文件损坏 / 格式不符 | 跳过该文件并报告，不中止整个流程 |

---

## 6. 校验器与诊断命令

插件提供 `doctor` 能力（形态待定：命令 / 技能内的检查步骤 / 两者都有），输出：

```
Boujoy 素材诊断
────────────────────────────────────
✅ logo            assets/logo.svg            128×32  来自 inbox/brand-h.png
✅ textureBackground assets/textures/bg.jpg   1920×1080  1.2MB ⚠️ 偏大
⚠️  bootRing        未配置                      将使用内置默认
❌ fontBrand        inbox/myfont.otf            格式不支持（需 woff2）
   建议：转换为 woff2，或删除该文件使用官方字体
────────────────────────────────────
配置校验：通过（0 错误，2 警告）
```

**校验项**：

| 类别 | 检查 |
|---|---|
| 存在性 | 引用的文件是否存在 |
| 格式 | 扩展名是否在允许列表；字体是否 woff2 |
| 尺寸 | 是否超出建议范围（警告而非错误） |
| 体积 | 是否超出上限 |
| 配置语法 | YAML 是否合法（报行号） |
| 配置语义 | 颜色格式、数值范围、引用的槽位 ID 是否存在 |
| 素材完整性 | `inbox/` 里是否还有**未被匹配**的文件（提醒用户） |

---

## 7. 配置格式（Agent 生成，用户可改）

```yaml
version: 1
name: "My Harness"
subtitle: "LOCAL AGENT OPS"

colors:
  brand: "#3ba7ff"
  accent: "#ffd166"
  tokens:                              # 高级：直接写 token（可选）
    --dsw-alias-bg-base: { light: "#f7f5f0", dark: "#0b0d10" }

motion:
  splash:   { enabled: true, duration: 3.0, skippable: true, playOncePerSession: true }
  conversation: { enabled: true, messageEnter: 240, toolCardEase: 160 }
  ambience: { enabled: true, intensity: 0.6 }

fonts:
  brand: "assets/fonts/brand.woff2"
  text:  "assets/fonts/text.woff2"
  fontSize: 14

assets:
  logo: "assets/logo.svg"
  logoMark: "assets/logo-mark.svg"
  textureBackground: "assets/textures/background.png"
  bootRing: "assets/boot/ring.svg"

advanced:
  customCss: "overrides.css"
  debug: false
```

**校验规则**（详见 §6）：

| 情况 | 行为 |
|---|---|
| 字段缺失 | 用默认值，不报错 |
| 类型/格式错 | **报错并指出行号**，该字段用默认，其余照常 |
| 数值越界 | 钳制 + warn |
| 引用文件不存在 | warn + 回退内置；无内置则隐藏该元素 |
| 整个文件语法错 | **不加载用户配置，全走内置默认**，界面一次性提示 |
| `version` 高于支持 | warn，尽量按已知字段加载 |

---

## 8. 素材任务定义（机器可读，供 Agent 使用）

随插件分发的机器可读规格（草案，格式待定）：

```jsonc
{
  "slots": [
    {
      "id": "logo",
      "required": true,
      "accept": ["svg", "png", "webp"],
      "prefer": "svg",
      "targetPath": "assets/logo.svg",
      "aspectHint": 4,
      "purpose": "侧栏展开态字标与开屏品牌标识",
      "hints": ["横向文字型标识", "含产品名"]
    }
    // … §3 的其余 9 项
  ],
  "derived": ["colors.brand", "colors.accent", "name", "subtitle"],
  "constraints": {
    "fontFormat": ["woff2"],
    "maxFileBytes": { "textureBackground": 524288 }
  }
}
```

**为什么需要它**：Agent 不必读本 Markdown 也能拿到槽位表；
也让校验器与文档共用同一份真相。

---

## 9. 加载与生效流程

```
host 启动
  ├─ ① 读 boujoy.config.yml（不存在 → 全用内置默认）
  ├─ ② 逐槽位解析素材：配置指定路径 → assets/<槽位路径> → 内置 assets/ → 隐藏
  ├─ ③ 生成运行时产物
  │     GET /boujoy/theme.css     内置 CSS + 配置变量 + overrides.css
  │     GET /boujoy/config.json   运行时视图（不含敏感路径）
  │     GET /boujoy/assets/<名>   解析后的实际文件
  └─ ④ DSH 版本探测（超范围时由宿主跳过整个 bundle）
```

**优先级**：`overrides.css` → 配置里的具体 token → 配置里的简写 → 用户素材 → 内置默认。

### 9.1 热更新 ⚠️

理想：改配置或换素材后**刷新页面即生效**，无需重启。
- 素材路由每次请求实时读盘（或短缓存）即可实现"换图刷新即变"
- 配置读取时机与缓存策略需验证
- 若 DSH HMR 不监听该目录 → 退化为"重启生效"（**可接受的降级**）

### 9.2 素材路由的安全要求 ⚠️ 本项目最大的安全风险点

**关键事实**【调研】：用 `ctx.webServer.register()` 注册的自定义路由**不会自动继承**
DSH 的鉴权、Host/Origin 栅栏、CORS 和 TLS。handler 必须自己处理。

| # | 要求 |
|---|---|
| 1 | **路径穿越防护**：规范化后校验前缀，拒绝 `..` |
| 2 | **扩展名白名单**：`svg / png / jpg / jpeg / webp / woff2 / css` |
| 3 | **不暴露配置文件**（含用户路径等隐私） |
| 4 | ⚠️ **必须调 `ctx.connection.requestRejection(req)`** 做 Host/Origin 校验 |
| 5 | 正确的 `Content-Type`（按扩展名，不按用户输入推断） |
| 6 | `Cache-Control`：素材可长缓存；`config.json` 用 `no-store` |
| 7 | 大小限制，防止巨型文件拖垮服务 |

**背景**：DSH `0.1.5` 起 web carrier 引入浏览器会话鉴权
（`?token=` 换 `SameSite=Strict` cookie，无 token 无 cookie 一律 401）——
**自定义路由不在这套保护内**。

---

## 10. 失败降级

| 故障 | 行为 |
|---|---|
| 配置语法错 | 用内置默认外观 + 一次性提示 |
| 单字段非法 | 只有该项回退默认 |
| logo 损坏 | 回退内置 logo；再无则隐藏 |
| 字体加载失败 | 回退 DSH 官方字体 |
| DSH 版本超范围 | **宿主自动跳过整个 bundle 并恢复官方界面**（官方机制） |
| Agent 适配到一半中断 | 下次运行幂等续做；既有产物不被破坏 |

**底线：任何素材或配置问题都不得让界面不可用。**

---

## 11. 与官方 skill 系统的关系

DSH 有官方 skills 系统【实测】：`ctx.skills.register()` 分层为
**project > runtime > user**，`skill` 工具可用（`/skill`）。

本项目计划：
- 把 §3–§5 的适配流程做成一个 **Skill 随插件分发**（`ctx.skills.register()`）
- 用户装了插件就等于装了"会配主题的 Agent 能力"
- ⚠️ 需验证：插件的 skill 注册落在哪一层、是否对所有会话可见

**这使整个设计成立**：用户不需要读文档，因为**Agent 手里有说明书**。

---

## 12. 实现待办

- [ ] 定稿槽位规格（§3）并生成机器可读 JSON（§8）
- [ ] 配置 schema + 校验器（含行号报错）
- [ ] `doctor` 诊断能力（含"inbox 未匹配文件"检测）
- [ ] Agent 适配 Skill（`ctx.skills.register()`，含幂等与回滚要求）
- [ ] 素材路由（含 §9.2 的 7 项安全要求）
- [ ] 配置 → CSS 变量 → token 的转换链
- [ ] 字体格式处理策略（§5）
- [ ] 热更新验证（§9.1）
- [ ] 示例素材包 `examples/`
- [ ] 用户文档改为"丢进 inbox → 让 Agent 配"的叙事
