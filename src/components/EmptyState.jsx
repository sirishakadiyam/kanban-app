import { CheckCircle2 } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="empty-state">
      <CheckCircle2 size={32} />
      <p className="empty-title">Nothing here yet</p>
      <p className="empty-text">
        Drag a task into this lane or create a new one to get started.
      </p>
    </div>
  )
}
