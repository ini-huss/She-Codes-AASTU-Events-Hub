import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Eye, EyeOff, Zap, ArrowRight, Info } from 'lucide-react'
import s from './AuthPage.module.css'

export default function AuthPage() {
  const { login, signup, authError, setAuthError, t, authLoading } = useApp()
  const [mode, setMode]         = useState('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [department, setDept]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [localErr, setLocalErr] = useState('')

  function switchMode(m) {
    setMode(m); setLocalErr(''); setAuthError('')
    setName(''); setEmail(''); setPassword(''); setConfirm(''); setDept('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLocalErr(''); setAuthError('')
    if (mode === 'login') {
      if (!email || !password) { setLocalErr('Please fill in all fields.'); return }
      login(email, password)
    } else {
      if (!name || !email || !password || !confirm) { setLocalErr('Please fill in all fields.'); return }
      if (password.length < 6) { setLocalErr('Password must be at least 6 characters.'); return }
      if (password !== confirm) { setLocalErr('Passwords do not match.'); return }
      signup(name, email, password, department)
    }
  }

  const error = localErr || authError

  return (
    <div className={s.page}>
      <div className={s.blob1} />
      <div className={s.blob2} />

      <div className={`${s.card} glass`}>
        {/* Brand */}
        <div className={s.brand}>
          <div className={s.brandIcon}><Zap size={18} /></div>
          <div>
            <div className={s.brandName}>AASTU Events Hub</div>
            <div className={s.brandSub}>Admin Platform</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={s.tabs}>
          <button className={`${s.tab} ${mode === 'login'  ? s.tabActive : ''}`} onClick={() => switchMode('login')}>{t('signIn')}</button>
          <button className={`${s.tab} ${mode === 'signup' ? s.tabActive : ''}`} onClick={() => switchMode('signup')}>{t('createAcct')}</button>
        </div>

        <h2 className={s.heading}>{mode === 'login' ? t('welcomeBack2') : t('createAcct')}</h2>
        <p className={s.subheading}>{mode === 'login' ? t('signInSub') : t('createSub')}</p>

        <form className={s.form} onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <label className={s.label}>
                {t('fullName')}
                <input className={s.input} type="text" placeholder="e.g. Dr. Elias Tesfaye"
                  value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </label>
              <label className={s.label}>
                {t('department')}
                <select className={s.input} value={department} onChange={e => setDept(e.target.value)}>
                  <option value="">— Select your department —</option>
                  <optgroup label="Administration">
                    <option>Office of the President</option>
                    <option>Office of the Registrar</option>
                    <option>Dean of Students Office</option>
                    <option>IT &amp; Systems Department</option>
                    <option>Finance &amp; Administration</option>
                    <option>Public Relations</option>
                  </optgroup>
                  <optgroup label="Engineering Departments">
                    <option>Computer Science &amp; Engineering</option>
                    <option>Electrical &amp; Computer Engineering</option>
                    <option>Civil &amp; Environmental Engineering</option>
                    <option>Mechanical Engineering</option>
                    <option>Chemical Engineering</option>
                    <option>Software Engineering</option>
                    <option>Industrial Engineering</option>
                    <option>Architecture &amp; Urban Planning</option>
                  </optgroup>
                  <optgroup label="Science Departments">
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
            </>
          )}

          <label className={s.label}>
            {t('email')}
            <input className={s.input} type="email" placeholder="you@aastu.edu.et"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </label>

          <label className={s.label}>
            {t('password')}
            <div className={s.pwWrap}>
              <input className={s.input} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          {mode === 'signup' && (
            <label className={s.label}>
              {t('confirmPw')}
              <input className={s.input} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            </label>
          )}

          {error && <div className={s.error}>{error}</div>}

          {mode === 'signup' && (
            <div className={s.roleNote}>
              <Info size={13} />
              <span>{t('roleNote')}</span>
            </div>
          )}

          <button type="submit" className={s.submitBtn} disabled={authLoading}>
            {authLoading ? 'Please wait...' : (mode === 'login' ? t('signIn') : t('createAcct'))}
            {!authLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {mode === 'login' && (
          <div className={s.hint}>
            <span>Default Super Admin:</span>
            <code>admin@aastu.edu.et</code>
            <span>/</span>
            <code>admin123</code>
          </div>
        )}

        <div className={s.switchRow}>
          {mode === 'login'
            ? <span>{t('noAccount')} <button className={s.switchBtn} onClick={() => switchMode('signup')}>{t('createOne')}</button></span>
            : <span>{t('haveAccount')} <button className={s.switchBtn} onClick={() => switchMode('login')}>{t('signIn')}</button></span>
          }
        </div>
      </div>
    </div>
  )
}
