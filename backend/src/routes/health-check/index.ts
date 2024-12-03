import os from "node:os";
import type { ElysiaApp } from "../../index";

export default (app: ElysiaApp) => {
  return app
    .get("/", () => ({ status: "ok" }))
    .get("/info", () => {
      const cpuUsage = process.cpuUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();

      return {
        cpuUsage,
        totalMemory,
        freeMemory,
      };
    });
};
