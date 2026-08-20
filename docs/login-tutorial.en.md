# GitHub Login Tutorial (Beginner)

This tutorial walks you through backing up your diary to GitHub from scratch. It takes about 10 minutes and **requires no programming knowledge**.

---

## Why log in to GitHub?

"墨辰DarkCube" stores your diary in **your own private GitHub repository**:

- Entries on your computer and phone sync through GitHub
- Even if you lose or break a device, your diary stays safe in the cloud
- A private repository is invisible to others — only you can access it

---

## Step 1: Create a GitHub account (skip if you have one)

1. Open your browser and go to <https://github.com/signup>
2. Enter your email, password, and username, then follow the prompts (email verification may be required)

> You only do this once. Use the same account when you switch computers or phones.

---

## Step 2: Generate an access token

A token is like a key that lets the app access GitHub on your behalf. **Select exactly these options**:

1. Open <https://github.com/settings/personal-access-tokens/new>
2. In **Token name**, enter any name, e.g. `darkcube-diary`
3. **Expiration**: choose **90 days** (regenerate after it expires)
4. **Repository access**: choose **All repositories**

   > ⚠️ This step is critical: choosing "Only select repositories" prevents the app from auto-creating the diary repository.

5. Scroll to **Permissions**, click **Add permissions**, and add these two:
   - **Contents** → **Read and write**
   - **Administration** → **Read and write**
6. Scroll to the bottom and click **Generate token**
7. **Copy immediately** the long string starting with `github_pat_...` — it is **shown only once**!

---

## Step 3: Log in inside the app

1. Open 墨辰DarkCube and tap **「Login GitHub」** in the top bar
2. Paste the token into the dialog
3. Keep the default **repo name** `darkcube-diary` (or use any name you like)
4. Tap **「Login & create repo」**

The app verifies the token and **automatically creates a private repository** for you — no manual setup needed.

---

## Step 4: Start syncing

1. Open **Settings** → **Sync**
2. Tap **「↑ Push」** or **「↓ Pull」** and wait a few seconds
3. Seeing "Push complete" / "Pull complete" means it worked
4. Turn on **Auto sync**: the app will sync automatically when it opens or when the network returns

Then open your repository on the GitHub website to see your entries under `diary/entries/` (one Markdown file per day).

---

## FAQ

**Q: "Token is invalid or expired"?**
Generate a new token (Step 2) and log in again.

**Q: "Access denied / no Contents permission"?**
Go back to Step 2.5 and make sure **Contents** is **Read and write** and Administration is also selected.

**Q: "Repository name already exists" or creation failed?**
Change the **repo name** in the login dialog to something new (e.g. `my-diary-2026`).

**Q: "Repository is empty" or sync fails?**
Try again once; if it still fails, send a screenshot of the error to the author (Settings → About → Author's Bilibili).

**Q: Forgot the token?**
The token is shown only once. Regenerate it at <https://github.com/settings/tokens> and log in again.

---

## Security note

- The token is part of your account's access keys: **never share it, never post screenshots of it online**
- It is stored only on your own device (local browser)
- If you suspect it leaked, delete it at <https://github.com/settings/tokens> and generate a new one
