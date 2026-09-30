# TODO.md —— 任务、优先级与开发进度

> **这是跨会话续作的唯一真相源。** 切换 AI 或重启会话后，读完 `AGENTS.md` 就来这里看进度，
> 不需要重读全部项目文档。
>
> 最后更新：**规划阶段结束（文档已建立，代码 0 行）**

---

## 🎯 当前进度

```
[■■■■■■■■■■] 调研     ✅ 完成
[■■■■■■■■■■] 计划     ✅ 完成（含框架目标与版本策略）
[          ] P0 环境+配置  ⬜ 未开始
[          ] P1 token       ⬜ 未开始
[          ] P2 开屏        ⬜ 未开始
[          ] P3 氛围        ⬜ 未开始
[          ] P3.5 框架化    ⬜ 未开始（新增：安全模式/示例素材/用户文档）
[          ] P4 C层         ⬜ 未开始
[          ] P5 对话        ⬜ 未开始（被 B3/B4 阻塞）
[          ] P6 回归        ⬜ 未开始
[          ] P7 桌面        ⬜ 未开始（可选）
```

**项目定位已升级**：从"一套主题"变为**"素材与配置驱动的界面自定义框架"**。
新增设计文档：`asset-library.md`（素材库规范）、`features-customization.md`（能力矩阵）、
`VERSIONING.md`（版本与兼容策略）。P0/P1/P2/P3 的任务范围相应扩大。

**下一件该做的事**：P0（隔离环境 + 插件骨架 + 素材路由 + **配置加载与校验**）。

---

## 🚧 阻塞项（需要人类输入）

| # | 阻塞项 | 影响 | 状态 |
|---|---|---|---|
| **B1** | 品牌素材：logo（SVG/透明PNG）、字体（woff2）、纹理/背景图 | P1、P3 | ⏳ 待提供 |
| **B2** | 视觉定位：主色 + 强调色具体色值 + 一句话风格定义 | P1–P4 | ⏳ 待提供 |
| **B3** | **第二个参考项目名称**（用户只在视频里看过，未给名称） | P5 前 | ⏳ 待确认 |
| **B4** | 对话动画路线：轻量（官方 `data-*` + CSS）/ 重度（替换 `conversation.chat.node`） | P5 | ⏳ 待决策 |
| **B5** | 品牌文案：开屏显示的产品名、副标题、版本号 | P2 | ⏳ 待提供 |
| **B6** | 目标端：只做 `web` profile，还是同时上 `desktop` | P7 | ⏳ 待决策 |
| **B7** | 用途：自用 / 分发（决定是否按可发布标准做） | 全程 | ⏳ 待决策 |
| **B8** | 🆕 配置文件格式与文件名确认（YAML vs JSON；`boujoy.config.yml`？） | P0 | ⏳ 待决策 |
| **B9** | 🆕 用户自定义目录定名（建议 `$DSH_HOME/boujoy/`） | P0 | ⏳ 待确认 |
| **B10** | 🆕 槽位清单复核（`docs/asset-library.md` §3 的 **34 项内容级**是否够用） | P0 / P3.5 | ⏳ 待确认 |
| ~~B11~~ | ~~适配 Skill 触发方式~~ → ✅ **已解除：采用自动触发** | P3.5 | ✅ 已定（D18） |

---

## 📋 任务清单

### P0 — 隔离环境 + 插件骨架 + 素材路由 + 配置系统（预估 2–3 天）

- [ ] **T0.1** 在 `C:\Users\Administrator\.dsh\profiles\web` 基础上建立隔离验证流程
  - 验收：`dsh --profile web --no-open --port 0` 能起来，浏览器能看到原生 DSH UI
  - 风险：低。**绝不碰 `desktop` profile**
- [ ] **T0.2** 建立插件包骨架目录结构（`package.json` / `cordis.patch.yml` / `src/index.js` / `src/client/index.jsx`）
- [ ] **T0.3** 实现 host 素材路由（`inject: ['webServer']` + `webServer.register({kind:'prefix'})` + 白名单 Map + `ctx.effect`）
  - 验收：`curl /boujoy/assets/<file>` 返回 200 与正确 content-type；未知路径返回 404
  - 注意：白名单写法，防路径穿越；只暴露已知扩展名
  - 🆕 **必须在 handler 开头调 `ctx.connection.requestRejection(req)`** —— 自定义路由**不继承**宿主鉴权与 Host/Origin 栅栏（见 `AGENTS.md` R10）
