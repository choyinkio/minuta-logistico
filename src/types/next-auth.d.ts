import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profile: string;
      canWrite: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    profile: string;
    canWrite: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    profile: string;
    canWrite: boolean;
  }
}
