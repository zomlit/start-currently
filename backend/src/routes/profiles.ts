import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { authMiddleware } from "../middleware/authMiddleware";
import logger from "../utils/logger";

// Define the settings schema
const specificSettingsSchema = t.Object({
  selectedSkin: t.String(),
  hideOnDisabled: t.Boolean(),
  pauseEnabled: t.Boolean(),
  canvasEnabled: t.Boolean(),
  backgroundCanvas: t.Boolean(),
  backgroundCanvasOpacity: t.Number(),
  micEnabled: t.Boolean(),
  progressBarForegroundColor: t.String(),
  progressBarBackgroundColor: t.String(),
  mode: t.Number(),
  gradient: t.String(),
  fillAlpha: t.Number(),
  lineWidth: t.Number(),
  channelLayout: t.String(),
  frequencyScale: t.String(),
  linearAmplitude: t.Boolean(),
  linearBoost: t.Number(),
  showPeaks: t.Boolean(),
  outlineBars: t.Boolean(),
  weightingFilter: t.String(),
  barSpace: t.Number(),
  ledBars: t.Boolean(),
  lumiBars: t.Boolean(),
  reflexRatio: t.Number(),
  reflexAlpha: t.Number(),
  reflexBright: t.Number(),
  mirror: t.Number(),
  splitGradient: t.Boolean(),
  roundBars: t.Boolean(),
});

const settingsSchema = t.Object({
  specificSettings: specificSettingsSchema,
  commonSettings: t.Object({}),
});

const profiles = new Elysia({ prefix: "/profiles" }).use(authMiddleware).post(
  "/:sectionId/create-default",
  async ({ params, body, store }) => {
    const { sectionId } = params;
    const { name, settings } = body as {
      name: string;
      settings: {
        specificSettings: Record<string, any>;
        commonSettings: Record<string, any>;
      };
    };

    if (!store.userId) {
      throw new Error("Unauthorized");
    }

    try {
      logger.info(
        `Creating profile with data: ${JSON.stringify(
          { name, settings },
          null,
          2
        )}`
      );

      const profile = await prisma.profile.create({
        data: {
          name,
          user_id: store.userId,
          section_id: sectionId,
          settings,
          is_default: true,
        },
      });

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      logger.error(`Error creating default profile: ${error}`);
      throw error;
    }
  },
  {
    params: t.Object({
      sectionId: t.String(),
    }),
    body: t.Object({
      name: t.String(),
      settings: settingsSchema,
    }),
    detail: {
      summary: "Create Default Profile",
      tags: ["Profiles"],
    },
  }
);

export default profiles;
