import type { Prisma, Role } from '@prisma/client';

import { AppError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/pagination';
import { cacheService } from '../../lib/redis';
import { taskRepository, type TaskRecord } from './task.repository';
import type { CreateTaskInput, ListTaskQuery, UpdateTaskInput } from './task.schemas';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
};

const CACHE_TTL_SECONDS = 60;

const toTaskResponse = (task: TaskRecord) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  createdBy: task.createdBy,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const invalidateTaskCache = async () => {
  await cacheService.deletePattern('tasks:*');
};

const getGroupCount = (count: { _all?: number } | true | undefined) =>
  typeof count === 'object' ? count?._all ?? 0 : 0;

const ensureTaskAccess = async (user: AuthenticatedUser, taskId: string) => {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
  }

  if (user.role !== 'ADMIN' && task.createdById !== user.id) {
    throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
  }

  return task;
};

export const taskService = {
  async createTask(user: AuthenticatedUser, input: CreateTaskInput) {
    const task = await taskRepository.create({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      createdById: user.id,
    });

    await invalidateTaskCache();

    return toTaskResponse(task);
  },

  async listTasks(user: AuthenticatedUser, query: ListTaskQuery) {
    const cacheKey = `tasks:${user.role}:${user.id}:${JSON.stringify(query)}`;
    const cached = await cacheService.getJson<{
      data: ReturnType<typeof toTaskResponse>[];
      meta: ReturnType<typeof buildPaginationMeta>;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const where: Prisma.TaskWhereInput = {};

    if (user.role !== 'ADMIN') {
      where.createdById = user.id;
    } else if (query.createdById) {
      where.createdById = query.createdById;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.TaskOrderByWithRelationInput;

    const [total, tasks] = await taskRepository.list({
      where,
      orderBy,
      skip,
      take: query.limit,
    });

    const payload = {
      data: tasks.map(toTaskResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };

    await cacheService.setJson(cacheKey, payload, CACHE_TTL_SECONDS);

    return payload;
  },

  async getTaskById(user: AuthenticatedUser, taskId: string) {
    const task = await ensureTaskAccess(user, taskId);
    return toTaskResponse(task);
  },

  async getAdminSummary() {
    const summary = await taskRepository.getAdminSummary();

    return {
      totalTasks: summary.total,
      byStatus: {
        TODO: getGroupCount(summary.statusGroups.find((group) => group.status === 'TODO')?._count),
        IN_PROGRESS: getGroupCount(summary.statusGroups.find((group) => group.status === 'IN_PROGRESS')?._count),
        DONE: getGroupCount(summary.statusGroups.find((group) => group.status === 'DONE')?._count),
      },
      byPriority: {
        LOW: getGroupCount(summary.priorityGroups.find((group) => group.priority === 'LOW')?._count),
        MEDIUM: getGroupCount(summary.priorityGroups.find((group) => group.priority === 'MEDIUM')?._count),
        HIGH: getGroupCount(summary.priorityGroups.find((group) => group.priority === 'HIGH')?._count),
        URGENT: getGroupCount(summary.priorityGroups.find((group) => group.priority === 'URGENT')?._count),
      },
    };
  },

  async updateTask(user: AuthenticatedUser, taskId: string, input: UpdateTaskInput) {
    await ensureTaskAccess(user, taskId);

    const updatedTask = await taskRepository.update(taskId, {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
    });

    await invalidateTaskCache();

    return toTaskResponse(updatedTask);
  },

  async deleteTask(user: AuthenticatedUser, taskId: string) {
    await ensureTaskAccess(user, taskId);
    await taskRepository.delete(taskId);
    await invalidateTaskCache();
  },
};
