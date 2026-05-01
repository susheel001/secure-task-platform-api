import type { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.TaskSelect;

export type TaskRecord = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

export const taskRepository = {
  create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({
      data,
      select: taskSelect,
    });
  },

  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      select: taskSelect,
    });
  },

  update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });
  },

  delete(id: string) {
    return prisma.task.delete({
      where: { id },
      select: taskSelect,
    });
  },

  list(params: {
    where: Prisma.TaskWhereInput;
    orderBy: Prisma.TaskOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.$transaction([
      prisma.task.count({ where: params.where }),
      prisma.task.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        select: taskSelect,
      }),
    ]);
  },

  async getAdminSummary() {
    const [total, statusGroups, priorityGroups] = await prisma.$transaction([
      prisma.task.count(),
      prisma.task.groupBy({
        by: ['status'],
        orderBy: {
          status: 'asc',
        },
        _count: {
          _all: true,
        },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        orderBy: {
          priority: 'asc',
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    return {
      total,
      statusGroups,
      priorityGroups,
    };
  },
};
