/** 同步引擎：拉取 / 推送分离，可单独执行；冲突时远端为权威并另存 .conflict.md */

import { db } from '../db'
import type { GitHubSettings, SyncResult, SyncState } from '../types'
import { deriveTitle } from '../markdown'
import { friendlyGitHubError, GitHubError, getRepo } from '../github/api'
import { parseContent, serializeContent } from './frontmatter'
import {
  createBlob,
  createCommit,
  createTree,
  getBranchRef,
  getCommit,
  getRawFile,
  getTreeRecursive,
  putContent,
  updateBranchRef,
  type TreeItem
} from '../github/git'

/** 首次初始化时写入仓库的说明文件 */
const README_CONTENT = `# 墨辰DarkCube

本仓库由「墨辰DarkCube」应用自动管理，作为云存档。

- \`diary/entries/YYYY/MM/YYYY-MM-DD.md\`：每日一篇 Markdown 日记
- \`diary/entries/**/*.conflict.md\`：同步冲突时自动保留的本地旧内容
`

/** 日记文件路径：diary/entries/YYYY/MM/YYYY-MM-DD.md */
export function entryPath(date: string): string {
  const [y, m] = date.split('-')
  return `diary/entries/${y}/${m}/${date}.md`
}

/** 冲突备份文件路径 */
export function conflictPath(date: string): string {
  const [y, m] = date.split('-')
  return `diary/entries/${y}/${m}/${date}.conflict.md`
}

const FILE_RE = /^diary\/entries\/\d{4}\/\d{2}\/(\d{4}-\d{2}-\d{2})\.md$/

function parseEntryPath(path: string): string | null {
  const m = path.match(FILE_RE)
  return m ? m[1] : null
}

/** 同步失败：携带出错的具体步骤，便于定位 */
export class SyncStepError extends Error {
  step: string

  constructor(step: string, cause: unknown) {
    super(friendlyGitHubError(cause))
    this.name = 'SyncStepError'
    this.step = step
  }
}

/** 给单个 GitHub 调用标注步骤，失败时抛出带上下文的错误 */
async function step<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof GitHubError) throw new SyncStepError(label, e)
    throw e
  }
}

/** 校验配置并解析远端 ref；空仓库自动初始化（写 README + 首个提交 + 默认分支） */
async function resolveBranch(
  settings: GitHubSettings
): Promise<{ branch: string; remoteRefSha: string | null }> {
  const { owner, repo, token, defaultBranch } = settings
  if (!owner || !repo || !token) throw new Error('请先登录 GitHub')
  let branch = defaultBranch || 'main'
  let remoteRefSha: string | null = null

  try {
    const ref = await step('读取分支', () => getBranchRef(token, owner, repo, branch))
    remoteRefSha = ref.sha
  } catch (e) {
    // 404：分支不存在；409 + "empty"：仓库还没有任何提交（GitHub 对空仓库返回 409 Conflict）
    const emptyRepo =
      e instanceof GitHubError && (e.status === 404 || (e.status === 409 && /empty/i.test(e.message)))
    if (!emptyRepo) throw e

    // 配置的分支名可能与仓库实际默认分支不一致：先探测真实默认分支
    const repoInfo = await step('读取仓库信息', () => getRepo(token, owner, repo))
    const actualBranch = repoInfo.default_branch
    // 守卫后已确认存在；闭包内 TS 不保留收窄，用别名固定类型
    const ghToken = token
    const ghOwner = owner
    const ghRepoName = repo

    /** 探测默认分支是否存在；'missing' 表示确实没有分支（空仓库） */
    async function resolveRef(): Promise<'ok' | 'missing' | 'error'> {
      try {
        const ref = await step('探测分支', () => getBranchRef(ghToken, ghOwner, ghRepoName, actualBranch))
        remoteRefSha = ref.sha
        branch = actualBranch
        return 'ok'
      } catch (e2) {
        const missing =
          e2 instanceof GitHubError &&
          (e2.status === 404 || (e2.status === 409 && /empty/i.test(e2.message)))
        return missing ? 'missing' : 'error'
      }
    }

    const probe = await resolveRef()
    if (probe === 'error') throw e
    if (probe === 'missing') {
      // 确实为空仓库：git database 接口全部不可用，必须用 PUT /contents 初始化
      // （一次调用即完成「创建文件 + 首个提交 + 默认分支」）
      try {
        await step('初始化空仓库', () => putContent(token, owner, repo, 'README.md', README_CONTENT, 'init: 墨辰DarkCube'))
      } catch (e2) {
        // 可能刚被其他设备初始化（README 已存在 → 422）：重新确认
        if ((await resolveRef()) !== 'ok') throw e2
      }
      if ((await resolveRef()) !== 'ok') {
        throw new Error('仓库初始化失败，请稍后重试')
      }
    }
  }

  return { branch, remoteRefSha }
}

