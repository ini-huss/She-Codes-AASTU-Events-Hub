import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RelatedEventCard.module.css';

/* ─── Category badge color map ─── */
const categoryColors = {
  Hackathon:   { bg: 'rgba(124,58,237,0.2)',  color: '#A78BFA' },
  Workshop:    { bg: 'rgba(16,185,129,0.15)', color: '#34D399' },
  Competition: { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
  Seminar:     { bg: 'rgba(59,130,246,0.15)', color: '#93C5FD' },
  Conference:  { bg: 'rgba(236,72,153,0.15)', color: '#F9A8D4' },
};

function getCategoryStyle(cat) {
  return categoryColors[cat] || { bg: 'rgba(255,255,255,0.1)', color: '#CBD5E1' };
}

/* ─── Inline SVG icons ─── */
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   RelatedEventCard Component
═══════════════════════════════════════════════════════════════ */
export default function RelatedEventCard({ event }) {
  const navigate = useNavigate();
  const catStyle = getCategoryStyle(event.category);

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/events/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${event.id}`)}
      aria-label={`View details for ${event.title}`}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img
          src={event.image}
          alt={event.title}
          className={styles.image}
          loading="lazy"
        />
        <span
          className={styles.badge}
          style={{ background: catStyle.bg, color: catStyle.color }}
        >
          {event.category}
        </span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <CalendarIcon />
            {event.date}
          </span>
          <span className={styles.metaItem}>
            <MapPinIcon />
            {event.venue}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>{event.price}</span>
          <span className={styles.viewLink}>View Details →</span>
        </div>
      </div>
    </article>
  );
}
