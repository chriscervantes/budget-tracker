import { Router, Request, Response } from "express";
import { expenseSchema } from "@budget-tracker/common";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = expenseSchema.parse(req.body);
    const expense = await createExpense(data);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = expenseSchema.partial().parse(req.body);
    const expense = await updateExpense(id, data);
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteExpense(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
