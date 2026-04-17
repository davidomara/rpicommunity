import { DefaultSession } from "next-auth";
import type { Role, MemberStatus } from "@/lib/domain-types";

declare module "next-auth" {
  interface User {
    role?: Role;
    status?: MemberStatus;
    username?: string;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      status: MemberStatus;
      username: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    status?: MemberStatus;
    username?: string;
  }
}
