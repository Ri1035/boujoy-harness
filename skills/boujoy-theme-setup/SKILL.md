---
name: boujoy-theme-setup
description: Configure the Boujoy Harness interface theme from a folder of user-supplied assets. Use when the user asks to apply, customize, change, or set up their Boujoy/DSH theme appearance, or drops images/fonts into $DSH_HOME/boujoy/inbox and wants them used. Maps arbitrary asset files to theme slots, generates the config, extracts brand colors, and validates the result.
---

# Boujoy 素材适配

把用户随手收集的素材，适配成 Boujoy Harness 主题的外观配置。

**用户不需要懂任何槽位名或配置语法**——那是你的工作。用户只负责"把文件放进 inbox"。

## 为什么这么做

用户收集的素材文件名通常是随机的（`IMG_2384.png`、`新建文件夹/1.jpg`），
他们也不该知道 `boot/ring.svg` 是干什么的。**判断"这张图该放哪"是模型的活，不是用户的活。**

---

## 工作流程

### ① 定位素材

| 位置 | 说明 |
|---|---|
| `$DSH_HOME/boujoy/inbox/` | **用户的素材收件箱**（主入口） |
| 用户直接给的路径 | 可能是任意目录；扫描其中所有文件 |
| `$DSH_HOME/boujoy/assets/` | 已有产物（**可能含用户手改，默认不要动**） |

`$DSH_HOME` 在 Windows 通常是 `C:\Users\<用户名>\.dsh`。

**递归扫描子目录**——用户很可能把素材分散在几个文件夹里。

### ② 逐个文件取证

对每个候选文件收集这些信息（**用工具看，不要靠文件名猜**）：

| 信息 | 用途 |
|---|---|
| 文件类型（MIME / 扩展名） | 图片 / 矢量 / 字体 |
| 像素尺寸 | 小方图 → 图标类；大图 → 背景类 |
| **是否有透明通道（alpha）** | **最强信号**：有 alpha → logo/图标/开屏元素；无 → 背景 |
| SVG 是否含文字（`<text>` 或字形路径） | 含文字 → 横向字标；纯图形 → 图标 |
| 文件体积 | 背景图超 500KB 要提示 |
| 平均色 / 主色 | 用于提取 `colors.brand` |

可用 `read_image` 直接看图片内容——**内容判断优先于一切元数据**。

### ③ 匹配到槽位

按下表匹配。**这张表是适配的唯一依据。**

| 槽位 ID | 用途 | 必需 | 偏好格式 | 建议尺寸 | 判断线索 |
|---|---|---|---|---|---|
| `logo` | 侧栏字标 + 开屏品牌 | ✅ | SVG | 宽高比 ≈4:1 | 横向、含产品名文字 |
| `logoMark` | 侧栏折叠态图标 | ❌ | SVG | 正方形 | 只有图形符号、无文字 |
| `favicon` | 浏览器标签图标 | ❌ | PNG | 32/64 正方形 | 极小方图 |
| `fontBrand` | 标题/品牌字体 | ❌ | **WOFF2** | — | 字体文件 |
| `fontText` | 正文字体 | ❌ | **WOFF2** | — | 字体文件 |
| `textureBackground` | 背景氛围图 | ❌ | PNG/JPG | ≤1920×1080、≤500KB | 大尺寸、**无 alpha**、构图完整 |
| `textureGrid` | 网格纹理（平铺） | ❌ | SVG | 约 64×64 tile | **无背景色的线框图案** |
| `textureNoise` | 噪点叠加 | ❌ | PNG | 128×128 可平铺 | 细密颗粒、低对比 |
| `bootCenter` | 开屏中心图 | ❌ | PNG/SVG | ≤800px、透明底 | 主体居中、**有 alpha** |
| `bootRing` | 开屏环形装饰 | ❌ | SVG | 正方形居中 | 圆环/齿轮/仪表类，将用于旋转 |

**判断优先级**：

1. **看内容**（`read_image`）—— 最可靠
2. **透明通道** —— 极强信号
3. **尺寸与长宽比**
4. **SVG 是否含文字**
5. ⚠️ **文件名最不可靠**，只作最后参考

### ④ 处理不确定项

- **置信度低 → 问用户**，给候选 + 理由，让他一句话确认
  > 例：「`x2.png` 看起来是方形图形标识（无文字、有透明通道），我倾向放到 `logoMark`。
  > 但它也可能是开屏中心图。你要哪个？」
