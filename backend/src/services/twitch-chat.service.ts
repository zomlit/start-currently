import { prisma } from "../db";

export async function fetchTwitchChatDataById(id: string) {
  try {
    const chatData = await prisma.twitchChatData.findUnique({
      where: { id },
    });

    if (!chatData) {
      throw new Error("Twitch chat data not found");
    }

    return chatData;
  } catch (error) {
    console.error("Error fetching Twitch chat data:", error);
    throw error;
  }
}
