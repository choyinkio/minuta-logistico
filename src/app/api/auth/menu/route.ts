import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user with profile and roles
    const user = await prisma.user.findFirst({
      where: { username: session.user.name as string },
      include: {
        profile: {
          include: { menus: { include: { menuItem: true } } }
        },
        roles: {
          include: { role: { include: { menus: { include: { menuItem: true } } } } }
        }
      }
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // Collect all unique menu items from profile and roles
    const menuMap = new Map();

    // From Profile
    user.profile?.menus.forEach(pm => {
      menuMap.set(pm.menuItem.id, pm.menuItem);
    });

    // From Roles
    user.roles.forEach(ur => {
      ur.role.menus.forEach(rm => {
        menuMap.set(rm.menuItem.id, rm.menuItem);
      });
    });

    const permittedMenus = Array.from(menuMap.values());
    return NextResponse.json(permittedMenus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener menús del usuario' }, { status: 500 });
  }
}
