# CodeRunner - 任务规划

## 项目概述
基于 Next.js 的独立自动代码评测平台（COMP9900 项目 P10）
替代 Moodle 插件版 CodeRunner，提供独立的 Web 界面

## 技术栈
- 前端/后端：Next.js 14 (App Router) + TypeScript
- 数据库：Prisma + SQLite
- 样式：Tailwind CSS
- 代码编辑器：Monaco Editor
- 认证：JWT + bcryptjs
- 代码执行：Node.js child_process（带超时沙箱）

## 阶段计划

### 阶段 1：项目基础设施
- [x] 初始化 package.json 和依赖
- [x] 配置 TypeScript、Tailwind、Next.js
- [x] 创建目录结构
- [ ] 定义 Prisma Schema
- [ ] 配置 Prisma Client
- [ ] 初始化数据库 + 运行迁移

### 阶段 2：认证系统
- [ ] 数据库 User 模型
- [ ] 注册 API (POST /api/auth/register)
- [ ] 登录 API (POST /api/auth/login)
- [ ] 当前用户 API (GET /api/auth/me)
- [ ] 登录页面 UI
- [ ] 注册页面 UI
- [ ] 中间件（路由保护）

### 阶段 3：题目浏览
- [ ] 数据库 Problem 模型 + TestCase 模型
- [ ] 题目列表 API (GET /api/problems)
- [ ] 题目详情 API (GET /api/problems/[id])
- [ ] 题目列表页面 UI
- [ ] 题目卡片组件

### 阶段 4：代码编辑与提交
- [ ] Monaco Editor 组件
- [ ] 题目详情页面（分栏布局）
- [ ] Run API（非持久化执行）
- [ ] Submit API（持久化提交 + 评分）
- [ ] 提交结果 API
- [ ] 运行结果显示组件

### 阶段 5：种子数据与演示
- [ ] 种子数据脚本（2个题目 + 1个学生账户）
- [ ] 首页重定向
- [ ] README.md 文档
- [ ] 启动脚本

### 阶段 6：收尾
- [ ] 错误处理完善
- [ ] UI 细节打磨
- [ ] 端到端测试验证

## 架构决策记录

### ADR-1：数据库选型 SQLite
- **原因**：原型阶段无需独立数据库服务器，SQLite 足够
- **后续**：生产环境可迁移至 PostgreSQL/MySQL

### ADR-2：代码执行使用 child_process
- **原因**：Sprint 1 原型阶段，Docker 沙箱复杂度高
- **限制**：无完全隔离，仅超时保护
- **后续**：Sprint 2 迁移至 Docker 沙箱

### ADR-3：JWT 无状态认证
- **原因**：简化架构，无需 Redis 存储会话
- **后续**：可添加 refresh token 机制

### ADR-4：Monaco Editor
- **原因**：功能完整，支持语法高亮、多语言
- **注意**：首次加载较大，可使用 CDN 优化
