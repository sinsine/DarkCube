# GitHub 登入教學（新手向）

這篇教學會帶你從零開始，把日記備份到 GitHub。全程約 10 分鐘，**完全不需要會寫程式**。

---

## 為什麼要登入 GitHub？

「墨辰DarkCube」把日記儲存在你**自己的 GitHub 私有倉庫**裡：

- 電腦和手機上的日記透過 GitHub 互相同步
- 即使裝置遺失、損壞，日記也安全地存在雲端
- 私有倉庫別人看不到，只有你能存取

---

## 第 1 步：註冊 GitHub 帳號（已有帳號可跳過）

1. 開啟瀏覽器，前往 <https://github.com/signup>
2. 填寫信箱、密碼、使用者名稱，依指示完成註冊（可能需要信箱驗證）

> 這一步只需要做一次。以後換電腦、換手機，都用同一個帳號。

---

## 第 2 步：產生存取權杖（Token）

Token 相當於一把「鑰匙」，讓應用程式可以替你存取 GitHub 日記。**請依下列選項精確勾選**：

1. 開啟 <https://github.com/settings/personal-access-tokens/new>
2. 在 **Token name** 隨便填個名字，例如 `darkcube-diary`
3. **Expiration（有效期限）**：建議選 **90 days**（到期後需重新產生）
4. **Repository access（倉庫存取）**：選擇 **All repositories**（所有倉庫）

   > ⚠️ 這一步很關鍵：如果選「Only select repositories（只選倉庫）」，應用程式將無法自動建立日記倉庫。

5. 向下找到 **Permissions（權限）**，點擊 **Add permissions**，依序新增兩項：
   - **Contents** → 權限選 **Read and write**
   - **Administration** → 權限選 **Read and write**
6. 拉到頁面底部，點擊 **Generate token（產生權杖）**
7. **立刻複製**顯示的 `github_pat_...` 開頭的一長串字元——**只顯示這一次**，關掉頁面就看不到了

---

## 第 3 步：在應用程式裡登入

1. 開啟墨辰DarkCube，點擊頂欄右側的 **「登入 GitHub」**
2. 在彈窗裡貼上剛才複製的 Token
3. **倉庫名稱**保持預設 `darkcube-diary` 即可（也可以改成你喜歡的名字）
4. 點擊 **「登入並建立倉庫」**

應用程式會自動驗證 Token，並在你的 GitHub 上**自動建立一個私有倉庫**，不需要你手動建立。

---

## 第 4 步：開始同步

1. 開啟 **設定** → 找到 **同步**
2. 點擊 **「↑ 上傳」** 或 **「↓ 下載」**，稍等幾秒
3. 看到「上傳完成」或「下載完成」就代表成功了
4. 建議開啟 **自動同步** 開關：以後開啟應用程式、或恢復連網時會自動同步

之後在 GitHub 網頁上開啟你的倉庫，就能看到 `diary/entries/` 資料夾裡的日記（一天一個 Markdown 檔案）。

---

## 常見問題

**Q：提示「Token 無效或已過期」？**
重新產生一個 Token（按第 2 步），再重新登入。

**Q：提示「沒有 Contents 權限」？**
回到第 2 步第 5 小步，確認 **Contents** 勾的是 **Read and write**，Administration 也勾了。

**Q：提示「倉庫名稱已存在」或建立失敗？**
把登入彈窗裡的**倉庫名稱改成一個新名字**（例如 `my-diary-2026`）再試。

**Q：提示「倉庫為空」或同步失敗？**
先再試一次；如果還不行，把錯誤訊息原文截圖給作者（見設定 → 關於 → 作者 B 站主頁）。

**Q：忘記 Token 了？**
Token 只顯示一次。開啟 <https://github.com/settings/tokens> 重新產生，然後在應用程式裡重新登入。

---

## 安全提醒

- Token 相當於你帳號的部分「鑰匙」：**不要傳給任何人，不要截圖貼到網路上**
- 它只儲存在你自己的裝置上（本機瀏覽器）
- 如果懷疑外洩，去 <https://github.com/settings/tokens> 刪掉它重新產生即可
