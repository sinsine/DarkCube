package main

import (
	"context"
	"os"
	"path/filepath"
)

// App 应用结构体：承载运行上下文，并向界面暴露必要的本地能力
type App struct {
	ctx context.Context
}

// NewApp 创建应用实例
func NewApp() *App {
	return &App{}
}

// startup 保存运行上下文
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// legacyDataDirs 旧版本本地数据目录（IndexedDB 存储位置）。
// 两个外壳的 origin 与目录都不同，无法直接读取，只能引导用户导出/导入迁移。
func legacyDataDirs() []string {
	appData := os.Getenv("APPDATA")
	if appData == "" {
		return nil
	}
	return []string{
		// 1.4.x 及更早的 Electron 版（file:// origin）
		filepath.Join(appData, "darkcube-diary", "IndexedDB", "file__0.indexeddb.leveldb"),
		// 1.5.0 轻量版（当时 exe 名为 墨辰DarkCube-Lite.exe）
		filepath.Join(appData, "墨辰DarkCube-Lite.exe", "EBWebView", "Default", "IndexedDB", "http_wails.localhost_0.indexeddb.leveldb"),
	}
}

// LegacyDataInfo 返回检测到的旧版本数据目录；未检测到则返回空字符串。
// 供界面在首次启动且本地无日记时提示用户迁移。
func (a *App) LegacyDataInfo() string {
	for _, dir := range legacyDataDirs() {
		st, err := os.Stat(dir)
		if err != nil || !st.IsDir() {
			continue
		}
		entries, err := os.ReadDir(dir)
		if err == nil && len(entries) > 0 {
			return dir
		}
	}
	return ""
}
