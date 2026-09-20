import type { UserRole } from "@/types/database";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isActive: boolean;
  }
  interface Session {
    user: User & {
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
  }
}
