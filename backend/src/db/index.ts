// src/db/index.ts

import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()

export * from "@prisma/client"