/** 仅下载：从云端拉取到本地（不推送本地改动） */
export async function pullOnly(
  settings: GitHubSettings,
  prev: SyncState | undefined
): Promise<SyncResult> {
  const { owner, repo, token } = settings
  if (!owner || !repo || !token) throw new Error('请先登录 GitHub')
  const { branch, remoteRefSha } = await resolveBranch(settings)

  let pulled = 0
  let conflicts = 0
  let remoteTreeSha = prev?.remoteTreeSha ?? ''

  // ---- 拉取（远端 ref 有变化时） ----
  const remoteEntries = new Map<string, string>() // date → blob sha
  const needPull = prev?.remoteRefSha !== remoteRefSha
  if (needPull && remoteRefSha) {
    const refSha = remoteRefSha // 闭包内 TS 不保留收窄
    const commit = await step('读取提交', () => getCommit(token, owner, repo, refSha))
    remoteTreeSha = commit.tree.sha
    const tree = await step('读取文件列表', () => getTreeRecursive(token, owner, repo, remoteTreeSha))
    const deletedDates = new Set(prev?.deleted ?? [])

    for (const item of tree) {
      if (item.type !== 'blob' || !item.sha) continue
      const date = parseEntryPath(item.path)
      if (date && !deletedDates.has(date)) remoteEntries.set(date, item.sha)
    }

    for (const [date, remoteSha] of remoteEntries) {
      const local = await db.entries.get(date)
      if (!local) {
        const content = await step('下载日记', () => getRawFile(token, owner, repo, entryPath(date), branch))
        const parsed = parseContent(content)
        await db.entries.put({
          date,
          title: deriveTitle(parsed.body),
          body: parsed.body,
          weather: parsed.weather,
          mood: parsed.mood,
          updatedAt: Date.now(),
          blobSha: remoteSha,
          dirty: false
        })
        pulled++
      } else if (local.blobSha !== remoteSha) {
        const content = await step('下载日记', () => getRawFile(token, owner, repo, entryPath(date), branch))
        const parsed = parseContent(content)
        if (local.dirty) {
          // 两端都改过 → 远端为权威，本地旧内容进冲突备份（稍后随上传推送 .conflict.md）
          await db.conflicts.put({
            date,
            title: local.title,
            body: serializeContent(local.body, { weather: local.weather, mood: local.mood }),
            updatedAt: local.updatedAt,
            synced: false
          })
          conflicts++
        }
        await db.entries.put({
          ...local,
          title: deriveTitle(parsed.body),
          body: parsed.body,
          weather: parsed.weather,
          mood: parsed.mood,
          blobSha: remoteSha,
          dirty: false,
          updatedAt: Date.now()
        })
        pulled++
      }
    }
  }

  // 记录同步状态（保留待删除墓碑，删除尚未推送）
  await db.syncState.put({
    id: 1,
    lastSyncAt: Date.now(),
    remoteRefSha: remoteRefSha ?? '',
    remoteTreeSha,
    deleted: prev?.deleted ?? []
  })

  return { ok: true, pulled, pushed: 0, conflicts }
}

