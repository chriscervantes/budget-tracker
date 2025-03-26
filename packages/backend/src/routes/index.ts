import { Router } from 'express';
import expenseRoutes from './expenseRoutes';
import monthlyExpenseRoutes from './monthlyExpenseRoutes';
import { syncUser } from '../middleware/syncUser';
import { userSchema } from '@budget-tracker/common';

const router = Router();

// router.use(syncUser); // Apply user sync to all routes
router.use(expenseRoutes);
router.use(monthlyExpenseRoutes);

// Optional: Keep local registration for testing (remove in production)
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const data = userSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password ?? '', 10);

    console.log('data', data);
    const user = await prisma.user.create({
      data: {
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        mobile: data.mobile,
        email: data.email,
        password: hashedPassword,
        auth0Id: 'local|' + data.email,
      },
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
