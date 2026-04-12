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

    const menus = await prisma.menuItem.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener menús' }, { status: 500 });
  }
}
