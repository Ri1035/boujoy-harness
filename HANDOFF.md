# HANDOFF.md —— 转手文档（换设备 / 换 Agent 继续）

> **用途**：在另一台设备、或另一个 Agent 会话里继续本项目时，**先读本文件**。
> 本文件是自包含的：读完它 + `AGENTS.md` + `docs/TODO.md`，你就能无缝接手，不需要重读全部文档。
>
> 最后更新：文档体系建立、调研完成、设计定稿。**工程代码 0 行。**

---

## 0. 30 秒接手指南

```
1. 读本文件（你正在读）
2. 读 AGENTS.md           → 协作契约、12 条红线、环境事实
3. 读 docs/TODO.md        → 当前进度、P0–P7 任务、11 项阻塞、17 条决策记录
4. 按需读：
   docs/architecture.md   → 动手前必读（271ms 时序、A/B/C 分层）
   docs/asset-library.md  → 槽位全量清单 + Agent 适配规范
   docs/features-customization.md → 产品定位与三档体验
   docs/VERSIONING.md     → 版本兼容纪律
   docs/development.md    → 工具链路径、命令、回归清单
   docs/component-api.md  → 官方 API 实测契约
   docs/DESIGN.md         → 视觉规范、token 分层、选择器分级
```

**一句话项目状态**：规划与调研全部完成，**还没写一行工程代码**，等用户提供素材/配色后开工 P0。

---

## 1. 项目是什么

**Boujoy Harness** —— 一个给 DSH（DeepSeek Harness）用的**主题插件**：

```
主产品：一套完整的 Boujoy 主题（装上就好看，零操作）
   └─ 保留空间：自定义框架（给想改成自己风格的人）
```

三档体验：

| 档 | 用户做什么 | 需要读文档吗 |
|---|---|---|
| ① 默认 | 装插件 | ❌ |
| ② 换素材 | 素材丢进 `$DSH_HOME/boujoy/inbox/`，让 Agent 适配 | ❌ |
| ③ 精调 | 手改 `boujoy.config.yml` / 写 `overrides.css` | ✅ |

**核心设计三条**：

1. **默认主题零操作即好看**（框架能力不能成为"半成品"的借口）
2. **脏活给 Agent**：用户不该知道槽位名/命名规则/格式要求
3. **引擎与内容分离**：代码只渲染，外观全在 `$DSH_HOME/boujoy/`，升级不覆盖用户内容

---

## 2. 仓库与位置

| 项 | 值 |
|---|---|
| 仓库 | https://github.com/Ri1035/boujoy-harness （**public**） |
| 当前分支 | `main` |
| 本地工作目录 | `C:\Users\Administrator\Desktop\DSH` |
| 提交数 | 6 |
| 工作区 | 干净 |
| 工程代码 | **0 行**（只有文档） |
| License | **未定**（尚未添加 LICENSE 文件——首次公开发布前需补） |

> ⚠️ **账号提醒**：仓库建在 `Ri1035` 名下，但用户给的邮箱是 `koka2996978242@outlook.com`。
> **该账号归属尚未向用户确认**。若搞错了，需换 remote 重建。

---

## 3. 这台机器的环境事实（换设备后需重新核对）

### 3.1 路径

| 用途 | 路径 |
|---|---|
| 工作目录 | `C:\Users\Administrator\Desktop\DSH` |
| DSH 安装目录 | `D:\soft\DSH` |
| DSH 包内容 | `D:\soft\DSH\resources\app.asar`（打包归档，115.7 MB，12967 个文件） |
| 原生模块解包 | `D:\soft\DSH\resources\app.asar.unpacked\dsh\node_modules`（**只有原生模块，无前端源码**） |
| DSH 用户数据 | `C:\Users\Administrator\.dsh` |
| **desktop profile（用户在用）** | `C:\Users\Administrator\.dsh\profiles\desktop` |
| **web profile（开发沙盒）** | `C:\Users\Administrator\.dsh\profiles\web` |
| **内置 Node** | `D:\soft\DSH\resources\runtime\primary-runtime\dependencies\node\bin\node.exe` |
| 内置 pnpm | `D:\soft\DSH\resources\runtime\primary-runtime\dependencies\pnpm` |
| dsh CLI | `D:\soft\DSH\resources\runtime\cli\bin\dsh.cmd` |

