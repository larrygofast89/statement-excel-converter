# 部署上线指南（Render）

本站在 Render 部署。以下是完整步骤。

## 前置条件

- [ ] 代码已推送到 GitHub 仓库 `statement-excel-converter`
- [ ] 已注册 Render（render.com，用 GitHub 登录）
- [ ] 已注册 UptimeRobot（uptimerobot.com，免费防休眠）

---

## 第一步：Render 部署

1. 登录 [render.com](https://render.com) → 右上角 **New +** → **Blueprint**
2. 选择 GitHub 仓库 `larrygofast89/statement-excel-converter`
3. Render 会自动读取 `render.yaml`，创建 Web Service
4. 点 **Apply** 开始部署（首次构建约 3-5 分钟）

> 如果不想用 Blueprint，也可以：New + → Web Service → 选仓库 → 手动填 Build Command `npm install && npm run build`、Start Command `npm start`，Node 版本选 20。

## 第二步：填环境变量

部署后，进入服务 → **Environment**，填下面 6 个环境变量：

| 变量名 | 值 |
|---|---|
| `OPENAI_API_KEY` | 你的百炼 key（从 `.env.local` 复制） |
| `OPENAI_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `OPENAI_MODEL` | `qwen3.7-plus` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://enplpjohgqfoltzenlhs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key（从 `.env.local` 复制） |
| `NEXT_PUBLIC_SITE_URL` | `https://statementexcelconverter.com`（邮箱确认链接重定向用，必填） |

填完点 **Save Changes**，Render 会自动重新部署。

## 第三步：切换 Supabase / Google 的域名（关键！）

线上登录必须用正式域名，把 localhost 全部换成正式域名：

| 位置 | 操作 |
|---|---|
| Supabase → Authentication → URL Configuration → **Site URL** | 改成 `https://statementexcelconverter.com` |
| Supabase → URL Configuration → **Redirect URLs** | 添加 `https://statementexcelconverter.com` |

> ⚠️ Google Cloud 的 redirect URI **不用改**——它始终指向 Supabase 回调地址 `https://xxx.supabase.co/auth/v1/callback`，与你的网站域名无关。

## 第四步：绑定域名

1. Render 服务 → **Settings → Custom Domains** → 添加 `statementexcelconverter.com`
2. 去你的域名注册商（DNS 管理），添加一条 **CNAME** 记录：
   - 主机名：`@`（或 `www`）
   - 值：Render 给的地址（如 `xxx.onrender.com`）
3. 等 DNS 生效（几分钟到几小时）

## 第五步：防休眠（免费档必做）

Render 免费档 15 分钟无访问会休眠，冷启动约 60 秒。用 UptimeRobot 每 5 分钟 ping 一次：

1. 注册 [uptimerobot.com](https://uptimerobot.com) → **New monitor**
2. Type 选 **HTTP(s)**，URL 填 `https://statementexcelconverter.com`
3. 监控间隔选 **5 分钟**
4. 保存

## 第六步：上线后检查清单

- [ ] 首页能打开，转换功能正常（上传 PDF → 出结果）
- [ ] 注册（邮箱）→ 收确认邮件 → 点链接 → 登录成功
- [ ] 忘记密码 → 收重置邮件 → 重置成功
- [ ] Google 登录正常
- [ ] 未登录用户转换 1 页后，再转会提示「每日 1 页，请登录」
- [ ] 深浅色模式切换正常

## 第七步：提交搜索引擎

- [ ] Google Search Console：添加网站 → 验证 → 提交 `sitemap.xml`
- [ ] Bing Webmaster：添加网站 → 提交 sitemap
