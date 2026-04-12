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
    const { id: roleId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, menuIds } = await req.json();

    const role = await prisma.$transaction(async (tx) => {
      const r = await tx.role.update({
        where: { id: roleId },
        data: { name }
      });

      if (menuIds && Array.isArray(menuIds)) {
        await tx.roleMenu.deleteMany({ where: { roleId } });
        if (menuIds.length > 0) {
          await tx.roleMenu.createMany({
            data: menuIds.map((menuId: string) => ({
              roleId,
              menuId
            }))
          });
        }
      }
      return r;
    });

    await createLog({
      action: "ROLE_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Editado rol: ${name}. Permisos de menú actualizados.`
    });

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar rol' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roleId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const role = await prisma.role.delete({
      where: { id: roleId }
    });

    await createLog({
      action: "ROLE_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Eliminado rol: ${role.name}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar rol. Asegúrese que no tenga usuarios asociados.' }, { status: 400 });
  }
}
