import React, { useState, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { EVENT_CATEGORIES } from '../data/store'
import {
  Search, Filter, Plus, Pencil, Trash2, Eye,
  X, Check, AlertCircle, MapPin, Calendar, User,
  ImagePlus, Users, DollarSign, AlertTriangle
} from 'lucide-react'
import s from './EventsPage.module.css'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLE = {
  Pending:  { cls: s.badgePending,  label: 'PENDING REVIEW' },
  Approved: { cls: s.badgeApproved, label: 'APPROVED' },
  Rejected: { cls: s.badgeRejected, label: 'REJECTED' },
}

// Today's date string for min date validation
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// Check if a date string is today or in the future
function isValidDate(dateStr) {
  if (!dateStr) return false
  const input = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return input >= today
}

// ── Image Upload ──────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }) {
  const ref = useRef()
  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }
  return value ? (
    <div>
      <img src={value} alt="preview" className={s.previewImg} />
      <button type="button" className={s.removeImg} onClick={() => onChange('')}>
        <X size={11} /> Remove image
      </button>
    </div>
  ) : (
    <div className={s.uploadArea} onClick={() => ref.current.click()}>
      <ImagePlus size={28} className={s.uploadIcon} />
      <div className={s.uploadText}>Click to upload event image</div>
      <div className={s.uploadSub}>PNG, JPG, WEBP up to 10MB</div>
      <input ref={ref} type="file" accept="image/*" className={s.uploadInput} onChange={handleFile} />
    </div>
  )
}

