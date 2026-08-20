# 墨辰日记 · DarkCube Diary

> 黑白液态玻璃风格的**本地优先**日记应用（PWA）——电脑与安卓双端互通，GitHub 私有仓库作为云存档，无需任何第三方服务器。

![PWA](https://img.shields.io/badge/PWA-可安装-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

## ✨ 功能

- **写日记**：一天一篇，Markdown 语法，实时预览，字数统计，自动保存（防抖 600ms）
- **图形化 Markdown 辅助**：编辑器上方工具栏一键插入 标题 / 加粗 / 斜体 / 删除线 / 引用 / 列表 / 待办 / 代码 / 链接 / 分割线（作用于当前选区）
- **两种 GitHub 登录**：手动 Token，或**网页辅助登录**（打开 GitHub 网页输码授权，免填 Token）
- **自动创建仓库**：登录后自动创建私有仓库（默认 `darkcube-diary`，已存在则复用），无需手动建仓
- **日间 / 夜间模式**：黑白玻璃界面一键反转
- **日历视图**：月历上墨点标记有日记的日子，今日高亮
- **时间线**：倒序浏览全部日记
- **GitHub 云存档**：日记以 Markdown 明文同步到你自己的**私有仓库**（`diary/entries/YYYY/MM/YYYY-MM-DD.md`），GitHub 网页上可直接阅读
- **双端互通**：PWA 应用，电脑（Chrome/Edge）与安卓（Chrome）均可安装使用，两端共享同一份数据
- **离线可用**：本地优先（IndexedDB），断网照常写日记，联网后自动同步
- **黑白液态玻璃**：纯黑白灰配色，动态灰阶光斑 + 毛玻璃拟态界面
- **数据安全**：同步冲突时远端为权威，本地旧内容自动备份为 `.conflict.md`，绝不丢数据；支持一键导出 JSON 备份

## 🖥 技术栈

| 层 | 技术 |
|---|---|
| 构建 | Vite 6 + React 18 + TypeScript（严格模式） |
| PWA | vite-plugin-pwa（Workbox 离线缓存、可安装） |
| 本地存储 | IndexedDB（Dexie.js） |
| 云同步 | GitHub REST API（Git Data 接口，纯 HTTP，无服务器） |
| Markdown | marked + DOMPurify（渲染 + 消毒） |
| 样式 | 手写 CSS 设计系统（无 UI 框架） |

## 🚀 快速开始（本地开发）

```bash
npm install
npm run dev        # http://localhost:5173
```

生产构建：

```bash
npm run build      # 输出到 dist/（含 service worker 与 manifest）
npm run preview    # 本地预览生产构建
```

## ☁️ GitHub 配置

### 方式 A：网页辅助登录（推荐，免填 Token）

需要一次性准备两样东西：

**1. 创建 OAuth App（约 2 分钟）**

1. 打开 [https://github.com/settings/applications/new](https://github.com/settings/applications/new)
2. 填写：
   - **Application name**：`DarkCube Diary`
   - **Homepage URL**：`https://github.com`
   - **Authorization callback URL**：`https://github.com`（Device Flow 用不到回调，随便填合法 URL 即可）
   - 勾选 **Enable Device Flow**
3. 创建后复制 **Client ID**（`Iv1.` 开头）。Device Flow **不需要 Client Secret**；若 GitHub 报错提示凭据错误，可在设置页补填 Secret。

**2. 部署中转 Worker（约 5 分钟，免费）**

GitHub 出于安全原因不允许浏览器直连 device flow 接口（无 CORS），需要自建一个仅做转发的中转服务：

1. 打开 [Cloudflare](https://dash.cloudflare.com) → Workers & Pages → 创建 Worker
2. 把本仓库 [server/device-flow-worker.js](server/device-flow-worker.js) 的内容粘贴进去 → 部署
3. 复制生成的地址（如 `https://xxx.workers.dev`）

**3. 应用内配置**

打开应用 → 设置 → **网页登录（OAuth）** → 填入 Client ID 与中转地址 → 保存。
之后点顶栏「登录 GitHub」→ 选「网页登录」→ 开始 → 打开 GitHub 授权页 → 输入设备码 → 授权 → 自动完成登录。

### 方式 B：手动 Token

1. 打开 [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) 生成**细粒度 Token**：
   - **Repository access**：All repositories（或 Select repositories 勾选日记仓库）
   - **Permissions** → **Contents**：**Read and write**
2. 应用内「登录 GitHub」→ 手动 Token → 粘贴 Token → 登录

> 两种方式都不需要手动创建仓库：登录成功后应用会**自动创建私有仓库**（默认 `darkcube-diary`，可在登录弹窗中修改；已存在则直接复用）。

## 📲 部署到 GitHub Pages（电脑 + 安卓安装）

日记数据在**私有仓库**里，由你的 Token 保护；应用外壳（不含任何数据）部署到公开仓库的 GitHub Pages（免费 HTTPS），两端即可直接安装使用。

1. 新建一个**公开**仓库（如 `darkcube-diary`），把本仓库代码推上去：
   ```bash
   git remote add origin https://github.com/<你的用户名>/darkcube-diary.git
   git push -u origin main
   ```
2. 仓库 → **Settings** → **Pages** → **Build and deployment** → Source 选 **GitHub Actions**（项目已自带 `.github/workflows/deploy.yml`，推送后自动构建部署）
3. 等待 Actions 运行完成，访问 `https://<你的用户名>.github.io/darkcube-diary/`
4. **电脑安装**：Chrome/Edge 打开该地址 → 地址栏右侧「安装」图标；或打开应用 → 设置 → 关于 → **安装应用到桌面**
5. **安卓安装**：安卓 Chrome 打开该地址 → 菜单 → **添加到主屏幕**（或浏览器弹出的安装横幅）

> 本地联调真机：`npm run dev` 已监听局域网（`http://192.168.x.x:5173`），手机可访问。但 PWA 安装（service worker）要求 HTTPS，正式使用请走 GitHub Pages。

## 🔄 同步与冲突策略

- **拉取**：对比远端 ref 与本地记录，按文件 blob SHA 精确比对，只下载有差异的日记
- **推送**：本地改动批量打包成一次 commit（blobs → tree → commit → ref）
- **冲突**：同一篇日记两端都改过 → **远端为权威**，本地旧内容自动备份为 `diary/entries/.../YYYY-MM-DD.conflict.md`（在时间线顶部有提示，设置页同步结果会显示冲突数）
- **删除**：删除已同步的日记会记录墓碑并同步删除远端文件，不会被重新拉回
- **限流**：GitHub 认证接口 5000 次/小时，个人使用绰绰有余

## 🔐 数据与隐私

- 日记以**明文 Markdown** 存入你的私有 GitHub 仓库（按你的选择，未加密）
- 安全边界 = GitHub 账号安全 + Token 安全：请使用**仅授权单个仓库**的细粒度 Token
- Token 仅存本机浏览器；退出登录会清除本机 Token
- 本地数据可随时导出 JSON 备份（设置 → 数据 → 导出）

## 📁 项目结构

```
├── .github/workflows/deploy.yml   # GitHub Pages 自动部署
├── public/icons/                  # PWA 图标（脚本生成）
├── scripts/gen-icons.mjs          # 纯 Node 图标生成器
├── server/device-flow-worker.js   # 网页登录中转（Cloudflare Worker）
├── src/
│   ├── core/
│   │   ├── types.ts               # 数据模型
│   │   ├── db.ts                  # Dexie 存储
│   │   ├── date.ts                # 日期/月历工具
│   │   ├── markdown.ts            # 渲染/标题/字数/工具栏转换
│   │   ├── github/api.ts          # GitHub REST 客户端（认证/仓库/自动建仓）
│   │   ├── github/git.ts          # Git Data API（ref/tree/blob/commit）
│   │   ├── github/oauth.ts        # Device Flow 客户端（经中转）
│   │   └── sync/engine.ts         # 同步引擎（拉取/推送/冲突/墓碑）
│   ├── ui/
│   │   ├── components/            # 顶栏/登录面板/工具栏/液体背景
│   │   └── views/                 # 日历/编辑器/时间线/设置
│   └── styles/                    # 黑白玻璃设计系统（含日间模式）
└── vite.config.ts
```

## 🗺 路线图

- [x] 图形化 Markdown 辅助工具栏
- [x] 网页辅助登录（Device Flow）
- [x] 自动创建仓库
- [x] 日间模式
- [ ] 内容加密后上传（口令派生密钥 AES-GCM）
- [ ] 图片/附件
- [ ] 标签分类与搜索
- [ ] 多日记本

## 📄 License

MIT
