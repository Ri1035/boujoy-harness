# VERSIONING.md —— 版本管理、兼容策略与变更日志规范

> 本文件回答三个问题：
> ① DSH 的版本迭代有多快、对插件意味着什么？
> ② 本插件如何编号、如何声明兼容范围？
> ③ 将来怎么维护变更日志、怎么记录每次适配？
>
> ⚠️ 文中标注 **【实测】** 的数据来自 npm registry 实际抓取（2026-09-30）；
> 标注 **【调研】** 的来自生态调研；**未确认**的会明确写出。

---

## 1. DSH 的版本节奏【实测】

### 1.1 官方变更记录在哪里【实测】

这是本项目的"版本记录"能力的**数据来源**：

| 来源 | 状态 | 说明 |
|---|---|---|
| GitHub **Releases** | ✅ **存在且内容完整** | tag 形如 `dsh-v0.2.0-rc.2`，release notes 中英双语 |
| GitHub **Releases Atom feed** | ✅ **推荐**（机器可读） | `https://github.com/deepseek-ai/deepseek-harness/releases.atom` |
| 仓库根 `CHANGELOG.md` | ❌ **不存在**（HTTP 404） | 官方不维护独立 CHANGELOG 文件 |

**官方 release notes 的分类结构【实测】**：

```
✨ 新增功能 / New Features
🐛 问题修复 / Bug Fixes
🎨 体验优化 / Improvements
⚠️ 其他变更 / Chores
（末尾附 Full Changelog: compare/<old>...<new> 链接）
```

> ⭐ **重要**：官方这套分类与本项目 [`CHANGELOG.md`](../CHANGELOG.md) 的分类高度一致
> （Added / Fixed / Changed + 本项目特有的 Adapted）。
> 因此**可以近乎自动地**把官方 release notes 映射成本项目的适配记录。

### 1.2 与本项目直接相关的一条官方变更【实测】

`v0.2.0-rc.2` 的「体验优化」里明确写着：

> **优化聊天耗时、过程信息、字号和深色主题样式，优化动画运行开销。**

`v0.2.0-rc.1` 的「体验优化」里写着：

> **优化对话进行中和完成状态的实时动画、用时信息、过程信息间距。**

**这两条同时是机会和风险**：

| 维度 | 含义 |
|---|---|
| ⚠️ **风险** | 官方自己在动「深色主题样式」「对话动画」「字号」——**正好压在本项目的作业面上**，意味着我们的 C 层覆盖和对话动效会被官方改动冲击 |
| ✅ **机会** | 官方在投入动画优化，说明这个方向被认可；我们可以对齐它的节奏而不是对抗 |

