import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const data = await prisma.account.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
  const data = await prisma.account.findUnique({
    where: { id: req.params.id },
    include: { transactions: { orderBy: { date: "desc" }, take: 20 } },
  });
  data ? res.json(data) : res.status(404).json({ error: "Not found" });
});

router.post("/", async (req: Request, res: Response) => {
  const data = await prisma.account.create({ data: req.body });
  res.status(201).json(data);
});

router.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.account.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.account.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
