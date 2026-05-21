import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EventDetailPage.module.css';
import RelatedEventCard from '../components/RelatedEventCard';

/* ─── Hardcoded sample event (replace with API call later) ─── */
const event = {
  id: 1,
  title: 'AASTU Tech Summit 2024',
  category: 'Hackathon',
  date: 'May 12, 2024',
  time: '09:00 AM',
  venue: 'Innovation Center Hall A',
  price: 'Free',
  image:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  description:
    'Join the biggest tech gathering of the semester. Industry leaders from across Addis Ababa share insights on AI, FinTech, and Renewable Energy. Network with peers, attend workshops, and compete in live challenges. Whether you are a first-year student curious about technology or a final-year engineer looking to connect with industry, this summit has something for everyone. Expect panel discussions, hands-on workshops, live coding challenges, and an awards ceremony celebrating the brightest minds at AASTU.',
  speakers: [
    { name: 'Dr. Abebe Girma', role: 'AI Researcher', initials: 'AG' },
    { name: 'Sara Tadesse', role: 'FinTech Lead', initials: 'ST' },
    { name: 'Yonas Bekele', role: 'Software Engineer', initials: 'YB' },
  ],
  schedule: [
    { time: '09:00 AM', title: 'Opening Ceremony' },
    { time: '10:00 AM', title: 'Keynote: Future of AI in Ethiopia' },
    { time: '12:00 PM', title: 'Lunch & Networking' },
    { time: '02:00 PM', title: 'Workshop Sessions' },
    { time: '05:00 PM', title: 'Awards & Closing' },
  ],
  sponsors: ['TechCorp', 'EthioTech', 'InnoHub', 'StartupET'],
};

/* ─── Related events (placeholder data) ─── */
const relatedEvents = [
  {
    id: 2,
    title: 'AI & Machine Learning Workshop',
    category: 'Workshop',
    date: 'May 20, 2024',
    time: '10:00 AM',
    venue: 'Lab Block C',
    price: 'Free',
    image:
      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
  },
  {
    id: 3,
    title: 'FinTech Innovation Challenge',
    category: 'Competition',
    date: 'June 3, 2024',
    time: '08:30 AM',
    venue: 'Main Auditorium',
    price: '50 ETB',
    image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
  },
  {
    id: 4,
    title: 'Renewable Energy Symposium',
    category: 'Seminar',
    date: 'June 15, 2024',
    time: '09:00 AM',
    venue: 'Engineering Hall',
    price: 'Free',
    image:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80',
  },
];

