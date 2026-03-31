export function groupTasks(tasks) {
  return {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    in_review: tasks.filter((t) => t.status === 'in_review'),
    done: tasks.filter((t) => t.status === 'done'),
  }
}

export function isOverdue(date) {
  if (!date) return false
  const today = new Date(new Date().toDateString())
  return new Date(date) < today
}

export function isDueSoon(date) {
  if (!date) return false
  const today = new Date(new Date().toDateString())
  const due = new Date(date)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  return diff >= 0 && diff <= 2
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getAccentClass(accent) {
  const map = {
    slate: 'accent-slate',
    violet: 'accent-violet',
    amber: 'accent-amber',
    emerald: 'accent-emerald',
  }
  return map[accent] || 'accent-slate'
}
