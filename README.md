# Bank Statement Converter — MVP

上传银行对账单图片 → AI 提取交易明细 → 下载 Excel / CSV。

## 技术栈

- Next.js 14（App Router）+ TypeScript
- OpenAI 兼容视觉模型（可换 DeepSeek / 通义千问等国产模型）
- xlsx（前端生成 Excel 下载）

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置 API key
cp .env.local.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY（和可选的 baseURL/model）

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

## 部署到 Vercel

```bash
npm run build   # 先本地验证能构建通过
```

然后在 Vercel 导入此目录，配置环境变量 `OPENAI_API_KEY` 即可。

## 下一步（TODO）

- [ ] 支持 PDF 上传（用 Claude 直接读 PDF，或 pdf 转图片）
- [ ] 免费次数限制（每月 3 次）+ 付费解锁（接 Creem）
- [ ] 银行品牌页矩阵（convert HSBC/Chase/... bank statement to excel）
- [ ] 教程页 + 更多长尾落地页
- [ ] Schema 结构化数据 + About/隐私页