### 3.2 版本

- DSH `0.2.0-rc.2`（npm `latest` = `next`）
- Node `24.21.0` / pnpm `11.7.0`
- **本机没有全局 `node`/`pnpm`** —— 必须用上面 DSH 内置的路径

> ⚠️ `D:\soft\DSH\resources\app.asar\dsh` 这个路径**不存在**（曾出现在任务描述里）。
> 真实路径带 `.unpacked`，且其中没有前端源码。

### 3.3 换设备后必须重新确认的

- [ ] DSH 版本是否仍为 `0.2.0-rc.2`（否则查 `releases.atom` 看有无破坏性变更）
- [ ] `.dsh` 用户目录位置（可能不同）
- [ ] 是否已有 `web` profile（没有则创建）
- [ ] 内置 Node/pnpm 路径是否相同

---

## 4. 关键设计决策（已定，不要重新推翻）

完整 17 条见 `docs/TODO.md` 的「决策记录」。最关键的是：

| # | 决策 | 原因 |
|---|---|---|
| D1 | 主骨架用 `dsh-550c-boot`（MIT），**不用** `dsh-endfield-ui` | endfield 的 GitHub API 返回 `license: null`，无法确认授权 → **只读不抄**；550c-boot 是唯一解决 271ms 时序问题的项目 |
| D2 | 不依赖 `better-sidebar` / `shikitor` | 参考项目明确警告禁止单独 add（会双挂载）；纯主题不需要 |
| D3 | 开发在 `web` profile，**不在 `desktop`** | desktop 被 Electron 独占，且是用户生产环境 |
| D4 | 首帧注入用 `webserver/index-inject`，**不用 `tapIndex`** | `tapIndex` 在桌面端是死代码（走 `dsh-app://` 不调 `renderIndex()`） |
| D5 | 动效自带 `--bj-*` 变量 | 官方无动效时长 token（实测空集） |
| D13 | 兼容范围用标准 **`peerDependencies["@deepseek-ai/dsh"]`** | 自造 `dsh.compatibility.*` 字段宿主不读，会被静默忽略 |
| D14 | **`dsh.client.inject` 保持空数组** | 生态中"面板静默消失/连锁 pending"根因几乎都是 client 服务依赖 |
| D15 | **只用 4 条最窄接缝** | 189 张社区升级卡中，这 4 条在全走廊**零改名记录** |
| D16 | 不碰官方 settings 通道，用户配置走自有文件 | 官方 settings 在 `0.1.7-alpha.1` 整体换代 |
| D17 | token 接口只能改颜色，其余走自有变量 | 实测 `Theme.listTokens` 只有 14 个且全是 `"CSS color"` |

---

## 5. 六个必须知道的技术事实（都是实测/调研结论，别再踩一遍）

### 5.1 ⭐ 开屏动画有 271ms 空窗，必须双半边（最关键）

`dsh-550c-boot` 作者用 CDP 实测：

| 时刻 | 事件 |
|---|---|
| 0ms | 导航开始 |
| **67ms** | DSH 自带开机卡片 `[data-dsh-boot]` 出现 |
| **271ms** | ← **空窗期**：client 插件还没执行，z-index 再高也盖不住 |
| 338ms | 我们的 client 插件求值、`shell.overlay` 挂载 |
| 517ms | DSH 开机卡片被移除 |

**正解**：首帧由 **host 半边**注入：

```js
ctx.on('webserver/index-inject', (table) => {
  table.push({ kind: 'style', text: FIRST_FRAME_CSS })
  table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
})
```

⚠️ **注入行有白名单**：未知 `kind` 会被 boot gate 拒绝，可能把桌面端打进崩溃恢复页。
**只产出 `kind: 'style'` 和 `kind: 'script'`。**

看门狗三条退出路径：卡片消失 / 卡片掉 spinner（失败态）/ 绝对超时（12s）。

### 5.2 主题 token 只有 14 个，而且全是颜色

实测 `Theme.listTokens`：

