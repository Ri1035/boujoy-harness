# AGENTS.md —— 项目入口说明书

> **这是 AI 协作的基础信息文档。任何 AI 接手本项目，请先完整读完本文件，再按需读取其他文档。**
>
> 本文件的目标：让一个新接手的 AI 在 **5 分钟内**知道「这是什么项目、现在到哪一步、什么能做、什么绝对不能做、下一步做什么」。

---

## 0. 30 秒速览

| 项 | 值 |
|---|---|
| 项目名 | **Boujoy Harness** |
| 类型 | DSH（DeepSeek Harness）**主题插件**，默认主题为主产品，另保留可自定义框架 |
| 目标环境 | DSH `0.2.0-rc.2`（当前桌面版），开发用独立 `web` profile |
| 当前阶段 | **规划与调研完成，工程代码为 0** |
| 交付形态 | 一个 npm 包（bundle）+ 一个 Agent Skill + 用户内容目录 `$DSH_HOME/boujoy/` |
| 核心设计 | ① 默认主题零操作即好看 ② 脏活给 Agent（用户只丢素材） ③ 引擎与内容分离 |
| 核心难点 | 开屏动画的 **271ms 空窗**；对话动画是**生态空白**；DSH **1.77 天一个版本**的适配压力 |

---

## 1. 必读顺序

接手时按此顺序读，不要一次读完所有文档：

1. **本文件**（AGENTS.md）—— 协作契约与红线
2. [`docs/TODO.md`](./docs/TODO.md) —— **当前进度与下一步**（跨会话续作的第一站）
3. [`docs/project-overview.md`](./docs/project-overview.md) —— 目标与范围
4. [`docs/architecture.md`](./docs/architecture.md) —— 技术框架，动手前必读
5. [`docs/asset-library.md`](./docs/asset-library.md) —— **槽位全量清单（34 项内容级可自定义）+ Agent 适配规范**
6. 按任务需要：`docs/DESIGN.md`（改视觉时）、`docs/features-customization.md`（改能力时）、
   `docs/VERSIONING.md`（涉及版本/兼容时）、`docs/development.md`（跑命令时）、
   `docs/component-api.md`（调 API 时）

> 🆕 **换设备 / 换会话接手时，先读 [`HANDOFF.md`](./HANDOFF.md)** —— 它是自包含的转手文档，
> 包含环境事实、六个关键结论、阻塞项、下一步该做什么、以及本项目踩过的坑。

> 只有 `docs/user-guide.md` 是给最终用户看的，AI 不需要主动读，除非要改用户文档。

### 1.1 项目定位（别搞错）

**这是一个"默认主题 + 保留自定义框架"的产品，不是"让用户自己做主题的工具"。**

```
主产品：一套完整的 Boujoy 主题（装上就好看，零操作）
   │
   └─ 保留空间：自定义框架（为想改成自己风格的人，不要求任何人使用）
```

| 分档 | 用户做什么 | 需要读文档吗 |
|---|---|---|
| ① 默认 | 装插件 | ❌ |
| ② 换素材 | 素材丢进 `$DSH_HOME/boujoy/inbox/`，让 Agent 适配 | ❌ |
| ③ 精调 | 手改配置 / 写 `overrides.css` | ✅ |

**关键设计：脏活给 Agent，不给用户。**
用户不该知道槽位名、命名规则、格式要求——那是 Agent 的活。
Agent 的能力以 **Skill 形式随插件分发**（`skills/boujoy-theme-setup/`）。

**引擎与内容分离**：代码只负责渲染，外观全在 `$DSH_HOME/boujoy/`。
升级引擎不覆盖内容，换内容不需要动引擎。

任何设计决策都要先问两个问题：

1. **"这属于引擎还是内容？"**
2. **"这件事能不能让 Agent 做，而不是让用户做？"**

---

## 2. 环境事实（已验证，不要重新猜）

### 2.1 路径

