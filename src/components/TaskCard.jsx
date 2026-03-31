import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, MoreHorizontal } from 'lucide-react'
import { initials, isDueSoon, isOverdue } from '../utils/helpers'

export default function TaskCard({ task, onOpen, labels, assignees }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  }

  const overdue = isOverdue(task.due_date)
  const dueSoon = isDueSoon(task.due_date)

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="task-card"
      onClick={onOpen}
      {...listeners}
      {...attributes}
    >
      <div className="task-top">
        <div className="task-text">
          <h3>{task.title}</h3>
          <p>{task.description || 'No description added.'}</p>
        </div>

        <button className="icon-btn icon-hidden" type="button">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="badge-row">
        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
        {task.due_date && (
          <span className={`badge due-badge ${overdue ? 'due-overdue' : dueSoon ? 'due-soon' : ''}`}>
            <CalendarDays size={12} />
            {task.due_date}
          </span>
        )}
      </div>

      {labels.length > 0 && (
        <div className="labels-row">
          {labels.map((label) => (
            <span key={label.id} className="label-chip" style={{ borderColor: label.color, color: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="task-footer">
        <span className="task-time">Updated recently</span>
        <div className="avatars-row">
          {assignees.map((member) => (
            <div
              key={member.id}
              className="avatar"
              title={member.name}
              style={{ background: member.color || 'linear-gradient(135deg,#8b5cf6,#d946ef)' }}
            >
              {member.avatar_text || initials(member.name)}
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
