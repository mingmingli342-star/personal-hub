# Personal Hub - 个人管理系统

全栈个人管理应用，4 大模块：资产管理、工作管理、身体与运动、规划管理。

## 启动方式

```bash
cd e:/Trea-work/05-cc/01-personal-hub
npm run dev
```

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001
- Vite 自动 proxy `/api` → 3001

## 技术栈

- **前端**: React 19 + Vite + TypeScript + Tailwind CSS v3 + Recharts + Lucide React
- **后端**: Express + TypeScript + Prisma ORM + SQLite
- **状态**: TanStack Query (服务端状态) + Zustand (UI 状态)
- **路由**: React Router v6

## 目录结构

```
client/src/
├── components/    # 通用 UI 组件 (StatCard, Modal, EmptyState, Skeleton)
├── pages/         # Dashboard, AssetsPage, WorkPage, HealthPage, PlansPage
├── layouts/       # MainLayout (侧栏 + 移动端导航)
├── services/      # api.ts (TanStack Query 封装)
├── stores/        # useStore.ts (Zustand - 深色模式 + 侧栏折叠)
├── lib/           # utils.ts (格式化、常量)
└── types/         # TypeScript 类型定义

server/src/
├── routes/        # accounts, transactions, budgets, work, health, plans, dashboard
└── index.ts       # Express 入口

server/prisma/
├── schema.prisma  # 11 个数据模型
└── seed.ts        # 演示数据
```

## 数据库

- SQLite (文件: `server/prisma/dev.db`)
- 迁移: `npm run db:migrate`
- 种子数据: `npm run db:seed`
- 重置: 删除 dev.db → 重新迁移 + 种子

## GitHub

- 仓库: https://github.com/mingmingli342-star/personal-hub
- 推送: `git push origin main`
