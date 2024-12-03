import { Elysia } from "elysia";

const userCommands = new Elysia()
  .get(
    "/user-commands",
    () => {
      // Your logic here
    },
    {
      detail: {
        summary: "Get User Commands",
        tags: ["Commands"],
        description: "Retrieves the list of user commands",
      },
    }
  )
  .post(
    "/",
    () => {
      // Your logic here
    },
    {
      detail: {
        summary: "Create User Command",
        tags: ["Commands"],
        description: "Creates a new user command",
      },
    }
  );

// Add swagger metadata
userCommands.meta = {
  name: "User Commands",
  tags: ["Commands"],
};

export default userCommands;
