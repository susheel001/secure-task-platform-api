import type { ChangeEvent } from 'react';

import type { TaskFilters as Filters } from '../types';

type TaskFiltersProps = {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
  showAdminScope: boolean;
};

export const TaskFilters = ({ filters, onChange, onReset, showAdminScope }: TaskFiltersProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(event.target.name as keyof Filters, event.target.value);
  };

  return (
    <section className="surface filter-surface">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Filters</p>
          <h2>Shape the queue</h2>
        </div>
        <button className="button ghost" type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Search</span>
          <input
            name="search"
            placeholder="Search titles or descriptions"
            value={filters.search ?? ''}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" value={filters.status ?? ''} onChange={handleChange}>
            <option value="">All statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select name="priority" value={filters.priority ?? ''} onChange={handleChange}>
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>

        <label className="field">
          <span>Sort By</span>
          <select name="sortBy" value={filters.sortBy ?? 'createdAt'} onChange={handleChange}>
            <option value="createdAt">Created date</option>
            <option value="updatedAt">Updated date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label className="field">
          <span>Direction</span>
          <select name="sortOrder" value={filters.sortOrder ?? 'desc'} onChange={handleChange}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>

        {showAdminScope ? (
          <label className="field">
            <span>Scope</span>
            <select name="createdById" value={filters.createdById ?? ''} onChange={handleChange}>
              <option value="">All users</option>
              <option value="__ME__">My tasks only</option>
            </select>
          </label>
        ) : null}
      </div>
    </section>
  );
};
