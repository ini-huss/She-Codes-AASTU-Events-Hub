import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { EVENT_CATEGORIES } from '../data/store'
import {
  Plus, X, Check, ImagePlus, AlertTriangle,
  Calendar, MapPin, Users, DollarSign, Eye, ChevronDown
} from 'lucide-react'
import s from './SuggestionsPage.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0] }
function isValidDate(d) { if (!d) return false; return new Date(d) >= new Date(new Date().setHours(0,0,0,0)) }

function ImageUpload({ value, onChange }) {
  const ref = useRef()
  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }
  return value ? (
    <div>
      <img src={value} alt="preview" className={s.previewImg} />
      <button type="button" className={s.removeImg} onClick={() => onChange('')}><X size={11} /> Remove</button>
    </div>
  ) : (
    <div className={s.uploadArea} onClick={() => ref.current.click()}>
      <ImagePlus size={24} className={s.uploadIcon} />
      <div className={s.uploadText}>Click to upload image (optional)</div>
      <input ref={ref} type="file" accept="image/*" className={s.uploadInput} onChange={handleFile} />
    </div>
  )
}

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

// ── Convert Modal (Admin only) ────────────────────────────────────────────────
function ConvertModal({ suggestion, onClose, onConvert }) {
  const [extra, setExtra] = useState({
    venue:    suggestion.venue    || '',
    capacity: suggestion.capacity || '',
    price:    suggestion.price    || 0,
    isFree:   suggestion.isFree   !== false,
    image:    suggestion.image    || '',
    urgent:   false,
  })
  const set = (k, v) => setExtra(f => ({ ...f, [k]: v }))
  const [err, setErr] = useState('')

  function handleConvert() {
    if (!extra.venue.trim()) { setErr('Please add a venue before converting.'); return }
    onConvert(suggestion.id, extra)
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={`${s.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>Convert to Event</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={s.sugInfo}>
          <div className={s.sugInfoTitle}>{suggestion.name}</div>
          <div className={s.sugInfoMeta}>Suggested by {suggestion.submittedBy} · {suggestion.submittedAt}</div>
          <p className={s.sugInfoDesc}>{suggestion.description}</p>
        </div>
        <p className={s.convertNote}>
          Fill in any missing details below. The event will be created as Pending and go through the normal approval flow.
        </p>
        <div className={s.formGrid}>
          <label className={s.label}>Venue *
            <input className={s.input} value={extra.venue}
              onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Hall A" />
          </label>
          <label className={s.label}>Max Capacity
            <input className={s.input} type="number" min="1" value={extra.capacity}
              onChange={e => set('capacity', e.target.value)} placeholder="Leave blank = unlimited" />
          </label>
          <div className={s.priceSection}>
            <div className={s.label} style={{ marginBottom: 8 }}>Ticket Price</div>
            <div className={s.priceToggle}>
              <button type="button" className={`${s.priceBtn} ${extra.isFree ? s.priceBtnActive : ''}`} onClick={() => set('isFree', true)}>Free</button>
              <button type="button" className={`${s.priceBtn} ${!extra.isFree ? s.priceBtnActive : ''}`} onClick={() => set('isFree', false)}>Paid</button>
            </div>
            {!extra.isFree && (
              <div className={s.priceInput}>
                <span className={s.priceCurrency}>ETB</span>
                <input className={s.input} type="number" min="0" value={extra.price}
                  onChange={e => set('price', e.target.value)} placeholder="e.g. 50" />
              </div>
            )}
          </div>
          <label className={s.label} style={{ display:'flex', flexDirection:'row', alignItems:'center', gap:8, paddingTop:20 }}>
            <input type="checkbox" checked={extra.urgent} onChange={e => set('urgent', e.target.checked)} />
            <span>Mark as Urgent</span>
          </label>
          <div style={{ gridColumn: '1/-1' }}>
            <div className={s.label} style={{ marginBottom: 6 }}>Event Image</div>
            <ImageUpload value={extra.image} onChange={v => set('image', v)} />
          </div>
        </div>
        {err && <div className={s.formErr}>{err}</div>}
        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.convertBtn} onClick={handleConvert}>
            <Check size={14} /> Convert to Event
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Decline Modal ─────────────────────────────────────────────────────────────
function DeclineModal({ suggestion, onClose, onDecline }) {
  const [reason, setReason] = useState('')
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={`${s.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>Decline Suggestion</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <p className={s.convertNote}>Declining "{suggestion.name}" by {suggestion.submittedBy}. They will be notified.</p>
        <label className={s.label}>Reason (optional)
          <textarea className={s.textarea} rows={3} value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Explain why this suggestion is being declined..." />
        </label>
        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.declineBtn} onClick={() => { onDecline(suggestion.id, reason); onClose() }}>
            <X size={14} /> Decline
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Suggest Form (Viewer) ─────────────────────────────────────────────────────
function SuggestForm({ onSubmit }) {
  const { currentUser } = useApp()
  const [form, setForm] = useState({
    name: '', category: 'Workshop', date: '', venue: '',
    description: '', image: '', capacity: '', price: 0, isFree: true,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [err, setErr]       = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit() {
    if (!form.name.trim())        { setErr('Event name is required.'); return }
    if (!form.description.trim()) { setErr('Description is required.'); return }
    if (form.date && !isValidDate(form.date)) { setErr('Date must be today or in the future.'); return }
    onSubmit({ ...form, organizer: currentUser.name })
    setSuccess(true)
    setForm({ name:'', category:'Workshop', date:'', venue:'', description:'', image:'', capacity:'', price:0, isFree:true })
    setErr('')
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className={`${s.suggestForm} glass`}>
      <h2 className={s.formTitle}>Suggest an Event</h2>
      <p className={s.formSub}>
        Fill in as much detail as you can. An Admin will review your suggestion, complete any missing information, and convert it into a real event if approved.
      </p>

      {success && (
        <div className={s.successMsg}>
          ✅ Your suggestion has been submitted! An Admin will review it soon.
        </div>
      )}

      <div className={s.formGrid}>
        <label className={s.label}>Event Name *
          <input className={s.input} value={form.name}
            onChange={e => set('name', e.target.value)} placeholder="e.g. Faculty Research Showcase" />
        </label>
        <label className={s.label}>Category
          <CategorySelect className={s.input} value={form.category} onChange={v => set('category', v)} />
        </label>
        <label className={s.label}>Preferred Date (if known)
          <input className={s.input} type="date" value={form.date}
            min={todayStr()} onChange={e => set('date', e.target.value)} />
        </label>
        <label className={s.label}>Preferred Venue (if known)
          <input className={s.input} value={form.venue}
            onChange={e => set('venue', e.target.value)} placeholder="e.g. Auditorium, Room 204" />
        </label>
        <label className={s.label}>Expected Attendance (if known)
          <input className={s.input} type="number" min="1" value={form.capacity}
            onChange={e => set('capacity', e.target.value)} placeholder="e.g. 100" />
        </label>
        <div className={s.priceSection}>
          <div className={s.label} style={{ marginBottom: 8 }}>Should this event be free or paid?</div>
          <div className={s.priceToggle}>
            <button type="button" className={`${s.priceBtn} ${form.isFree ? s.priceBtnActive : ''}`} onClick={() => set('isFree', true)}>Free</button>
            <button type="button" className={`${s.priceBtn} ${!form.isFree ? s.priceBtnActive : ''}`} onClick={() => set('isFree', false)}>Paid</button>
          </div>
          {!form.isFree && (
            <div className={s.priceInput}>
              <span className={s.priceCurrency}>ETB</span>
              <input className={s.input} type="number" min="0" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="Suggested price" />
            </div>
          )}
        </div>
        <label className={s.label} style={{ gridColumn: '1/-1' }}>Description * (what is this event about, who is it for, why is it important?)
          <textarea className={s.textarea} rows={4} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the event in detail. The more you write, the easier it is for the Admin to create it properly." />
        </label>
        <div style={{ gridColumn: '1/-1' }}>
          <div className={s.label} style={{ marginBottom: 6 }}>Event Image (optional)</div>
          <ImageUpload value={form.image} onChange={v => set('image', v)} />
        </div>
      </div>

      {err && <div className={s.formErr}>{err}</div>}

      <button className={s.submitBtn} onClick={handleSubmit}>
        <Plus size={14} /> Submit Suggestion
      </button>
    </div>
  )
}

// ── Suggestions Page ──────────────────────────────────────────────────────────
export default function SuggestionsPage() {
  const { suggestions, submitSuggestion, convertSuggestion, declineSuggestion, userCan, currentUser } = useApp()
  const [convertModal, setConvert] = useState(null)
  const [declineModal, setDecline] = useState(null)
  const [filter, setFilter]        = useState('Pending')

  const isAdmin = userCan('canApproveEvents')

  const filtered = suggestions.filter(s =>
    filter === 'All' ? true : s.status === filter
  )

  const STATUS_STYLE = {
    Pending:   { cls: s.statusPending,   label: 'PENDING' },
    Converted: { cls: s.statusConverted, label: 'CONVERTED' },
    Declined:  { cls: s.statusDeclined,  label: 'DECLINED' },
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Event Suggestions</h1>
          <p className={s.sub}>
            {isAdmin
              ? 'Review suggestions from faculty and staff. Convert them into real events or decline with feedback.'
              : 'Suggest an event for Admin review. Fill in as much detail as possible.'}
          </p>
        </div>
      </div>

      {/* Viewer sees the suggestion form */}
      {!isAdmin && <SuggestForm onSubmit={submitSuggestion} />}

      {/* Viewer also sees their own past suggestions */}
      {!isAdmin && suggestions.filter(s => s.submittedEmail === currentUser?.email).length > 0 && (
        <div className={`${s.myList} glass`}>
          <h3 className={s.myListTitle}>My Suggestions</h3>
          {suggestions.filter(s => s.submittedEmail === currentUser?.email).map(sug => (
            <div key={sug.id} className={s.myItem}>
              <div className={s.myItemName}>{sug.name}</div>
              <div className={s.myItemMeta}>{sug.submittedAt}</div>
              <span className={`${s.statusBadge} ${STATUS_STYLE[sug.status]?.cls}`}>
                {STATUS_STYLE[sug.status]?.label}
              </span>
              {sug.status === 'Declined' && sug.adminNote && (
                <div className={s.myItemNote}>Reason: {sug.adminNote}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin sees all suggestions with filter */}
      {isAdmin && (
        <>
          <div className={s.filters}>
            {['Pending', 'Converted', 'Declined', 'All'].map(f => (
              <button key={f} className={`${s.fBtn} ${filter === f ? s.fActive : ''}`} onClick={() => setFilter(f)}>
                {f}
                {f === 'Pending' && suggestions.filter(s => s.status === 'Pending').length > 0 && (
                  <span className={s.badge}>{suggestions.filter(s => s.status === 'Pending').length}</span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className={s.empty}>No {filter.toLowerCase()} suggestions.</div>
          ) : (
            <div className={s.list}>
              {filtered.map(sug => (
                <div key={sug.id} className={`${s.card} glass`}>
                  <div className={s.cardTop}>
                    <div>
                      <div className={s.cardName}>{sug.name}</div>
                      <div className={s.cardMeta}>
                        <span>By {sug.submittedBy}</span>
                        <span>·</span>
                        <span>{sug.submittedAt}</span>
                        <span>·</span>
                        <span>{sug.category}</span>
                        {sug.date && <><span>·</span><Calendar size={11} /><span>{sug.date}</span></>}
                        {sug.venue && <><span>·</span><MapPin size={11} /><span>{sug.venue}</span></>}
                        {sug.capacity && <><span>·</span><Users size={11} /><span>{sug.capacity} max</span></>}
                        <span>·</span>
                        {sug.isFree !== false
                          ? <span className={s.freeTag}>FREE</span>
                          : <span className={s.priceTag}>ETB {sug.price}</span>
                        }
                      </div>
                    </div>
                    <span className={`${s.statusBadge} ${STATUS_STYLE[sug.status]?.cls}`}>
                      {STATUS_STYLE[sug.status]?.label}
                    </span>
                  </div>
                  <p className={s.cardDesc}>{sug.description}</p>
                  {sug.image && <img src={sug.image} alt={sug.name} className={s.cardImg} />}
                  {sug.status === 'Declined' && sug.adminNote && (
                    <div className={s.declineNote}>Declined: {sug.adminNote}</div>
                  )}
                  {sug.status === 'Pending' && (
                    <div className={s.cardActions}>
                      <button className={s.declineBtn} onClick={() => setDecline(sug)}>
                        <X size={13} /> Decline
                      </button>
                      <button className={s.convertBtn} onClick={() => setConvert(sug)}>
                        <Check size={13} /> Convert to Event
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {convertModal && (
        <ConvertModal suggestion={convertModal} onClose={() => setConvert(null)} onConvert={convertSuggestion} />
      )}
      {declineModal && (
        <DeclineModal suggestion={declineModal} onClose={() => setDecline(null)} onDecline={declineSuggestion} />
      )}
    </div>
  )
}
