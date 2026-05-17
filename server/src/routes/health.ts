import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

export const bodyRecordsRouter = Router();
export const exerciseRecordsRouter = Router();

bodyRecordsRouter.get("/", async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate as string);
    if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate as string);
  }
  const data = await prisma.bodyRecord.findMany({ where, orderBy: { date: "desc" } });
  res.json(data);
});

bodyRecordsRouter.post("/", async (req: Request, res: Response) => {
  if (req.body.weight && req.body.height) {
    const h = (req.body.height as number) / 100;
    req.body.bmi = Math.round(((req.body.weight as number) / (h * h)) * 10) / 10;
  }
  const data = await prisma.bodyRecord.create({ data: req.body });
  res.status(201).json(data);
});

bodyRecordsRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.bodyRecord.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

bodyRecordsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.bodyRecord.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

exerciseRecordsRouter.get("/", async (req: Request, res: Response) => {
  const { startDate, endDate, type } = req.query;
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate as string);
    if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate as string);
  }
  if (type) where.type = type as string;
  const data = await prisma.exerciseRecord.findMany({ where, orderBy: { date: "desc" } });
  res.json(data);
});

exerciseRecordsRouter.post("/", async (req: Request, res: Response) => {
  const data = await prisma.exerciseRecord.create({ data: req.body });
  res.status(201).json(data);
});

exerciseRecordsRouter.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.exerciseRecord.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

exerciseRecordsRouter.delete("/:id", async (req: Request, res: Response) => {
  await prisma.exerciseRecord.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
