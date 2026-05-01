import type { AdminTaskSummary, ApiResponse, PaginatedApiResponse, Task, TaskFilters, TaskPayload } from '../types';
import { api } from './api';

export const taskApi = {
  list(filters: TaskFilters) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null),
    );

    return api
      .get<PaginatedApiResponse<Task>>('/tasks', {
        params,
      })
      .then((response) => response.data);
  },
  create(payload: TaskPayload) {
    return api.post<ApiResponse<Task>>('/tasks', payload).then((response) => response.data);
  },
  update(taskId: string, payload: TaskPayload) {
    return api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, payload).then((response) => response.data);
  },
  delete(taskId: string) {
    return api.delete<{ success: boolean; message: string }>(`/tasks/${taskId}`).then((response) => response.data);
  },
  adminSummary() {
    return api.get<ApiResponse<AdminTaskSummary>>('/tasks/admin/summary').then((response) => response.data);
  },
};
