import { DefaultSession } from "next-auth";
import { Role, MemberStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      status: MemberStatus;
      username: string;
    };
  }
}
