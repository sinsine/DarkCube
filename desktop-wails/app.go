package main

import "context"

// App 应用结构体（当前仅用于承载运行上下文与生命周期回调）
type App struct {
	ctx context.Context
}

// NewApp 创建应用实例
func NewApp() *App {
	return &App{}
}
