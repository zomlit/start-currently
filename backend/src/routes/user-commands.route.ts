import { Elysia, t } from "elysia";
import { CommandManagerService } from "../services/command-manager.service";

const commandManager = new CommandManagerService();

const userCommandsRoute = new Elysia()
  .post(
    "/user-commands",
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
      detail: {
        summary: "Get User Commands",
        tags: ["Commands"],
      },
    }
  )
  .get(
    "/user-commands/:userId",
    async ({ params }) => {
      const commands = await commandManager.listCommands(params.userId);
      return { success: true, commands };
    },
    {
      detail: {
        summary: "Get User Commands",
        tags: ["Commands"],
      },
    }
  )
  .put(
    "/user-commands/:id/:userId",
    async ({ params, body }) => {
      const command = await commandManager.updateCommand(
        BigInt(params.id),
        params.userId,
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
      detail: {
        summary: "Update User Command",
        tags: ["Commands"],
      },
    }
  )
  .delete(
    "/user-commands/:id/:userId",
    async ({ params }) => {
      await commandManager.deleteCommand(BigInt(params.id), params.userId);
      return { success: true, message: "Command deleted" };
    },
    {
      detail: {
        summary: "Delete User Command",
        tags: ["Commands"],
      },
    }
  );

export default userCommandsRoute;
