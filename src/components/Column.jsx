import { useDroppable } from '@dnd-kit/core'
import { MoreHorizontal } from 'lucide-react'
import TaskCard from './TaskCard'
import EmptyState from './EmptyState'
import { getAccentClass } from '../utils/helpers'

export default function Column({ id, title, accent, tasks, onOpenTask, taskLabels, labels, taskAssignees, teamMembers }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={`column ${isOver ? 'column-active' : ''}`}>
      <div className="column-head">
        <div className="column-title-wrap">
          <span className={`column-dot ${getAccentClass(accent)}`} />
          <div>
            <h2>{title}</h2>
            <p>{tasks.length} items</p>
          </div>
        </div>

        <button className="icon-btn" type="button">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="column-body">
        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => onOpenTask(task)}
              labels={labels.filter((label) => taskLabels.some((tl) => tl.task_id === task.id && tl.label_id === label.id))}
              assignees={teamMembers.filter((member) => taskAssignees.some((ta) => ta.task_id === task.id && ta.member_id === member.id))}
            />
          ))
        )}
      </div>
    </div>
  )
}