| 用途 | 路径 |
|---|---|
| 工作目录 | `C:\Users\Administrator\Desktop\DSH` |
| DSH 安装目录 | `D:\soft\DSH` |
| DSH 包内容 | `D:\soft\DSH\resources\app.asar`（**打包归档，115.7 MB，12967 个文件**） |
| 原生模块解包 | `D:\soft\DSH\resources\app.asar.unpacked\dsh\node_modules`（**只有原生模块，没有前端源码**） |
| DSH 用户数据 | `C:\Users\Administrator\.dsh` |
| **桌面 profile（用户正在用）** | `C:\Users\Administrator\.dsh\profiles\desktop` |
| **web profile（开发沙盒）** | `C:\Users\Administrator\.dsh\profiles\web` |
| 内置 Node | `D:\soft\DSH\resources\runtime\primary-runtime\dependencies\node\bin\node.exe` |
| 内置 pnpm | `D:\soft\DSH\resources\runtime\primary-runtime\dependencies\pnpm` |
| dsh CLI | `D:\soft\DSH\resources\runtime\cli\bin\dsh.cmd` |

> ⚠️ 任务描述里曾出现过 `D:\soft\DSH\resources\app.asar\dsh` 这个路径 —— **它不存在**。
> 真实路径带 `.unpacked`，且其中没有前端源码。

### 2.2 版本

- DSH：`0.2.0-rc.2`（npm `latest` = `next`）
- Node：`24.21.0` / pnpm `11.7.0`
- `@deepseek-ai/dsh-client-ui-*` 等单包在 npm 上的 `latest` **严重滞后**（停在 `0.0.1-rc.x`）
  → **版本对齐一律以 dsh 本体为准，不要按单包 latest 判断**

### 2.3 关键机制

| 机制 | 事实 |
|---|---|
| profile 管理 | `desktop` profile **被 Electron 应用独占**，CLI 会拒绝：`profile "desktop" is managed exclusively by the Electron application` |
| 开发用 profile | `web`，CLI 可自由管理：`dsh plugin --profile web add ...` |
| 配置覆盖 | 改 profile 的 `cordis.patch.yml`（用户层）或 `package.json` 的 `dsh.profile.bundles` |
| patch 语义 | **整行替换，不做深合并** —— 覆盖官方行必须重述该行全部 key |
| 层顺序 | profile.bundles → profile 的 `cordis.patch.yml` → `$DSH_HOME/cordis.patch.yml` → 各 `--patch`；后者按行胜出 |
| HMR | 运行中改 `cordis.patch.yml` 会被事务性重读；新插件首次需重启进程才会重建 `window.__DSH_BOOT__` 名册 |

---

## 3. 绝对红线（违反会出事故）

| # | 禁止事项 | 原因 |
|---|---|---|
| **R1** | **不要直接改 `app.asar` 或 DSH 安装目录** | 打包归档 + 更新即覆盖，改了就丢；且会破坏签名校验 |
| **R2** | **不要在 `desktop` profile 上做实验性安装** | 那是用户正在使用的工作环境，装坏了影响工作 |
| **R3** | **不要把凭据 / token / 密钥写进任何文件或提交** | 见 §7 |
| **R4** | **不要整段复制 `dsh-endfield-ui` 的代码** | 该仓库 GitHub API 返回 `license: null`，许可未确认。**只读源码学结构，落笔自己写** |
| **R5** | **不要注册 `root` slot** | 官方原文 "DO NOT register here" —— 它会**替换整个 AppFrame**，页面只剩你的组件，所有 seat 消失 |
| **R6** | **不要用 CSS Modules 哈希类做选择器**（如 `.Mbwy4a_card`） | 随构建变化，必然碎 |
| **R7** | **不要把中文 `aria-label` 写进选择器** | 参考项目踩过：`button[aria-label="新建会话"]`，语言一换即废 |
| **R8** | **不要用 `tapIndex` 注入** | 桌面端走 `dsh-app://` 直读 index.html，**从不调用 `renderIndex()`**，是死代码 |
| **R9** | **不要给 `dsh.client.inject` 填任何服务** | 生态里"面板静默消失/连锁 pending"的根因几乎都是 client 服务依赖。本项目功能不需要任何 client 服务 → **保持空数组** |
| **R10** | **素材路由必须自己处理鉴权** | `ctx.webServer.register()` 注册的路由**不继承**宿主的鉴权与 Host/Origin 栅栏；handler 必须先调 `ctx.connection.requestRejection(req)` |
| **R11** | **兼容范围只能写在 `peerDependencies`** | 写进 `dsh.*` 自定义字段、`dependencies`、`engines` 都会被**静默忽略**。只有 `peerDependencies["@deepseek-ai/dsh"]` 会被宿主检查 |
| **R12** | **不要重定义官方 `--dsw-*` token** | 官方 ui-theme spec **拒绝 token 重定义**。未暴露的项（圆角/阴影/字体）走自有 `--bj-*` 变量 + 自有元素 |

