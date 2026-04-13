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

    if (!user) {
      return NextResponse.json([]);
    }

    // Collect all unique menu items from profile -> roles -> menus
    const menuMap = new Map();

    if (user.profile?.roles) {
      user.profile.roles.forEach(pr => {
        if (pr.role.menus) {
          pr.role.menus.forEach(rm => {
            menuMap.set(rm.menuItem.id, rm.menuItem);
          });
        }
      });
    }

    const permittedMenus = Array.from(menuMap.values());
    return NextResponse.json(permittedMenus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener menús del usuario' }, { status: 500 });
  }
}
