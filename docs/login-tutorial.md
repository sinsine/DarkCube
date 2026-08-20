# GitHub 登录教程（小白向）

这篇教程会带你从零开始，把日记备份到 GitHub。全程约 10 分钟，**完全不需要会编程**。

---

## 为什么要登录 GitHub？

「墨辰DarkCube」把日记保存在你**自己的 GitHub 私有仓库**里：

- 电脑和手机上的日记通过 GitHub 互相同步（双端互通）
- 即使设备丢了、坏了，日记也安全地存在云端
- 私有仓库别人看不到，只有你能访问

---

## 第 1 步：注册 GitHub 账号（已有账号可跳过）

1. 打开浏览器，访问 <https://github.com/signup>
2. 填写邮箱、密码、用户名，按提示完成注册（可能需要邮箱验证）
3. 注册完成后，建议先在 <https://github.com> 登录一次

> 这一步只需要做一次。以后换电脑、换手机，都用同一个账号。

---

## 第 2 步：生成访问令牌（Token）

Token 相当于一把「钥匙」，让应用可以替你往 GitHub 存取日记。**请按下面的选项精确勾选**：

1. 打开 <https://github.com/settings/personal-access-tokens/new>
2. 在 **Token name** 里随便填个名字，例如 `darkcube-diary`
3. **Expiration（有效期）**：建议选 **90 days**（到期后需重新生成）
4. **Repository access（仓库访问）**：选择 **All repositories**（所有仓库）

   > ⚠️ 这一步很关键：如果选「Only select repositories（只选仓库）」，应用将无法自动创建日记仓库。

5. 向下找到 **Permissions（权限）**，点击 **Add permissions**，依次添加两项：
   - **Contents** → 权限选 **Read and write**
   - **Administration** → 权限选 **Read and write**
6. 拉到页面底部，点击 **Generate token（生成令牌）**
7. **立刻复制**显示的 `github_pat_...` 开头的一长串字符——**只显示这一次**，关掉页面就看不到了

---

## 第 3 步：在应用里登录

1. 打开墨辰DarkCube，点击顶栏右侧的 **「登录 GitHub」**
2. 在弹窗里粘贴刚才复制的 Token
3. **仓库名**保持默认 `darkcube-diary` 即可（也可以改成你喜欢的名字）
4. 点击 **「登录并创建仓库」**

应用会自动验证 Token，并在你的 GitHub 上**自动创建一个私有仓库**，不需要你手动建仓库。

---

## 第 4 步：开始同步

1. 打开 **设置** → 找到 **同步**
2. 点击 **「立即同步」**，稍等几秒
3. 看到「完成：拉取 N · 推送 M」就说明成功了
4. 建议顺手打开 **自动同步** 开关：以后打开应用、或恢复联网时会自动同步

之后在 GitHub 网页上打开你的仓库，就能看到 `diary/entries/` 文件夹里的日记（一天一个 Markdown 文件）。

---

## 常见问题

**Q：提示「Token 无效或已过期」？**
重新生成一个 Token（按第 2 步），再重新登录。

**Q：提示「访问被拒绝 / 没有 Contents 权限」？**
回到第 2 步第 5 小步，确认 **Contents** 勾的是 **Read and write**，Administration 也勾了。

**Q：提示「仓库名已存在」或创建失败？**
把登录弹窗里的**仓库名改成一个新名字**（例如 `my-diary-2026`）再试。

**Q：提示「仓库为空」或同步失败？**
先点「立即同步」重试一次；如果还不行，把报错原文截图发给作者（见设置 → 关于 → 作者 B 站主页）。

**Q：忘记 Token 了？**
Token 只显示一次。打开 <https://github.com/settings/tokens> 重新生成，然后在应用里重新登录。

---

## 安全提醒

- Token 相当于你账号的部分「钥匙」：**不要发给任何人，不要截图发到网上**
- 它只保存在你自己的设备上（本机浏览器）
- 如果怀疑泄露，去 <https://github.com/settings/tokens> 删掉它重新生成即可
