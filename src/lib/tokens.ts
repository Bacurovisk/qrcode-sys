import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { TokenPurpose } from "@/generated/prisma/enums";

const TTL_MS: Record<TokenPurpose, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

export function generateTokenString(): string {
  return randomBytes(32).toString("hex");
}

export async function createVerificationToken(userId: string, purpose: TokenPurpose) {
  const token = generateTokenString();
  const expiresAt = new Date(Date.now() + TTL_MS[purpose]);

  await prisma.verificationToken.create({
    data: { token, purpose, userId, expiresAt },
  });

  return token;
}

/** Returns the most recent token for this purpose issued to the user, if any. */
export async function getLatestToken(userId: string, purpose: TokenPurpose) {
  return prisma.verificationToken.findFirst({
    where: { userId, purpose },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Validates a token, marks it used, and returns the associated user id.
 * Returns null if the token doesn't exist, is expired, already used, or is
 * for the wrong purpose.
 */
export async function consumeToken(rawToken: string, purpose: TokenPurpose) {
  const record = await prisma.verificationToken.findUnique({ where: { token: rawToken } });

  if (
    !record ||
    record.purpose !== purpose ||
    record.usedAt ||
    record.expiresAt.getTime() < Date.now()
  ) {
    return null;
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
}
