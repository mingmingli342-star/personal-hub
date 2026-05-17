import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

export const projectsRouter = Router();
export const tasksRouter = Router();
export const workLogsRouter = Router();

// Projects
projectsRouter.get("/", async (_req: Request, res: Response) => {
  const data = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });
  res.json(data);
});

projectsRouter.get("/:id", async (req: Request, res: Response) => {
  const data = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });
  data ? res.json(data) : res.status(404).json({ error: "Not found" });
});

projectsRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.project.create({ data: req.body });
  res.status(201).json(data);
});

projectsRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

projectsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Tasks
tasksRouter.get("/", async (req: Request, res: Response) => {
  const { status, projectId } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status as string;
  if (projectId) where.projectId = projectId as string;
  const data = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { project: true },
  });
  res.json(data);
});

tasksRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.task.create({ data: req.body, include: { project: true } });
  res.status(201).json(data);
});

tasksRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.task.update({ where: { id: req.params.id }, data: req.body, include: { project: true } });
  res.json(data);
});

tasksRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Work Logs
workLogsRouter.get("/", async (req: Request, res: Response) => {
  const { projectId, taskId } = req.query;
  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId as string;
  if (taskId) where.taskId = taskId as string;
  const data = await prisma.workLog.findMany({
    where,
    orderBy: { date: "desc" },
    include: { project: true, task: true },
  });
  res.json(data);
});

workLogsRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.workLog.create({ data: req.body, include: { project: true, task: true } });
  res.status(201).json(data);
});

workLogsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.workLog.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
