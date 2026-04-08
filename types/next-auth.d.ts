import { DefaultSession } from "next-auth";
import { Role, MemberStatus } from "@prisma/client";

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
