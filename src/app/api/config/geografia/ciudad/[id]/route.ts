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
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();

    const item = await prisma.ciudad.update({
      where: { id },
      data
    });

    await createLog({
      action: "CIUDAD_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Editado ciudad: ${data.nombre || data.codigo}`
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const item = await prisma.ciudad.delete({
      where: { id }
    });

    await createLog({
      action: "CIUDAD_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Eliminado ciudad: ${item.nombre || item.codigo || id}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar. Verifique que no tenga dependencias hijas.' }, { status: 400 });
  }
}
