import { prisma } from "./index";

export async function updateUserTestField({
  userId,
  testField,
}: {
  userId: string;
  testField: string;
}) {
  return await prisma.user.update({
    where: { id: userId },
    data: { testField },
  });
}
