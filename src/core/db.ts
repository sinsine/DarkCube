import Dexie, { type Table } from 'dexie'
import type { ConflictRecord, DiaryEntry, GitHubSettings, SyncState } from './types'

class DarkCubeDB extends Dexie {
  entries!: Table<DiaryEntry, string>
  settings!: Table<GitHubSettings, number>
  syncState!: Table<SyncState, number>
  conflicts!: Table<ConflictRecord, string>

  constructor() {
    super('darkcube-diary')
    this.version(1).stores({
      entries: 'date, updatedAt',
      settings: 'id',
      syncState: 'id'
    })
    this.version(2).stores({
      conflicts: 'date, synced'
    })
  }
}

export const db = new DarkCubeDB()

/** 读取 GitHub 配置（无则返回 undefined） */
export async function loadSettings(): Promise<GitHubSettings | undefined> {
  return db.settings.get(1)
}

/** 保存 GitHub 配置 */
export async function saveSettings(s: GitHubSettings): Promise<void> {
  await db.settings.put({ ...s, id: 1 })
}
