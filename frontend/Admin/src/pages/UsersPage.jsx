import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Search, Plus, Trash2, Pencil, X, Check, Shield } from 'lucide-react'
import { assignableRoles, ROLE_LEVEL } from '../data/roles'
import s from './UsersPage.module.css'

const STATUSES = ['Active', 'Inactive']

const ROLE_STYLE = {
  'Super Admin': s.roleSuperAdmin,
  'Admin':       s.roleAdmin,
  'Organizer':   s.roleOrganizer,
  'Viewer':      s.roleViewer,
}

// ── Add / Edit User Modal ─────────────────────────────────────────────────────
function UserModal({ user, onClose, onSave, title, currentUser }) {
  const roles = assignableRoles(currentUser)
  const blank = {
    name: '', email: '', role: roles[roles.length - 1] || 'Viewer',
    department: '', status: 'Active',
    joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    avatar: '',
  }
  const [form, setForm] = useState(user ? { ...user } : blank)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.name || !form.email) return
    const avatar = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    onSave({ ...form, avatar })
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={`${s.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>{title}</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={s.formGrid}>
          <label className={s.label}>Full Name *
            <input className={s.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Abebe Kebede" />
          </label>
          <label className={s.label}>Email *
            <input className={s.input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. abebe@aastu.edu.et" />
          </label>
          <label className={s.label}>Department / Position
            <select className={s.input} value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">— Select department —</option>
              <optgroup label="Administration">
                <option>Office of the President</option>
                <option>Office of the Registrar</option>
                <option>Dean of Students Office</option>
                <option>IT &amp; Systems Department</option>
                <option>Finance &amp; Administration</option>
                <option>Public Relations</option>
              </optgroup>
              <optgroup label="Engineering">
                <option>Computer Science &amp; Engineering</option>
                <option>Electrical &amp; Computer Engineering</option>
                <option>Civil &amp; Environmental Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Chemical Engineering</option>
                <option>Software Engineering</option>
                <option>Industrial Engineering</option>
                <option>Architecture &amp; Urban Planning</option>
              </optgroup>
              <optgroup label="Science">
                <option>Applied Mathematics</option>
                <option>Applied Physics</option>
                <option>Applied Chemistry</option>
                <option>Biotechnology</option>
              </optgroup>
              <optgroup label="Student Organizations">
                <option>Student Union</option>
                <option>GDSC AASTU</option>
                <option>IEEE Student Branch</option>
                <option>Arts &amp; Culture Club</option>
                <option>Sports Club</option>
                <option>Eco Club</option>
                <option>Entrepreneurship Club</option>
                <option>Photography &amp; Media Club</option>
              </optgroup>
              <optgroup label="Other">
                <option>Health Services Center</option>
                <option>Research &amp; Innovation Center</option>
                <option>Career &amp; Alumni Services</option>
                <option>Other</option>
              </optgroup>
            </select>
          </label>
          <label className={s.label}>Role
            <select className={s.input} value={form.role} onChange={e => set('role', e.target.value)}>
              {/* Only show roles the current user is allowed to assign */}
              {roles.length > 0
                ? roles.map(r => <option key={r}>{r}</option>)
                : <option>{form.role}</option>
              }
            </select>
          </label>
          <label className={s.label}>Status
            <select className={s.input} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(st => <option key={st}>{st}</option>)}
            </select>
          </label>
        </div>
        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.saveBtn} onClick={handleSave}>
            <Check size={14} /> {user ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Users Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { users, addUser, deleteUser, updateUser, currentUser, userCan, t } = useApp()
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('All')
  const [addModal, setAdd]    = useState(false)
  const [editUser, setEdit]   = useState(null)

  const ROLES_ALL = ['Super Admin', 'Admin', 'Organizer', 'Viewer']

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase()
    return (
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department||'').toLowerCase().includes(q)) &&
      (roleFilter === 'All' || u.role === roleFilter)
    )
  }), [users, search, roleFilter])

  function handleDelete(id) {
    const target = users.find(u => u.id === id)
    if (!target) return
    if (ROLE_LEVEL[target.role] >= ROLE_LEVEL[currentUser.role]) {
      alert('You cannot remove a user with equal or higher role than yours.')
      return
    }
    if (window.confirm('Remove this user?')) deleteUser(id)
  }

  // Can this user edit a specific target user?
  function canEdit(target) {
    if (!userCan('canManageUsers')) return false
    if (currentUser.role === 'Super Admin') return true
    return ROLE_LEVEL[target.role] < ROLE_LEVEL[currentUser.role]
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>{t('usersTitle')}</h1>
          <p className={s.sub}>{t('usersSub')}</p>
        </div>
        {userCan('canManageUsers') && (
          <button className={s.addBtn} onClick={() => setAdd(true)}>
            <Plus size={15} /> {t('addUser')}
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className={s.statsRow}>
        {[
          { label: t('totalUsers'), value: users.length,                                       color: 'var(--accent)' },
          { label: t('active'),     value: users.filter(u => u.status === 'Active').length,    color: 'var(--green)' },
          { label: t('admins'),     value: users.filter(u => u.role.includes('Admin')).length, color: 'var(--purple)' },
          { label: t('organizers'), value: users.filter(u => u.role === 'Organizer').length,   color: 'var(--yellow)' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${s.statBox} glass`}>
            <div className={s.statVal} style={{ color }}>{value}</div>
            <div className={s.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Role hierarchy guide */}
      <div className={`${s.roleGuide} glass`}>
        <div className={s.roleGuideTitle}>Role Hierarchy</div>
        <div className={s.roleGuideGrid}>
          {[
            { role: 'Super Admin', color: '#f59e0b', desc: 'Full control — manage all users, promote roles, change system settings, approve/reject all events.' },
            { role: 'Admin',       color: '#10b981', desc: 'Manage events and lower-level users (Organizers, Viewers). Cannot change system settings or promote to Admin.' },
            { role: 'Organizer',   color: '#a855f7', desc: 'Create and edit events. Cannot approve, reject, or delete events. Cannot manage users.' },
            { role: 'Viewer',      color: '#6b9aaa', desc: 'Read-only access. Can view dashboard and analytics. Cannot create or modify anything.' },
          ].map(({ role, color, desc }) => (
            <div key={role} className={s.roleGuideItem}>
              <div className={s.roleGuideName} style={{ color }}>{role}</div>
              <div className={s.roleGuideDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={13} className={s.searchIcon} />
          <input
            className={s.searchInput}
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={s.clearX} onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
        <div className={s.roleFilters}>
          {['All', ...ROLES_ALL].map(r => (
            <button key={r} className={`${s.fBtn} ${roleFilter === r ? s.fActive : ''}`} onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`${s.tableCard} glass`}>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Department / Position</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                {userCan('canManageUsers') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className={s.emptyRow}>{t('noUsers')}</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={s.userCell}>
                      <div className={s.avatar}>{u.avatar}</div>
                      <div>
                        <div className={s.userName}>{u.name}</div>
                        {u.id === currentUser?.id && <div className={s.youTag}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td className={s.tdEmail}>{u.email}</td>
                  <td className={s.tdDept}>{u.department || '—'}</td>
                  <td>
                    <span className={`${s.roleBadge} ${ROLE_STYLE[u.role] || ''}`}>
                      <Shield size={9} /> {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${s.statusBadge} ${u.status === 'Active' ? s.statusActive : s.statusInactive}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className={s.tdJoined}>{u.joined}</td>
                  {userCan('canManageUsers') && (
                    <td>
                      <div className={s.actions}>
                        {canEdit(u) ? (
                          <>
                            <button className={s.iconBtn} title="Edit" onClick={() => setEdit(u)}>
                              <Pencil size={13} />
                            </button>
                            {u.id !== currentUser?.id && (
                              <button className={`${s.iconBtn} ${s.delBtn}`} title="Delete" onClick={() => handleDelete(u.id)}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className={s.noEdit}>—</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addModal && (
        <UserModal title="Add New User" onClose={() => setAdd(false)} onSave={addUser} currentUser={currentUser} />
      )}
      {editUser && (
        <UserModal title="Edit User" user={editUser} onClose={() => setEdit(null)} onSave={u => updateUser(u.id, u)} currentUser={currentUser} />
      )}
    </div>
  )
}
