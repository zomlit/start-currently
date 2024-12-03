import { Elysia, t } from "elysia";
import { prisma } from "../db";

const bracketRoutes = new Elysia().group("/brackets", (app) =>
  app
    .delete(
      "/:bracketId",
      async ({ params, set }) => {
        console.log("DELETE method called for bracketId:", params.bracketId);

        try {
          await prisma.bracket.delete({
            where: { id: params.bracketId },
          });
          return { success: true, message: "Bracket deleted successfully" };
        } catch (error) {
          console.error("Error deleting bracket:", error);
          set.status = 500;
          return { success: false, error: "Failed to delete bracket" };
        }
      },
      {
        detail: {
          summary: "Delete Bracket",
          tags: ["Tournament"],
        },
      }
    )
    .get(
      "/:bracketId",
      async ({ params, set }) => {
        if (!params.bracketId) {
          set.status = 400;
          return { success: false, error: "No bracketId provided" };
        }

        try {
          console.log("Fetching bracket with ID:", params.bracketId);
          const bracket = await prisma.bracket.findUnique({
            where: { id: params.bracketId },
          });

          if (!bracket) {
            set.status = 404;
            return { success: false, error: "Bracket not found" };
          }

          console.log("Bracket found:", bracket);
          return { success: true, data: bracket };
        } catch (error) {
          console.error("Error fetching bracket:", error);
          set.status = 500;
          return { success: false, error: "Failed to fetch bracket" };
        }
      },
      {
        detail: {
          summary: "Get Bracket",
          tags: ["Tournament"],
        },
      }
    )
    .put(
      "/:bracketId",
      async ({ params, body, set }) => {
        try {
          const updatedBracket = await prisma.bracket.update({
            where: { id: params.bracketId },
            data: body,
          });

          return { success: true, data: updatedBracket };
        } catch (error) {
          console.error("Error updating bracket:", error);
          set.status = 500;
          return { success: false, error: "Failed to update bracket" };
        }
      },
      {
        body: t.Object({
          name: t.Optional(t.String()),
          data: t.Optional(t.Any()),
        }),
        detail: {
          summary: "Update Bracket",
          tags: ["Tournament"],
        },
      }
    )
);

export default bracketRoutes;