---

## 4. 技术框架（一句话版）

改造分三层，动手前务必读 [`docs/architecture.md`](./docs/architecture.md)：

| 层 | 手段 | 官方支持 |
|---|---|---|
| **A** | `ctx.theme.overrideTokens(source, {light, dark})` 覆盖 `--dsw-alias-*` | ✅ 完全官方 |
| **B** | host `webServer` 素材路由 + host `webserver/index-inject` 首帧 + client `shell.overlay` | ✅ 官方接缝 |
| **C** | 注入自有 CSS 改已有组件外观（**分级使用选择器**） | ⚠️ 官方未承诺 |
| **C+** | 对话动画：官方 `data-*` 属性 或 注册 `conversation.chat.node` | ⚠️ 接缝存在但无先例 |

### 4.1 三个最容易做错的地方

1. **开屏必须双半边**：只走 client 的 `shell.overlay` 会漏出 DSH 开机卡片 271ms。
   首帧必须由 host 半边 `ctx.on('webserver/index-inject', table => ...)` 注入。
   （该事件**已实测存在于本实例**，签名 `'webserver/index-inject'(table: IndexInjection[]): void`）
2. **注入行有白名单**：未知 `kind` 会被 boot gate 拒绝，可能把桌面端打进崩溃恢复页。
   **只产出 `kind: 'style'` 和 `kind: 'script'`。**
3. **`overrideTokens` 必须传 `{light, dark}` 对**，裸字符串会抛教学错误。

---

## 5. 可用的验证手段（不要靠猜）

| 手段 | 命令 / 调用 | 能查到什么 |
|---|---|---|
| 查实时 slot 树 | `cordis_inspect_query` platform=`client`, provider=`Slots`, method=`listSubTree` | 90 个 slot 的 kind、scope、注册项、占用者 |
| 查主题 token | platform=`client`, provider=`Theme`, method=`listTokens` | 当前主题的 token 清单 |
| 查可用事件 | platform=`host`/`client`, provider=`Event`, method=`listEvents` | 事件契约（如 `webserver/index-inject`） |
| 查服务 | provider=`Service`, method=`listService` | host/client 全部服务方法签名 |
| 查插件清单 | `plugin_manager` action=`list_plugins` / `list_bundles` | 当前 profile 的 loader 行与 bundle |
| 离线看组合树 | `dsh --profile <name> --dump-config` | patch 层的实际组合结果（`desktop` 会被拒） |

> ⚠️ client 侧查询需要有一个活动页面响应。若报超时，让用户在 GUI 里刷新一次页面再查。

---

## 6. 协作约定

- **写代码前必须先在 [`docs/TODO.md`](./docs/TODO.md) 里找到对应任务**；完成后更新状态与产出。
- **每完成一个阶段，更新 `TODO.md` 的「当前进度」区块** —— 这是跨会话续作的唯一真相源。
- **改视觉规范 → 同步更新 `docs/DESIGN.md`**；改架构 → 同步 `docs/architecture.md`。
- **新增/修改自有组件 API → 同步 `docs/component-api.md`**。
- **不写「看起来合理」的猜测**。DSH 处于 developer preview，官方 README 明确
  "THERE WILL BE COMPATIBILITY-BREAKING CHANGES"；任何 API 行为都以**实测**为准，测不了就标注"未确认"。
