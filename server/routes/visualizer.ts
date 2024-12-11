import { Elysia } from "elysia";
import { auth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import type { ApiContext } from "@currently/shared/types/api";
import { visualizerProfileSchema } from "@currently/shared/schemas/visualizer";

export const visualizerRoutes = new Elysia()
  .use(auth)
  .group("/api/visualizer/profiles", (app) =>
    app
      .get("/", async ({ user }: ApiContext) => ({
        data: await prisma.visualizerProfile.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
        }),
      }))
      .post("/", async ({ body, user }: ApiContext) => {
        const data = visualizerProfileSchema.parse(body);
        return await prisma.visualizerProfile.create({
          data: { ...data, userId: user.id },
        });
      })
      .put("/:id", async ({ params: { id }, body, user }: ApiContext) => {
        const data = visualizerProfileSchema.parse(body);
        return await prisma.visualizerProfile.update({
          where: { id, userId: user.id },
          data,
        });
      })
      .delete("/:id", async ({ params: { id }, user }: ApiContext) => {
        return await prisma.visualizerProfile.delete({
          where: { id, userId: user.id },
        });
      })
  );
