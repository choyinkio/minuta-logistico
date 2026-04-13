const fs = require('fs');
const path = require('path');

const models = [
  { name: 'pais', pathDir: 'api/config/geografia/pais', modelName: 'pais', includes: '' },
  { name: 'region', pathDir: 'api/config/geografia/region', modelName: 'region', includes: 'include: { pais: true }' },
  { name: 'ciudad', pathDir: 'api/config/geografia/ciudad', modelName: 'ciudad', includes: 'include: { region: true }' },
  { name: 'comuna', pathDir: 'api/config/geografia/comuna', modelName: 'comuna', includes: 'include: { ciudad: true }' },
  { name: 'sucursal', pathDir: 'api/config/sucursales', modelName: 'sucursal', includes: 'include: { comuna: { include: { ciudad: { include: { region: { include: { pais: true } } } } } }, licitacion: true }' }
];

const basePath = path.join(__dirname, 'src', 'app');

models.forEach(m => {
  const dirPath = path.join(basePath, m.pathDir);
  const idDirPath = path.join(dirPath, '[id]');
  
  fs.mkdirSync(idDirPath, { recursive: true });

  const getIncludeStr = m.includes ? `, ${m.includes}` : '';

  // route.ts (GET, POST)
  const routeContent = `import { NextResponse } from 'next/server';
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

    const items = await prisma.${m.modelName}.findMany({
      where: filters
      ${getIncludeStr}
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

    const item = await prisma.${m.modelName}.create({
      data
    });

    await createLog({
      action: "${m.name.toUpperCase()}_CREATE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: \`Creado ${m.name}: \${data.nombre || data.code}\`
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear registro' }, { status: 500 });
  }
}
`;

  // [id]/route.ts (PUT, DELETE)
  const idRouteContent = `import { NextResponse } from 'next/server';
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

    const item = await prisma.${m.modelName}.update({
      where: { id },
      data
    });

    await createLog({
      action: "${m.name.toUpperCase()}_EDIT",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: \`Editado ${m.name}: \${data.nombre || data.codigo}\`
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

    const item = await prisma.${m.modelName}.delete({
      where: { id }
    });

    await createLog({
      action: "${m.name.toUpperCase()}_DELETE",
      userId: session.user.id,
      username: session.user.name || "Admin",
      description: \`Eliminado ${m.name}: \${item.nombre || item.codigo || id}\`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar. Verifique que no tenga dependencias hijas.' }, { status: 400 });
  }
}
`;

  fs.writeFileSync(path.join(dirPath, 'route.ts'), routeContent);
  fs.writeFileSync(path.join(idDirPath, 'route.ts'), idRouteContent);
  console.log("Generado API para " + m.name);
});