- 文档里区分三档证据等级：**已实测** / **引用参考项目的说法** / **未确认**。

---

## 7. 安全规则（本次会话相关）

- 用户在 2026-09-30 的会话中**明文提供过一个 GitHub PAT**（`ghp_` 开头，40 字符）。
  该 token 出现在对话记录中，**应视为已泄露**，已提示用户 revoke。
- **不得将任何 token / 密钥写入仓库文件、README、脚本或 git 配置。**
- 推送凭据只允许在**单次命令的环境变量**中传递，用完即弃，不落盘。
- 如果将来需要自动化推送，使用 GitHub Actions 的 `GITHUB_TOKEN` 或用户自配的凭据管理器，
  **不要在仓库里存放长期有效的 PAT**。

---

## 8. 常见误区（前人踩过的坑）

| 误区 | 实际 |
|---|---|
| "改 `app.asar` 里的 CSS 就能换肤" | 归档只读、更新覆盖，且 12967 个文件中找目标成本极高。走插件 |
| "主题 token 里应该有圆角/阴影/动效变量" | **实测 `Theme.listTokens` 只返回 14 个 token，`valueType` 全是 `"CSS color"`**。圆角（`--dsw-radius-*`）、阴影（`--dsw-elevation-*`）、字体（`--dsw-font-*`）在官方包产物里**存在但未暴露**，动效时长/缓动则**完全不存在**。→ 这些必须走 C 层自有 `--bj-*` 变量 |
| "官方文档说 ui-theme 管 motion，所以有动效 token" | 官方文档说的是**官方自己 CSS 里定义了动画**，不等于给第三方暴露了可覆盖 token。实测 token 接口只有颜色 |
| "`shell.overlay` 里 z-index 开最大就能盖住启动画面" | 不行，时序上 client 插件还没执行 |
| "参考项目能直接跑" | **没有任何项目声明支持 0.2.0-rc.2**，最高验证到 rc.1 |
| "顺手把 `better-sidebar` 也装上" | 参考项目明确警告**禁止单独 add**，会双挂载；本项目不需要第三方依赖 |
| "CSS 覆盖越深越像" | 深 = 碎。选择器分级纪律见 `DESIGN.md` |
| "自造个 `dsh.compatibility.*` 字段声明兼容范围" | **宿主不读自定义字段**。只有 `peerDependencies["@deepseek-ai/dsh"]` 会被检查 |
| "我的素材路由是内部服务，不需要鉴权" | ⚠️ `ctx.webServer.register()` 注册的路由**不继承**宿主的鉴权与 Host/Origin 栅栏，必须自己调 `ctx.connection.requestRejection(req)` |

---

## 9. 当前阻塞（需要人类输入）

| # | 阻塞项 | 影响的阶段 |
|---|---|---|
| B1 | 品牌素材（logo / 字体 / 纹理） | P1、P3 |
| B2 | 视觉定位（主色 + 强调色 + 风格定义） | P1–P4 |
| B3 | **第二个参考项目名称**（用户只在视频里看过，未给名称） | P5 之前 |
| B4 | 对话动画路线选择（轻量 / 重度） | P5 |
| B8 | 配置文件格式与文件名（YAML vs JSON、`boujoy.config.yml`？） | P0 |
| B9 | 用户自定义目录定名（建议 `$DSH_HOME/boujoy/`） | P0 |

> 阻塞项与待办详见 [`docs/TODO.md`](./docs/TODO.md)。

---

## 10. 🆕 版本适配纪律（因 DSH 迭代极快，单列一节）

**实测数据**：DSH 在 49.6 天内发布 **29 个版本**，平均 **1.77 天一个版本**；
且所有子包的 npm `latest` 停在 `0.0.1-rc.1`（与本体 `0.2.0-rc.2` 严重脱节）。

