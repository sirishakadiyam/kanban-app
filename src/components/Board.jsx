import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Column from './Column'
import { STATUSES } from '../utils/constants'

export default function Board({ grouped, moveTask, onOpenTask, taskLabels, labels, taskAssignees, teamMembers }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    moveTask(active.id, over.id)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <section className="board-grid">
        {STATUSES.map((col) => (
          <Column
            key={col.key}
            id={col.key}
            title={col.title}
            accent={col.accent}
            tasks={grouped[col.key] || []}
            onOpenTask={onOpenTask}
            taskLabels={taskLabels}
            labels={labels}
            taskAssignees={taskAssignees}
            teamMembers={teamMembers}
          />
        ))}
      </section>
    </DndContext>
  )
}
