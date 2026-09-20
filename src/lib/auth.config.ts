import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/lib/validations/auth";
import { getUserByEmail } from "@/server/queries/user";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/types/database";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;
        const user = await getUserByEmail(email);

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          role?: UserRole;
          firstName?: string;
          lastName?: string;
          isActive?: boolean;
        };
        token.role = u.role;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.isActive = u.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (session.user) {
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
};
