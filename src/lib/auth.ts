import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { 
            profile: {
              include: {
                menus: {
                  include: { menuItem: true }
                }
              }
            },
            roles: {
              include: {
                role: {
                  include: {
                    menus: {
                      include: { menuItem: true }
                    }
                  }
                }
              }
            }
          }
        });

        if (!user) return null;

        // ... (check account locked/expired)

        // Consolidate paths
        const paths = new Set<string>();
        user.profile?.menus.forEach(m => paths.add(m.menuItem.path));
        user.roles.forEach(ur => {
          ur.role.menus.forEach(rm => paths.add(rm.menuItem.path));
        });

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.username,
          username: user.username,
          profile: user.profile?.name,
          permittedPaths: Array.from(paths)
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.profile = (user as any).profile;
        token.permittedPaths = (user as any).permittedPaths;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.profile = token.profile as string;
        session.user.permittedPaths = token.permittedPaths as string[];
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
