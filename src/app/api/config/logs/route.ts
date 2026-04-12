import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 for performance
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener logs' }, { status: 500 });
  }
}
