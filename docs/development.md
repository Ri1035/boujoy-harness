# development.md —— 开发方式、执行命令与回归测试清单

> 目标读者：动手写代码的人或 AI。命令均可直接复制执行。
>
> 证据等级：**【实测】**= 本机验证过；**【引用】**= 官方文档/参考项目说法。

---

## 1. 环境准备

### 1.1 工具链位置【实测】

本机**没有全局 `node` / `pnpm`**，必须用 DSH 自带的：

| 工具 | 路径 |
|---|---|
| Node | `D:\soft\DSH\resources\runtime\primary-runtime\dependencies\node\bin\node.exe` |
| pnpm | `D:\soft\DSH\resources\runtime\primary-runtime\dependencies\pnpm\bin\pnpm.cjs`（用上面的 node 执行） |
| dsh CLI | `D:\soft\DSH\resources\runtime\cli\bin\dsh.cmd` |

**临时把工具链接进 PATH**（每个新终端都要做一次）：

```powershell
$node = "D:\soft\DSH\resources\runtime\primary-runtime\dependencies\node"
$env:PATH = "$node\bin;$env:PATH"
node -v          # 期望 24.x
```

> ⚠️ 不要假设 `node` 可用；先 `Get-Command node` 确认。

### 1.2 关键路径

```powershell
$DSH_HOME   = "C:\Users\Administrator\.dsh"
$WEB_PROFILE = "$DSH_HOME\profiles\web"        # 开发沙盒
$DESKTOP_PROFILE = "$DSH_HOME\profiles\desktop" # ⛔ 不要在这上面做实验
```

---

## 2. 开发工作流

### 2.1 环境隔离（最重要的一条）

**所有实验都在 `web` profile 上做，绝不碰 `desktop`。**

```powershell
# 启动一个隔离的开发实例（随机端口，不自动开浏览器）
& "D:\soft\DSH\resources\runtime\cli\bin\dsh.cmd" --profile web --no-open --port 0
```

- `--port 0` 让系统分配空闲端口，避免和正在运行的桌面实例（`127.0.0.1:19387`）冲突
- `--no-open` 不自动打开浏览器
- 启动后从输出里找到实际 URL，手动在浏览器打开

### 2.2 安装/卸载插件

```powershell
# 安装（本地目录方式，适合开发期）
& $dsh plugin --profile web add "C:\Users\Administrator\Desktop\DSH\plugin"

# 卸载
& $dsh plugin --profile web remove <包名>
```

> 【引用：官方 publish.md】`dsh plugin` 在 profile 目录内转发给 pnpm，
> 并把声明了 `dsh.bundle.patch` 的依赖追加进 `dsh.profile.bundles`。

### 2.3 离线检查组合树（不启动服务）

```powershell
& $dsh --profile web --dump-config
```

期望输出中出现类似 `# == <包名>` 的层标记。
**这一步能在不启动服务的情况下确认插件层被正确组合进去。**

> ⚠️ `--profile desktop --dump-config` 会被拒绝：
> `profile "desktop" is managed exclusively by the Electron application`

### 2.4 生效方式

| 改动类型 | 生效方式 |
|---|---|
| `cordis.patch.yml` 的内容 | 运行中会被事务性重读（HMR） |
| `client.js` 内容变化 | client HMR 重建链（**前提：插件已在名册中**） |
| **新增/删除插件包、改 `package.json` 的 client 声明** | **必须重启进程**（清单与负结论在进程内缓存） |

---

## 3. 调试手段

### 3.1 用 inspect 查运行时（首选）

| 目的 | 调用 |
|---|---|
| 看实时 slot 树与占用者 | `cordis_inspect_query` client / Slots / `listSubTree` |
| 看主题 token | client / Theme / `listTokens` |
| 看事件契约 | host 或 client / Event / `listEvents` |
| 看服务方法签名 | host 或 client / Service / `listService` |
| 看 loader 行与 bundle | `plugin_manager` `list_plugins` / `list_bundles` |

> ⚠️ **client 侧查询需要有一个活动页面响应**。若超时，先在 GUI 里刷新一次页面。

### 3.2 浏览器侧调试

- 打开开发者工具看 Console 报错
- 检查 `<head>` 里是否有我们注入的 `<style>` / `<link>`，以及**是否重复**
- 检查 `document.body` 上的自定义属性是否在卸载后残留
- 检查 `window.__DSH_BOOT__` 名册里是否有我们的插件条目

### 3.3 验证首帧（开屏专用）

```js
// 在页面加载最早的时机执行，检查 DSH 开机卡片是否被覆盖
document.querySelector('[data-dsh-boot]')
```

验收：**从导航到首帧，不应看到 "Loading plugins…" 卡片**。

---

## 4. ⭐ 回归测试清单

每次发布前**必须**全部通过。建议按此表逐项勾选并记录实际结果。

### 4.1 外观正确性

- [ ] **明色模式**：文本可读，无白底白字、无白底浅灰字
- [ ] **暗色模式**：同上
- [ ] **跟随系统**：切换系统明暗时正确跟随
- [ ] 主色/强调色在两种模式下都符合设计稿
- [ ] 品牌字标在展开侧栏与折叠状态下都正常
- [ ] 字体正确加载（无 FOUT 闪烁或回退字体暴露）
- [ ] 代码块、markdown、diff 配色正常
- [ ] 菜单、弹窗、Tooltip 材质正常

