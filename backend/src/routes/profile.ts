import { Elysia, t } from "elysia";
import { prisma } from "../db";
import logger from "../utils/logger";
import { createAuthService } from "../types/auth";
import jwt from "jsonwebtoken";

type ProfileSettings = Record<string, any>;

interface CreateDefaultProfileBody {
  settings: {
    name: string;
    isDefault: boolean;
    common: {
      backgroundColor: string;
      padding: number;
      showBorders: boolean;
    };
    sectionSpecific: {
      fontSize: number;
      chartType: string;
    };
  };
}

export const profileRoutes = new Elysia({ prefix: "/profiles" })
  .use(createAuthService())
  .get("/visualizer", async ({ headers, set }) => {
    const token = headers.authorization?.split(" ")[1];
    logger.info("Visualizer request headers:", { headers });

    if (!token) {
      set.status = 401;
      return { success: false, error: "No token provided" };
    }

    try {
      // Decode the JWT token
      const decoded = jwt.verify(
        token,
        process.env.CLERK_JWT_VERIFICATION_KEY as string
      ) as any;
      const userId = decoded.sub;

      if (!userId) {
        set.status = 401;
        return { success: false, error: "Invalid token" };
      }

      logger.info(`Fetching visualizer profiles for user ${userId}`);

      const visualizerProfiles = await prisma.sectionProfiles.findMany({
        where: {
          section_id: "visualizer",
          user_id: userId,
        },
        orderBy: {
          created_at: "asc",
        },
      });

      logger.info(`Found ${visualizerProfiles.length} profiles`);
      return { success: true, data: visualizerProfiles };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.error("JWT verification failed:", error);
        set.status = 401;
        return { success: false, error: "Invalid token" };
      }

      logger.error("Error fetching visualizer profiles:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      set.status = 500;
      return { success: false, error: "Failed to fetch visualizer profiles" };
    }
  })
  .get("/:sectionId", async ({ params, query, Auth, set }) => {
    const { user: userId } = Auth;
    logger.info("Received request to get or create profile:", {
      params,
      query,
      userId,
    });

    try {
      const { user_id } = query;

      if (!user_id) {
        set.status = 400;
        return { success: false, error: "user_id is required" };
      }

      // Verify that the authenticated user matches the requested user_id
      if (userId !== user_id) {
        set.status = 401;
        return { success: false, error: "Unauthorized access" };
      }

      let profile = await prisma.sectionProfiles.findFirst({
        where: {
          section_id: params.sectionId,
          user_id: user_id as string,
        },
      });

      if (!profile) {
        // If profile doesn't exist, create a default one
        profile = await prisma.sectionProfiles.create({
          data: {
            section_id: params.sectionId,
            name: "Default Profile",
            settings: {},
            user_id: user_id as string,
          },
        });
      }

      return { success: true, data: profile };
    } catch (error) {
      logger.error("Error getting or creating profile:", error);
      set.status = 500;
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get or create profile",
      };
    }
  })
  .get(
    "/:sectionId/:profileId",
    async ({
      params,
    }: {
      params: { sectionId: string; profileId: string };
    }) => {
      const profile = await prisma.sectionProfiles.findUnique({
        where: { id: params.profileId },
      });
      if (!profile || profile.section_id !== params.sectionId) {
        throw new Error("Profile not found");
      }
      return profile;
    }
  )
  .put(
    "/:id",
    async ({
      params,
      body,
    }: {
      params: { id: string };
      body: { name: string; settings: ProfileSettings };
    }) => {
      const updatedProfile = await prisma.sectionProfiles.update({
        where: { id: params.id },
        data: {
          name: body.name,
          settings: body.settings,
        },
      });
      return updatedProfile;
    }
  )
  .post("/copy", async ({ body }: { body: { id: string; name: string } }) => {
    const { id, ...profileData } = body;
    const originalProfile = await prisma.sectionProfiles.findUnique({
      where: { id },
    });
    if (!originalProfile) {
      throw new Error("Original profile not found");
    }
    const copiedProfile = await prisma.sectionProfiles.create({
      data: {
        name: `${originalProfile.name} (Copy)`,
        user_id: originalProfile.user_id,
        section_id: originalProfile.section_id,
        is_default: false,
        created_at: new Date(),
      },
    });
    return copiedProfile;
  })
  .put("/:id/set-default", async ({ params }: { params: { id: string } }) => {
    const profile = await prisma.sectionProfiles.findUnique({
      where: { id: params.id },
    });
    if (!profile) {
      throw new Error("Profile not found");
    }

    // First, unset default for all profiles in the same section
    await prisma.sectionProfiles.updateMany({
      where: {
        section_id: profile.section_id,
        user_id: profile.user_id,
      },
      data: {
        settings: {
          ...(profile.settings as ProfileSettings),
          is_default: false,
        },
      },
    });

    // Then set the specified profile as default
    const updatedProfile = await prisma.sectionProfiles.update({
      where: { id: params.id },
      data: {
        settings: {
          ...(profile.settings as ProfileSettings),
          is_default: true,
        },
      },
    });
    return updatedProfile;
  })
  .delete("/:id", async ({ params }: { params: { id: string } }) => {
    await prisma.sectionProfiles.delete({
      where: { id: params.id },
    });
    return { success: true, message: "Profile deleted successfully" };
  })
  .post("/:sectionId/create-default", async ({ params, body, Auth, set }) => {
    const { user: userId } = Auth;
    const typedBody = body as CreateDefaultProfileBody;

    if (!userId) {
      set.status = 401;
      return { success: false, error: "Unauthorized" };
    }

    logger.info("Received create-default request:", {
      params,
      body: typedBody,
      userId,
    });

    try {
      if (!typedBody.settings || Object.keys(typedBody.settings).length === 0) {
        logger.error("Received empty or invalid request body");
        set.status = 400;
        return {
          success: false,
          error: "Empty or invalid request body",
        };
      }

      const { settings } = typedBody;

      if (!settings.name) {
        logger.error("Missing required fields:", { settings });
        set.status = 400;
        return {
          success: false,
          error: "Missing required fields",
          details: { settings },
        };
      }

      const defaultProfile = {
        section_id: params.sectionId,
        name: settings.name,
        settings: settings,
        user_id: userId,
      };

      logger.info("Creating profile with data:", defaultProfile);

      const createdProfile = await prisma.sectionProfiles.create({
        data: defaultProfile,
      });

      logger.info("Profile created successfully:", createdProfile);
      return { success: true, data: createdProfile };
    } catch (error) {
      logger.error("Error creating default profile:", error);
      set.status = 500;
      return {
        success: false,
        error: "Failed to create default profile",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  });

export default profileRoutes;
