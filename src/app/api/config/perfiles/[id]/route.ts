import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, description, menuIds } = await req.json();

    // Perform update in a transaction
    const profile = await prisma.$transaction(async (tx) => {
      const p = await tx.profile.update({
        where: { id: profileId },
        data: { name, description }
      });

      // If menuIds provided, update associations
      if (menuIds && Array.isArray(menuIds)) {
        // Delete current
        await tx.profileMenu.deleteMany({
          where: { profileId: profileId }
        });

        // Add new
        if (menuIds.length > 0) {
          await tx.profileMenu.createMany({
            data: menuIds.map((menuId: string) => ({
              profileId: profileId,
              menuId
            }))
          });
        }
      }

      return p;
    });

    await createLog({
      action: "PROFILE_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Editado perfil: ${name}. Permisos actualizados.`
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if users depend on this profile
    const usersCount = await prisma.user.count({ where: { profileId } });
    if (usersCount > 0) {
      return NextResponse.json({ error: 'No se puede eliminar un perfil con usuarios asociados.' }, { status: 400 });
    }

    await prisma.profileMenu.deleteMany({
      where: { profileId: profileId }
    });

    const profile = await prisma.profile.delete({
      where: { id: profileId }
    });

    await createLog({
      action: "PROFILE_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Eliminado perfil: ${profile.name}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar perfil' }, { status: 500 });
  }
}
