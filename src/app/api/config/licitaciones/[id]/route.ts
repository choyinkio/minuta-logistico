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
    const { id: licitacionId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { code, name, description, startDate, endDate } = await req.json();

    const data: any = {};
    if (code) data.code = code;
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (startDate) data.startDate = new Date(startDate + 'T12:00:00');
    if (endDate) data.endDate = new Date(endDate + 'T12:00:00');

    const licitacion = await prisma.licitacion.update({
      where: { id: licitacionId },
      data
    });

    await createLog({
      action: "LICITACION_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Editada licitación: ${licitacion.name} (ID: ${licitacionId})`
    });

    return NextResponse.json(licitacion);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar licitación' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: licitacionId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const licitacion = await prisma.licitacion.delete({
      where: { id: licitacionId }
    });

    await createLog({
      action: "LICITACION_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Eliminada licitación: ${licitacion.name} (Código: ${licitacion.code})`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar licitación' }, { status: 500 });
  }
}
