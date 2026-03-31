import { Plus, Search, Filter, Inbox, Clock3 } from 'lucide-react'

export default function Header({
  summary,
  search,
  setSearch,
  priorityFilter,
  setPriorityFilter,
  labelFilter,
  setLabelFilter,
  labels,
  openCreate,
}) {
  return (
    <section className="hero-card">
      <div className="hero-top">
        <div>
          <div className="pill-label">Pulse Board Workspace</div>
          <h1>Pulse Board</h1>
          <p className="hero-text">
            A modern, team-friendly task board with elegant hierarchy, smooth interactions,
            and a polished visual system.
          </p>
        </div>

        <div className="top-actions">
          <button className="btn btn-primary" onClick={openCreate} type="button">
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="hero-stats">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
            className="search-input"
          />
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-label">Total Tasks</p>
            <p className="stat-value">{summary.total}</p>
          </div>
          <Inbox size={28} className="stat-icon" />
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-label">Completed</p>
            <p className="stat-value">{summary.completed}</p>
          </div>
          <Clock3 size={28} className="stat-icon" />
        </div>

        <select className="select-box" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>

        <select className="select-box" value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}>
          <option value="all">All labels</option>
          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>

        <button className="btn btn-filter" type="button">
          <Filter size={16} />
          Filters
        </button>
      </div>
    </section>
  )
}
