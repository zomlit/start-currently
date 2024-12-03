import { Elysia, t } from "elysia";
import { prisma } from "../db";

const bracketsRoutes = new Elysia().group("/brackets", (app) =>
  app
    .post(
      "/",
      async ({ body, set }) => {
        const { name, data, user_id } = body;

        try {
          console.log("Creating bracket with data:", {
            user_id,
            name,
            data,
          });
          const bracket = await prisma.bracket.create({
            data: {
              owner_id: user_id,
              name,
              data,
              user_id,
              updated_at: new Date(),
            },
          });
          console.log("Bracket created successfully:", bracket);
          return { success: true, data: bracket };
        } catch (error) {
          console.error("Error creating bracket:", error);
          set.status = 500;
          return { success: false, error: "Failed to create bracket" };
        }
      },
      {
        body: t.Object({
          name: t.String(),
          data: t.Any(),
          user_id: t.String(),
        }),
      }
    )
    .get("/", async ({ query, set }) => {
      console.log("GET /brackets/ endpoint hit. Query params:", query);
      const { user_id } = query;
      if (!user_id) {
        console.warn("GET /brackets/ called without user_id");
        set.status = 400;
        return { success: false, error: "User ID is required" };
      }

      try {
        console.log(`Fetching brackets for user_id: ${user_id}`);
        const brackets = await prisma.bracket.findMany({
          where: { user_id },
          select: { id: true, name: true, created_at: true },
          orderBy: { created_at: "desc" },
        });
        console.log(
          `Found ${brackets.length} brackets for user_id: ${user_id}`
        );
        return { success: true, data: brackets };
      } catch (error) {
        console.error("Error fetching brackets:", error);
        set.status = 500;
        return { success: false, error: "Failed to fetch brackets" };
      }
    })
);

export default bracketsRoutes;
