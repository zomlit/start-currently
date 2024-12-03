import { Elysia } from "elysia";
import { prisma } from "../db";

const userDataRoutes = new Elysia({ prefix: "/api/user-data" }).get(
  "/:id",
  async ({ params: { id } }) => {
    try {
      const userData = await prisma.userProfile.findUnique({
        where: { user_id: id },
      });
      if (!userData) {
        return { success: false, error: "User not found" };
      }
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

export default userDataRoutes;