- 返回 **14 个** token，`valueType` **全是 `"CSS color"`**
- **没有**圆角、阴影、字体、动效 token
- `--dsw-radius-*` / `--dsw-elevation-*` / `--dsw-font-*` 在产物里**存在但未暴露**
- 官方 spec **拒绝 token 重定义**

→ **圆角、阴影、字体、动效全部走自有 `--bj-*` 变量 + 自有元素，不要重定义官方 token。**

> 官方 `web-styling.md` 说 ui-theme 管辖 motion，指的是**官方自己 CSS 里的动画**，
> 不等于给第三方暴露了可覆盖 token。两者不矛盾。

### 5.3 素材路由必须自己处理鉴权（安全）

`ctx.webServer.register()` 注册的自定义路由**不继承**宿主的鉴权、Host/Origin 栅栏、CORS、TLS。

handler **必须**开头调：

```js
ctx.connection.requestRejection(req)
```

背景：DSH `0.1.5` 起有浏览器会话鉴权（`?token=` 换 `SameSite=Strict` cookie，无 token 无 cookie 一律 401）。
我们实测直接请求 `http://127.0.0.1:19387/` 得到 **401** 就是这套机制——**但它不覆盖我们的路由**。

### 5.4 只用 4 条最窄接缝（避开所有已知雷区）

社区 [oh-my-dsh/dsh-plugin-upgrade-skill](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill) 有 **189 张升级说明卡**（覆盖 `0.1.0-rc.8 → 0.1.7-rc.1`）。对照结论：

| 我们依赖的 | 历史改名记录 |
|---|---|
| `ctx.theme.overrideTokens` + `--dsw-alias-*` | **全走廊零次** |
| `shell.overlay` | **全走廊零次** |
| `webserver/index-inject` | **全走廊零次** |
| bundle / patch 机制 | 变过但**向后兼容** |

**被记录改动过、我们都不碰的**：slot 名称（`conversation`→`main.conversation`、`rightbar` 改作用域）、
settings API 整体换代、图标导出名（`*16` 全删无别名）、`ctx.workspaces` 职责拆分。

> ⚠️ **"没有记录"是负证据，不是官方承诺稳定。**

### 5.5 DSH 版本节奏极快

| 指标 | 值 |
|---|---|
| 49.6 天内发布版本数 | **29 个** |
| 平均发布间隔 | **1.77 天** |
| 子包 npm `latest` | **全部停在 `0.0.1-rc.1`**（本体是 `0.2.0-rc.2`） |

**配套纪律**：
- 兼容范围写 `peerDependencies`，不写自定义字段
- semver 陷阱：`^0.1.7` **不接受** `0.1.7-rc.1`（宿主用 `includePrerelease: true`）
- 上界写 `<0.3.0-0`（带 `-0` 才能排除整个 `0.3.x`）
- DSH 内置 pnpm **只装发布满 24 小时的版本**，新版本 24h 内 `update` 装不上**且不报错**

### 5.6 版本记录的数据来源

| 来源 | 状态 |
|---|---|
| 官方仓库根 `CHANGELOG.md` | ❌ **不存在**（404） |
| GitHub **Releases** | ✅ 权威，tag 形如 `dsh-v0.2.0-rc.2`，中英双语 |
| **`releases.atom`** | ✅ **推荐**，机器可读（HTML 页面抓不到正文） |
| 官方 `docs/upgrade-guide/<版本>/` | ✅ 逐版本迁移指南（比 release notes 权威） |

⚠️ **npm 版本 ≠ GitHub Release**：npm 29 个 vs GitHub 24 个，有 2 个版本只在 GitHub 有。

---

## 6. 当前进度

```
[■■■■■■■■■■] 调研           ✅ 完成
[■■■■■■■■■■] 计划           ✅ 完成（含框架目标、版本策略、槽位清单）
[■■■■■■■■■■] 文档体系       ✅ 完成（18 个文件）
[          ] P0 骨架+配置     ⬜ 未开始  ← 下一件事
[          ] P1 默认主题 token ⬜ 未开始
[          ] P2 开屏动画       ⬜ 未开始
[          ] P3 氛围层         ⬜ 未开始
[          ] P3.5 适配能力     ⬜ 未开始
[          ] P4 C 层视觉       ⬜ 未开始
[          ] P5 对话动画       ⬜ 未开始
[          ] P6 回归测试       ⬜ 未开始
[          ] P7 桌面端         ⬜ 未开始（可选）
```

