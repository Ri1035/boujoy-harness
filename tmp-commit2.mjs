import { execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const cwd = 'C:\\Users\\Administrator\\Desktop\\DSH'
const git = (args, opts = {}) => execFileSync('git', args, { cwd, encoding: 'utf8', ...opts }).trim()

try {
  git(['add', '-A'])
  const staged = git(['diff', '--cached', '--name-only'])
  console.log('=== 暂存文件 ===')
  console.log(staged || '(none)')

  // 安全扫描：确认没有凭据混入
  const diff = git(['diff', '--cached'])
  const leak = /ghp_[A-Za-z0-9]{20,}/.test(diff)
  console.log('LEAK_CHECK=' + (leak ? 'FOUND_TOKEN' : 'clean'))
  if (leak) { console.log('中止：提交内容中发现 token 字面量'); process.exit(30) }

  const msg = `docs: 定位升级为界面自定义框架 + 版本适配策略

项目定位从"一套主题"升级为"素材与配置驱动的界面自定义框架"。

新增文档：
- docs/asset-library.md          素材库与自定义配置规范
  - 双目录优先级模型（$DSH_HOME/boujoy/ 逐项覆盖内置 assets/）
  - 配置文件完整字段草案（配色/动效/字体/素材/高级）
  - 素材替换清单与规格要求、校验规则、失败降级、安全模式
- docs/features-customization.md 高度自定义能力说明（12 项能力，11 项零代码）
- docs/VERSIONING.md             版本管理、兼容策略与变更日志规范
- CHANGELOG.md                   变更日志

更新文档：
- AGENTS.md        新增 §1.1 项目定位、§10 版本适配纪律；必读顺序纳入新文档
- docs/TODO.md     新增 B8/B9 阻塞项、ADR D7-D12；P0/P1/P2/P3 任务扩容，
                   新增 P3.5 框架化收尾（安全模式/示例素材/用户文档）
- docs/project-overview.md  新增 §3.0 框架能力验收条目（G0.1-G0.8）
- docs/architecture.md      新增配置与素材解析层（§4.0）、双目录架构图、目录结构规划
- docs/user-guide.md        新增 §6 自定义外观（素材/配色/动效/逃生舱/降级/安全模式）
- README.md                 重写定位、文档导航、版本节奏警示

实测数据（npm registry，2026-09-30）：
- DSH 49.6 天内发布 29 个版本，平均 1.77 天一个版本
- 所有子包 latest 停在 0.0.1-rc.1，与本体 0.2.0-rc.2 严重脱节
- 许可自 0.1.0-rc.2 起由 BSD-3-Clause 改为 MIT
`
  const msgFile = join(tmpdir(), 'boujoy-commit-2.txt')
  writeFileSync(msgFile, msg, { encoding: 'utf8' })  // 无 BOM
  git(['commit', '-F', msgFile])
  unlinkSync(msgFile)

  console.log('')
  console.log('COMMIT=' + git(['rev-parse', '--short', 'HEAD']))
  console.log('SUBJECT=' + git(['log', '-1', '--format=%s']))
} catch (e) {
  console.log('ERROR: ' + e.message)
  if (e.stdout) console.log(e.stdout)
  if (e.stderr) console.log(e.stderr)
  process.exit(1)
}
