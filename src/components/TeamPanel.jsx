import { useState } from 'react'
import { initials } from '../utils/helpers'

export default function TeamPanel({ teamMembers, createTeamMember, labels, createLabel }) {
  const [memberName, setMemberName] = useState('')
  const [memberColor, setMemberColor] = useState('#7c3aed')
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState('#06b6d4')

  function addMember(e) {
    e.preventDefault()
    if (!memberName.trim()) return
    createTeamMember({
      name: memberName,
      color: memberColor,
      avatar_text: initials(memberName),
    })
    setMemberName('')
  }

  function addLabel(e) {
    e.preventDefault()
    if (!labelName.trim()) return
    createLabel({ name: labelName, color: labelColor })
    setLabelName('')
  }

  return (
    <div className="team-panel">
      <div className="panel-box">
        <h3>Team</h3>
        <form onSubmit={addMember} className="modal-form">
          <input className="form-input" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Member name" />
          <input className="color-input" type="color" value={memberColor} onChange={(e) => setMemberColor(e.target.value)} />
          <button className="btn btn-primary" type="submit">Add Member</button>
        </form>
        <div className="stack-list">
          {teamMembers.map((member) => (
            <div key={member.id} className="member-row">
              <span className="avatar" style={{ background: member.color }}>{member.avatar_text}</span>
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-box">
        <h3>Labels</h3>
        <form onSubmit={addLabel} className="modal-form">
          <input className="form-input" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="Label name" />
          <input className="color-input" type="color" value={labelColor} onChange={(e) => setLabelColor(e.target.value)} />
          <button className="btn btn-primary" type="submit">Add Label</button>
        </form>
        <div className="stack-list">
          {labels.map((label) => (
            <div key={label.id} className="mini-row">
              <span className="label-dot" style={{ background: label.color }} />
              {label.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
