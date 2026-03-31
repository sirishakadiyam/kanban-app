import { useState } from 'react'

export default function TaskDetailsDrawer({ task, onClose, comments, activity, labels, assignees, addComment }) {
  const [comment, setComment] = useState('')

  async function submitComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    await addComment(task.id, comment)
    setComment('')
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="icon-btn" type="button" onClick={onClose}>×</button>
        </div>

        <div className="drawer-section">
          <h3>Description</h3>
          <p>{task.description || 'No description added.'}</p>
        </div>

        <div className="drawer-section">
          <h3>Labels</h3>
          <div className="labels-row">
            {labels.length ? labels.map((label) => (
              <span key={label.id} className="label-chip" style={{ borderColor: label.color, color: label.color }}>
                {label.name}
              </span>
            )) : <p>No labels</p>}
          </div>
        </div>

        <div className="drawer-section">
          <h3>Assignees</h3>
          <div className="stack-list">
            {assignees.length ? assignees.map((member) => (
              <div key={member.id} className="mini-row">{member.name}</div>
            )) : <p>No assignees</p>}
          </div>
        </div>

        <div className="drawer-section">
          <h3>Comments</h3>
          <form onSubmit={submitComment} className="modal-form">
            <textarea
              className="form-input form-textarea"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment"
            />
            <button className="btn btn-primary" type="submit">Add Comment</button>
          </form>
          <div className="stack-list">
            {comments.length ? comments.map((item) => (
              <div key={item.id} className="comment-card">
                <p>{item.body}</p>
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
            )) : <p>No comments yet.</p>}
          </div>
        </div>

        <div className="drawer-section">
          <h3>Activity</h3>
          <div className="stack-list">
            {activity.length ? activity.map((item) => (
              <div key={item.id} className="activity-card">
                <strong>{item.action}</strong>
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
            )) : <p>No activity yet.</p>}
          </div>
        </div>
      </aside>
    </div>
  )
}