### 4.2 开屏动画

- [ ] **不出现** DSH 的 "Loading plugins…" 卡片
- [ ] 片头完整播放，退场动画正常
- [ ] **刷新页面不重复播放**（`sessionStorage` 去重生效）
- [ ] **切换会话不重复播放**
- [ ] 加载失败时有合理降级（不无限黑屏）
- [ ] 绝对超时路径有效（人为阻塞时应能退出）
- [ ] 「跳过」/关闭开关有效

### 4.3 对话动画

- [ ] 助手消息入场动画正常
- [ ] 流式输出时动效不卡顿
- [ ] 工具卡片展开/收起正常
- [ ] **流式输出时滚动跟随不乱跳**（⚠️ 最容易出问题的一项）
- [ ] 历史会话回看时动画行为合理（不建议对历史消息重放动画）

### 4.4 布局与窗口

- [ ] 窄窗 `980×640` 下输入框、侧栏、按钮不被遮挡
- [ ] 宽屏下右栏与对话列不重叠
- [ ] 侧栏折叠/展开正常
- [ ] 窗口缩放时无错位

### 4.5 生命周期

- [ ] **卸载后完全恢复原生外观**
- [ ] 卸载后无残留 `<link>` / `<style>`
- [ ] 卸载后无 404 素材请求
- [ ] 卸载后 `body` 上的自定义属性已清除
- [ ] 重新安装可重复成功
- [ ] 升级后功能正常

### 4.6 无障碍

- [ ] `prefers-reduced-motion: reduce` 下动画降级或跳过
- [ ] 键盘焦点始终可见
- [ ] 装饰性元素有 `aria-hidden="true"`
- [ ] Tab 顺序未被破坏
- [ ] 正文对比度 ≥ 4.5:1，大字 ≥ 3:1

### 4.7 性能

- [ ] 长会话（多 turn）滚动流畅
- [ ] 常驻循环动画不明显占用 CPU
- [ ] 页面加载时间无明显恶化

---

## 5. 发布检查（若对外分发）

- [ ] 素材授权逐一确认（logo / 字体 / 纹理）
- [ ] 字体已转 `.woff2` 并附授权文件
- [ ] README 标注"非官方主题，与 DeepSeek 官方无关联"（若适用）
- [ ] 声明兼容的 DSH 版本范围（**不要写宽泛的兼容声明**）
- [ ] 在**隔离的 `DSH_HOME`** 上做过干净安装测试
- [ ] `npm pack --dry-run` 确认打包内容完整且无多余文件
- [ ] 版本号与 git tag 一致
- [ ] 提供 SHA-256 校验值

### 5.1 隔离安装测试【引用：参考项目做法】

```powershell
$testHome = Join-Path $env:TEMP ("dsh-test-" + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Force -Path $testHome | Out-Null
$env:DSH_HOME = $testHome
# 在该隔离 HOME 下安装并启动，验证：
#   1. profiles/web/package.json 出现插件依赖
#   2. dsh.profile.bundles 出现插件名
#   3. 启动命令不含 --patch
#   4. /boujoy/* 素材路由返回 200
#   5. 页面出现开屏与主题
#   6. 刷新不重复注入
#   7. 卸载后恢复原生
```

---

## 6. 常见开发陷阱

| 陷阱 | 说明 |
|---|---|
| 用错 Node | 本机无全局 node，必须用 DSH 内置的 |
| 在 `desktop` profile 上实验 | CLI 会拒绝，且影响用户生产环境 |
| 改 `package.json` 后不重启 | 插件清单在进程内缓存，不重启不生效 |
| client inspect 超时 | 需要活动页面；让用户刷新 GUI |
| 以为 `--dump-config` 对所有 profile 可用 | `desktop` 被独占，会被拒 |
| patch 写成深合并假设 | **整行替换**，覆盖官方行要重述全部 key |
| 忘记 `ctx.effect` 包裹路由注册 | HMR 后会重复注册/残留 |
| 注入 `<link>` 不写去重 | 刷新后重复注入，出现双开屏 |
| 用 `tapIndex` | 桌面端死代码，改走 `webserver/index-inject` |
| 注入自定义 `kind` | 白名单校验会拒绝，可能进崩溃恢复页 |

---

## 7. 参考项目位置

调研资料与参考项目源码摘录在仓库 `research/` 目录：

| 文件 | 内容 |
|---|---|
| `research/PLAN.md` | 实施计划书（分层路线、分期、风险登记册） |
| `research/REPORT.md` | 生态调研报告（15+ 项目、动画实现代码片段、API 边界） |
| `research/_dsh_pkgs/` | 官方 npm 包解包（slot 目录、token、类型定义） |
| `research/<项目名>/` | 参考项目的源码摘录（**只读参考，注意 license**） |

> ⚠️ `dsh-endfield-ui` 的 GitHub API 返回 `license: null`，
> 其代码**只读不抄**（见 `AGENTS.md` 红线 R4）。