- [ ] 🆕 **T0.3b** 素材路由安全自检：路径穿越（`..`）、非法扩展名、超大文件、跨源请求 四项各写一个用例
- [ ] 🆕 **T0.3c** `package.json` 声明 `peerDependencies["@deepseek-ai/dsh"]`（范围取真实验证过的下界）与 `dsh.client.inject: []`
  - 验收：用 `--dump-config` 确认插件层正常；用一个超范围版本验证宿主确实会跳过
- [ ] **T0.4** 装进 `web` profile，验证插件被加载（`dsh --profile web --dump-config` 出现插件层）
- [ ] 🆕 **T0.5 配置系统**：读取 `$DSH_HOME/boujoy/boujoy.config.yml`（不存在则全用默认）
- [ ] 🆕 **T0.6 配置校验**：字段类型/范围/颜色格式校验，错误要**带行号的人话报错**，单项失败不拖垮整体
- [ ] 🆕 **T0.7 默认值合并**：配置与内置默认的深度合并（用户值优先）
- [ ] 🆕 **T0.8 素材解析层**：用户目录优先、缺失回退内置的"逐项覆盖"逻辑
- [ ] 🆕 **T0.9 配置运行时视图**：`GET /boujoy/config.json` 供 client 读取

### P1 — A 层：主题 token（预估 1–2 天）

- [ ] **T1.1** 选定并铺满 `DESIGN.md` §2.2 的 15 个核心 alias token（明暗双份）
- [ ] **T1.2** 扩展覆盖：状态色、`--dsw-specific-*` 区域色
- [ ] 🆕 **T1.3 配置→token 转换链**：`colors.brand` / `colors.tokens` → `overrideTokens` 入参
- [ ] **T1.4** 接入品牌字体（`.woff2` + `@font-face` + 覆盖 font family token）
- [ ] **T1.5** 品牌字标替换：`sidebar.brand.mark` + `sidebar.brand.name`（single slot，替换点）
- [ ] **T1.6** 明暗两套对比度自检（正文 ≥4.5:1）
  - 验收：明/暗/跟随系统三种模式下无白底白字、无低对比文字

### P2 — B 层：开屏动画（预估 1–2 天）⚠️ 最容易做错

- [ ] **T2.1** host 首帧注入：`ctx.on('webserver/index-inject', table => ...)`
  - 只推 `{kind:'style'}` 和 `{kind:'script', placement:'head'}`（**未知 kind 会被 boot gate 拒绝**）
  - 验收：从导航到首帧**不出现** DSH 的 `[data-dsh-boot]` "Loading plugins…" 卡片
- [ ] **T2.2** 首帧看门狗三条退出路径（卡片消失 / 掉 spinner / 绝对超时 12s）
- [ ] **T2.3** client 半边：`shell.overlay` 注册开屏正片（`kind: 'list'`，条目自设 `pointer-events`）
- [ ] **T2.4** 开屏动画本体（CSS keyframes + React 计时器）
- [ ] **T2.5** 退场动画（两段式：内容淡出 → 延迟 → 底幕淡出）
- [ ] **T2.6** **刷新去重**（`sessionStorage`）—— 多数参考项目都没做
- [ ] **T2.7** `prefers-reduced-motion` 降级 + 可跳过/可关闭
- [ ] 🆕 **T2.8 配置驱动**：`motion.splash.duration` / `.skippable` / `.playOncePerSession` 生效

### P3 — B 层：氛围与素材（预估 1–2 天）

- [ ] **T3.1** 背景氛围层（纹理/网格/渐变，读取用户素材）
- [ ] **T3.2** HUD / 装饰元素（角标、状态条等）
- [ ] **T3.3** 常驻循环动画（扫描线/呼吸/漂移等，注意性能与 reduced-motion）
- [ ] 🆕 **T3.4 配置驱动**：`motion.ambience.intensity` / `.enabled` 生效
- [ ] 🆕 **T3.5 素材回退链验证**：删除任一素材，界面不崩、回退内置

### P3.5 — 🆕 框架化收尾（预估 2–3 天）

> ⚠️ **顺序要求**：默认主题（P1–P3）必须先做好。默认主题不成立，框架就没有第一个内容。

