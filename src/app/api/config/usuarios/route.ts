import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { 
      username, email, password, profileId, expirationDate, 
      isLocked, canWrite, firstName, lastName, licitacionIds 
    } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (usuario, correo, clave)' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        profileId,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        isLocked: !!isLocked,
        canWrite: !!canWrite,
        // Relationship mapping
        licitaciones: licitacionIds && Array.isArray(licitacionIds) ? {
          create: licitacionIds.map((id: string) => ({
            licitacion: { connect: { id } }
          }))
        } : undefined
      },
      include: { 
        profile: true,
        licitaciones: {
          include: { licitacion: true }
        }
      }
    });

    await createLog({
      action: "USER_CREATE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Creación de nuevo usuario: ${username} (${firstName} ${lastName})`
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El nombre de usuario ya existe' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { 
        profile: true,
        licitaciones: {
          include: { licitacion: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}
