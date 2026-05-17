import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { accountId, type, startDate, endDate } = req.query;
  const where: Record<string, unknown> = {};
  if (accountId) where.accountId = accountId as string;
  if (type) where.type = type as string;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate as string);
    if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate as string);
  }
  const data = await prisma.transaction.findMany({ where, orderBy: { date: "desc" }, include: { account: true } });
  res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
  const data = await prisma.transaction.findUnique({ where: { id: req.params.id }, include: { account: true } });
  data ? res.json(data) : res.status(404).json({ error: "Not found" });
});

router.post("/", async (req: Request, res: Response) => {
  const data = await prisma.transaction.create({ data: req.body, include: { account: true } });
  const delta = req.body.type === "income" ? req.body.amount : -req.body.amount;
  await prisma.account.update({ where: { id: req.body.accountId }, data: { balance: { increment: delta } } });
  res.status(201).json(data);
});

router.put("/:id", async (req: Request, res: Response) => {
  const old = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!old) return res.status(404).json({ error: "Not found" });
  const data = await prisma.transaction.update({ where: { id: req.params.id }, data: req.body, include: { account: true } });
  const oldDelta = old.type === "income" ? -old.amount : old.amount;
  await prisma.account.update({ where: { id: old.accountId }, data: { balance: { increment: oldDelta } } });
  const newDelta = req.body.type === "income" ? req.body.amount : -req.body.amount;
  await prisma.account.update({ where: { id: req.body.accountId }, data: { balance: { increment: newDelta } } });
  res.json(data);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const old = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!old) return res.status(404).json({ error: "Not found" });
  await prisma.transaction.delete({ where: { id: req.params.id } });
  const delta = old.type === "income" ? -old.amount : old.amount;
  await prisma.account.update({ where: { id: old.accountId }, data: { balance: { increment: delta } } });
  res.json({ success: true });
});

export default router;
