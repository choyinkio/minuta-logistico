import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLog } from '@/lib/logger';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      username, email, password, profileId, expirationDate, 
      isLocked, canWrite, firstName, lastName, licitacionIds 
    } = body;

    const data: any = {};
    if (username !== undefined) data.username = username;
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email;
    if (profileId !== undefined) data.profileId = profileId;
    if (expirationDate !== undefined) data.expirationDate = expirationDate ? new Date(expirationDate) : null;
    if (isLocked !== undefined) data.isLocked = !!isLocked;
    if (canWrite !== undefined) data.canWrite = !!canWrite;
    
    // Only update password if provided
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    // Handle licitaciones update
    if (licitacionIds && Array.isArray(licitacionIds)) {
      data.licitaciones = {
        deleteMany: {},
        create: licitacionIds.map((id: string) => ({
          licitacion: { connect: { id } }
        }))
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      include: { 
        profile: true,
        licitaciones: {
          include: { licitacion: true }
        }
      }
    });

    await createLog({
      action: "USER_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Edición de usuario: ${updatedUser.username} (${updatedUser.firstName} ${updatedUser.lastName}). Campos modificados: ${Object.keys(data).join(', ')}`
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.profile !== 'Administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.delete({
      where: { id: userId }
    });

    await createLog({
      action: "USER_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: `Eliminación de usuario: ${user.username}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
