import type { Task } from '../types';

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

export const TaskList = ({ tasks, isLoading, onEdit, onDelete }: TaskListProps) => {
  if (isLoading) {
    return (
      <section className="surface list-surface">
        <div className="surface-header">
          <div>
            <p className="eyebrow">Tasks</p>
            <h2>Loading the latest queue</h2>
          </div>
        </div>
        <div className="task-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="task-card skeleton" key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="surface list-surface">
        <div className="empty-state">
          <p className="eyebrow">Nothing here yet</p>
          <h2>No tasks match this view</h2>
          <p>Tweak the filters or create a fresh task to seed the board.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="surface list-surface">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Execution board</h2>
        </div>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="task-card-top">
              <div>
                <div className="pill-row">
                  <span className={`pill status-${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
                <h3>{task.title}</h3>
              </div>
              <div className="task-actions">
                <button className="button ghost small" type="button" onClick={() => onEdit(task)}>
                  Edit
                </button>
                <button className="button danger small" type="button" onClick={() => void onDelete(task)}>
                  Delete
                </button>
              </div>
            </div>

            <p className="task-description">{task.description || 'No additional context provided.'}</p>

            <dl className="task-meta">
              <div>
                <dt>Owner</dt>
                <dd>{task.createdBy.name}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
};
