/** 同步引擎：拉取远端 → 比对 → 推送本地，冲突时远端为权威并另存 .conflict.md */

import { db } from '../db'
import type { GitHubSettings, SyncResult, SyncState } from '../types'
import { deriveTitle } from '../markdown'
import { GitHubError, getRepo } from '../github/api'
import {
  createBlob,
  createCommit,
  createRef,
  createTree,
  getBranchRef,
  getCommit,
  getRawFile,
  getTreeRecursive,
  updateBranchRef,
  type TreeItem
} from '../github/git'

/** 首次初始化时写入仓库的说明文件 */
const README_CONTENT = `# 墨辰日记

本仓库由「墨辰日记」应用自动管理，作为云存档。

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

/** 执行一次完整同步。成功返回结果对象，失败抛出错误（由调用方转成用户提示） */
export async function syncNow(
  settings: GitHubSettings,
  prev: SyncState | undefined
): Promise<SyncResult> {
  const { owner, repo, token, defaultBranch } = settings
  if (!owner || !repo || !token) throw new Error('请先登录 GitHub')
  const branch = defaultBranch || 'main'

  // ---- 1. 远端 ref ----
  let remoteRefSha: string | null = null
  let needInitRef = false
  try {
    const ref = await getBranchRef(token, owner, repo, branch)
    remoteRefSha = ref.sha
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) {
      // 仓库还没有任何提交（新建的空仓库）→ 确认仓库存在后走首次初始化
      await getRepo(token, owner, repo)
      needInitRef = true
    } else {
      throw e
    }
  }

  let pulled = 0
  let pushed = 0
  let conflicts = 0
  let remoteTreeSha = prev?.remoteTreeSha ?? ''

  // ---- 2. 拉取（远端 ref 有变化时） ----
  const remoteEntries = new Map<string, string>() // date → blob sha
  const needPull = !needInitRef && prev?.remoteRefSha !== remoteRefSha
  if (needPull && remoteRefSha) {
    const commit = await getCommit(token, owner, repo, remoteRefSha)
    remoteTreeSha = commit.tree.sha
    const tree = await getTreeRecursive(token, owner, repo, remoteTreeSha)
    const deletedDates = new Set(prev?.deleted ?? [])

    for (const item of tree) {
      if (item.type !== 'blob' || !item.sha) continue
      const date = parseEntryPath(item.path)
      if (date && !deletedDates.has(date)) remoteEntries.set(date, item.sha)
    }

    for (const [date, remoteSha] of remoteEntries) {
      const local = await db.entries.get(date)
      if (!local) {
        const content = await getRawFile(token, owner, repo, entryPath(date), branch)
        await db.entries.put({
          date,
          title: deriveTitle(content),
          body: content,
          updatedAt: Date.now(),
          blobSha: remoteSha,
          dirty: false
        })
        pulled++
      } else if (local.blobSha !== remoteSha) {
        const content = await getRawFile(token, owner, repo, entryPath(date), branch)
        if (local.dirty) {
          // 两端都改过 → 远端为权威，本地旧内容进冲突备份（稍后上传 .conflict.md）
          await db.conflicts.put({
            date,
            title: local.title,
            body: local.body,
            updatedAt: local.updatedAt,
            synced: false
          })
          conflicts++
        }
        await db.entries.put({
          ...local,
          title: deriveTitle(content),
          body: content,
          blobSha: remoteSha,
          dirty: false,
          updatedAt: Date.now()
        })
        pulled++
      }
    }
  }

  // ---- 3. 推送（本地改动 / 冲突备份 / 墓碑 / 首次初始化） ----
  const dirtyEntries = await db.entries.filter((e) => e.dirty || !e.blobSha).toArray()
  const pendingConflicts = await db.conflicts.filter((c) => !c.synced).toArray()
  const tombstones = needPull
    ? (prev?.deleted ?? []).filter((d) => remoteEntries.has(d))
    : (prev?.deleted ?? [])

  if (
    needInitRef ||
    dirtyEntries.length > 0 ||
    pendingConflicts.length > 0 ||
    tombstones.length > 0
  ) {
    const items: TreeItem[] = []
    const pushedShas = new Map<string, string>()

    if (needInitRef) {
      // 空仓库首次初始化：先写入 README，保证分支上有内容
      const readme = await createBlob(token, owner, repo, README_CONTENT)
      items.push({ path: 'README.md', mode: '100644', type: 'blob', sha: readme.sha })
    }
    for (const e of dirtyEntries) {
      const blob = await createBlob(token, owner, repo, e.body)
      pushedShas.set(e.date, blob.sha)
      items.push({ path: entryPath(e.date), mode: '100644', type: 'blob', sha: blob.sha })
    }
    for (const c of pendingConflicts) {
      const blob = await createBlob(token, owner, repo, c.body)
      items.push({ path: conflictPath(c.date), mode: '100644', type: 'blob', sha: blob.sha })
    }
    for (const d of tombstones) {
      items.push({ path: entryPath(d), mode: '100644', type: 'blob', sha: null })
    }

    const tree = await createTree(token, owner, repo, remoteTreeSha || null, items)
    const commitMsg = `sync: ${dirtyEntries.length} entries${pendingConflicts.length > 0 ? `, ${pendingConflicts.length} conflicts` : ''}`
    const commit = await createCommit(token, owner, repo, commitMsg, tree.sha, needInitRef ? [] : [remoteRefSha!])
    if (needInitRef) {
      await createRef(token, owner, repo, branch, commit.sha)
    } else {
      await updateBranchRef(token, owner, repo, branch, commit.sha)
    }

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

  // ---- 4. 记录同步状态 ----
  await db.syncState.put({
    id: 1,
    lastSyncAt: Date.now(),
    remoteRefSha: remoteRefSha ?? '',
    remoteTreeSha,
    deleted: []
  })

  return { ok: true, pulled, pushed, conflicts }
}
