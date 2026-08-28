# RenoAI

面向新加坡家庭维修场景的移动优先 MVP。用户用文字与照片描述问题，确认 AI 整理出的 Problem Brief 后，系统并行生成维修判断和独立价格区间，最后产出唯一的 Project Brief。

## 核心数据流

```text
Property → ProblemBrief → (RepairResult + PriceResult) → ProjectBrief
```

- Qwen3-VL-Flash：理解文字/照片，生成 Problem Brief 和最少补问。
- DeepSeek V4 Flash：只读取已确认的 Problem Brief，输出维修判断，不输出价格。
- Price Engine：只读取已确认的 Problem Brief，通过本地价格知识库匹配，不调用 LLM。
- User View、Contractor View 和浏览器 PDF 都读取同一份 Project Brief。

## 本地启动

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。默认没有 API Key 也能运行，因为项目会自动使用 Demo Mode。

## 接入真实 AI API

1. 复制 `.env.example` 为 `.env.local`。
2. 在阿里云 Model Studio 新加坡区域创建 Workspace、开通 `qwen3-vl-flash`，创建 API Key，并把 Workspace ID 写进 `QWEN_BASE_URL`。
3. 在 DeepSeek 开放平台创建 API Key。
4. 填入以下配置，并关闭 Demo Mode：

```dotenv
QWEN_API_KEY=sk-your-qwen-key
QWEN_BASE_URL=https://YOUR_WORKSPACE_ID.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3-vl-flash

DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash

AI_DEMO_MODE=false
```

重启 `npm run dev` 后生效。API Key 只保存在服务器环境变量中，绝不能加 `NEXT_PUBLIC_`，也不要提交 `.env.local`。

## 当前 MVP 能力

- Property onboarding
- 文字、照片、视频附件和分类提示输入
- Problem Brief + completeness check 同一次 Qwen 调用
- 最多 1–3 个关键补问
- Brief 编辑与强制用户确认
- DeepSeek / Price Engine 并行处理
- 无可靠价格匹配时明确返回 unavailable
- Requests 列表、用户结果页、Contractor View
- 浏览器 Print / Save as PDF
- LocalStorage 演示数据层

## 下一步生产化

- 用 Supabase 替换 LocalStorage，加入用户登录与 Row Level Security。
- 用 Supabase Storage/R2 保存图片和视频；目前媒体只用于当前浏览器会话。
- 把价格库迁移到数据库并加入版本、来源和人工审核字段。
- 为 API 加速率限制、请求体限制、日志脱敏和错误监控。
- 服务端生成正式 PDF，并把 Project Brief 持久化后供承包商分享。

## 主要目录

```text
src/app                 页面与 API routes
src/features            按 UX flow 拆分的 UI 模块
src/schemas             Zod 数据边界
src/server/ai           Qwen / DeepSeek 客户端与 prompts
src/server/pipeline     确认后的并行分析
src/server/pricing      独立价格引擎
data/pricing            价格知识库
```

完整的页面路由、数据所有权和后续预留目录见 [docs/architecture.md](docs/architecture.md)。
