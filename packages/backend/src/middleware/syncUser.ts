import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth0Id = randomUUID(); //(req as any).auth.sub;
  const { firstName, lastName, mobile, email, password } = req.body;
  let user = await prisma.user.findUnique({ where: { auth0Id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        mobile,
        password,
        auth0Id,
        email, //(req as any).auth.payload.email || `${auth0Id}@example.com`,
      },
    });
  }

  (req as any).user = user;
  next();
};
