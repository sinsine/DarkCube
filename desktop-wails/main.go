// 墨辰DarkCube · 轻量桌面壳（Wails + 系统 WebView2）
//
// 与 Electron 版共用同一份前端构建产物（frontend/dist），
// 但不打包 Chromium：产物体积约 12MB（Electron 约 100MB）。
//
// 注意：两个壳的 IndexedDB origin 不同（Electron 为 file__0，本壳为 http_wails.localhost_0），
// 因此本地数据不互通，迁移请使用应用内的「数据 → 导出备份 / 导入备份」。
package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

// 在页面脚本执行前注入：把 window.open 与 target="_blank" 链接交给系统浏览器，
// 避免在应用内弹出新窗口（同时阻断应用内导航到外部页面）。
const externalLinkBridge = `
(function () {
  var openInBrowser = function (url) {
    try {
      if (url && window.runtime && window.runtime.BrowserOpenURL) {
        window.runtime.BrowserOpenURL(String(url));
      }
    } catch (e) {}
  };
  var nativeOpen = window.open;
  window.open = function (url) {
    if (url) {
      openInBrowser(url);
      return null;
    }
    return nativeOpen.apply(window, arguments);
  };
  document.addEventListener('click', function (ev) {
    var el = ev.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.href) return;
    var href = el.getAttribute('href') || '';
    if (href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
    if (el.target === '_blank' || /^https?:/i.test(href)) {
      ev.preventDefault();
      openInBrowser(el.href);
    }
  }, true);
})();
`

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:     "墨辰DarkCube",
		Width:     1120,
		Height:    780,
		MinWidth:  380,
		MinHeight: 560,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 244, G: 244, B: 244, A: 1},
		// 单实例：避免多开互相干扰本地数据与同步状态
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "com.darkcube.diary.wails",
		},
		OnStartup:  app.startup,
		OnDomReady: app.domReady,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

// startup 保存运行上下文
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// domReady 注入外链桥接脚本（在页面脚本之前执行）
func (a *App) domReady(ctx context.Context) {
	runtime.WindowExecJS(ctx, externalLinkBridge)
}
