# CodeRunner - 研究发现

## 项目文档分析

### 需求文档 (PDF 1)
- 来源：UNSW COMP9900 项目 P10
- 客户：Henry Hickman
- 目标：构建 CodeRunner 的独立 Web 版本，脱离 Moodle
- Sprint 1 核心功能：
  - 学生注册/登录
  - 题目浏览
  - 代码编辑 + 运行 + 提交
  - 自动评分

### 提案文档 (PDF 2) - 关键发现
- 团队：9900-W09C-Bread（6人）
- 架构：前后端分离，但使用 Next.js 可统一
- UI 设计（从故事板描述）：
  - **登录/注册**：居中表单，蓝色主题
  - **题目列表**：卡片网格，显示标题/语言/难度/状态
  - **题目详情**：左右分栏（左：题目描述，右：代码编辑器）
  - **提交结果**：逐测试用例展示通过/失败

## 技术调研

### Prisma + SQLite
- SQLite 适合原型，无需额外服务
- Prisma 提供类型安全的 ORM
- 迁移文件可追踪 schema 变更

### Monaco Editor in Next.js
- `@monaco-editor/react` 提供 React 封装
- 动态加载避免 SSR 冲突
- 使用 `next/dynamic` 确保只在客户端渲染

### 代码执行方案
- Python：`python -c "code"` 或写入临时文件执行
- JavaScript：Node.js `vm` 模块或 `child_process`
- 超时控制：`setTimeout` + `child_process.kill`

## 种子数据设计

### 学生测试账户
- 邮箱：`student@test.com`
- 密码：`password123`
- 姓名：`Test Student`

### 题目 1：两数之和 (Easy)
- 语言：Python
- 描述：实现函数 `add(a, b)` 返回两数之和
- 模板代码
- 示例测试用例

### 题目 2：判断素数 (Medium)
- 语言：Python
- 描述：实现函数 `is_prime(n)` 判断是否为素数
- 模板代码
- 示例测试用例 + 隐藏测试用例
