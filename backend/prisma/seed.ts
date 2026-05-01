import bcrypt from 'bcryptjs';
import { PrismaClient, Role, TaskPriority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Demo User',
      role: Role.USER,
      passwordHash,
    },
  });

  const existingTasks = await prisma.task.count();

  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Plan Q2 sprint capacity',
          description: 'Review engineering bandwidth and align priorities with product.',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          createdById: admin.id,
        },
        {
          title: 'Write onboarding checklist',
          description: 'Create a concise checklist for new hires joining the backend team.',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          createdById: admin.id,
        },
        {
          title: 'Refine analytics export flow',
          description: 'Document edge cases and propose a safer retry strategy.',
          status: TaskStatus.DONE,
          priority: TaskPriority.URGENT,
          createdById: user.id,
        },
        {
          title: 'Triage mobile API feedback',
          description: 'Categorize frontend issues and prepare follow-up tasks.',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          createdById: user.id,
        },
      ],
    });
  }

  console.log('Seed complete. Demo users:');
  console.log('ADMIN -> admin@example.com / Password123!');
  console.log('USER  -> user@example.com / Password123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
