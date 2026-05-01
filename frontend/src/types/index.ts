export type UserRole = 'USER' | 'ADMIN';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreator {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: TaskCreator;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminTaskSummary {
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  createdById?: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
