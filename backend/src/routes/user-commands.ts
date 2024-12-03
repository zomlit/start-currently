import { Elysia, t } from "elysia";
import { CommandManagerService } from "../services/command-manager.service";

const commandManager = new CommandManagerService();

const userCommandsRoutes = new Elysia({ prefix: "/api/user-commands" })
  .post(
    "/",
    async ({ body }) => {
      const command = await commandManager.createCommand(body);
      return { success: true, command };
    },
    {
      body: t.Object({
        c_name: t.String(),
        c_command: t.String(),
        c_start: t.Boolean(),
        c_exact: t.Boolean(),
        c_anywhere: t.Boolean(),
        c_enabled: t.Boolean(),
        c_roles: t.Optional(t.Any()),
        c_user_cooldown: t.Optional(t.Number()),
        c_global_cooldown: t.Optional(t.Number()),
        c_category: t.Optional(t.String()),
        c_placement: t.Optional(t.String()),
      }),
    }
  )
  .get("/:id", async ({ params }) => {
    const commands = await commandManager.listCommands(params.id);
    return { success: true, commands };
  })
  .put(
    "/:id/:commandId",
    async ({ params, body }) => {
      const command = await commandManager.updateCommand(
        BigInt(params.commandId),
        params.id,
        body
      );
      return { success: true, command };
    },
    {
      body: t.Partial(
        t.Object({
          c_name: t.String(),
          c_command: t.String(),
          c_start: t.Boolean(),
          c_exact: t.Boolean(),
          c_anywhere: t.Boolean(),
          c_enabled: t.Boolean(),
          c_roles: t.Any(),
          c_user_cooldown: t.Number(),
          c_global_cooldown: t.Number(),
          c_category: t.String(),
          c_placement: t.String(),
        })
      ),
    }
  )
  .delete("/:id/:commandId", async ({ params }) => {
    await commandManager.deleteCommand(BigInt(params.commandId), params.id);
    return { success: true, message: "Command deleted" };
  });

export default userCommandsRoutes;
