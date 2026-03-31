import { useState } from 'react'

export default function TaskModal({ teamMembers, labels, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    due_date: '',
    assigneeIds: [],
    labelIds: [],
  })

  function toggleArrayValue(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Create Task</h2>
          <button className="icon-btn" type="button" onClick={onClose}>×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            className="form-input"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="form-input form-textarea"
            rows="4"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="form-row two-col">
            <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
            <input className="form-input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>

          <div>
            <p className="field-label">Assign Team Members</p>
            <div className="checkbox-grid">
              {teamMembers.map((member) => (
                <label key={member.id} className="check-item">
                  <input
                    type="checkbox"
                    checked={form.assigneeIds.includes(member.id)}
                    onChange={() => toggleArrayValue('assigneeIds', member.id)}
                  />
                  {member.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="field-label">Labels</p>
            <div className="checkbox-grid">
              {labels.map((label) => (
                <label key={label.id} className="check-item">
                  <input
                    type="checkbox"
                    checked={form.labelIds.includes(label.id)}
                    onChange={() => toggleArrayValue('labelIds', label.id)}
                  />
                  {label.name}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
