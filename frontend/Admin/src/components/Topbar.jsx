import React, { useState } from 'react'
import { Bell, Search, X, Inbox } from 'lucide-react'
import { useApp } from '../context/AppContext'
import s from './Topbar.module.css'

export default function Topbar() {
  const {
    notifications, unreadCount, markAllRead,
    myInbox, myUnreadInbox, markInboxRead,
    currentUser,
  } = useApp()

  const [panel, setPanel] = useState(null) // null | 'notifs' | 'inbox'
  const [search, setSearch] = useState('')

  function togglePanel(name) {
    if (panel === name) {
      setPanel(null)
    } else {
      setPanel(name)
      if (name === 'notifs') markAllRead()
      if (name === 'inbox')  markInboxRead(currentUser?.id)
    }
  }

  const INBOX_COLOR = { approved: '#10b981', rejected: '#ef4444', role_change: '#f59e0b', welcome: '#7c5cbf', info: '#6b9aaa' }

  return (
    <header className={`${s.bar} glass`}>
      {/* Search */}
      <div className={s.search}>
        <Search size={13} className={s.searchIcon} />
        <input
          className={s.searchInput}
          placeholder="Search operations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className={s.clearBtn}>
            <X size={12} />
          </button>
        )}
      </div>

      <div className={s.right}>
        {/* Personal inbox — shows messages for the logged-in user */}
        <div className={s.notifWrap}>
          <button
            className={s.iconBtn}
            onClick={() => togglePanel('inbox')}
            aria-label="My inbox"
            title="My inbox"
          >
            <Inbox size={17} />
            {myUnreadInbox > 0 && <span className={s.dot}>{myUnreadInbox}</span>}
          </button>

          {panel === 'inbox' && (
            <div className={`${s.dropdown} glass`}>
              <div className={s.dropHead}>
                <span>My Inbox</span>
                <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>
                  Messages about your events &amp; role
                </span>
              </div>
              {myInbox.length === 0 ? (
                <div className={s.emptyPanel}>No messages yet.</div>
              ) : myInbox.map(m => (
                <div key={m.id} className={`${s.notifItem} ${!m.read ? s.unread : ''}`}>
                  <span
                    className={s.notifDot}
                    style={{ background: INBOX_COLOR[m.type] || 'var(--t3)' }}
                  />
                  <div>
                    <div className={s.notifText}>{m.text}</div>
                    <div className={s.notifTime}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin notifications bell */}
        <div className={s.notifWrap}>
          <button
            className={s.iconBtn}
            onClick={() => togglePanel('notifs')}
            aria-label="Notifications"
            title="Admin notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className={s.dot}>{unreadCount}</span>}
          </button>

          {panel === 'notifs' && (
            <div className={`${s.dropdown} glass`}>
              <div className={s.dropHead}>
                <span>Notifications</span>
                <button className={s.markRead} onClick={markAllRead}>Mark all read</button>
              </div>
              {notifications.length === 0 ? (
                <div className={s.emptyPanel}>No notifications yet.</div>
              ) : notifications.slice(0, 10).map(n => (
                <div key={n.id} className={`${s.notifItem} ${!n.read ? s.unread : ''}`}>
                  <span className={s.notifDot} />
                  <div>
                    <div className={s.notifText}>{n.text}</div>
                    <div className={s.notifTime}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className={s.avatar}>{currentUser?.avatar || 'AD'}</div>
      </div>
    </header>
  )
}
