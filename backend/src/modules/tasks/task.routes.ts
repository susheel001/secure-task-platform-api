import { Router } from 'express';
import { Role } from '@prisma/client';

import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { taskController } from './task.controller';
import {
  createTaskBodySchema,
  listTaskQuerySchema,
  taskParamsSchema,
  updateTaskBodySchema,
} from './task.schemas';

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get(
  '/admin/summary',
  authorize(Role.ADMIN),
  asyncHandler(taskController.getAdminSummary),
);
taskRouter.get('/', validate({ query: listTaskQuerySchema }), asyncHandler(taskController.listTasks));
taskRouter.post('/', validate({ body: createTaskBodySchema }), asyncHandler(taskController.createTask));
taskRouter.get(
  '/:taskId',
  validate({ params: taskParamsSchema }),
  asyncHandler(taskController.getTaskById),
);
taskRouter.patch(
  '/:taskId',
  validate({ params: taskParamsSchema, body: updateTaskBodySchema }),
  asyncHandler(taskController.updateTask),
);
taskRouter.delete(
  '/:taskId',
  validate({ params: taskParamsSchema }),
  asyncHandler(taskController.deleteTask),
);
