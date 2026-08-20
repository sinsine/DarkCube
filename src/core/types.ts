/** 视图标识 */
export type ViewId = 'calendar' | 'editor' | 'timeline' | 'settings'

/** 一篇日记：以日期为键，一天一篇 */
export interface DiaryEntry {
  /** YYYY-MM-DD */
  date: string
  title: string
  body: string
  updatedAt: number
  /** 最近一次与远端比对的 blob SHA（同步用） */
  blobSha?: string
  /** 本地有未推送改动 */
  dirty?: boolean
  /** 天气（随正文同步：以 front matter 嵌入仓库文件） */
  weather?: string
  /** 心情（随正文同步：以 front matter 嵌入仓库文件） */
  mood?: string
}

/** 冲突备份：同步时本地被远端覆盖的旧内容，另存为仓库 .conflict.md */
export interface ConflictRecord {
  /** 原日记日期 YYYY-MM-DD */
  date: string
  title: string
  body: string
  updatedAt: number
  /** 已上传到仓库 */
  synced?: boolean
}

/** GitHub 连接配置（单例 id=1） */
export interface GitHubSettings {
  id: number
  /** 仓库所有者（用户名或组织） */
  owner?: string
  /** 仓库名 */
  repo?: string
  /** 细粒度 Personal Access Token */
  token?: string
  /** 验证通过后记录的 GitHub 登录名，用于界面展示 */
  userLogin?: string
  /** 头像地址（验证时取回） */
  userAvatar?: string
  /** 仓库默认分支 */
  defaultBranch?: string
  /** 自动同步开关 */
  autoSync: boolean
}

/** 同步状态（单例 id=1） */
export interface SyncState {
  id: number
  lastSyncAt?: number
  remoteRefSha?: string
  remoteTreeSha?: string
  /** 本地已删除、待推送删除到远端的日期（墓碑） */
  deleted?: string[]
}

export interface SyncResult {
  ok: boolean
  pulled: number
  pushed: number
  conflicts: number
  message?: string
}
