import { Router, Request, Response } from "express";
import prisma from "../prisma.js";
import { startOfDay, endOfDay } from "date-fns";

export const goalsRouter = Router();
export const habitsRouter = Router();
export const habitLogsRouter = Router();
export const eventsRouter = Router();

goalsRouter.get("/", async (_req: Request, res: Response) => {
  const data = await prisma.goal.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

goalsRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.goal.create({ data: req.body });
  res.status(201).json(data);
});

goalsRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.goal.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

goalsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.goal.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

habitsRouter.get("/", async (_req: Request, res: Response) => {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());
  const habits = await prisma.habit.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      logs: {
        where: { date: { gte: today, lte: tomorrow } },
      },
    },
  });
  const result = habits.map((h) => ({
    ...h,
    todayDone: h.logs.length > 0,
    logs: undefined,
  }));
  res.json(result);
});

habitsRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.habit.create({ data: req.body });
  res.status(201).json(data);
});

habitsRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.habit.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

habitsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.habit.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

habitLogsRouter.get("/", async (req: Request, res: Response) => {
  const { habitId, startDate, endDate } = req.query;
  const where: Record<string, unknown> = {};
  if (habitId) where.habitId = habitId as string;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate as string);
    if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate as string);
  }
  const data = await prisma.habitLog.findMany({ where, orderBy: { date: "desc" } });
  res.json(data);
});

habitLogsRouter.post("/", async (req: Request, res: Response) => {
  const { habitId, date } = req.body;
  const d = date ? startOfDay(new Date(date)) : startOfDay(new Date());
  const nextDay = endOfDay(d);

  const existing = await prisma.habitLog.findFirst({
    where: { habitId, date: { gte: d, lte: nextDay } },
  });

  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } });
    return res.json({ deleted: true, id: existing.id });
  } else {
    const data = await prisma.habitLog.create({
      data: { habitId, date: d, completed: true },
    });
    return res.status(201).json(data);
  }
});

eventsRouter.get("/", async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) (where.startTime as Record<string, unknown>).gte = new Date(startDate as string);
    if (endDate) (where.startTime as Record<string, unknown>).lte = new Date(endDate as string);
  }
  const data = await prisma.calendarEvent.findMany({ where, orderBy: { startTime: "asc" } });
  res.json(data);
});

eventsRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.calendarEvent.create({ data: req.body });
  res.status(201).json(data);
});

eventsRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.calendarEvent.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

eventsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.calendarEvent.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
