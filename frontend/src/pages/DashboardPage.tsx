import { startTransition, useDeferredValue, useEffect, useState } from 'react';

import { TaskFilters } from '../components/TaskFilters';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';
import { taskApi } from '../lib/taskApi';
import type { AdminTaskSummary, PaginationMeta, Task, TaskFilters as Filters, TaskPayload } from '../types';

const defaultFilters: Filters = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 6,
};

const emptyMeta: PaginationMeta = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const emptyAdminSummary: AdminTaskSummary = {
  totalTasks: 0,
  byStatus: {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  },
  byPriority: {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  },
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [adminSummary, setAdminSummary] = useState<AdminTaskSummary | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summaryVersion, setSummaryVersion] = useState(0);

  const deferredSearch = useDeferredValue(filters.search);

  const todoCount = tasks.filter((task) => task.status === 'TODO').length;
  const inProgressCount = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((task) => task.status === 'DONE').length;
  const showAdminScope = user?.role === 'ADMIN';
  const currentSummary = adminSummary ?? emptyAdminSummary;
  const adminFocusCount = currentSummary.byPriority.HIGH + currentSummary.byPriority.URGENT;

  useEffect(() => {
    let active = true;

    const fetchTasks = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await taskApi.list({
          ...filters,
          search: deferredSearch,
          createdById: filters.createdById === '__ME__' ? user?.id : filters.createdById,
        });

        if (!active) {
          return;
        }

        setTasks(response.data);
        setMeta(response.meta);
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void fetchTasks();

    return () => {
      active = false;
    };
  }, [
    deferredSearch,
    filters.createdById,
    filters.limit,
    filters.page,
    filters.priority,
    filters.sortBy,
    filters.sortOrder,
    filters.status,
    user?.id,
  ]);

  useEffect(() => {
    let active = true;

    if (!showAdminScope) {
      setAdminSummary(null);
      setIsSummaryLoading(false);
      return () => {
        active = false;
      };
    }

    const fetchAdminSummary = async () => {
      setIsSummaryLoading(true);

      try {
        const response = await taskApi.adminSummary();

        if (active) {
          setAdminSummary(response.data);
        }
      } catch (summaryError) {
        if (active) {
          setError(getErrorMessage(summaryError));
        }
      } finally {
        if (active) {
          setIsSummaryLoading(false);
        }
      }
    };

    void fetchAdminSummary();

    return () => {
      active = false;
    };
  }, [showAdminScope, summaryVersion]);

  const handleReload = async (nextMessage?: string) => {
    const response = await taskApi.list({
      ...filters,
      search: deferredSearch,
      createdById: filters.createdById === '__ME__' ? user?.id : filters.createdById,
    });

    setTasks(response.data);
    setMeta(response.meta);

    if (showAdminScope) {
      setSummaryVersion((version) => version + 1);
    }

    if (nextMessage) {
      setSuccess(nextMessage);
      window.setTimeout(() => setSuccess(''), 2500);
    }
  };

  const handleTaskSubmit = async (payload: TaskPayload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const normalizedPayload = {
        ...payload,
        description: payload.description?.trim() || undefined,
      };

      if (activeTask) {
        await taskApi.update(activeTask.id, normalizedPayload);
        setActiveTask(null);
        await handleReload('Task updated.');
      } else {
        await taskApi.create(normalizedPayload);
        await handleReload('Task created.');
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    setError('');

    try {
      await taskApi.delete(task.id);

      if (activeTask?.id === task.id) {
        setActiveTask(null);
      }

      await handleReload('Task deleted.');
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Protected dashboard</p>
          <h1>{user?.name}, keep the queue moving.</h1>
          <p>
            Users manage only their own tasks. Admins can inspect and operate across the full workspace from the
            same API surface.
          </p>
        </div>

        <div className="hero-actions">
          <div className="user-chip">
            <strong>{user?.role}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="button ghost" type="button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat-card">
          <span>Todo</span>
          <strong>{todoCount}</strong>
        </div>
        <div className="stat-card">
          <span>In Progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div className="stat-card">
          <span>Done</span>
          <strong>{doneCount}</strong>
        </div>
        <div className="stat-card">
          <span>Total in view</span>
          <strong>{meta.total}</strong>
        </div>
      </section>

      {showAdminScope ? (
        <section className="surface admin-summary-surface">
          <div className="surface-header">
            <div>
              <p className="eyebrow">Admin control</p>
              <h2>Workspace-wide RBAC summary</h2>
            </div>
            <span className="summary-state">{isSummaryLoading ? 'Refreshing' : 'Live'}</span>
          </div>

          <div className="summary-grid">
            <div className="summary-metric">
              <span>Total tasks</span>
              <strong>{currentSummary.totalTasks}</strong>
            </div>
            <div className="summary-metric">
              <span>Todo</span>
              <strong>{currentSummary.byStatus.TODO}</strong>
            </div>
            <div className="summary-metric">
              <span>In progress</span>
              <strong>{currentSummary.byStatus.IN_PROGRESS}</strong>
            </div>
            <div className="summary-metric">
              <span>Done</span>
              <strong>{currentSummary.byStatus.DONE}</strong>
            </div>
            <div className="summary-metric">
              <span>High or urgent</span>
              <strong>{adminFocusCount}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {error ? <div className="notice error">{error}</div> : null}
      {success ? <div className="notice success">{success}</div> : null}

      <section className="dashboard-grid">
        <div className="dashboard-column narrow">
          <TaskForm
            activeTask={activeTask}
            isSubmitting={isSubmitting}
            onCancelEdit={() => setActiveTask(null)}
            onSubmit={handleTaskSubmit}
          />
        </div>

        <div className="dashboard-column wide">
          <TaskFilters
            filters={filters}
            showAdminScope={showAdminScope}
            onChange={(key, value) => {
              startTransition(() => {
                setFilters((current) => ({
                  ...current,
                  [key]: value,
                  page: key === 'page' ? Number(value) : 1,
                }));
              });
            }}
            onReset={() => {
              setFilters(defaultFilters);
              setActiveTask(null);
            }}
          />

          <TaskList tasks={tasks} isLoading={isLoading} onEdit={setActiveTask} onDelete={handleDeleteTask} />

          <div className="pagination-bar">
            <p>
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="pagination-actions">
              <button
                className="button ghost small"
                type="button"
                disabled={!meta.hasPreviousPage}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))
                }
              >
                Previous
              </button>
              <button
                className="button ghost small"
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: Math.min(meta.totalPages, (current.page ?? 1) + 1) }))
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
