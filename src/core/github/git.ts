/** Git Data API：用纯 HTTP 完成「git push / pull」所需的底层操作 */

import { ghApiFetch } from './api'

export interface GhRef {
  ref: string
  sha: string
}

export interface GhTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree' | 'commit'
  sha: string | null
  size?: number
}

export interface TreeItem {
  path: string
  mode: '100644'
  type: 'blob'
  /** 置 null 表示删除该文件 */
  sha: string | null
}

export async function getBranchRef(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<GhRef> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branch)}`,
    token
  )
  return (await res.json()) as GhRef
}

export async function getCommit(
  token: string,
  owner: string,
  repo: string,
  sha: string
): Promise<{ tree: { sha: string } }> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits/${sha}`,
    token
  )
  return (await res.json()) as { tree: { sha: string } }
}

export async function getTreeRecursive(
  token: string,
  owner: string,
  repo: string,
  treeSha: string
): Promise<GhTreeItem[]> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${treeSha}?recursive=1`,
    token
  )
  const j = (await res.json()) as { tree?: GhTreeItem[] }
  return j.tree ?? []
}

export async function getRawFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    token,
    { headers: { Accept: 'application/vnd.github.raw' } }
  )
  return res.text()
}

export async function createBlob(
  token: string,
  owner: string,
  repo: string,
  content: string
): Promise<{ sha: string }> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ content, encoding: 'utf-8' })
    }
  )
  return (await res.json()) as { sha: string }
}

export async function createTree(
  token: string,
  owner: string,
  repo: string,
  baseTree: string | null,
  items: TreeItem[]
): Promise<{ sha: string }> {
  const body: { tree: TreeItem[]; base_tree?: string } = { tree: items }
  if (baseTree) body.base_tree = baseTree
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(body)
    }
  )
  return (await res.json()) as { sha: string }
}

export async function createCommit(
  token: string,
  owner: string,
  repo: string,
  message: string,
  tree: string,
  parents: string[]
): Promise<{ sha: string }> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ message, tree, parents })
    }
  )
  return (await res.json()) as { sha: string }
}

export async function createRef(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  sha: string
): Promise<void> {
  await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha })
    }
  )
}

export async function updateBranchRef(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  sha: string
): Promise<void> {
  await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs/heads/${encodeURIComponent(branch)}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({ sha, force: false })
    }
  )
}
