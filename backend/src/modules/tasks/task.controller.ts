import type { Request, Response } from 'express';

import { taskService } from './task.service';

export const taskController = {
  async createTask(request: Request, response: Response) {
    const task = await taskService.createTask(request.user!, request.body);

    response.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  },

  async listTasks(request: Request, response: Response) {
    const tasks = await taskService.listTasks(request.user!, request.query as never);

    response.status(200).json({
      success: true,
      ...tasks,
    });
  },

  async getTaskById(request: Request, response: Response) {
    const { taskId } = request.params as { taskId: string };
    const task = await taskService.getTaskById(request.user!, taskId);

    response.status(200).json({
      success: true,
      data: task,
    });
  },

  async getAdminSummary(_request: Request, response: Response) {
    const summary = await taskService.getAdminSummary();

    response.status(200).json({
      success: true,
      data: summary,
    });
  },

  async updateTask(request: Request, response: Response) {
    const { taskId } = request.params as { taskId: string };
    const task = await taskService.updateTask(request.user!, taskId, request.body);

    response.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  },

  async deleteTask(request: Request, response: Response) {
    const { taskId } = request.params as { taskId: string };
    await taskService.deleteTask(request.user!, taskId);

    response.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  },
};
