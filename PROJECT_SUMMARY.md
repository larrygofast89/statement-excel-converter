# 银行对账单转换站 — 项目总结

> 网站：https://statementexcelconverter.com（已上线）
> GitHub：https://github.com/larrygofast89/statement-excel-converter
> 完成日期：2026-10-16

---

## 一、项目概览

银行对账单（Bank Statement）PDF / 图片 → Excel / CSV 转换工具。用户上传对账单，AI 提取账户信息、账户摘要（Summary）和交易明细，导出为标准表格文件。

- **核心功能**：AI 提取账户信息（银行/户名/账号/币种/账单周期）+ Summary + 交易明细
- **多文件支持**：一次上传多个文件，可选「合并为一个表」或「分别导出」
- **流式体验**：SSE 流式返回，边转换边展示（进度、步骤指示、逐笔渲染）
- **认证体系**：邮箱 + Google 登录，未登录每日 1 页限制
- **SEO**：落地页 + 2 个子页面（Supported Banks / Statement Types），robots/sitemap/canonical/Schema

---

## 二、网站设计

### 整体风格
- 简洁工具站风格，绿色主题（`#20ab89`）
- 单页落地（首页）承载转换工具 + 功能说明 + 使用步骤 + FAQ

### 布局结构
| 区域 | 内容 |
|---|---|
| Header | Logo + 导航（Banks / Statement types / How it works / FAQ）+ 登录按钮 + 深浅色切换 |
| Hero | 标题 + 副标题 + 转换工具（上传区 + 模式选择 + 结果区）|
| 功能区 | 4 个 feature 卡片 |
| 步骤区 | 3 步使用说明 |
| FAQ | 折叠式问答 |
| 内链区 | 两个子页面入口卡片 |

### 深色模式
- `html.dark` class 方案 + `prefers-color-scheme` 跟随系统
- 头部内联脚本预判主题（防闪烁），ThemeToggle 组件手动切换，localStorage 记忆

### 响应式
- 移动端导航收起、单列布局（`@media (max-width: 640px)`）

---

## 三、代码实现说明

### 技术栈
- **框架**：Next.js 14（App Router）+ React 18 + TypeScript
- **样式**：纯 CSS（globals.css，CSS 变量 + 深色模式）
- **图标**：lucide-react

### 目录结构
```
app/
  page.tsx               # 首页（落地页 + Schema JSON-LD）
  layout.tsx             # 全局布局（Header/Footer/主题脚本/AuthNotice）
  globals.css            # 全部样式
  icon.svg               # favicon
  robots.ts              # robots.txt（disallow /api/）
  sitemap.ts             # sitemap（首页 + banks + converters）
  banks/page.tsx         # 支持的银行子页面
  converters/page.tsx    # 支持的 statement 类型子页面
  reset-password/page.tsx # 重置密码页
  auth/confirm/route.ts  # 邮箱确认链接处理（verifyOtp）
  api/extract/route.ts   # 核心转换 API（SSE 流式）
components/
  Converter.tsx          # 转换工具主组件（上传/流式/结果/导出）
  AuthButton.tsx         # 登录按钮 + 弹窗（邮箱/Google/忘记密码）
  AuthNotice.tsx         # 验证结果提示横幅
  ThemeToggle.tsx        # 深浅色切换
lib/
  supabase.ts            # Supabase 客户端封装（browser/server）
```

### 核心流程：转换 API（`api/extract/route.ts`）
1. 接收文件（FormData）+ 模式（separate/merge）
2. **mupdf 渲染** PDF/图片为图片页
3. **身份识别**：登录 user_id 或匿名 device_id cookie
4. **每日限制检查**：未登录查 `conversion_limits` 表，超 1 页返回 403
5. **SSE 流式**：逐页调 AI（每页 HEADER + TX 两个 prompt），stream 解析交易
6. 完成后记录用量（upsert 累加页数）

### 认证流程
- 登录：邮箱密码 `signInWithPassword` / Google `signInWithOAuth` / 注册 `signUp`
- 邮箱验证：signUp → Resend 发确认邮件 → 点链接 `/auth/confirm?token_hash=...&type=signup` → `verifyOtp`
- 忘记密码：`resetPasswordForEmail` → 邮件 → `/reset-password` → `updateUser`
- 已注册检测：`signUp` 返回 `data.user.identities` 空数组 = 已注册，提示并切登录模式

