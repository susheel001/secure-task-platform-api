import { TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

const titleSchema = z.string().trim().min(3).max(120);
const descriptionSchema = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const createTaskBodySchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
});

export const updateTaskBodySchema = createTaskBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');

export const taskParamsSchema = z.object({
  taskId: z.string().cuid(),
});

export const listTaskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  search: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  createdById: z.string().cuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskBodySchema>;
export type ListTaskQuery = z.infer<typeof listTaskQuerySchema>;