- [ ] **T3.5.1 槽位规格定稿**：`docs/asset-library.md` §3 的 10 个槽位 → 生成机器可读 JSON（Agent 与校验器共用）
- [ ] **T3.5.2 `doctor` 校验器**：存在性 / 格式 / 尺寸 / 体积 / 配置语法（含行号）/ 语义，
      以及**"inbox 里未被匹配的文件"**检测
- [ ] 🆕 **T3.5.3 Agent 适配 Skill**：把 `skills/boujoy-theme-setup/SKILL.md` 通过
      **`ctx.skills.register()`** 随插件分发
  - 验收：装插件后对 Agent 说"用 inbox 里的素材给我配一套外观"，能正确匹配并生成配置
  - 注意：需验证插件的 skill 注册落在哪一层、是否对所有会话可见
- [ ] **T3.5.4 `overrides.css` 逃生舱**：注入用户任意 CSS，优先级最高
- [ ] **T3.5.5 示例素材包**：`examples/` 放一套可直接改的素材与配置
- [ ] **T3.5.6 用户文档改写**：叙事从"按模板填素材"改为"丢进 inbox → 让 Agent 配"
- [ ] **T3.5.7 配置错误的人话报错验证**：故意写错配置，确认提示清晰且界面可用
- [ ] 🆕 **T3.5.8 幂等与回滚验证**：连续跑两次适配，确认无重复文件、无水印残留、可回滚

### P4 — C 层：视觉语言（预估 2–3 天）

- [ ] **T4.1** 圆角与 `corner-shape`（注意 `DESIGN.md` §3.1 的配对规则）
- [ ] **T4.2** 阴影与抬升（注意 §3.4 的禁止配对规则）
- [ ] **T4.3** 侧栏 / 会话列 / 输入卡的几何与材质（优先用二级 `data-slot` 选择器）
- [ ] **T4.4** 建立三级选择器收容文件 `overrides.tier3.css`，文件头写验证版本

### P5 — C+ 层：对话动画（预估 2–4 天，被 B3/B4 阻塞）

- [ ] **T5.1** 决策路线（轻量 / 重度）
- [ ] **T5.2** 助手消息入场动画
- [ ] **T5.3** 流式输出节奏动效
- [ ] **T5.4** 工具调用卡片展开/收起缓动
- [ ] **T5.5** ⚠️ **与官方滚动跟随管线共存**：需处理 follow ledger 误判（`gap>25px` 的 scroll 被当读者输入）
  与残留 lag（rAF 打 `translateY` 抵消）
- [ ] 🆕 **T5.6 配置驱动**：`motion.conversation.*` 生效

### P6 — 回归测试（预估 1–2 天）

见 [`development.md`](./development.md) 的回归清单。至少包含：

- [ ] 明/暗/跟随系统三模式
- [ ] 窄窗（980×640）不遮挡输入与侧栏
- [ ] 刷新不重复注入 `<link>`、不双开屏
- [ ] 卸载后完全恢复原生，无 404 素材请求
- [ ] `prefers-reduced-motion` 下无动画
- [ ] 长会话/多 turn 滚动性能

### P7 — 上桌面端（可选，预估 0.5 天）

- [ ] **T7.1** 把同一包注册进 `desktop` profile 的 `dsh.profile.bundles`
- 注意：desktop profile 被 Electron 独占，CLI 不能管；改 `package.json` 后需**重启整个应用**

---

## 📝 决策记录（ADR）

