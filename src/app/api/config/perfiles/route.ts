import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createLog } from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const profiles = await prisma.profile.findMany({
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
    const roles = await prisma.role.findMany({
      include: {
        menus: {
          include: { menuItem: true }
        }
      }
    });
    return NextResponse.json({ profiles, roles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener perfiles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, description, type, roleIds, menuIds } = await req.json();

    if (type === 'profile') {
      const profile = await prisma.profile.create({
        data: { 
          name, 
          description,
          roles: {
            create: (roleIds || []).map((rid: string) => ({ roleId: rid }))
          }
        }
      });
      await createLog({
        action: "PROFILE_CREATE",
        userId: session.user.id,
        username: session.user.name || "Admin",
        description: `Creación de perfil: ${name} con ${roleIds?.length || 0} roles`
      });
      return NextResponse.json(profile);
    } else {
      const role = await prisma.role.create({
        data: { 
          name,
          menus: {
            create: (menuIds || []).map((mid: string) => ({ menuId: mid }))
          }
        }
      });
      await createLog({
        action: "ROLE_CREATE",
        userId: session.user.id,
        username: session.user.name || "Admin",
        description: `Creación de rol: ${name} con ${menuIds?.length || 0} menús`
      });
      return NextResponse.json(role);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
