import { prisma } from "../db";
import logger from "../utils/logger";

// Add this diagnostic function
async function diagnoseUserProfile(userId: string) {
  try {
    // Try different query approaches
    const rawQuery = await prisma.$queryRaw`
      SELECT is_active, last_activity, s_expires_at 
      FROM "UserProfile" 
      WHERE user_id = ${userId}`;

    logger.info(`Raw SQL query result:`, {
      userId,
      rawQuery: JSON.stringify(rawQuery, null, 2),
    });

    const directQuery = await prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    logger.info(`Direct Prisma query result:`, {
      userId,
      directQuery: JSON.stringify(directQuery, null, 2),
    });

    return { rawQuery, directQuery };
  } catch (error) {
    logger.error(`Database diagnosis error:`, {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Add this function to force update the active status
async function forceUpdateActiveStatus(userId: string) {
  try {
    // Force update using raw SQL
    await prisma.$executeRaw`
      UPDATE "UserProfile" 
      SET is_active = true,
          last_activity = NOW(),
          s_expires_at = NOW() + INTERVAL '1 hour'
      WHERE user_id = ${userId}`;

    // Verify the update with proper typing
    const after = await prisma.$queryRaw<
      Array<{
        is_active: boolean;
        last_activity: Date | null;
        s_expires_at: Date | null;
      }>
    >`
      SELECT is_active, last_activity, s_expires_at 
      FROM "UserProfile" 
      WHERE user_id = ${userId}`;

    // Now TypeScript knows the shape of 'after'
    if (!after[0]?.is_active) {
      logger.warn(`Force update may have failed:`, {
        userId,
        state: after,
      });
    }

    return after;
  } catch (error) {
    logger.error(`Force update failed:`, {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  await forceUpdateActiveStatus(userId);

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: userId },
    select: {
      is_active: true,
      last_activity: true,
      s_expires_at: true,
    },
  });

  return {
    is_active: profile?.is_active ?? false,
    last_activity: profile?.last_activity,
    s_expires_at: profile?.s_expires_at,
  };
}

export async function updateUserActivity(userId: string) {
  const now = new Date();
  return await prisma.$transaction(async (tx) => {
    return tx.userProfile.update({
      where: { user_id: userId },
      data: {
        is_active: true,
        last_activity: now,
        s_expires_at: new Date(now.getTime() + 3600 * 1000),
      },
    });
  });
}
