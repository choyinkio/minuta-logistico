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
            }
          }
        });

        if (!user) return null;

        // Check if account is locked
        if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
          throw new Error("Cuenta bloqueada temporalmente. Intente más tarde.");
        }

        // Check if password has expired
        if (user.expirationDate && user.expirationDate < new Date()) {
          throw new Error("Su contraseña ha expirado. Contacte al administrador.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // Consolidate paths from Profile -> Roles -> Menus
        const paths = new Set<string>();
        if (user.profile?.roles) {
          user.profile.roles.forEach(pr => {
            if (pr.role.menus) {
              pr.role.menus.forEach(rm => paths.add(rm.menuItem.path));
            }
          });
        }

        return {
          id: user.id,
          name: user.username,
          username: user.username,
          profile: user.profile?.name || "invitado",
          permittedPaths: Array.from(paths),
          canWrite: user.canWrite
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
        token.canWrite = (user as any).canWrite;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.profile = token.profile as string;
        session.user.permittedPaths = token.permittedPaths as string[];
        session.user.canWrite = token.canWrite as boolean;
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
