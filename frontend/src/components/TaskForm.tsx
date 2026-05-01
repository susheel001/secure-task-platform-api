import { useEffect, useState } from 'react';

import type { Task, TaskPayload, TaskPriority, TaskStatus } from '../types';

type TaskFormProps = {
  activeTask: Task | null;
  isSubmitting: boolean;
  onCancelEdit: () => void;
  onSubmit: (payload: TaskPayload) => Promise<void>;
};

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
};

const defaultState: FormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
};

export const TaskForm = ({ activeTask, isSubmitting, onCancelEdit, onSubmit }: TaskFormProps) => {
  const [form, setForm] = useState<FormState>(defaultState);

  useEffect(() => {
    if (activeTask) {
      setForm({
        title: activeTask.title,
        description: activeTask.description ?? '',
        status: activeTask.status,
        priority: activeTask.priority,
      });
      return;
    }

    setForm(defaultState);
  }, [activeTask]);

  return (
    <section className="surface composer-surface">
      <div className="surface-header">
        <div>
          <p className="eyebrow">{activeTask ? 'Edit Task' : 'New Task'}</p>
          <h2>{activeTask ? 'Refine the current work item' : 'Create the next task'}</h2>
        </div>
        {activeTask ? (
          <button className="button ghost" type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </div>

      <form
        className="task-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit({
            title: form.title,
            description: form.description,
            status: form.status,
            priority: form.priority,
          });
        }}
      >
        <label className="field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="What needs to happen?"
            required
            minLength={3}
            maxLength={120}
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Context, constraints, or rollout notes"
            rows={5}
            maxLength={1000}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))
              }
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>

          <label className="field">
            <span>Priority</span>
            <select
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
        </div>

        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : activeTask ? 'Update Task' : 'Create Task'}
        </button>
      </form>
    </section>
  );
};
