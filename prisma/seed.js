const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('ContraseñaSegura@123', 10)
  
  // NOTA: No se borran datos existentes. Solo se crean/actualizan registros base.
  // Los perfiles y roles creados por el usuario se conservan.

  // 1. Upsert Menu Items (agrega nuevos sin borrar existentes)
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', category: 'main' },
    { name: 'Usuarios', path: '/config/usuarios', icon: 'UserPlus', category: 'config' },
    { name: 'Perfiles y Roles', path: '/config/perfiles', icon: 'ShieldCheck', category: 'config' },
    { name: 'Logs Sistema', path: '/config/logs', icon: 'FileText', category: 'config' },
    { name: 'Feriados', path: '/config/feriados', icon: 'CalendarDays', category: 'config' },
    { name: 'Licitación', path: '/config/licitaciones', icon: 'FileSignature', category: 'config' },
    { name: 'Zonas Geográficas', path: '/config/zonas', icon: 'MapPinned', category: 'config' },
    { name: 'Sucursales', path: '/config/sucursales', icon: 'Building2', category: 'config' },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { path: item.path },
      update: { name: item.name, icon: item.icon, category: item.category },
      create: item,
    });
  }

  // 2. Upsert roles base del sistema (nunca se borran)
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador Total' },
    update: {},
    create: { name: 'Administrador Total' },
  });

  const calendarioRole = await prisma.role.upsert({
    where: { name: 'Calendario' },
    update: {},
    create: { name: 'Calendario' },
  });

  // 3. Vincular todos los menús al rol Administrador Total
  const allMenus = await prisma.menuItem.findMany();
  for (const menu of allMenus) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: adminRole.id, menuId: menu.id } },
      update: {},
      create: { roleId: adminRole.id, menuId: menu.id },
    });
  }

  // 4. Vincular menú Feriados al rol Calendario
  const feriadosMenu = await prisma.menuItem.findUnique({ where: { path: '/config/feriados' } });
  const dashboardMenu = await prisma.menuItem.findUnique({ where: { path: '/dashboard' } });

  for (const menu of [feriadosMenu, dashboardMenu]) {
    if (menu) {
      await prisma.roleMenu.upsert({
        where: { roleId_menuId: { roleId: calendarioRole.id, menuId: menu.id } },
        update: {},
        create: { roleId: calendarioRole.id, menuId: menu.id },
      });
    }
  }

  // 5. Upsert perfil Administrador
  const adminProfile = await prisma.profile.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: { name: 'Administrador', description: 'Acceso total al sistema' },
  });

  // 6. Upsert perfil Calendario (PERSISTENTE - no debe borrarse nunca)
  const calendarioProfile = await prisma.profile.upsert({
    where: { name: 'Calendario' },
    update: {},
    create: { name: 'Calendario', description: 'Acceso al módulo de feriados y calendario' },
  });

  // 7. Vincular roles a perfiles
  await prisma.profileRole.upsert({
    where: { profileId_roleId: { profileId: adminProfile.id, roleId: adminRole.id } },
    update: {},
    create: { profileId: adminProfile.id, roleId: adminRole.id },
  });

  await prisma.profileRole.upsert({
    where: { profileId_roleId: { profileId: calendarioProfile.id, roleId: calendarioRole.id } },
    update: {},
    create: { profileId: calendarioProfile.id, roleId: calendarioRole.id },
  });

  // 8. Upsert usuario admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { profileId: adminProfile.id },
    create: {
      username: 'admin',
      password: hashedPassword,
      profileId: adminProfile.id,
      isLocked: false,
    },
  });

  console.log('Semilla ejecutada con éxito. Datos existentes preservados.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
