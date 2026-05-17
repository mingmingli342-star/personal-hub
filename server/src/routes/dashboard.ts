import { Router, Request, Response } from "express";
import prisma from "../prisma.js";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const nextWeek = addDays(now, 7);

  const [
    accounts,
    monthlyTransactions,
    recentTransactions,
    pendingTasks,
    activeProjects,
    recentWorkLogs,
    latestBodyRecord,
    weeklyExercises,
    activeGoals,
    habits,
    upcomingEvents,
  ] = await Promise.all([
    prisma.account.findMany(),
    prisma.transaction.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { account: true },
    }),
    prisma.task.count({ where: { status: { not: "done" } } }),
    prisma.project.count({ where: { status: "active" } }),
    prisma.workLog.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { project: true },
    }),
    prisma.bodyRecord.findFirst({ orderBy: { date: "desc" } }),
    prisma.exerciseRecord.findMany({
      where: { date: { gte: weekStart } },
    }),
    prisma.goal.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" } }),
    prisma.habit.findMany({
      include: { logs: { where: { date: { gte: today, lte: todayEnd } } } },
    }),
    prisma.calendarEvent.findMany({
      where: { startTime: { gte: now, lte: nextWeek } },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const weeklyExerciseMinutes = weeklyExercises.reduce((sum, e) => sum + e.durationMinutes, 0);
  const todayHabits = habits.map((h) => ({ habit: { ...h, logs: undefined }, done: h.logs.length > 0 }));

  res.json({
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    recentTransactions,
    pendingTasks,
    activeProjects,
    recentWorkLogs,
    latestBodyRecord,
    weeklyExerciseMinutes,
    activeGoals,
    todayHabits,
    upcomingEvents,
  });
});

export default router;
