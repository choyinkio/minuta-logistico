import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: any = {};
    
    // Dynamic filters
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'ts') filters[key] = value;
    }

    const items = await prisma.region.findMany({
      where: filters
      , include: { pais: true }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.profile !== 'Administrador' && !session.user.canWrite)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();

    const item = await prisma.region.create({
      data
    });

    await createLog({
      action: "REGION_CREATE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Creado region: ${data.nombre || data.code}`
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear registro' }, { status: 500 });
  }
}
