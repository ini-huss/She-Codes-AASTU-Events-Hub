import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Save, Bell, Shield, Palette, Globe, Database } from 'lucide-react'
import s from './SettingsPage.module.css'

const SECTIONS = [
  { id: 'general',       label: 'General',        icon: Globe },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',        icon: Shield },
  { id: 'appearance',    label: 'Appearance',      icon: Palette },
  { id: 'data',          label: 'Data & Privacy',  icon: Database },
]

// Preset accent colors
const PRESETS = [
  { label: 'Purple (default)', value: '#7c5cbf' },
  { label: 'Aqua',             value: '#00ffff' },
  { label: 'Blue',             value: '#3b82f6' },
  { label: 'Green',            value: '#10b981' },
  { label: 'Pink',             value: '#ec4899' },
  { label: 'Orange',           value: '#f97316' },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`${s.toggle} ${checked ? s.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className={s.toggleThumb} />
    </button>
  )
}

export default function SettingsPage() {
  const { accentColor, setAccentColor, language, setLanguage, t, currentUser, userCan } = useApp()
  const [active, setActive] = useState('general')
  const [saved, setSaved]   = useState(false)

  // General — language change applies immediately to whole app
  const [platformName, setPlatformName] = useState('AASTU Events Hub')
  const [timezone, setTimezone]         = useState('Africa/Addis_Ababa')

  function handleLanguageChange(lang) {
    setLanguage(lang)   // ← updates context immediately, whole UI re-renders
  }

  // Notifications
  const [emailNotifs, setEmailNotifs]   = useState(true)
  const [pushNotifs, setPushNotifs]     = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)
  const [urgentAlerts, setUrgentAlerts] = useState(true)

  // Security
  const [twoFactor, setTwoFactor]       = useState(false)
  const [sessionTimeout, setSession]    = useState('30')
  const [loginAlerts, setLoginAlerts]   = useState(true)

  // Appearance — local copy, applied live via context
  const [localAccent, setLocalAccent]   = useState(accentColor)
  const [compactMode, setCompact]       = useState(false)
  const [animations, setAnimations]     = useState(true)

  // Data
  const [autoBackup, setAutoBackup]     = useState(true)
  const [analyticsOn, setAnalyticsOn]   = useState(true)

  // Apply accent color live as user picks
  function handleAccentChange(color) {
    setLocalAccent(color)
    setAccentColor(color)   // ← this updates CSS variables immediately
  }

  function handleSave() {
    setAccentColor(localAccent)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Settings</h1>
        <p className={s.sub}>Configure your platform preferences and system options.</p>
      </div>

      <div className={s.layout}>
        {/* Sidebar nav */}
        <nav className={`${s.settingsNav} glass`}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${s.navItem} ${active === id ? s.navActive : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className={`${s.panel} glass`}>

          {/* Access notice for non-Super-Admin */}
          {currentUser?.role !== 'Super Admin' && (
            <div className={s.accessNotice}>
              <span>👁 You are viewing as <strong>{currentUser?.role}</strong>. Some settings are read-only.</span>
            </div>
          )}

          {/* ── General ── */}
          {active === 'general' && (
            <div className={s.section}>
              <h2 className={s.sectionTitle}>General Settings</h2>
              <div className={s.fields}>
                <label className={s.field}>
                  <span className={s.fieldLabel}>Platform Name</span>
                  <input className={s.input} value={platformName} onChange={e => setPlatformName(e.target.value)} />
                </label>
                <label className={s.field}>
                  <span className={s.fieldLabel}>Timezone</span>
                  <select className={s.input} value={timezone} onChange={e => setTimezone(e.target.value)}>
                    <option>Africa/Addis_Ababa</option>
                    <option>UTC</option>
                    <option>Africa/Nairobi</option>
                    <option>Europe/London</option>
                  </select>
                </label>
                <label className={s.field}>
                  <span className={s.fieldLabel}>Language — changes apply instantly</span>
                  <select className={s.input} value={language} onChange={e => handleLanguageChange(e.target.value)}>
                    <option>English</option>
                    <option>Amharic</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {active === 'notifications' && (
            <div className={s.section}>
              <h2 className={s.sectionTitle}>Notification Preferences</h2>
              <div className={s.toggleList}>
                {[
                  { label: 'Email Notifications',  sub: 'Receive updates via email',                  val: emailNotifs,  set: setEmailNotifs },
                  { label: 'Push Notifications',   sub: 'Browser push notifications',                 val: pushNotifs,   set: setPushNotifs },
                  { label: 'Weekly Report',        sub: 'Summary of platform activity every Monday',  val: weeklyReport, set: setWeeklyReport },
                  { label: 'Urgent Alerts',        sub: 'Immediate alerts for urgent event requests', val: urgentAlerts, set: setUrgentAlerts },
                ].map(({ label, sub, val, set }) => (
                  <div key={label} className={s.toggleRow}>
                    <div>
                      <div className={s.toggleLabel}>{label}</div>
                      <div className={s.toggleSub}>{sub}</div>
                    </div>
                    <Toggle checked={val} onChange={set} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {active === 'security' && (
            <div className={s.section}>
              <h2 className={s.sectionTitle}>Security Settings</h2>
              <div className={s.toggleList}>
                <div className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Two-Factor Authentication</div>
                    <div className={s.toggleSub}>Add an extra layer of security to your account</div>
                  </div>
                  <Toggle checked={twoFactor} onChange={setTwoFactor} />
                </div>
                <div className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Login Alerts</div>
                    <div className={s.toggleSub}>Get notified of new sign-ins to your account</div>
                  </div>
                  <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
                </div>
              </div>
              <div className={s.fields} style={{ marginTop: 20 }}>
                <label className={s.field}>
                  <span className={s.fieldLabel}>Session Timeout (minutes)</span>
                  <select className={s.input} value={sessionTimeout} onChange={e => setSession(e.target.value)}>
                    {['15','30','60','120'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {active === 'appearance' && (
            <div className={s.section}>
              <h2 className={s.sectionTitle}>Appearance</h2>

              <div className={s.field}>
                <span className={s.fieldLabel}>Accent Color — changes apply instantly</span>
                {/* Preset swatches */}
                <div className={s.swatches}>
                  {PRESETS.map(p => (
                    <button
                      key={p.value}
                      className={`${s.swatch} ${localAccent === p.value ? s.swatchActive : ''}`}
                      style={{ background: p.value }}
                      title={p.label}
                      onClick={() => handleAccentChange(p.value)}
                    />
                  ))}
                </div>
                {/* Custom color picker */}
                <div className={s.colorRow}>
                  <input
                    type="color"
                    className={s.colorPicker}
                    value={localAccent}
                    onChange={e => handleAccentChange(e.target.value)}
                  />
                  <span className={s.colorVal}>{localAccent}</span>
                  <span className={s.colorHint}>or pick a custom color</span>
                </div>
              </div>

              <div className={s.toggleList} style={{ marginTop: 20 }}>
                <div className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Compact Mode</div>
                    <div className={s.toggleSub}>Reduce spacing for a denser layout</div>
                  </div>
                  <Toggle checked={compactMode} onChange={setCompact} />
                </div>
                <div className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Animations</div>
                    <div className={s.toggleSub}>Enable smooth transitions and animations</div>
                  </div>
                  <Toggle checked={animations} onChange={setAnimations} />
                </div>
              </div>
            </div>
          )}

          {/* ── Data ── */}
          {active === 'data' && (
            <div className={s.section}>
              <h2 className={s.sectionTitle}>Data & Privacy</h2>
              <div className={s.toggleList}>
                <div className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Automatic Backups</div>
                    <div className={s.toggleSub}>Back up platform data daily at midnight</div>
                  </div>
                  <Toggle checked={autoBackup} onChange={setAutoBackup} />
                </div>
                <div className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Usage Analytics</div>
                    <div className={s.toggleSub}>Share anonymous usage data to improve the platform</div>
                  </div>
                  <Toggle checked={analyticsOn} onChange={setAnalyticsOn} />
                </div>
              </div>
              {currentUser?.role === 'Super Admin' && (
              <div className={s.dangerZone}>
                <h3 className={s.dangerTitle}>Danger Zone — Super Admin Only</h3>
                <button className={s.dangerBtn} onClick={() => {
                  if (window.confirm('Clear all event data? This cannot be undone.')) {
                    localStorage.removeItem('aastu_events')
                    localStorage.removeItem('aastu_suggestions')
                    window.location.reload()
                  }
                }}>
                  Clear All Event Data
                </button>
                <button className={s.dangerBtn} onClick={() => {
                  if (window.confirm('Clear the audit log? This cannot be undone.')) {
                    localStorage.removeItem('aastu_audit_log')
                    window.location.reload()
                  }
                }}>
                  Clear Audit Log
                </button>
                <button className={s.dangerBtn} onClick={() => {
                  if (window.confirm('⚠️ FULL RESET: This will delete ALL data including all accounts, events, users, and logs. The system will restart fresh with only the default Super Admin. Are you absolutely sure?')) {
                    localStorage.clear()
                    window.location.reload()
                  }
                }}>
                  Full System Reset
                </button>
              </div>
              )}
            </div>
          )}

          {/* Save */}
          <div className={s.saveRow}>
            {saved && <span className={s.savedMsg}>✓ Settings saved</span>}
            <button
              className={s.saveBtn}
              onClick={handleSave}
              disabled={!userCan('canChangeSettings')}
              style={!userCan('canChangeSettings') ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
