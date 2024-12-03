import { PrismaClient, user_commands } from "@prisma/client";

export class CommandManagerService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCommand(
    command: Omit<user_commands, "id" | "created_at" | "user_id">
  ): Promise<user_commands> {
    return this.prisma.user_commands.create({
      data: command,
    });
  }

  async getCommand(id: bigint, userId: string): Promise<user_commands | null> {
    return this.prisma.user_commands.findUnique({
      where: {
        id_user_id: {
          id,
          user_id: userId,
        },
      },
    });
  }

  async updateCommand(
    id: bigint,
    userId: string,
    data: Partial<Omit<user_commands, "id" | "created_at" | "user_id">>
  ): Promise<user_commands> {
    return this.prisma.user_commands.update({
      where: {
        id_user_id: {
          id,
          user_id: userId,
        },
      },
      data,
    });
  }

  async deleteCommand(id: bigint, userId: string): Promise<void> {
    await this.prisma.user_commands.delete({
      where: {
        id_user_id: {
          id,
          user_id: userId,
        },
      },
    });
  }

  async listCommands(userId: string): Promise<user_commands[]> {
    return this.prisma.user_commands.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  // Additional methods for filtering and advanced queries can be added here
}
