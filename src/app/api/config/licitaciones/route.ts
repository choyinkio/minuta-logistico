import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function GET() {
  try {
    const licitaciones = await prisma.licitacion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(licitaciones);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener licitaciones' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { code, name, description, startDate, endDate } = await req.json();

    if (!code || !name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const licitacion = await prisma.licitacion.create({
      data: {
        code,
        name,
        description,
        startDate: new Date(startDate + 'T12:00:00'),
        endDate: new Date(endDate + 'T12:00:00'),
      }
    });

    await createLog({
      action: "LICITACION_CREATE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Creada licitación: ${name} (Código: ${code})`
    });

    return NextResponse.json(licitacion);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una licitación con ese código' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear licitación' }, { status: 500 });
  }
}
