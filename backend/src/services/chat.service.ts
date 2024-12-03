import { prisma } from "../db";

export async function saveChatMessage(message: any) {
  try {
    await prisma.chatMessage.create({
      data: {
        platform: message.platform,
        channel: message.channel,
        username: message.username,
        message: message.message,
        color: message.color,
        badges: message.badges,
        emotes: message.emotes,
        userStatus: message.userStatus,
        avatar: message.avatar,
      },
    });
  } catch (error) {
    console.error("Error saving chat message to database:", error);
  }
}