因此：

| 纪律 | 说明 |
|---|---|
| **兼容范围必须写在 `peerDependencies`** | ⚠️ 只有 `peerDependencies["@deepseek-ai/dsh"]` 会被宿主检查；写进 `dsh.*` 自定义字段、`dependencies`、`engines` **都会被静默忽略** |
| **`dsh.client.inject` 保持空数组** | 生态里绝大多数"最惨故障"（面板静默消失、连锁 pending）根因都是 client 服务依赖；本项目功能不需要任何 client 服务，空数组从结构上消灭这类故障 |
| **只声明验证过的版本** | 不写 `>=0.1.0` 这类宽泛范围；兼容矩阵每行必须对应一次真实验证 |
| **插件版本与 DSH 版本解耦** | 不为 DSH 改个数字就跟发版；只在接缝真的变了才适配 |
| **子包依赖显式指定版本** | 用 `latest` 会装到两个月前的版本 |
| **任何接缝失效都要能降级** | 单点失效不得导致整体崩溃（见下） |
| **升级适配必须更新 `CHANGELOG.md` 的 `Adapted` 段** | 记录适配的 DSH 版本 + 改动的接缝 |

**semver 陷阱（必须记住）**：宿主用 `semver.satisfies(..., { includePrerelease: true })`，
所以 `^0.1.7` **不接受** `0.1.7-rc.1`。预发布区间要写显式 tuple，例如
`>=0.2.0-rc.2 <0.3.0-0`（上界带 `-0` 才能正确排除整个 `0.3.x`）。

**发布节奏硬约束**：DSH 内置 pnpm **默认只安装发布满 24 小时的版本**
（`minimumReleaseAge`）→ 新版本 24 小时内 `dsh plugin update` 装不上**且不报错**（静默停在旧版）。
要立刻用需显式 `add '<pkg>@^<ver>'`。

**版本记录的数据来源**：

| 来源 | 状态 |
|---|---|
| 官方仓库根 `CHANGELOG.md` | ❌ **不存在**（404） |
| GitHub **Releases** | ✅ 权威来源，tag 形如 `dsh-v0.2.0-rc.2`，中英双语 |
| GitHub **Releases Atom feed** | ✅ **推荐**，机器可读（HTML 页面抓不到正文） |
| 官方 `docs/upgrade-guide/<版本>/` | ✅ 逐版本官方迁移指南（比 release notes 权威） |
| 社区 [oh-my-dsh/dsh-plugin-upgrade-skill](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill) | 189 张升级卡，覆盖 `0.1.0-rc.8 → 0.1.7-rc.1`，每卡指向官方 tag 源码 |

> ⚠️ **注意**：官方 release notes **不是破坏性变更台账**——它不含 breaking/迁移章节。
> 要查破坏性变更，看 `docs/upgrade-guide/` 与 tag 源码。
>
> ⚠️ **npm 版本 ≠ GitHub Release 版本**：npm 29 个 vs GitHub 24 个，
> 且有 2 个版本（`0.1.2-alpha.1`、`0.1.3-alpha.1`）**只有 GitHub Release、npm 上没有**。
> 只看 npm 会漏掉变更。

**必须能降级的关键路径**：

| 失效点 | 降级行为 |
|---|---|
| 首帧注入失效 | 退回纯 client 开屏（漏 271ms，功能正常） |
| 素材 404 / 损坏 | 回退内置同名素材；再无则隐藏元素 |
| `data-*` 属性改名 | 该组 CSS 失效，样式局部丢失（不崩） |
| `[data-dsh-boot]` 改名 | 看门狗退化为 12s 绝对超时（不崩） |
| DSH 版本超范围 | **宿主自动跳过整个 bundle 并恢复官方界面**（官方机制，不需要我们写代码） |

> 完整策略见 [`docs/VERSIONING.md`](./docs/VERSIONING.md)。
