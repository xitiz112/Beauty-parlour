import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import { authConfig } from "./auth.config";
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from "./lib/rate-limit";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET must be set in production. Generate one with `npx auth secret`.");
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

class TooManyAttemptsError extends CredentialsSignin {
  code = "too-many-attempts";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        if (isLoginLocked(email)) {
          throw new TooManyAttemptsError();
        }

        const user = await prisma.adminUser.findUnique({ where: { email } });
        // Always hash, even on a missing user, so response timing doesn't
        // reveal whether an email address has a desk account.
        const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinva");
        if (!user || !ok) {
          recordLoginFailure(email);
          return null;
        }

        clearLoginFailures(email);
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
