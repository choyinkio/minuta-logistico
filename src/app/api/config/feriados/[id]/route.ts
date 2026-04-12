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
    const { id: holidayId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { date, description } = await req.json();

    const data: any = {};
    if (date) data.date = new Date(date + 'T12:00:00');
    if (description) data.description = description;

    const holiday = await prisma.holiday.update({
      where: { id: holidayId },
      data
    });

    await createLog({
      action: "HOLIDAY_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Editado feriado: ${holiday.description} para el día ${date || holiday.date}`
    });

    return NextResponse.json(holiday);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar feriado' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: holidayId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const holiday = await prisma.holiday.delete({
      where: { id: holidayId }
    });

    await createLog({
      action: "HOLIDAY_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Eliminado feriado: ${holiday.description}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar feriado' }, { status: 500 });
  }
}