### 关键坑位（已解决）
1. **深色模式层叠顺序**：`html.dark` 覆盖块必须放 CSS 文件末尾，否则被组件原始样式覆盖
2. **弹窗被遮挡**：header 有 backdrop-filter（创建 stacking context），弹窗需用 React Portal 提到 body
3. **Render 反向代理**：confirm 路由 `request.url` 是内部地址，需用 `NEXT_PUBLIC_SITE_URL` 环境变量
4. **邮件模板**：必须用 `{{ .TokenHash }}` + `type` 格式（不能默认 `{{ .ConfirmationURL }}`）
5. **Supabase URL**：不能带 `/rest/v1/` 后缀

---

## 四、依赖清单

### 生产依赖
| 依赖 | 版本 | 用途 |
|---|---|---|
| next | 14.2.15 | Next.js 框架 |
| react / react-dom | 18.3.1 | UI 框架 |
| openai | 4.67.3 | 调用 LLM（compatible-mode） |
| mupdf | ^1.28.1 | PDF/图片渲染（wasm） |
| xlsx | 0.18.5 | 生成 Excel |
| @supabase/supabase-js | ^2.117.3 | Supabase 客户端 |
| @supabase/ssr | ^0.12.7 | Supabase SSR（cookie 会话） |
| lucide-react | ^1.57.0 | 图标 |

### 开发依赖
| 依赖 | 版本 |
|---|---|
| typescript | 5.6.3 |
| @types/node | 20.16.11 |
| @types/react | 18.3.11 |
| @types/react-dom | 18.3.1 |

---

## 五、平台 / 工具清单

### 1. 部署与基础设施

| 名称 | 作用 | 配置内容 | 地址 |
|---|---|---|---|
| **Render** | 托管 Web 应用（免费档） | Blueprint `render.yaml`：build `npm install && npm run build`、start `npm start`、Node 20、autoDeploy | https://render.com |
| **Cloudflare** | 域名注册 + DNS 管理 | CNAME `@` → `statement-excel-converter.onrender.com`（DNS only 灰色云朵）；Resend 的 SPF/DKIM 记录 | https://dash.cloudflare.com |
| **UptimeRobot** | 防免费档休眠 | 每 5 分钟 ping `https://statementexcelconverter.com` | https://uptimerobot.com |

### 2. 认证与数据

| 名称 | 作用 | 配置内容 | 地址 |
|---|---|---|---|
| **Supabase** | 邮箱/Google 登录 + Postgres 数据库 | Auth（Email + Google OAuth）、`conversion_limits` 表、Site URL、邮件模板 | https://supabase.com（项目 `enplpjohgqfoltzenlhs`） |
| **Google Cloud Console** | Google OAuth 凭据 + 品牌塑造 | OAuth Client ID/Secret、回调地址 `xxx.supabase.co/auth/v1/callback`、品牌名 Statement Excel Converter | https://console.cloud.google.com |

### 3. 邮件服务

| 名称 | 作用 | 配置内容 | 地址 |
|---|---|---|---|
| **Resend** | 发送验证/重置邮件 | SMTP `smtp.resend.com:465`、username=`resend`、password=API Key、域名验证（SPF/DKIM） | https://resend.com |

### 4. AI 模型

| 名称 | 作用 | 配置内容 | 地址 |
|---|---|---|---|
| **阿里百炼 DashScope** | 视觉语言模型提取对账单 | 模型 `qwen3.7-plus`、compatible-mode API | https://dashscope.aliyuncs.com |

### 5. 代码与搜索

| 名称 | 作用 | 配置内容 | 地址 |
|---|---|---|---|
| **GitHub** | 代码托管 | 仓库 `statement-excel-converter`，GitHub Desktop push | https://github.com/larrygofast89/statement-excel-converter |
| **Google Search Console** | 谷歌收录 | 域名验证（DNS TXT）+ sitemap 提交 | https://search.google.com/search-console |
| **Bing Webmaster** | 必应收录 | 导入 GSC 验证 + sitemap 提交 | https://bing.com/webmasters |

---

## 六、环境变量清单（Render 部署）

| 变量名 | 值 | 说明 |
|---|---|---|
| `OPENAI_API_KEY` | `sk-ws-...` | 百炼 API Key（敏感） |
| `OPENAI_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 模型接口 |
| `OPENAI_MODEL` | `qwen3.7-plus` | 模型名 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://enplpjohgqfoltzenlhs.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key（敏感） |
| `NEXT_PUBLIC_SITE_URL` | `https://statementexcelconverter.com` | 站点域名（邮件链接重定向用） |

> 完整可复制清单见项目内 `render-env.txt`（已 gitignore，不提交）。

---

## 七、后续方向

1. 观察 GSC/Bing 收录数据
2. 内容营销（博客 + 外链）+ 页面内容加厚（每页 600–2000 词）
3. 登录用户限额对齐竞品（5 页/天）
4. 换更快模型（deepseek-flash，降低首 token 延迟）
5. 转换准确率持续优化