**顺序纪律**：**P1–P3 先把默认主题做好，P3.5 才做适配能力。**
默认主题不成立，框架就没有第一个内容。

预估：P0–P3 约 5–7 天出可用 1.0；含 C 层与对话动画约 10–14 天。

---

## 7. ⏳ 需要用户输入的事项（11 项，全部未解除）

| # | 阻塞项 | 影响的阶段 |
|---|---|---|
| **B1** | 品牌素材（logo / 字体 / 纹理）—— 给一个目录路径 | P1、P3 |
| **B2** | 视觉定位：主色 + 强调色具体色值 + 一句话风格定义 | P1–P4 |
| **B3** | **第二个参考项目名称**（用户只在视频里看过，从未给出名称） | P5 之前 |
| **B4** | 对话动画路线：轻量（官方 `data-*` + CSS）/ 重度（替换 `conversation.chat.node`） | P5 |
| **B5** | 品牌文案：开屏的产品名、副标题、版本号 | P2 |
| **B6** | 目标端：只做 `web` profile，还是同时上 `desktop` | P7 |
| **B7** | 用途：自用 / 分发（决定是否按可发布标准做） | 全程 |
| **B8** | 配置文件格式与文件名（YAML vs JSON；`boujoy.config.yml`？） | P0 |
| **B9** | 用户自定义目录定名（建议 `$DSH_HOME/boujoy/`） | P0 |
| **B10** | 槽位清单定稿（`docs/asset-library.md` §2 的 30 项是否够用） | P0 / P3.5 |
| **B11** | 适配 Skill 触发方式 → **用户已决定：自动触发** ✅ | P3.5 |

### 7.1 其他未决事项

- **仓库账号归属**：`Ri1035` 是否是用户的账号？（用户邮箱是 `koka2996978242@outlook.com`）
- **License**：尚未添加 LICENSE 文件。首次公开发布前需决定。
- **凭据安全**：用户曾明文提供 GitHub PAT，**已提示 revoke**。
  新会话**不要**再向用户索要 token；优先用用户本机凭据管理器，或让用户自己推。

---

## 8. 换设备后的第一步该做什么

### 8.1 如果你（新 Agent）拿到的是这个仓库

```powershell
# 1. 克隆
git clone https://github.com/Ri1035/boujoy-harness.git
cd boujoy-harness

# 2. 读文档（按顺序）
#    HANDOFF.md（本文件） → AGENTS.md → docs/TODO.md
```

### 8.2 如果要继续开发，先确认环境

```powershell
# DSH 版本
Invoke-RestMethod https://registry.npmjs.org/@deepseek-ai/dsh | Select-Object -Expand dist-tags

# 官方最新 release notes（机器可读）
Invoke-WebRequest "https://github.com/deepseek-ai/deepseek-harness/releases.atom" -UseBasicParsing

# 内置 Node 是否可用
& "<DSH>/resources/runtime/primary-runtime/dependencies/node/bin/node.exe" -v
```

### 8.3 如果用户说"继续"或"开工"

**默认从 P0 开始**（它不依赖素材）：

1. `plugin/` 骨架（`package.json` + `cordis.patch.yml` + `index.js` + `client.js`）
2. `lib/slots.js` —— 槽位规格（机器可读，Skill 与 doctor 共用）
3. `lib/config.js` —— 配置加载 + 校验（带行号报错）
4. `lib/routes.js` —— 素材路由（**含 `ctx.connection.requestRejection`**）
5. `lib/skill.js` —— 注册适配 Skill 到 `ctx.skills`
6. 装进 `web` profile，起隔离实例验证

**验收标准**：`dsh --profile web --dump-config` 出现插件层；
浏览器能看到原生界面；`/boujoy/config.json` 返回 200。

### 8.4 开工前必须遵守