/** 仅上传：将本地改动 / 冲突备份 / 墓碑推送到云端 */
export async function pushOnly(
  settings: GitHubSettings,
  prev: SyncState | undefined
): Promise<SyncResult> {
  const { owner, repo, token } = settings
  if (!owner || !repo || !token) throw new Error('请先登录 GitHub')
  const resolved = await resolveBranch(settings)
  const branch = resolved.branch
  let remoteRefSha: string | null = resolved.remoteRefSha

  let pushed = 0
  let remoteTreeSha = prev?.remoteTreeSha ?? ''

  // 确定 base tree：远端有变化或墓碑存在时，取当前提交的树
  if (remoteRefSha && (prev?.remoteRefSha !== remoteRefSha || !remoteTreeSha || (prev?.deleted?.length ?? 0) > 0)) {
    const refSha = remoteRefSha
    const commit = await step('读取提交', () => getCommit(token, owner, repo, refSha))
    remoteTreeSha = commit.tree.sha
  }

  // 墓碑只推远端确实存在的日记文件（避免删除不存在的路径报错）
  let tombstones = prev?.deleted ?? []
  if (tombstones.length > 0 && remoteRefSha && remoteTreeSha) {
    const tree = await step('读取文件列表', () => getTreeRecursive(token, owner, repo, remoteTreeSha))
    const remoteDates = new Set<string>()
    for (const item of tree) {
      const d = item.type === 'blob' && item.sha ? parseEntryPath(item.path) : null
      if (d) remoteDates.add(d)
    }
    tombstones = tombstones.filter((d) => remoteDates.has(d))
  }

  // ---- 推送（本地改动 / 冲突备份 / 墓碑） ----
  const dirtyEntries = await db.entries.filter((e) => e.dirty || !e.blobSha).toArray()
  const pendingConflicts = await db.conflicts.filter((c) => !c.synced).toArray()

  if (dirtyEntries.length > 0 || pendingConflicts.length > 0 || tombstones.length > 0) {
    if (!remoteRefSha) {
      throw new Error('缺少远端分支引用，无法提交（请重试）')
    }
    const parentSha = remoteRefSha // 闭包内 TS 不保留收窄
    const items: TreeItem[] = []
    const pushedShas = new Map<string, string>()

    for (const e of dirtyEntries) {
      const blob = await step('上传日记', () =>
        createBlob(token, owner, repo, serializeContent(e.body, { weather: e.weather, mood: e.mood }))
      )
      pushedShas.set(e.date, blob.sha)
      items.push({ path: entryPath(e.date), mode: '100644', type: 'blob', sha: blob.sha })
    }
    for (const c of pendingConflicts) {
      const blob = await step('上传冲突备份', () => createBlob(token, owner, repo, c.body))
      items.push({ path: conflictPath(c.date), mode: '100644', type: 'blob', sha: blob.sha })
    }
    for (const d of tombstones) {
      items.push({ path: entryPath(d), mode: '100644', type: 'blob', sha: null })
    }

    const tree = await step('构建提交树', () => createTree(token, owner, repo, remoteTreeSha || null, items))
    const commitMsg = `sync: ${dirtyEntries.length} entries${pendingConflicts.length > 0 ? `, ${pendingConflicts.length} conflicts` : ''}`
    const commit = await step('创建提交', () => createCommit(token, owner, repo, commitMsg, tree.sha, [parentSha]))
    await step('更新分支', () => updateBranchRef(token, owner, repo, branch, commit.sha))

    // 更新本地 blob SHA / 清除 dirty / 标记冲突已上传
    for (const [date, sha] of pushedShas) {
      const e = await db.entries.get(date)
      if (e) await db.entries.update(date, { blobSha: sha, dirty: false })
    }
    for (const c of pendingConflicts) {
      await db.conflicts.update(c.date, { synced: true })
    }
    remoteRefSha = commit.sha
    pushed = dirtyEntries.length + pendingConflicts.length
  }

  // 记录同步状态（墓碑已推送，清空）
  await db.syncState.put({
    id: 1,
    lastSyncAt: Date.now(),
    remoteRefSha: remoteRefSha ?? '',
    remoteTreeSha,
    deleted: []
  })

  return { ok: true, pulled: 0, pushed, conflicts: 0 }
}

/** 完整同步：先下载再上传（自动同步使用） */
export async function syncNow(
  settings: GitHubSettings,
  prev: SyncState | undefined
): Promise<SyncResult> {
  const pulled = await pullOnly(settings, prev)
  const after = await db.syncState.get(1)
  const pushed = await pushOnly(settings, after)
  return { ok: true, pulled: pulled.pulled, pushed: pushed.pushed, conflicts: pulled.conflicts }
}
