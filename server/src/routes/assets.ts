import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

export const assetsRouter = Router();

function getRouter(req: Request) {
  const path = req.path;
  if (path.startsWith("/transactions") || req.baseUrl.includes("transactions")) {
    return "transactions";
  }
  if (path.startsWith("/budgets") || req.baseUrl.includes("budgets")) {
    return "budgets";
  }
  return "accounts";
}

// --- Transactions ---

const transactions = Router();

transactions.get("/", async (_req, res: Response) => {
  const { accountId, type, startDate, endDate } = _req.query;
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

transactions.get("/:id", async (req: Request, res: Response) => {
  const data = await prisma.transaction.findUnique({ where: { id: req.params.id }, include: { account: true } });
  data ? res.json(data) : res.status(404).json({ error: "Not found" });
});

transactions.post("/", async (req: Request, res: Response) => {
  const data = await prisma.transaction.create({ data: req.body, include: { account: true } });

  // Update account balance
  const delta = req.body.type === "income" ? req.body.amount : -req.body.amount;
  await prisma.account.update({ where: { id: req.body.accountId }, data: { balance: { increment: delta } } });

  res.status(201).json(data);
});

transactions.put("/:id", async (req: Request, res: Response) => {
  const old = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!old) return res.status(404).json({ error: "Not found" });

  const data = await prisma.transaction.update({ where: { id: req.params.id }, data: req.body, include: { account: true } });

  // Revert old balance impact
  const oldDelta = old.type === "income" ? -old.amount : old.amount;
  await prisma.account.update({ where: { id: old.accountId }, data: { balance: { increment: oldDelta } } });

  // Apply new balance impact
  const newDelta = req.body.type === "income" ? req.body.amount : -req.body.amount;
  await prisma.account.update({ where: { id: req.body.accountId }, data: { balance: { increment: newDelta } } });

  res.json(data);
});

transactions.delete("/:id", async (req: Request, res: Response) => {
  const old = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!old) return res.status(404).json({ error: "Not found" });

  await prisma.transaction.delete({ where: { id: req.params.id } });

  const delta = old.type === "income" ? -old.amount : old.amount;
  await prisma.account.update({ where: { id: old.accountId }, data: { balance: { increment: delta } } });

  res.json({ success: true });
});

// --- Accounts ---

const accounts = Router();

accounts.get("/", async (_req, res: Response) => {
  const data = await prisma.account.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

accounts.get("/:id", async (req: Request, res: Response) => {
  const data = await prisma.account.findUnique({ where: { id: req.params.id }, include: { transactions: { orderBy: { date: "desc" }, take: 20 } } });
  data ? res.json(data) : res.status(404).json({ error: "Not found" });
});

accounts.post("/", async (req: Request, res: Response) => {
  const data = await prisma.account.create({ data: req.body });
  res.status(201).json(data);
});

accounts.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.account.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

accounts.delete("/:id", async (req: Request, res: Response) => {
  await prisma.account.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Budgets ---

const budgets = Router();

budgets.get("/", async (_req, res: Response) => {
  const data = await prisma.budget.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

budgets.post("/", async (req: Request, res: Response) => {
  const data = await prisma.budget.create({ data: req.body });
  res.status(201).json(data);
});

budgets.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.budget.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

budgets.delete("/:id", async (req: Request, res: Response) => {
  await prisma.budget.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Mount sub-routers
// Express routes need careful mounting, using the baseUrl to route
assetsRouter.get("/", async (req: Request, res: Response) => {
  const path = req.baseUrl;
  if (path === "/api/accounts") {
    return accounts.get.name !== "bound accounts.get" ? accounts(req, res) : res.json(await prisma.account.findMany({ orderBy: { createdAt: "desc" } }));
  }
  if (path === "/api/transactions") {
    const { accountId, type, startDate, endDate } = req.query;
    const where: Record<string, unknown> = {};
    if (accountId) where.accountId = accountId as string;
    if (type) where.type = type as string;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate as string);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate as string);
    }
    return res.json(await prisma.transaction.findMany({ where, orderBy: { date: "desc" }, include: { account: true } }));
  }
  if (path === "/api/budgets") {
    return res.json(await prisma.budget.findMany({ orderBy: { createdAt: "desc" } }));
  }
  res.json([]);
});

assetsRouter.post("/", async (req: Request, res: Response) => {
  const path = req.baseUrl;
  if (path === "/api/accounts") {
    const data = await prisma.account.create({ data: req.body });
    return res.status(201).json(data);
  }
  if (path === "/api/transactions") {
    const data = await prisma.transaction.create({ data: req.body, include: { account: true } });
    const delta = req.body.type === "income" ? req.body.amount : -req.body.amount;
    await prisma.account.update({ where: { id: req.body.accountId }, data: { balance: { increment: delta } } });
    return res.status(201).json(data);
  }
  if (path === "/api/budgets") {
    const data = await prisma.budget.create({ data: req.body });
    return res.status(201).json(data);
  }
  res.status(400).json({ error: "Unknown resource" });
});

assetsRouter.put("/:id", async (req: Request, res: Response) => {
  const path = req.baseUrl;
  if (path === "/api/accounts") {
    const data = await prisma.account.update({ where: { id: req.params.id }, data: req.body });
    return res.json(data);
  }
  if (path === "/api/transactions") {
    const old = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!old) return res.status(404).json({ error: "Not found" });
    const data = await prisma.transaction.update({ where: { id: req.params.id }, data: req.body, include: { account: true } });
    const oldDelta = old.type === "income" ? -old.amount : old.amount;
    await prisma.account.update({ where: { id: old.accountId }, data: { balance: { increment: oldDelta } } });
    const newDelta = req.body.type === "income" ? req.body.amount : -req.body.amount;
    await prisma.account.update({ where: { id: req.body.accountId }, data: { balance: { increment: newDelta } } });
    return res.json(data);
  }
  if (path === "/api/budgets") {
    const data = await prisma.budget.update({ where: { id: req.params.id }, data: req.body });
    return res.json(data);
  }
  res.status(400).json({ error: "Unknown resource" });
});

assetsRouter.delete("/:id", async (req: Request, res: Response) => {
  const path = req.baseUrl;
  if (path === "/api/accounts") {
    await prisma.account.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  }
  if (path === "/api/transactions") {
    const old = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!old) return res.status(404).json({ error: "Not found" });
    await prisma.transaction.delete({ where: { id: req.params.id } });
    const delta = old.type === "income" ? -old.amount : old.amount;
    await prisma.account.update({ where: { id: old.accountId }, data: { balance: { increment: delta } } });
    return res.json({ success: true });
  }
  if (path === "/api/budgets") {
    await prisma.budget.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  }
  res.status(400).json({ error: "Unknown resource" });
});

assetsRouter.get("/:id", async (req: Request, res: Response) => {
  const path = req.baseUrl;
  if (path === "/api/accounts") {
    const data = await prisma.account.findUnique({ where: { id: req.params.id }, include: { transactions: { orderBy: { date: "desc" }, take: 20 } } });
    return data ? res.json(data) : res.status(404).json({ error: "Not found" });
  }
  if (path === "/api/transactions") {
    const data = await prisma.transaction.findUnique({ where: { id: req.params.id }, include: { account: true } });
    return data ? res.json(data) : res.status(404).json({ error: "Not found" });
  }
  res.status(404).json({ error: "Not found" });
});