- **完全无法匹配 → 明确报告**，不要硬塞
  > 例：「`chart.png` 看起来是数据图表截图，和外观槽位无关，我没有使用它。」
- **多个文件竞争同一槽位 → 问用户选一个**，不要自己挑

### ⑤ 生成产物

1. **复制**（不要移动）文件到 `assets/<槽位路径>`；必要时转扩展名
2. 生成/更新 `$DSH_HOME/boujoy/boujoy.config.yml`
3. 从 logo 与素材配色提取 `colors.brand` / `colors.accent`

**产物路径约定**：

```
assets/logo.svg
assets/logo-mark.svg
assets/favicon.png
assets/fonts/brand.woff2
assets/fonts/text.woff2
assets/textures/background.png
assets/textures/grid.svg
assets/textures/noise.png
assets/boot/center.png
assets/boot/ring.svg
```

**配置模板**（只写实际配置了的项，其余留空走内置默认）：

```yaml
version: 1
name: "<从 logo 文字识别，或问用户>"
subtitle: "<拟一个符合风格的短句>"

colors:
  brand: "#xxxxxx"        # 从 logo 主色提取
  accent: "#xxxxxx"       # 可选

motion:
  splash:       { enabled: true, duration: 3.0, skippable: true, playOncePerSession: true }
  conversation: { enabled: true, messageEnter: 240, toolCardEase: 160 }
  ambience:     { enabled: true, intensity: 0.6 }

assets:
  logo: "assets/logo.svg"
  # …只列出实际配置的槽位
```

### ⑥ 校验

适配完必须让插件复核，不要凭感觉说"配好了"：

1. 确认配置里引用的每个文件**真实存在**
2. 确认字体**都是 woff2**（非 woff2 见下节处理）
3. 确认尺寸/体积没超标
4. **检查 inbox 里是否还有未被匹配的文件**——要向用户说明它们为什么没用上
5. 若有 `doctor` 类能力，运行它并复述结果

### ⑦ 报告

给用户的报告要包含：

- ✅ **配了什么**（槽位 ← 源文件）
- ⬜ **留空了哪些**（会使用内置默认）
- ❓ **需要用户决定的**（低置信项、竞争槽位）
- ⚠️ **没被使用的文件及原因**
- 🔧 **格式问题**（如字体需转换）

---

## 硬性要求

| # | 要求 |
|---|---|
| 1 | **幂等**：重复运行不得产生重复文件或冲突。比对内容哈希后再决定是否覆盖 |
| 2 | **可回滚**：改动前备份既有 `assets/` 与配置（或写入 `.history/`） |
| 3 | **不覆盖用户手改**：某槽位已由用户显式指定时，默认跳过并在报告里说明 |
| 4 | **不改 `inbox/`**：那是用户的原始素材，只读 |
| 5 | **不伪造素材**：没有就不配，**绝不要生成占位图冒充** |
| 6 | **复制而非移动**：保留用户原文件在 inbox |
| 7 | **不硬塞**：匹配不上就如实报告 |

---

## 格式问题的处理

| 情况 | 处理 |
|---|---|
| 字体是 `.ttf` / `.otf` | **引擎只支持 woff2**。①提示用户；②若环境有转换工具则转换后写入；③否则不配该字体、使用官方字体，并在报告里说明 |
| SVG 写死了 `width`/`height` | 会无法自适应。可自动改写为仅保留 `viewBox` |
| 背景图过大（>500KB） | 提示用户；或尝试压缩后写入（原文件保留在 inbox） |
| 图片是 `.webp` | 可用；但 `favicon` 建议转 PNG |
| 文件损坏 / 无法识别 | 跳过并报告，不要中止整个流程 |

---

## 边界：什么时候不要做

- **用户只是问"这插件怎么用"** → 回答即可，不要擅自改他的素材
- **用户没提供任何素材，且 inbox 为空** → 告诉他插件默认外观已经可用，
  想自定义就把素材丢进 `$DSH_HOME/boujoy/inbox/`
- **素材涉及版权不明** → 提醒用户自行确认授权（尤其商用/分发场景）
- **用户手改过配置** → 先读现有配置，在其基础上增补，不要整体重写

---

## 参考

- 完整槽位规格与设计依据：仓库 `docs/asset-library.md`
- 项目的版本与兼容纪律：仓库 `docs/VERSIONING.md`