/* ─── Category badge color map ─── */
const categoryColors = {
  Hackathon: { bg: 'rgba(124,58,237,0.2)', color: '#A78BFA' },
  Workshop: { bg: 'rgba(16,185,129,0.15)', color: '#34D399' },
  Competition: { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
  Seminar: { bg: 'rgba(59,130,246,0.15)', color: '#93C5FD' },
  Conference: { bg: 'rgba(236,72,153,0.15)', color: '#F9A8D4' },
};

function getCategoryStyle(cat) {
  return (
    categoryColors[cat] || { bg: 'rgba(255,255,255,0.1)', color: '#CBD5E1' }
  );
}

/* ─── Icons (inline SVG to avoid external deps) ─── */
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const TicketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   EventDetailPage Component
═══════════════════════════════════════════════════════════════ */
export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registered, setRegistered] = useState(false);
  const [saved, setSaved] = useState(false);

  // In a real app: fetch event by `id` from API
  // For now we use the hardcoded object above
  const catStyle = getCategoryStyle(event.category);

  return (
    <div className={styles.page}>

      {/* ── Hero Banner ── */}
      <section className={styles.hero} aria-label="Event banner">
        <img
          src={event.image}
          alt={event.title}
          className={styles.heroImage}
        />
        {/* Gradient overlay */}
        <div className={styles.heroOverlay} aria-hidden="true" />

        {/* Back button */}
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeftIcon />
          <span>Back</span>
        </button>

        {/* Hero content */}
        <div className={styles.heroContent}>
          <span
            className={styles.categoryBadge}
            style={{ background: catStyle.bg, color: catStyle.color }}
          >
            {event.category}
          </span>
          <h1 className={styles.heroTitle}>{event.title}</h1>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className={styles.container}>
        <div className={styles.layout}>

          {/* ── Left / Main Column ── */}
          <main className={styles.mainCol}>

            {/* Event Meta */}
            <section className={styles.card} aria-label="Event details">
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <CalendarIcon />
                  <div>
                    <span className={styles.metaLabel}>Date</span>
                    <span className={styles.metaValue}>{event.date}</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <ClockIcon />
                  <div>
                    <span className={styles.metaLabel}>Time</span>
                    <span className={styles.metaValue}>{event.time}</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <MapPinIcon />
                  <div>
                    <span className={styles.metaLabel}>Venue</span>
                    <span className={styles.metaValue}>{event.venue}</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <TagIcon />
                  <div>
                    <span className={styles.metaLabel}>Category</span>
                    <span className={styles.metaValue}>{event.category}</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <TicketIcon />
                  <div>
                    <span className={styles.metaLabel}>Price</span>
                    <span className={styles.metaValue}>{event.price}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className={styles.card} aria-labelledby="desc-heading">
              <h2 className={styles.sectionTitle} id="desc-heading">
                About This Event
              </h2>
              <p className={styles.description}>{event.description}</p>
            </section>

            {/* Speakers */}
            <section className={styles.card} aria-labelledby="speakers-heading">
              <h2 className={styles.sectionTitle} id="speakers-heading">
                Speakers &amp; Organizers
              </h2>
              <div className={styles.speakersGrid}>
                {event.speakers.map((speaker) => (
                  <div key={speaker.name} className={styles.speakerCard}>
                    <div className={styles.avatar} aria-hidden="true">
                      {speaker.initials}
                    </div>
                    <div className={styles.speakerInfo}>
                      <span className={styles.speakerName}>{speaker.name}</span>
                      <span className={styles.speakerRole}>{speaker.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Schedule */}
            <section className={styles.card} aria-labelledby="schedule-heading">
              <h2 className={styles.sectionTitle} id="schedule-heading">
                Event Schedule
              </h2>
              <ol className={styles.timeline} aria-label="Event agenda">
                {event.schedule.map((item, index) => (
                  <li key={index} className={styles.timelineItem}>
                    <div className={styles.timelineDot} aria-hidden="true" />
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineTime}>{item.time}</span>
                      <span className={styles.timelineTitle}>{item.title}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Sponsors */}
            <section className={styles.card} aria-labelledby="sponsors-heading">
              <h2 className={styles.sectionTitle} id="sponsors-heading">
                Sponsors
              </h2>
              <div className={styles.sponsorsRow}>
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor} className={styles.sponsorBox} aria-label={`Sponsor: ${sponsor}`}>
                    <span className={styles.sponsorName}>{sponsor}</span>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* ── Right / Sidebar ── */}
          <aside className={styles.sidebar} aria-label="Registration">
            <div className={styles.stickyCard}>
              <div className={styles.priceDisplay}>
                <span className={styles.priceLabel}>Admission</span>
                <span className={styles.priceValue}>{event.price}</span>
              </div>

              {/* Register Button */}
              <button
                className={`${styles.registerBtn} ${registered ? styles.registeredBtn : ''}`}
                onClick={() => setRegistered((prev) => !prev)}
                aria-pressed={registered}
              >
                {registered ? (
                  <>
                    <CheckIcon />
                    Registered ✓
                  </>
                ) : (
                  event.price === 'Free' ? 'Register Now' : 'Buy Ticket'
                )}
              </button>

              {/* Save / Bookmark */}
              <button
                className={`${styles.saveBtn} ${saved ? styles.savedBtn : ''}`}
                onClick={() => setSaved((prev) => !prev)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from saved events' : 'Save this event'}
              >
                <BookmarkIcon filled={saved} />
                {saved ? 'Event Saved' : 'Save Event'}
              </button>

              {/* Quick info recap */}
              <div className={styles.sidebarMeta}>
                <div className={styles.sidebarMetaRow}>
                  <CalendarIcon />
                  <span>{event.date}</span>
                </div>
                <div className={styles.sidebarMetaRow}>
                  <ClockIcon />
                  <span>{event.time}</span>
                </div>
                <div className={styles.sidebarMetaRow}>
                  <MapPinIcon />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
          </aside>

        </div>

        {/* ── Related Events ── */}
        <section className={styles.relatedSection} aria-labelledby="related-heading">
          <h2 className={styles.relatedTitle} id="related-heading">
            You May Also Like
          </h2>
          <div className={styles.relatedGrid}>
            {relatedEvents.map((relEvent) => (
              <RelatedEventCard key={relEvent.id} event={relEvent} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
