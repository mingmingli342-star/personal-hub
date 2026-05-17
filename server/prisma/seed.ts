import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Account
  const bank = await prisma.account.create({ data: { name: "工资卡", type: "bank", balance: 50000, color: "#3b82f6" } });
  const alipay = await prisma.account.create({ data: { name: "支付宝", type: "alipay", balance: 3200, color: "#06b6d4" } });
  const wechat = await prisma.account.create({ data: { name: "微信钱包", type: "wechat", balance: 800, color: "#22c55e" } });

  // Transactions
  const now = new Date();
  const txs = [
    { amount: 15000, type: "income", category: "薪资", accountId: bank.id, date: new Date(now.getFullYear(), now.getMonth(), 5), description: "5月工资" },
    { amount: 2000, type: "expense", category: "房租", accountId: bank.id, date: new Date(now.getFullYear(), now.getMonth(), 3), description: "房租" },
    { amount: 45, type: "expense", category: "餐饮", accountId: wechat.id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), description: "午餐外卖" },
    { amount: 300, type: "expense", category: "购物", accountId: alipay.id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2), description: "日用品" },
    { amount: 88, type: "expense", category: "交通", accountId: wechat.id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3), description: "打车" },
    { amount: 500, type: "expense", category: "娱乐", accountId: alipay.id, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "电影+晚餐" },
  ];
  for (const tx of txs) {
    await prisma.transaction.create({ data: tx });
    // Update balance
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    await prisma.account.update({ where: { id: tx.accountId }, data: { balance: { increment: delta } } });
  }

  // Projects
  const proj = await prisma.project.create({ data: { name: "个人管理系统", description: "开发全栈个人管理应用", status: "active", color: "#3b82f6" } });
  await prisma.project.create({ data: { name: "学习 Rust", description: "通过实践项目学习 Rust", status: "paused", color: "#f59e0b" } });

  // Tasks
  await prisma.task.create({ data: { title: "完成前端页面开发", description: "实现 Dashboard + 4 模块页面", status: "done", priority: "high", projectId: proj.id, estimatedMinutes: 180 } });
  await prisma.task.create({ data: { title: "后端 API 测试", description: "测试所有 CRUD 接口", status: "in_progress", priority: "medium", projectId: proj.id, estimatedMinutes: 60 } });
  await prisma.task.create({ data: { title: "配置数据库", description: "Prisma schema 设计 + 迁移", status: "done", priority: "high", projectId: proj.id, estimatedMinutes: 30 } });
  await prisma.task.create({ data: { title: "UI 细节打磨", description: "深色模式、响应式、动画", status: "todo", priority: "low", projectId: proj.id, estimatedMinutes: 120 } });

  // Work Log
  await prisma.workLog.create({ data: { content: "完成 Prisma schema 设计和数据库迁移", date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), projectId: proj.id, durationMinutes: 120 } });
  await prisma.workLog.create({ data: { content: "实现所有后端 CRUD API 路由", date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), projectId: proj.id, durationMinutes: 180 } });
  await prisma.workLog.create({ data: { content: "开发前端 React 页面和组件", date: now, projectId: proj.id, durationMinutes: 240 } });

  // Body Records
  await prisma.bodyRecord.create({ data: { date: new Date(now.getFullYear(), now.getMonth(), 1), weight: 70.5, bmi: 22.8, bodyFat: 18.5, waist: 80, note: "月初测量" } });
  await prisma.bodyRecord.create({ data: { date: new Date(now.getFullYear(), now.getMonth(), 15), weight: 69.8, bmi: 22.6, bodyFat: 18.0, waist: 79, note: "月中测量" } });

  // Exercise Records
  await prisma.exerciseRecord.create({ data: { date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2), type: "跑步", durationMinutes: 30, calories: 280, intensity: "medium", note: "晨跑" } });
  await prisma.exerciseRecord.create({ data: { date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4), type: "健身", durationMinutes: 60, calories: 450, intensity: "high", note: "力量训练" } });
  await prisma.exerciseRecord.create({ data: { date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5), type: "游泳", durationMinutes: 45, calories: 350, intensity: "medium" } });

  // Goals
  await prisma.goal.create({ data: { title: "体重降至 65kg", description: "通过饮食控制和规律运动", category: "health", startDate: new Date(now.getFullYear(), 0, 1), targetDate: new Date(now.getFullYear(), 11, 31), progress: 35, status: "active", color: "#22c55e" } });
  await prisma.goal.create({ data: { title: "完成个人管理系统", description: "全栈项目开发", category: "career", startDate: new Date(now.getFullYear(), 4, 1), targetDate: new Date(now.getFullYear(), 4, 31), progress: 80, status: "active", color: "#3b82f6" } });
  await prisma.goal.create({ data: { title: "每月读书 2 本", description: "养成阅读习惯", category: "learning", startDate: new Date(now.getFullYear(), 3, 1), progress: 45, status: "active", color: "#8b5cf6" } });

  // Habits
  await prisma.habit.create({ data: { name: "晨跑 30 分钟", description: "每天早上跑步", frequency: "daily", targetCount: 1, color: "#3b82f6" } });
  await prisma.habit.create({ data: { name: "阅读 30 分钟", description: "每天阅读至少半小时", frequency: "daily", targetCount: 1, color: "#8b5cf6" } });
  await prisma.habit.create({ data: { name: "力量训练", description: "每周健身", frequency: "weekly", targetCount: 3, color: "#ef4444" } });

  // Calendar Events
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);
  await prisma.calendarEvent.create({ data: { title: "项目评审会议", startTime: new Date(tomorrow.setHours(14, 0, 0, 0)), endTime: new Date(tomorrow.setHours(15, 30, 0, 0)), color: "#3b82f6", note: "准备项目进度汇报" } });
  await prisma.calendarEvent.create({ data: { title: "朋友聚会", startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 18, 0), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 21, 0), color: "#f59e0b", note: "老地方见" } });

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
