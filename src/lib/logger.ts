import prisma from "@/lib/prisma";

export async function createLog({
  action,
  userId,
  username,
  description,
  ip = "internal"
}: {
  action: string;
  userId?: string;
  username?: string;
  description: string;
  ip?: string;
}) {
  try {
    await prisma.log.create({
      data: {
        action,
        userId,
        username,
        description,
        ip
      }
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}
