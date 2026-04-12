import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(holidays);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener feriados' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { date, description } = await req.json();

    if (!date || !description) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Bug fix: set time to noon to avoid timezone shifts jumping to previous day
    const adjustedDate = new Date(date + 'T12:00:00');

    const holiday = await prisma.holiday.create({
      data: {
        date: adjustedDate,
        description
      }
    });

    await createLog({
      action: "HOLIDAY_CREATE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Agregado feriado: ${description} para el día ${date}`
    });

    return NextResponse.json(holiday);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un feriado en esa fecha' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear feriado' }, { status: 500 });
  }
}
