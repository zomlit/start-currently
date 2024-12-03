import { Elysia, t } from "elysia";
import { prisma } from "../../db";
import logger from "../../utils/logger";
import { createAuthService } from "../../types/auth";

export default (app: Elysia) =>
  app
    .use(createAuthService())
    .get(
      "/profiles/:sectionId",
      async ({ params, Auth, set }) => {
        const { sectionId } = params;
        const { user: userId } = Auth;

        if (!userId) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        try {
          logger.info(`Fetching ${sectionId} profiles for user ${userId}`);

          const profiles = await prisma.sectionProfiles.findMany({
            where: {
              user_id: userId,
              section_id: sectionId,
            },
            orderBy: {
              created_at: "asc",
            },
          });

          return profiles;
        } catch (error) {
          logger.error(`Error fetching profiles:`, error);
          set.status = 500;
          return { error: "Failed to fetch profiles" };
        }
      },
      {
        params: t.Object({
          sectionId: t.String(),
        }),
        detail: {
          tags: ["Profile"],
          summary: "Get User Profiles",
          description: "Get profiles for a specific section",
        },
      }
    )
    .get(
      "/profiles/:sectionId/:profileId",
      async ({ params, Auth, set }) => {
        const { sectionId, profileId } = params;
        const { user: userId } = Auth;

        if (!userId) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        try {
          logger.info(
            `Fetching profile ${profileId} in section ${sectionId} for user ${userId}`
          );

          const profile = await prisma.sectionProfiles.findFirst({
            where: {
              id: profileId,
              user_id: userId,
              section_id: sectionId,
            },
          });

          if (!profile) {
            set.status = 404;
            return { error: "Profile not found" };
          }

          return profile;
        } catch (error) {
          logger.error(`Error fetching profile:`, error);
          set.status = 500;
          return { error: "Failed to fetch profile" };
        }
      },
      {
        params: t.Object({
          sectionId: t.String(),
          profileId: t.String(),
        }),
        detail: {
          tags: ["Profile"],
          summary: "Get Single Profile",
          description: "Get a specific profile by ID",
        },
      }
    );