| # | 决策 | 理由 | 状态 |
|---|---|---|---|
| D1 | 主骨架用 `dsh-550c-boot`（MIT）而非 `dsh-endfield-ui` | endfield 的 license API 返回 `null`，无法确认；550c-boot 是唯一解决 271ms 时序问题的项目 | ✅ 已定 |
| D2 | 不依赖 `better-sidebar` / `shikitor` | 参考项目明确警告禁止单独 add（会双挂载）；纯主题不需要 | ✅ 已定 |
| D3 | 开发在 `web` profile，不在 `desktop` | desktop 被 Electron 独占，且是用户生产环境 | ✅ 已定 |
| D4 | 首帧注入用 `webserver/index-inject`，不用 `tapIndex` | `tapIndex` 在桌面端是死代码（走 `dsh-app://` 不调 `renderIndex`） | ✅ 已定 |
| D5 | 动效自带 `--bj-*` 变量 | 官方无动效 token（实测空集） | ✅ 已定 |
| D6 | 对话动画路线 | 待 B4 | ⏳ 待定 |
| **D7** | **项目定位升级为"素材与配置驱动的界面自定义框架"** | 用户明确要求"高度自定义框架插件"；引擎与内容分离能同时解决"素材可替换"与"升级不覆盖用户内容" | ✅ 已定 |
| **D8** | **用户自定义目录用 `$DSH_HOME/boujoy/`** | 已实测 `$DSH_HOME` 下无 `cordis.patch.yml`、无同名冲突；命名空间独立于 DSH | ✅ 已定（待确认目录名） |
| **D9** | **素材采用"逐项同名覆盖"而非"整目录替换"** | 用户只放想改的文件即可，未提供的自动回退内置，降低上手成本 | ✅ 已定 |
| **D10** | **引入安全模式（Safe Mode）** | DSH 平均 1.77 天一个版本且官方声明会有破坏性变更；宁可少效果不能让界面不可用 | ✅ 已定 |
| **D11** | **插件版本与 DSH 版本解耦**，只用兼容矩阵关联 | 追赶每个 rc 不现实；只声明真实验证过的版本，不做宽泛承诺 | ✅ 已定 |
| **D12** | **子包依赖必须显式指定版本** | 实测所有子包 `latest` 停在 `0.0.1-rc.1`，用 `latest` 会装到两个月前的版本 | ✅ 已定 |
| **D13** | **兼容范围用标准 `peerDependencies["@deepseek-ai/dsh"]`** | 起先设计为自造 `dsh.compatibility.*` 字段，**实测/调研证实宿主不读自定义字段**；官方从 `0.1.7-rc.1` 起强制校验 peerDependencies | ✅ 已定（修正过一次） |
| **D14** | **`dsh.client.inject` 保持空数组** | 生态中"面板静默消失/连锁 pending"的根因几乎都是 client 服务依赖；本项目功能不需要任何 client 服务 | ✅ 已定 |
| **D15** | **只用 4 条最窄接缝**：`overrideTokens` / `shell.overlay` / `index-inject` / bundle 机制 | 189 张社区升级卡中，这 4 条在 `0.1.0-rc.8 → 0.1.7-rc.1` 全走廊**零改名记录**；而 slot 名称、settings API、图标导出名都改过 | ✅ 已定 |
| **D16** | **不碰官方 settings 通道，用户配置走自有文件** | 官方 settings API 在 `0.1.7-alpha.1` 整体换代（`ctx.settings.register` 移除、`settingsScope`→`configForms`）；走自有 `$DSH_HOME/boujoy/boujoy.config.yml` 天然免疫 | ✅ 已定 |
| **D17** | **token 接口只能改颜色，其余走自有变量** | 实测 `Theme.listTokens` 只返回 14 个 token 且 `valueType` 全为 `"CSS color"`；圆角/阴影/字体存在但未暴露；官方 spec **拒绝 token 重定义** | ✅ 已定 |
| **D18** | **适配 Skill 采用自动触发** | 用户明确要求"自动触发"；Skill 的 `description` 已写成列举式触发条件，覆盖外观/主题/换肤/logo/配色/字体/背景/开屏/inbox 等话题 | ✅ 已定 |
| **D19** | **槽位清单扩展为 34 项内容级 + 13 项样式级 + 30 项结构级** | 用户要求"把可以自定义的元素组件全部写出来"；分 🟢内容/🟡样式/🔵结构 三级，标注稳定性 | ✅ 已定（待 B10 复核） |
| **D20** | **槽位规格做成单一数据源 `plugin/lib/slots.js`** | Agent 适配依据、`doctor` 校验器、文档 §3 三者共用同一份真相，改一处即全同步 | ✅ 已定 |

---

## 🔄 会话交接备忘

新会话接手时：

1. 读根目录 `AGENTS.md`（协作契约 + 红线）
2. 读本文件的「当前进度」和「阻塞项」
3. 若阻塞项已解除 → 从「任务清单」中第一个未完成的 P 开始
4. 完成后：勾选任务、更新「当前进度」、把产生的决策补进「决策记录」
5. **不要重读所有文档**，按需读 `architecture.md` / `DESIGN.md`
