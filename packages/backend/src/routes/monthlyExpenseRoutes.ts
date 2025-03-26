import { Router, Request, Response } from 'express';
import { monthlyExpenseSchema } from '@budget-tracker/common';
import {
  createMonthlyExpense,
  getMonthlyExpense,
  getMonthlyExpenses,
} from '../services/monthlyExpenseService';

const router = Router();

router.post('/month-expense', async (req: Request, res: Response) => {
  try {
    console.log('create monthly expense');
    const data = monthlyExpenseSchema.parse(req.body);
    const userId = (req as any).user.id;
    const monthlyExpense = await createMonthlyExpense(data, userId);
    res.status(201).json(monthlyExpense);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/monthly-expense', async (req: Request, res: Response) => {
  try {
    console.log('get one');
    const { id, userId } = req.body;
    console.log('req', req.body);
    const monthlyExpense = await getMonthlyExpense(id, userId);
    res.json(monthlyExpense);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

router.get('/monthly-expenses', async (req: Request, res: Response) => {
  try {
    console.log('get all');
    //get the user id from token
    // req.header.
    const monthlyExpense = await getMonthlyExpenses('1');
    res.json(monthlyExpense);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

export default router;