→ 这进一步强化了 [选择器分级纪律](./DESIGN.md#4--选择器分级纪律本项目最重要的规范) 的必要性：
**凡是官方正在主动演进的区域（深色主题、对话动画、字号），CSS 覆盖都要按最高警戒级别对待。**

### 1.3 硬数据

从 npm registry 抓取 `@deepseek-ai/dsh` 的全部发布记录：

| 指标 | 值 |
|---|---|
| 首次发布 | `0.0.1-rc.1` @ 2026-08-10 |
| 最新 | `0.2.0-rc.2` @ 2026-09-29 |
| **时间跨度** | **49.6 天** |
| **版本总数** | **29 个** |
| **平均发布间隔** | **1.77 天** |
| 最短间隔 | **0.02 天**（`0.1.5-rc.3` → `0.1.7-alpha.1`，几乎同时） |
| 最长间隔 | 9.06 天（`0.1.1-rc.2` → `0.1.2-alpha.2`） |

**结论：DSH 处在典型的高频迭代期，平均不到两天一个版本。**

### 1.2 版本号语义观察

- 通道混用：`0.x.y-rc.N` 与 `0.x.y-alpha.N` 交替出现
- **版本号有跳跃**：`0.0.1-rc.5` 之后直接是 `0.1.0-rc.2`（rc.3/rc.4 未发布）；
  `0.1.3-alpha.2` 之后直接 `0.1.5-alpha.1`（**没有 0.1.4**）
- **存在回填发布**：`0.1.5-rc.3` 发布于 2026-09-22，**晚于** `0.1.6-alpha.1`（09-15）
  → 说明维护者在给旧分支打补丁，**时间线不是严格线性**
- 从 `0.1.7-rc.2` 直接跳到 `0.2.0-rc.1`

⚠️ **不要用"版本号大小"推断时间顺序**，必须以发布时间为准。

### 1.3 dist-tags 陷阱【实测 —— 非常重要的坑】

| 包 | `latest` | `next` | `alpha` |
|---|---|---|---|
| `@deepseek-ai/dsh` | `0.2.0-rc.2` ✅ | `0.2.0-rc.2` | `0.1.7-alpha.2` |
| `@deepseek-ai/dsh-base` | **`0.0.1-rc.1`** ⚠️ | `0.2.0-rc.2` | `0.1.7-alpha.2` |
| `@deepseek-ai/dsh-web-app` | **`0.0.1-rc.1`** ⚠️ | `0.2.0-rc.2` | `0.1.7-alpha.2` |
| `@deepseek-ai/dsh-client-ui-theme` | **`0.0.1-rc.1`** ⚠️ | `0.2.0-rc.2` | `0.1.7-alpha.2` |
| `@deepseek-ai/dsh-client-ui-conversation` | **`0.0.1-rc.1`** ⚠️ | `0.2.0-rc.2` | `0.1.7-alpha.2` |

**所有子包的 `latest` 都停在最早的 `0.0.1-rc.1`**，与本体严重脱节。

**影响**：
- 任何人都不要用 `pnpm add @deepseek-ai/dsh-client-ui-theme`（会装到两个月前的版本）
- 依赖子包必须**显式指定版本或使用 `next` 通道**
- 这也解释了为什么社区里出现"插件与本体版本对不上"的现象

### 1.4 许可变更【实测】

| 版本区间 | license |
|---|---|
| `0.0.1-rc.1` ~ `0.0.1-rc.5` | BSD-3-Clause |
| **`0.1.0-rc.2` 起** | **MIT** |
| `@deepseek-ai/dsh-fs` 等个别包 | npm 元数据仍显示 BSD-3-Clause |

→ 复用官方代码/类型前，**逐包核对 license**。

---

## 2. 这对本插件意味着什么

### 2.1 风险分层：哪些接缝稳、哪些容易碎

按"被改动概率 × 改动后的破坏力"排序（结合【调研】所得的变更线索）：

| 层级 | 依赖的接缝 | 稳定性 | 碎裂后果 |
|---|---|---|---|
| **最稳** | bundle / profile / patch 机制 | 高 | 插件装不上（可立刻发现） |
| **很稳** | host 服务名（`webServer`）、`ctx.on(...)` 事件 | 高 | 需改键名（有先例：`httpServer`→`webServer`） |
| **较稳** | `ctx.slots` 注册 API、slot 名称与 cardinality | 中高 | 浮层不显示 |
| **较稳** | `ctx.theme.overrideTokens` API | 中高 | 配色失效 |
| **中** | `--dsw-alias-*` token **名称** | 中 | 单个 token 失效，颜色局部错 |
| **中** | 官方 `data-*` 属性 | 中 | CSS 选择器失效，局部样式丢失 |
| **较脆** | 未文档化内部标记（`[data-dsh-boot]`） | 低 | 看门狗降级为超时（不崩） |
| **最脆** | DSH 组件的**结构**（DOM 层级、`:has()` 关系） | 低 | 布局错乱 |

**对本项目（只做 token + overlay + 首帧 + CSS）的结论**：

- **最稳的路线本身就是低风险的**：token 覆盖与自有 overlay 不依赖 DSH 内部结构
- 真正的风险集中在 **C 层的结构选择器** 和 `data-*` 属性
- 因此 [选择器分级纪律](./DESIGN.md#4--选择器分级纪律本项目最重要的规范) 不只是"保持整洁"，**它直接决定升级成本**

### 2.2 兼容策略（四道防线）

```
第 1 道：版本隔离
   插件版本、DSH 版本、用户素材版本 三者独立演进
   → 用户换素材不会影响插件代码；插件升级不覆盖用户配置

第 2 道：声明式兼容范围（★ 最省事的一道，由宿主执行）
   package.json 的 peerDependencies["@deepseek-ai/dsh"] 声明验证过的范围
   → 超范围时 DSH 自己拒绝安装 / 跳过 bundle 并恢复官方界面
   → "不崩"由宿主保证，不需要我们写代码（见 §3.2）

第 3 道：结构上消灭依赖（★ 性价比最高）
   dsh.client.inject: []
   → 不等待任何 client 服务，结构上不可能出现 pending / 静默消失
   → 生态里绝大多数"最惨故障"根因都是 client 服务依赖

第 4 道：分层降级
   单个接缝失效时局部降级，而非整体崩溃
   例：首帧注入失败 → 退回纯 client 开屏（漏 271ms 但功能正常）
       素材 404 → 回退内置素材；再无则纯色块
       字体失败 → 回退官方字体
       token 覆盖失败 → 官方配色
       任一条失败只丢该条视觉效果，不级联
```

### 2.3 明确不做的事

| 不做 | 原因 |
|---|---|
| 追赶每个 DSH 版本 | 1.77 天一个版本，追赶不现实 |
| 声称支持"所有版本" | 官方自己都说会有破坏性变更 |
| 用 `latest` 拉子包 | 会装到 `0.0.1-rc.1` |
| 依赖未文档化的内部标记做核心功能 | 它们是**增强**，不是**依赖** |

---

## 3. 本插件的版本编号规则

采用 **SemVer**，但语义针对"主题插件"调整：

| 位 | 何时递增 | 例子 |
|---|---|---|
| **MAJOR** | 配置格式不兼容变更（用户需改配置文件）、或 DSH 大版本专项适配导致行为变化 | `1.0.0` → `2.0.0`（配置字段重命名） |
| **MINOR** | 新增能力（新素材槽位、新动效、新自定义项） | `0.1.0` → `0.2.0`（新增对话动效开关） |
| **PATCH** | 修 bug、适配 DSH 新版本、调色值 | `0.1.0` → `0.1.1` |

**起始版本**：`0.1.0`（当前处于规划期，未发布）

### 3.1 与 DSH 版本的对应关系

**两者版本号完全独立。** 映射关系只存在于兼容矩阵（§4）。

**理由**：插件不需要跟随 DSH 的每个 rc，也不需要因为 DSH 改了个数字就跟着发版。

### 3.2 兼容范围声明【已修正 —— 用标准 `peerDependencies`】

> ⚠️ **本节曾写过一版错误设计**：自造 `dsh.compatibility.dshVersions` / `safeModeBelow` / `verifiedAt`
> 字段。**宿主不会读这些自定义字段，会被静默忽略。** 已修正为官方机制。

**唯一有效的做法是在 `peerDependencies` 里声明 `@deepseek-ai/dsh`。**

```jsonc
{
  "peerDependencies": {
    "@deepseek-ai/cordis": "^4.0.1",
    "@deepseek-ai/dsh": ">=0.2.0-rc.2 <0.3.0-0"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "inject": [], "platform": "web" }
  }
}
```

**DSH `0.1.7-rc.1` 起，peer 兼容是强制的**【调研】：

| 时机 | 行为 |
|---|---|
| 安装时 | `dsh plugin --profile <p> add <spec>` 在 pnpm 之前就拒绝不匹配的插件并 `exit 1`，提示 `installation rejected: ... Running it may cause crashes or data loss.` |
| 启动时 | 不匹配的 profile bundle 被**跳过**（`dsh: skipping profile bundle "X"`）并恢复官方界面，而非崩溃 |

**检查范围（很关键）**：

| 写在哪 | 是否被检查 |
|---|---|
| `peerDependencies["@deepseek-ai/dsh"]` 或 `@deepseek-ai/dsh-*` | ✅ **会被检查** |
| `dependencies` | ❌ 不检查 |
| `engines` | ❌ 不检查（信息性） |
| `dsh.*` 自定义字段 | ❌ 不检查 |
| 不声明 DSH peer 的插件 | ❌ 永不被拒（同时也失去保护） |

**semver 陷阱**【调研】：

- 宿主用 `semver.satisfies(runtime, range, { includePrerelease: true })`，需 semver ≥ 7.8.3
- ⚠️ **`^0.1.7` 不接受 `0.1.7-rc.1`**；`~0.1.7`、`>=0.1.7` 在所有预发布版本上都会被拒
- 预发布区间必须写成显式的预发布 tuple，例如 `>=0.1.7-rc.1 <0.3.0-0`
  （注意上界用 `<0.3.0-0` 这种带 `-0` 的写法才能正确排除整个 `0.3.x`）

**豁免机制**：存在 `<profile>/compatibility.json`，形如
`{ "<name>@<version>": ["<exact dsh version>"] }`；**插件或 DSH 任一方换版本即失效**。
用户自助放行命令：

```bash
dsh plugin --profile web allow-version <pkg>@<版本> --dsh-version <版本> --accept-risk
```

**原则**：**只声明验证过的范围**，下界是你真实验证过的版本，上界取下一个大版本。
不写 `>=0.1.0` 这类宽泛范围——那等于对用户撒谎，而且会被强制门当场打脸。

---

## 4. 兼容矩阵

每次适配一个 DSH 版本，在 `CHANGELOG.md` 与本节同步记录。

| 插件版本 | 验证的 DSH 版本 | 验证日期 | 结果 | 备注 |
|---|---|---|---|---|
| （待发布） | `0.2.0-rc.2` | — | 未验证 | 目标基线 |

**填写规则**：

- `结果` 只能是：`全通过` / `部分通过（注明缺项）` / `安全模式` / `不兼容`
- 每行必须对应一次**真实验证**（在隔离 profile 上跑过回归清单）
- 未验证的版本**不要写进矩阵**

---

## 5. 变更日志（CHANGELOG）规范

### 5.1 文件位置

仓库根目录 `CHANGELOG.md`，遵循 [Keep a Changelog](https://keepachangelog.com/) 精神。

### 5.2 分类

| 分类 | 含义 |
|---|---|
| `Added` | 新能力（对应 MINOR） |
| `Changed` | 行为/视觉变化（可能对应 MINOR 或 MAJOR） |
| `Fixed` | 修 bug（对应 PATCH） |
| `Adapted` | **本项目特有**：适配新的 DSH 版本 |
| `Deprecated` | 即将移除 |
| `Removed` | 已移除（可能对应 MAJOR） |
| `Security` | 安全相关 |

### 5.3 每条记录必须包含

1. **一句话说清改了什么**（用户视角，不是 commit message）
2. **影响范围**：是否影响用户配置、是否需要用户操作
3. **若是 DSH 适配**：适配的 DSH 版本号 + 改动了哪个接缝
4. **若是破坏性变更**：明确写 `BREAKING` 并给出迁移指引

### 5.4 示例格式

```markdown
## [0.2.0] - 2026-10-15

### Added
- 支持对话消息入场动画，可在 `motion.conversation.messageEnter` 调节时长
- 素材库新增 `assets/textures/noise.png` 噪点叠加槽位

### Adapted
- 适配 DSH `0.2.0-rc.3`
  - 接缝变更：`data-content-phase` 取值新增 `settling` 中间态
  - 处理方式：CSS 选择器改为同时匹配新旧取值，保持向后兼容

### Fixed
- 修复刷新页面重复播放开屏动画的问题（改用 `sessionStorage` 去重）

### Changed
- **BREAKING**：配置字段 `splashDuration` 改名为 `motion.splash.duration`
  - 迁移：旧字段仍可识别但会输出 warn，下个 MAJOR 移除

[0.2.0]: https://github.com/Ri1035/boujoy-harness/compare/v0.1.0...v0.2.0
```

---

## 6. 版本适配工作流（每次 DSH 发新版时）

```
DSH 发布新版本
  │
  ├─ 1. 判断是否需要适配
  │     ├─ 只改 DSH 内部实现 → 跳过
  │     └─ 动到本项目依赖的接缝 → 进入适配
  │
  ├─ 2. 在隔离 profile 上验证（绝不在 desktop profile 上试）
  │     └─ 跑 development.md §4 的回归清单
  │
  ├─ 3. 记录结论
  │     ├─ 全通过 → 更新兼容矩阵 + 发布 PATCH，CHANGELOG 写 Adapted
  │     └─ 有碎裂 → 修复 → 同上；若短期无法修 → 降低声明范围 + 启用安全模式
  │
  └─ 4. 更新 VERSIONING.md §4 与 CHANGELOG.md
```

### 6.1 快速判断"要不要适配"的探针

按成本从低到高：

1. **读官方 release notes**（最省事）：抓 `releases.atom`，看是否有落在本项目作业面上的条目
   —— 尤其是「深色主题样式」「对话动画」「字号」「插件」「设置」相关
2. **看 token 差异**：对比新旧版本的 `--dsw-alias-*` 清单（本项目已实测可提取）
3. **看 slot 树差异**：对比 `cordis_inspect_query` 的 slot 清单
4. **看 `data-*` 属性**：在官方包产物里 grep 本项目用到的属性名
5. **看关键事件**：`webserver/index-inject` 是否仍在
6. **跑回归清单**：最可靠，也最费时

> 前 5 项能在不启动服务的情况下完成，适合做"是否需要投入适配"的前置判断。

### 6.2 官方 release notes 的抓取方式（可脚本化）

```powershell
# Atom feed，纯 XML，比抓 HTML 页面可靠得多
Invoke-WebRequest "https://github.com/deepseek-ai/deepseek-harness/releases.atom" -UseBasicParsing
```

**注意**：GitHub 的 release **HTML 页面抓不到正文**（返回的是导航框架），
`raw.githubusercontent.com/.../CHANGELOG.md` 是 404。
**Atom feed 是唯一稳定的机器可读来源。**

> 后续可做成 P6 阶段的一个辅助脚本：自动拉最新 release notes，与本项目 `CHANGELOG.md`
> 的分类对齐，生成"是否需要适配"的初判报告。

---

## 7. 待办

- [ ] 确认兼容范围声明字段的**确切名称**（避免与 DSH 既有字段冲突）
- [ ] 实现运行期 DSH 版本探测（从哪个接口读？⚠️ 需验证 host 侧能否拿到版本）
- [ ] 实现安全模式的状态持久化（`$DSH_HOME/boujoy/.state.json`）
- [ ] 建立 DSH 版本差异的自动探针脚本（§6.1 的前 4 项）
- [ ] 首次真实适配后，补全 §4 兼容矩阵第一行

---

## 附：数据来源

| 数据 | 来源 | 获取方式 | 等级 |
|---|---|---|---|
| 29 个版本与发布时间 | npm registry | `https://registry.npmjs.org/@deepseek-ai%2Fdsh` | 【实测】 |
| dist-tags 与子包滞后 | npm registry | 各包的 `dist-tags` 字段 | 【实测】 |
| license 变更 | npm registry | 各版本 manifest 的 `license` | 【实测】 |
| 官方 release notes 位置与结构 | GitHub Releases | `releases.atom`（HTML 页抓不到正文） | 【实测】 |
| 「优化深色主题样式/对话动画」条目 | `v0.2.0-rc.2` / `v0.2.0-rc.1` release notes | 同上 | 【实测】 |
| 接缝风险分层 | 本项目调研 | 见 [`../research/REPORT.md`](../research/REPORT.md) | 【调研】 |
| `settingsScope` 更名影响 | 社区 issue | `dsh-market/dsh-market#722`（抓取失败，仅搜索结果） | **未确认** |

### 破坏性变更清单（来源：社区迁移卡库，覆盖 `0.1.0-rc.8 → 0.1.7-rc.1`）

> **来源**【调研】：社区仓库 [oh-my-dsh/dsh-plugin-upgrade-skill](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill)
> 维护了 **189 张升级说明卡 + 13 条跨版本对策**，每卡带 before/after、症状、
> 迁移配方，并**钉在官方 tag 源码**上。以下为与本项目相关的摘录。

| 版本边 | 变更 | 对本项目的影响 |
|---|---|---|
| `0.1.0-rc.8 → 0.1.1-rc.1` | **`httpServer` → `webServer`**、`tasks` → `jobs`；**`webServer.register` 路由形状不变** | 🟡 直接改名即可；我们的素材路由写法不受影响 |
| 同上 | `dshClient` → `dsh.client`；若字段名错，**client 半边不进名册、无报错、UI 静默消失** | 🔴 **本项目必须用 `dsh.client`**，写错会静默失效 |
| `0.1.1-rc.2 → 0.1.2-alpha.1` | **`@deepseek-ai/dsh-client-runtime` 被删除**（该边共删 5 个包） | 🟢 本项目**不依赖**任何 `dsh-client-runtime`；`dsh.client.inject: []` 从结构上免疫 |
| 同上 | 若 `dsh.client.inject` 列了已删除的包 → **装配行永久 pending、面板静默消失** | 🔴 再次印证 **inject 必须为空数组** |
| `0.1.5-alpha.1 → 0.1.5-alpha.2` | **slot 大重排**：`conversation` → `main.conversation`；`rightbar` 变 root 作用域并拆出 `rightbar.session` | 🔴 **本项目只注册 `shell.overlay`**，天然免疫 |
| 同上 | `ctx.workspaces` 职责拆分（导航方法移到 `ctx.uiWorkspace`） | 🟢 本项目不碰 |
| `0.1.6-alpha.2 → 0.1.7-alpha.1` | **UI primitives 图标改名：所有 `*16` 导出消失，且无别名**。症状 `Minified React error #130` | 🟠 本项目**不使用官方图标组件**（自带 SVG），但若将来用需注意 |
| 同上 | **settings 换代**：`ctx.settings.register` 不再存在；全局 `settings.yaml` 只做一次性导入 | 🔴 **本项目的用户配置不走 DSH settings**（走自己的 `$DSH_HOME/boujoy/boujoy.config.yml`）→ 天然免疫 |
| 同上 | `dsh.bundle.patch` 由 `string` 扩为 `string \| string[]` | 🟢 **单文件写法仍有效**，向后兼容 |
| `0.1.7-rc.1` | **peer 兼容强制化**（安装拒绝 + 启动跳过） | 🟢 **利好**：我们声明 `peerDependencies` 就获得官方保护 |
| `0.1.5` | **web carrier 引入浏览器会话鉴权**；自定义路由**不继承**鉴权与 Host/Origin 栅栏 | 🔴 **本项目素材路由必须自己调 `ctx.connection.requestRejection(req)`** |

**一个极易踩的静默坑**：patch 里若 `id` 找不到，**只 warn 不报错、静默失效**
（`patch: entry %C not found`）。→ 覆盖官方行时务必用 `--dump-config` 验证真的生效了。

### 与本项目的关系总结

**令人安心的一点**：本项目刻意选择的极窄接缝集（`overrideTokens` / `shell.overlay` /
`index-inject` / `dsh.client.inject: []`）**恰好避开了上表所有红色项**。

| 本项目依赖的 | 历史改名记录 | 结论 |
|---|---|---|
| `ctx.theme.overrideTokens` + `--dsw-alias-*` | **全走廊零次**（负证据） | 最稳 |
| `shell.overlay` | **全走廊零次**（负证据，仅 1 次能力描述） | 最稳 |
| `webserver/index-inject` | **全走廊零次**（负证据） | 较稳 |
| bundle / patch 机制 | 变过但**向后兼容** | 稳 |
| 官方 `data-*` 结构属性 | 卡库**根本不覆盖这层** | ⚠️ 不在契约内 |
| 官方组件 DOM 结构 | 同上 | ⚠️ 不在契约内 |

> ⚠️ **"没有记录"不等于"官方承诺稳定"**——这是负证据，不是保证。
> 仍必须靠每版的实测 + 兼容矩阵来维持。

### 明确"未确认"的项目（不要当结论用）

| 项 | 状态 |
|---|---|
| `ctx.workspace` → `ctx.workspaceRegistry` 的确切版本与是否有过渡别名 | **未确认**（只能确认 master 与 0.1.5-rc.1 都叫 `workspaceRegistry`，且无卡记为破坏性改名） |
| `settingsScope` → `configForms` 落在哪条 alpha 边 | **未确认**（只被 jump 卡覆盖整段）。但 `ctx.settings.register` 移除**已确认为 `0.1.7-alpha.1`** |
| 官方 `docs/upgrade-guide/v0.1.7-rc.2/*` 正文 | **未取到**（API 403 限流、raw 404）——**这是最权威的破坏性变更来源，值得再试** |
| `0.1.7-rc.2 → 0.2.0-rc.2`（**我们的目标版本**） | **社区卡库未覆盖**（上界是 0.1.7-rc.1）→ 只能用本地实测 + tag 源码比对 |
| `peerDependenciesMeta.optional: true` 是否豁免强制门 | **未确认**（有主题插件的 README 行为暗示不豁免） |

