// Plain JS seed for production runtime (no ts-node needed)
// Idempotent via upsert; safe to run on every container start
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const permissions = [
    { name: 'projects:create', resource: 'projects', action: 'create' },
    { name: 'projects:read', resource: 'projects', action: 'read' },
    { name: 'projects:update', resource: 'projects', action: 'update' },
    { name: 'projects:delete', resource: 'projects', action: 'delete' },
    { name: 'tasks:create', resource: 'tasks', action: 'create' },
    { name: 'tasks:read', resource: 'tasks', action: 'read' },
    { name: 'tasks:update', resource: 'tasks', action: 'update' },
    { name: 'tasks:delete', resource: 'tasks', action: 'delete' },
    { name: 'users:create', resource: 'users', action: 'create' },
    { name: 'users:read', resource: 'users', action: 'read' },
    { name: 'users:update', resource: 'users', action: 'update' },
    { name: 'users:delete', resource: 'users', action: 'delete' },
    { name: 'reports:read', resource: 'reports', action: 'read' },
    { name: 'reports:export', resource: 'reports', action: 'export' },
    { name: 'crm:read', resource: 'crm', action: 'read' },
    { name: 'crm:write', resource: 'crm', action: 'write' },
    { name: 'admin:access', resource: 'admin', action: 'access' },
    { name: 'settings:manage', resource: 'settings', action: 'manage' },
    { name: 'workflows:create', resource: 'workflows', action: 'create' },
    { name: 'workflows:execute', resource: 'workflows', action: 'execute' },
    { name: 'resources:manage', resource: 'resources', action: 'manage' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: { ...perm, description: `${perm.action} ${perm.resource}` },
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrative access', isSystem: true },
  });
  await prisma.role.upsert({
    where: { name: 'PROJECT_MANAGER' },
    update: {},
    create: { name: 'PROJECT_MANAGER', description: 'Project management access', isSystem: true },
  });
  await prisma.role.upsert({
    where: { name: 'TEAM_MEMBER' },
    update: {},
    create: { name: 'TEAM_MEMBER', description: 'Team member access', isSystem: true },
  });
  await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {},
    create: { name: 'VIEWER', description: 'Read-only access', isSystem: true },
  });

  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }
  for (const perm of allPermissions.filter((p) => p.name !== 'admin:access')) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  await prisma.organization.upsert({
    where: { slug: 'nsproject' },
    update: {},
    create: { name: 'NsProject Enterprise', slug: 'nsproject', industry: 'Technology' },
  });

  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@nsproject.com' },
    update: {},
    create: {
      email: 'admin@nsproject.com',
      username: 'superadmin',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      jobTitle: 'System Administrator',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
  });

  console.log('✅ Seed complete. Login: admin@nsproject.com / Admin@123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(0); })
  .finally(async () => { await prisma.$disconnect(); });