- ⛔ **不要碰 `desktop` profile**（用户生产环境）
- ⛔ **不要改 `app.asar`**
- ⛔ **不要把 token 写进任何文件**
- ✅ 所有实验在 `web` profile + 独立端口
- ✅ 提交前跑 token 泄露扫描
- ✅ 提交信息用**无 BOM UTF-8**（PowerShell 5.1 按 ANSI 读脚本会毁中文——本项目踩过两次）

---

## 9. 协作约定（别破坏）

- **证据分三档**：`【实测】` / `【引用】` / **未确认**。**测不了就标"未确认"，不要写成结论。**
- **改动同步文档**：改视觉 → `DESIGN.md`；改架构 → `architecture.md`；改 API → `component-api.md`；
  改能力 → `features-customization.md`；完成阶段 → `TODO.md` 进度区块
- **每次适配 DSH 新版本**必须更新 `CHANGELOG.md` 的 `Adapted` 段
- **决策要进 ADR**（`TODO.md` 决策记录），包括**被推翻的决策**（本项目已记录一次：自造兼容字段）

---

## 10. 已知的坑（本项目已经踩过或明确避开的）

| 坑 | 事实 |
|---|---|
| 直接用 `powershell.exe` 写含中文的文件/提交信息 | PS 5.1 按 ANSI 读取 UTF-8 脚本 → **中文全毁**。用 Node 写无 BOM UTF-8 |
| `Set-Content -Encoding utf8NoBOM` | PS 5.1 **不支持**该枚举值 → 用 `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` |
| 自造兼容字段声明 DSH 版本 | 宿主**不读**，静默忽略 |
| 用 `latest` 拉 `@deepseek-ai/dsh-*` 子包 | 会装到 `0.0.1-rc.1`（两个月前） |
| 给 `dsh.client.inject` 填服务 | 生态里"面板静默消失"的主要根因 |
| 用 `tapIndex` 注入首帧 | 桌面端死代码 |
| 用 CSS Modules 哈希类做选择器 | 随构建变化，必碎 |
| 把中文 `aria-label` 写进选择器 | 语言一换即碎（参考项目踩过） |
| 注册 `root` slot | 官方原文 "DO NOT register here"，会替换整个 AppFrame |
| patch 里 `id` 写错 | **只 warn 不报错、静默失效** → 必须 `--dump-config` 验证 |
| 把参考项目源码直接入库 | 第三方代码缺 LICENSE 再分发有授权风险 → 本项目只入库自己的分析文档 |

---

## 11. 文档地图（18 个文件）

```
README.md                        项目门面：定位、安装、版本节奏警示
AGENTS.md                        ★ AI 协作入口：环境、12 条红线、技术框架、验证手段
CHANGELOG.md                     变更日志（含 Adapted 段，本仓库自己的）
HANDOFF.md                       ★ 本文件
.gitignore

docs/
├── TODO.md                      ★ 进度真相源：P0–P7、11 阻塞、17 条 ADR
├── project-overview.md          目标（含 G0.x 框架验收条目）、范围、术语表
├── architecture.md              A/B/C 分层、271ms 时序、数据流、目录规划
├── asset-library.md             ★ 槽位全量清单 + Agent 适配规范 + 路由安全
├── features-customization.md    产品定位（主产品/保留空间）、三档体验、12 项能力
├── DESIGN.md                    14 个 token、选择器四级纪律、`--bj-*` 动效变量
├── VERSIONING.md                版本节奏实测、兼容矩阵、破坏性变更清单、适配工作流
├── development.md               工具链路径、命令、7 大类回归清单
├── component-api.md             官方 API 实测契约（theme/slots/webServer/skills/data-*）
├── user-guide.md                用户手册（面向最终用户）
└── （共 10 个 docs 文件）

skills/
└── boujoy-theme-setup/SKILL.md  ★ Agent 适配能力（随插件分发，自动触发）

research/
├── PLAN.md                      实施计划书
└── REPORT.md                    生态调研报告（15+ 项目、动画实现代码片段）
```

---

## 12. 一句话总结

**调研透了、设计定了、文档齐了、代码没写。**

下一步是 P0（不依赖素材，可立即开工），等用户提供素材/配色后进 P1 做默认主题。

**接手时最该先看的三个文件**：`AGENTS.md`（红线）→ `docs/TODO.md`（进度与阻塞）→ 本文件（全貌）。
