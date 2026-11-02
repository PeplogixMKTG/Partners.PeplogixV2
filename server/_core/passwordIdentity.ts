import { createHash } from "node:crypto";
import type { User } from "../../drizzle/schema";

export function passwordAdminOpenId(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  return `password_admin_${createHash("sha256")
    .update(normalizedEmail)
    .digest("hex")
    .slice(0, 40)}`;
}

export function isPasswordOwner(
  user: Pick<User, "openId" | "email" | "loginMethod" | "role">,
  ownerEmail: string
): boolean {
  const normalizedOwner = ownerEmail.trim().toLowerCase();
  return Boolean(
    normalizedOwner &&
      user.openId === passwordAdminOpenId(normalizedOwner) &&
      user.email?.trim().toLowerCase() === normalizedOwner &&
      user.loginMethod === "password" &&
      user.role === "admin"
  );
}
