import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const data = await prisma.budget.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

router.post("/", async (req: Request, res: Response) => {
  const data = await prisma.budget.create({ data: req.body });
  res.status(201).json(data);
});

router.put("/:id", async (req: Request, res: Response) => {
  const data = await prisma.budget.update({ where: { id: req.params.id }, data: req.body });
  res.json(data);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.budget.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
