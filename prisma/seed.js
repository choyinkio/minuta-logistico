const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('ContraseñaSegura@123', 10)
  
  // Limpieza total antes de re-sembrar
  await prisma.roleMenu.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.profileRole.deleteMany();
  await prisma.user.updateMany({ data: { profileId: null } });
  await prisma.profile.deleteMany();
  await prisma.role.deleteMany();
  // 1. Create Menu Items
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
      update: { 
        name: item.name, 
        icon: item.icon, 
        category: item.category 
      },
      create: item,
    });
  }

  // 2. Create default roles
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

  // 3. Link All Menus to Admin Role
  const allMenus = await prisma.menuItem.findMany();
  for (const menu of allMenus) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: adminRole.id, menuId: menu.id } },
      update: {},
      create: { roleId: adminRole.id, menuId: menu.id },
    });
  }

  // 4. Link Specific Menu to Calendario Role
  const feriadosMenu = await prisma.menuItem.findUnique({ where: { path: '/config/feriados' } });
  if (feriadosMenu) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: calendarioRole.id, menuId: feriadosMenu.id } },
      update: {},
      create: { roleId: calendarioRole.id, menuId: feriadosMenu.id },
    });
  }

  // 5. Create default profile
  const adminProfile = await prisma.profile.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      description: 'Acceso total al sistema',
    },
  });

  // 5. Link Role to Profile
  await prisma.profileRole.upsert({
    where: { profileId_roleId: { profileId: adminProfile.id, roleId: adminRole.id } },
    update: {},
    create: { profileId: adminProfile.id, roleId: adminRole.id },
  });

  // 6. Create admin user
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

  console.log('Semilla jerárquica ejecutada con éxito.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