// ── Category Select ───────────────────────────────────────────────────────────
function CategorySelect({ value, onChange, className }) {
  const groups = [...new Set(EVENT_CATEGORIES.map(c => c.group))]
  return (
    <select className={className} value={value} onChange={e => onChange(e.target.value)}>
      {groups.map(g => (
        <optgroup key={g} label={g}>
          {EVENT_CATEGORIES.filter(c => c.group === g).map(c => (
            <option key={c.value} value={c.value}>{c.value}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ── Add Event Modal ───────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd, existingEvents }) {
  const { currentUser } = useApp()
  const [form, setForm] = useState({
    name: '', organizer: currentUser?.name || '', category: 'Workshop',
    date: '', venue: '', description: '', image: '',
    status: 'Pending', registrations: 0,
    capacity: '', price: '', isFree: true,
    urgent: false, submittedAt: 'Just now', feedback: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [err, setErr]         = useState('')
  const [dupWarning, setDup]  = useState('')

  function checkDuplicate(name, date, venue) {
    const dup = existingEvents.find(e =>
      e.name.toLowerCase().trim() === name.toLowerCase().trim() &&
      e.date === date &&
      e.venue.toLowerCase().trim() === venue.toLowerCase().trim()
    )
    if (dup) {
      setDup(`⚠️ An event named "${dup.name}" already exists on ${dup.date} at ${dup.venue}. Are you sure this is different?`)
    } else {
      setDup('')
    }
  }

  function handleAdd() {
    if (!form.name.trim() || !form.organizer.trim() || !form.date || !form.venue.trim()) {
      setErr('Please fill in Name, Organizer, Date and Venue.')
      return
    }
    if (!isValidDate(form.date)) {
      setErr('Event date must be today or a future date.')
      return
    }
    if (form.capacity && Number(form.capacity) < 1) {
      setErr('Capacity must be at least 1.')
      return
    }
    if (!form.isFree && (!form.price || Number(form.price) < 0)) {
      setErr('Please enter a valid price for paid events.')
      return
    }
    onAdd({
      ...form,
      capacity:     form.capacity ? Number(form.capacity) : null,
      price:        form.isFree ? 0 : Number(form.price),
    })
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={`${s.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>Create New Event</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={s.formGrid}>
          <label className={s.label}>Event Name *
            <input
              className={s.input} value={form.name}
              onChange={e => { set('name', e.target.value); checkDuplicate(e.target.value, form.date, form.venue) }}
              placeholder="e.g. AI Workshop 2025"
            />
          </label>
          <label className={s.label}>Organizer *
            <input className={s.input} value={form.organizer}
              onChange={e => set('organizer', e.target.value)} placeholder="e.g. GDSC AASTU" />
          </label>
          <label className={s.label}>Date * (today or future)
            <input
              className={s.input} type="date" value={form.date}
              min={todayStr()}
              onChange={e => { set('date', e.target.value); checkDuplicate(form.name, e.target.value, form.venue) }}
            />
          </label>
          <label className={s.label}>Venue *
            <input className={s.input} value={form.venue}
              onChange={e => { set('venue', e.target.value); checkDuplicate(form.name, form.date, e.target.value) }}
              placeholder="e.g. Main Hall A" />
          </label>
          <label className={s.label}>Category
            <CategorySelect className={s.input} value={form.category} onChange={v => set('category', v)} />
          </label>
          <label className={s.label}>Max Capacity (optional)
            <input className={s.input} type="number" min="1" value={form.capacity}
              onChange={e => set('capacity', e.target.value)} placeholder="e.g. 200 (leave blank = unlimited)" />
          </label>

          {/* Price section */}
          <div className={s.priceSection}>
            <div className={s.label} style={{ marginBottom: 8 }}>Ticket Price</div>
            <div className={s.priceToggle}>
              <button
                type="button"
                className={`${s.priceBtn} ${form.isFree ? s.priceBtnActive : ''}`}
                onClick={() => set('isFree', true)}
              >Free</button>
              <button
                type="button"
                className={`${s.priceBtn} ${!form.isFree ? s.priceBtnActive : ''}`}
                onClick={() => set('isFree', false)}
              >Paid</button>
            </div>
            {!form.isFree && (
              <div className={s.priceInput}>
                <span className={s.priceCurrency}>ETB</span>
                <input
                  className={s.input} type="number" min="0" value={form.price}
                  onChange={e => set('price', e.target.value)} placeholder="e.g. 50"
                />
              </div>
            )}
          </div>

          <label className={s.label} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 20 }}>
            <input type="checkbox" checked={form.urgent} onChange={e => set('urgent', e.target.checked)} />
            <span>Mark as Urgent</span>
          </label>

          <label className={s.label} style={{ gridColumn: '1/-1' }}>Description
            <textarea className={s.textarea} rows={3} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Brief description of the event..." />
          </label>
          <div style={{ gridColumn: '1/-1' }}>
            <div className={s.label} style={{ marginBottom: 6 }}>Event Image</div>
            <ImageUpload value={form.image} onChange={v => set('image', v)} />
          </div>
        </div>

        {/* Duplicate warning */}
        {dupWarning && (
          <div className={s.dupWarning}>
            <AlertTriangle size={13} />
            <span>{dupWarning}</span>
          </div>
        )}
        {err && <div className={s.formErr}>{err}</div>}

        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.saveBtn} onClick={handleAdd}>
            <Plus size={14} /> Create Event
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ event, onClose, onSave }) {
  const [form, setForm] = useState({
    ...event,
    isFree: !event.price || event.price === 0,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [err, setErr] = useState('')

  function handleSave() {
    if (!form.date) { setErr('Date is required.'); return }
    if (!isValidDate(form.date)) { setErr('Event date must be today or a future date.'); return }
    onSave({ ...form, price: form.isFree ? 0 : Number(form.price || 0) })
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={`${s.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>Edit Event</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={s.formGrid}>
          <label className={s.label}>Event Name
            <input className={s.input} value={form.name} onChange={e => set('name', e.target.value)} />
          </label>
          <label className={s.label}>Organizer
            <input className={s.input} value={form.organizer} onChange={e => set('organizer', e.target.value)} />
          </label>
          <label className={s.label}>Date (today or future)
            <input className={s.input} type="date" value={form.date} min={todayStr()}
              onChange={e => set('date', e.target.value)} />
          </label>
          <label className={s.label}>Venue
            <input className={s.input} value={form.venue} onChange={e => set('venue', e.target.value)} />
          </label>
          <label className={s.label}>Category
            <CategorySelect className={s.input} value={form.category} onChange={v => set('category', v)} />
          </label>
          <label className={s.label}>Max Capacity
            <input className={s.input} type="number" min="1" value={form.capacity || ''}
              onChange={e => set('capacity', e.target.value ? Number(e.target.value) : null)}
              placeholder="Leave blank = unlimited" />
          </label>

          <div className={s.priceSection}>
            <div className={s.label} style={{ marginBottom: 8 }}>Ticket Price</div>
            <div className={s.priceToggle}>
              <button type="button" className={`${s.priceBtn} ${form.isFree ? s.priceBtnActive : ''}`} onClick={() => set('isFree', true)}>Free</button>
              <button type="button" className={`${s.priceBtn} ${!form.isFree ? s.priceBtnActive : ''}`} onClick={() => set('isFree', false)}>Paid</button>
            </div>
            {!form.isFree && (
              <div className={s.priceInput}>
                <span className={s.priceCurrency}>ETB</span>
                <input className={s.input} type="number" min="0" value={form.price || ''}
                  onChange={e => set('price', e.target.value)} placeholder="e.g. 50" />
              </div>
            )}
          </div>

          <label className={s.label} style={{ gridColumn: '1/-1' }}>Description
            <textarea className={s.textarea} rows={3} value={form.description}
              onChange={e => set('description', e.target.value)} />
          </label>
          <div style={{ gridColumn: '1/-1' }}>
            <div className={s.label} style={{ marginBottom: 6 }}>Event Image</div>
            <ImageUpload value={form.image} onChange={v => set('image', v)} />
          </div>
        </div>
        {err && <div className={s.formErr}>{err}</div>}
        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.saveBtn} onClick={handleSave}>
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ event, onClose, onApprove, onReject }) {
  const [feedback, setFeedback] = useState(event.feedback || '')
  const [step, setStep] = useState('view')
  const capacityFull = event.capacity && event.registrations >= event.capacity

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={`${s.modal} ${s.modalLg} glass`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>{event.name}</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {event.image
          ? <img src={event.image} alt={event.name} className={s.heroImg} />
          : <div className={s.heroPlaceholder}><ImagePlus size={32} /><span>No image uploaded</span></div>
        }

        <div className={s.reviewMeta}>
          <span><User size={12} /> {event.organizer}</span>
          <span><Calendar size={12} /> {event.date}</span>
          <span><MapPin size={12} /> {event.venue}</span>
          {event.capacity && (
            <span><Users size={12} /> {event.registrations}/{event.capacity} capacity</span>
          )}
          {event.price > 0
            ? <span><DollarSign size={12} /> ETB {event.price}</span>
            : <span className={s.freeTag}>FREE</span>
          }
        </div>

        {capacityFull && (
          <div className={s.capacityFull}>
            <AlertCircle size={13} /> This event has reached full capacity.
          </div>
        )}

        <p className={s.reviewDesc}>{event.description}</p>

        {event.status === 'Rejected' && event.feedback && (
          <div className={s.feedbackBox}>
            <AlertCircle size={13} />
            <span>Rejection reason: {event.feedback}</span>
          </div>
        )}

        {event.status === 'Pending' && step === 'view' && (
          <div className={s.modalActions}>
            <button className={s.rejectBtn} onClick={() => setStep('reject')}>
              <X size={14} /> Reject
            </button>
            <button className={s.approveBtn} onClick={() => { onApprove(event.id); onClose() }}>
              <Check size={14} /> Approve
            </button>
          </div>
        )}

        {event.status === 'Pending' && step === 'reject' && (
          <div className={s.rejectStep}>
            <label className={s.label}>Rejection reason (optional)
              <textarea className={s.textarea} rows={3}
                placeholder="Explain why this event is being rejected..."
                value={feedback} onChange={e => setFeedback(e.target.value)} />
            </label>
            <div className={s.modalActions}>
              <button className={s.cancelBtn} onClick={() => setStep('view')}>Back</button>
              <button className={s.rejectBtn} onClick={() => { onReject(event.id, feedback); onClose() }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {event.status !== 'Pending' && (
          <div className={s.modalActions}>
            <button className={s.cancelBtn} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, onReview, onEdit, onDelete, userCan }) {
  const st = STATUS_STYLE[event.status]
  const capacityFull = event.capacity && event.registrations >= event.capacity

  return (
    <div className={`${s.card} glass`}>
      <div className={s.imgWrap}>
        {event.image
          ? <img src={event.image} alt={event.name} className={s.img} />
          : <div className={s.imgPlaceholder}><ImagePlus size={24} /><span>No image</span></div>
        }
        <span className={s.catBadge}>{event.category}</span>
        <span className={`${s.statusBadge} ${st.cls}`}>{st.label}</span>
        {capacityFull && <span className={s.fullBadge}>FULL</span>}
      </div>
      <div className={s.cardBody}>
        <h3 className={s.cardName}>{event.name}</h3>
        <div className={s.cardMeta}>
          <span><User size={11} /> {event.organizer}</span>
          <span><Calendar size={11} /> {event.date}</span>
          <span><MapPin size={11} /> {event.venue}</span>
        </div>
        <div className={s.cardFooter}>
          {event.capacity
            ? <span className={`${s.regCount} ${capacityFull ? s.regFull : ''}`}>
                {event.registrations}/{event.capacity} registered
              </span>
            : event.registrations > 0
              ? <span className={s.regCount}>{event.registrations.toLocaleString()} registered</span>
              : null
          }
          {event.price > 0
            ? <span className={s.priceTag}>ETB {event.price}</span>
            : <span className={s.freeTag}>FREE</span>
          }
        </div>
      </div>
      <div className={s.cardActions}>
        {userCan('canEditEvents') && (
          <button className={s.iconBtn} title="Edit" onClick={() => onEdit(event)}><Pencil size={13} /></button>
        )}
        {userCan('canDeleteEvents') && (
          <button className={`${s.iconBtn} ${s.delBtn}`} title="Delete" onClick={() => onDelete(event.id)}><Trash2 size={13} /></button>
        )}
        <button className={s.primaryBtn} onClick={() => onReview(event)}>
          <Eye size={13} />
          {event.status === 'Pending' && userCan('canApproveEvents') ? 'Review' : 'View'}
        </button>
      </div>
    </div>
  )
}

// ── Events Page ───────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { events, approveEvent, rejectEvent, deleteEvent, updateEvent, addEvent, currentUser, userCan } = useApp()
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('All')
  const [category, setCategory] = useState('All')
  const [myOnly, setMyOnly]     = useState(false)
  const [reviewEvt, setReview]  = useState(null)
  const [editEvt, setEdit]      = useState(null)
  const [showAdd, setShowAdd]   = useState(false)

  // All unique categories from existing events + store
  const allCategories = ['All', ...new Set(events.map(e => e.category))]

  const filtered = useMemo(() => events.filter(e => {
    const q = search.toLowerCase()
    const matchSearch   = e.name.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q)
    const matchStatus   = status   === 'All' || e.status   === status
    const matchCategory = category === 'All' || e.category === category
    const matchMine     = !myOnly  || e.organizerEmail === currentUser?.email
    return matchSearch && matchStatus && matchCategory && matchMine
  }), [events, search, status, category, myOnly, currentUser])

  function handleDelete(id) {
    if (window.confirm('Delete this event? This cannot be undone.')) deleteEvent(id)
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Event Management</h1>
          <p className={s.sub}>Review, approve, and manage all event proposals.</p>
        </div>
        {userCan('canCreateEvents') && (
          <button className={s.addBtn} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> New Event
          </button>
        )}
      </div>

      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={13} className={s.searchIcon} />
          <input className={s.searchInput} placeholder="Search events or organizers..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={s.clearX} onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
        <div className={s.filters}>
          <Filter size={13} style={{ color: 'var(--t3)' }} />
          {STATUSES.map(st => (
            <button key={st} className={`${s.fBtn} ${status === st ? s.fActive : ''}`} onClick={() => setStatus(st)}>{st}</button>
          ))}
          <div className={s.divider} />
          {allCategories.map(c => (
            <button key={c} className={`${s.fBtn} ${category === c ? s.fActive : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
          {/* My Events filter for Organizers */}
          {currentUser?.role === 'Organizer' && (
            <>
              <div className={s.divider} />
              <button className={`${s.fBtn} ${myOnly ? s.fActive : ''}`} onClick={() => setMyOnly(v => !v)}>
                My Events
              </button>
            </>
          )}
        </div>
      </div>

      <div className={s.countRow}>
        <span className={s.count}>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className={s.empty}>No events match your filters.</div>
      ) : (
        <div className={s.grid}>
          {filtered.map(e => (
            <EventCard key={e.id} event={e}
              onReview={setReview} onEdit={setEdit} onDelete={handleDelete}
              userCan={userCan}
            />
          ))}
        </div>
      )}

      {reviewEvt && (
        <ReviewModal event={reviewEvt} onClose={() => setReview(null)}
          onApprove={approveEvent} onReject={rejectEvent} />
      )}
      {editEvt && (
        <EditModal event={editEvt} onClose={() => setEdit(null)}
          onSave={form => updateEvent(form.id, form)} />
      )}
      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onAdd={addEvent} existingEvents={events} />
      )}
    </div>
  )
}
