import { Elysia } from "elysia";

const widgetProfiles = new Elysia()
  // Add your widget profile routes here
  .get(
    "/widget-profiles",
    () => {
      // Your logic here
    },
    {
      detail: {
        summary: "Get Widget Profiles",
        tags: ["Widget Profiles"],
      },
    }
  );

export default widgetProfiles;
