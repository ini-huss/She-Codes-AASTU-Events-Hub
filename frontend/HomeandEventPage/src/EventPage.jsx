import { useEffect, useMemo, useState } from "react";
import { COLORS } from "./components/constants";

const eventsData = [
  {
    id: 1,
    title: "AASTU Tech Summit 2024",
    category: "Hackathon",
    date: "May 12, 2024",
    time: "09:00 AM",
    venue: "Innovation Center Hall A",
    price: "Free Entry",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop",
    org: "Tech Club",
  },
  {
    id: 2,
    title: "Red Carpet Gala Night",
    category: "Cultural",
    date: "May 15, 2024",
    time: "06:00 PM",
    venue: "Red Carpet Plaza",
    price: "ETB 200",
    action: "Buy Ticket",
    actionType: "ticket",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop",
    org: "Student Union",
  },
  {
    id: 3,
    title: "Spring Career Expo",
    category: "Career",
    date: "May 18, 2024",
    time: "10:00 AM",
    venue: "Main Library Hall",
    price: "Students Only",
    action: "Register",
    actionType: "register",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
    org: "Student Union",
  },
  {
    id: 4,
    title: "AI & Robotics Seminar",
    category: "Seminar",
    date: "May 20, 2024",
    time: "02:00 PM",
    venue: "Block B - Seminar Room",
    price: "Free Entry",
    action: "Register",
    actionType: "register",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
    org: "Robotics Society",
  },
  {
    id: 5,
    title: "Campus Beats Live",
    category: "Music",
    date: "May 25, 2024",
    time: "07:00 PM",
    venue: "Amphitheater Area",
    price: "ETB 150",
    action: "Get Ticket",
    actionType: "ticket",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop",
    org: "Student Union",
  },
  {
    id: 6,
    title: "AASTU Inter-College Finals",
    category: "Sports",
    date: "May 30, 2024",
    time: "04:00 PM",
    venue: "Main Sports Arena",
    price: "Free Entry",
    action: "Join Now",
    actionType: "join",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop",
    org: "Student Union",
  },
];

const categoryColors = {
  Hackathon: { bg: "#1de9b6", text: "#0a0a1a" },
  Cultural: { bg: "#ff6b9d", text: "#0a0a1a" },
  Career: { bg: "#7c83fd", text: "#fff" },
  Seminar: { bg: "#ffd166", text: "#0a0a1a" },
  Music: { bg: "#ff9a3c", text: "#0a0a1a" },
  Sports: { bg: "#4cc9f0", text: "#0a0a1a" },
  Tech: { bg: "#1de9b6", text: "#0a0a1a" },
  Arts: { bg: "#ff6b9d", text: "#0a0a1a" },
};

const CATEGORIES = ["Tech", "Arts", "Sports", "Seminars"];
const ORGS = ["Student Union", "Tech Club", "Robotics Society"];
const SORT_OPTIONS = ["Newest First", "Oldest First", "Price: Low to High", "A-Z"];

function Modal({ event, onClose }) {
  const [registered, setRegistered] = useState(false);
  if (!event) return null;

  const handleAction = () => setRegistered(true);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        <img src={event.image} alt={event.title} style={styles.modalImg} />
        <h2 style={styles.modalTitle}>{event.title}</h2>
        <div style={styles.modalMeta}>
          <span>📅 {event.date} • {event.time}</span>
          <span>📍 {event.venue}</span>
          <span>🏢 {event.org}</span>
        </div>
        <div style={styles.modalPriceLine}>
          <span style={styles.priceTag}>{event.price}</span>
          {registered ? (
            <span style={styles.successMsg}>✅ You're registered!</span>
          ) : (
            <button style={styles.actionBtnModal} onClick={handleAction}>
              {event.action}
            </button>
          )}
        </div>
        <button style={styles.addCalBtn} onClick={() => alert(`Added "${event.title}" to your calendar!`)}>
          📆 Add to Calendar
        </button>
      </div>
    </div>
  );
}

function EventCard({ event, onOpen }) {
  const isFree = event.price === "Free Entry" || event.price === "Students Only";

  return (
    <div style={styles.card} onClick={() => onOpen(event)}>
      <div style={styles.cardImgWrap}>
        <img src={event.image} alt={event.title} style={styles.cardImg} />
        <button
          style={styles.calIconBtn}
          title="Add to Calendar"
          onClick={e => { e.stopPropagation(); alert(`Added "${event.title}" to your calendar!`); }}
        >📆</button>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{event.title}</h3>
        <div style={styles.cardMeta}>📅 {event.date} • {event.time}</div>
        <div style={styles.cardMeta}>📍 {event.venue}</div>
        <div style={styles.cardFooter}>
          <span style={isFree ? styles.freeTag : styles.priceTag}>{event.price}</span>
          <button
            style={styles.actionBtn}
            onClick={e => { e.stopPropagation(); onOpen(event); }}
          >
            {event.action}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventPage({ selectedEvent }) {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [venue, setVenue] = useState("All Venues");
  const [sort, setSort] = useState("Newest First");
  const [modal, setModal] = useState(null);

  const toggleCat = c => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleOrg = o => setSelectedOrgs(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  const clearAll = () => {
    setSelectedCats([]);
    setSelectedOrgs([]);
    setVenue("All Venues");
  };

  useEffect(() => {
    if (selectedEvent) {
      setModal(selectedEvent);
    }
  }, [selectedEvent]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return eventsData.filter(event => {
      const matchesQuery = !query || [event.title, event.category, event.venue]
        .some(value => value.toLowerCase().includes(query));
      if (!matchesQuery) return false;

      if (selectedCats.length && !selectedCats.some(category => event.category === category)) {
        return false;
      }

      if (selectedOrgs.length && !selectedOrgs.includes(event.org)) {
        return false;
      }

      if (venue !== "All Venues" && event.venue !== venue) {
        return false;
      }

      return true;
    });
  }, [search, selectedCats, selectedOrgs, venue]);

  const sortedEvents = useMemo(() => {
    const events = [...filteredEvents];

    if (sort === "A-Z") {
      return events.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort === "Oldest First") {
      return events.sort((a, b) => a.id - b.id);
    }

    if (sort === "Price: Low to High") {
      return events.sort((a, b) => {
        const value = event => event.price.includes("Free") || event.price.includes("Students") ? 0 : parseInt(event.price.replace(/\D/g, "")) || 0;
        return value(a) - value(b);
      });
    }

    return events.sort((a, b) => b.id - a.id);
  }, [filteredEvents, sort]);

  return (
    <div style={styles.root}>
      <div style={styles.hero}>
        <div style={styles.heroSearchWrap}>
          <span style={styles.heroSearchIcon}>🔍</span>
          <input
            style={styles.heroInput}
            placeholder="Explore hackathons, workshops, or festivals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button style={styles.heroBtn} onClick={() => {}}>
            <span>⚙️</span> Search Now
          </button>
        </div>
    </div>
      <div style={styles.content}>
        <aside style={styles.sidebar}>
          <h3 style={styles.sideTitle}>Filters</h3>

          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>CATEGORY</div>
            <div style={styles.tagRow}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  style={{ ...styles.filterTag, ...(selectedCats.includes(c) ? styles.filterTagActive : {}) }}
                  onClick={() => toggleCat(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>VENUE</div>
            <select style={styles.select} value={venue} onChange={e => setVenue(e.target.value)}>
              <option>All Venues</option>
              <option>Innovation Center Hall A</option>
              <option>Main Library Hall</option>
              <option>Main Sports Arena</option>
              <option>Amphitheater Area</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>ORGANIZATION</div>
            {ORGS.map(o => (
              <label key={o} style={styles.radioLabel}>
                <input type="checkbox" checked={selectedOrgs.includes(o)} onChange={() => toggleOrg(o)} style={{ accentColor: "#7c83fd" }} />
                <span style={{ marginLeft: 8 }}>{o}</span>
              </label>
            ))}
          </div>

          <button style={styles.clearBtn} onClick={clearAll}>Clear All</button>
        </aside>

        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <span style={styles.showing}>Showing <b style={{ color: "#7c83fd" }}>{sortedEvents.length}</b> upcoming events</span>
            <div style={styles.sortWrap}>
              <span style={{ color: "#aaa", marginRight: 8, fontSize: 13 }}>Sort by:</span>
              <select style={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {sortedEvents.length === 0 ? (
            <div style={styles.empty}>No events found. Try clearing filters!</div>
          ) : (
            <div style={styles.grid}>
              {sortedEvents.map(e => <EventCard key={e.id} event={e} onOpen={setModal} />)}
            </div>
          )}

          <div style={styles.discoverWrap}>
            <button style={styles.discoverBtn} onClick={() => alert("Loading more events...")}>
              ↓ Discover More Events
            </button>
          </div>
        </main>
      </div>

      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <div style={styles.footerLogo}>AASTU Events Hub</div>
          <p style={styles.footerDesc}>The central platform for managing and discovering all Addis Ababa Science and Technology University events.</p>
        </div>
        <div style={styles.footerLinks}>
          <div>
            <div style={styles.footerHead}>QUICK LINKS</div>
            <button style={styles.footerLink} onClick={() => alert("Privacy Policy")}>Privacy Policy</button>
            <button style={styles.footerLink} onClick={() => alert("Terms of Service")}>Terms of Service</button>
          </div>
          <div>
            <div style={styles.footerHead}>RESOURCES</div>
            <button style={styles.footerLink} onClick={() => alert("Campus Map")}>Campus Map</button>
            <button style={styles.footerLink} onClick={() => alert("Contact Support")}>Contact Support</button>
          </div>
        </div>
      </footer>
      <div style={styles.footerCopy}>© 2024 Addis Ababa Science and Technology University. All Rights Reserved.</div>
      {modal && <Modal event={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

const styles = {
  root: { fontFamily: "'Segoe UI', sans-serif", background: "#0d0d1f", color: "#e0e0ff", minHeight: "100vh" },
  nav: { display: "flex", alignItems: "center", padding: "0 32px", height: 56, background: "#13132a", borderBottom: "1px solid #1e1e3a", position: "sticky", top: 0, zIndex: 100 },
  logo: { fontWeight: 800, fontSize: 18, color: "#fff", marginRight: 32, letterSpacing: -0.5 },
  navLinks: { display: "flex", gap: 4 },
  navLink: { background: "none", border: "none", color: "#aab", fontSize: 14, padding: "6px 14px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" },
  navLinkActive: { color: "#fff", background: "#1e1e3a", borderBottom: "2px solid #7c83fd" },
  navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 },
  iconBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aab" },
  navSearch: { background: "#1e1e3a", border: "1px solid #2e2e5a", borderRadius: 8, color: "#fff", padding: "6px 12px", outline: "none", fontSize: 13 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#7c83fd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" },

  hero: { background: "linear-gradient(135deg, #13132a 0%, #1a1a3a 100%)", padding: "32px 32px 24px", borderBottom: "1px solid #1e1e3a" },
  heroSearchWrap: { display: "flex", alignItems: "center", background: "#1e1e3a", borderRadius: 14, padding: "10px 16px", maxWidth: 860, gap: 10, border: "1px solid #2e2e5a" },
  heroSearchIcon: { fontSize: 18, color: "#7c83fd" },
  heroInput: { flex: 1, background: "none", border: "none", color: "#fff", fontSize: 15, outline: "none" },
  heroBtn: { background: "linear-gradient(90deg, #7c83fd, #a259ff)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },  pageActionRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 },
  secondaryBtn: { background: 'transparent', color: '#7c83fd', border: '1px solid #7c83fd', borderRadius: 12, padding: '10px 18px', cursor: 'pointer', fontWeight: 700 },
  content: { display: "flex", maxWidth: 1200, margin: "0 auto", padding: "24px 16px", gap: 24 },

  sidebar: { width: 200, minWidth: 180, flexShrink: 0, background: "#13132a", borderRadius: 14, padding: "20px 16px", border: "1px solid #1e1e3a", height: "fit-content" },
  sideTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#fff" },
  filterGroup: { marginBottom: 20 },
  filterLabel: { fontSize: 11, color: "#7c83fd", fontWeight: 700, letterSpacing: 1, marginBottom: 10 },
  radioLabel: { display: "flex", alignItems: "center", fontSize: 13, color: "#ccd", marginBottom: 8, cursor: "pointer" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  filterTag: { background: "#1e1e3a", border: "1px solid #2e2e5a", color: "#ccd", borderRadius: 20, padding: "4px 12px", fontSize: 12, cursor: "pointer", transition: "all 0.2s" },
  filterTagActive: { background: "#7c83fd", color: "#fff", border: "1px solid #7c83fd" },
  select: { background: "#1e1e3a", border: "1px solid #2e2e5a", color: "#ccd", borderRadius: 8, padding: "6px 10px", width: "100%", fontSize: 13, outline: "none" },
  clearBtn: { width: "100%", background: "none", border: "1px solid #2e2e5a", color: "#aab", borderRadius: 8, padding: "8px 0", fontSize: 13, cursor: "pointer", marginTop: 4, transition: "all 0.2s" },

  main: { flex: 1 },
  mainHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  showing: { fontSize: 14, color: "#aab" },
  sortWrap: { display: "flex", alignItems: "center" },
  sortSelect: { background: "#1e1e3a", border: "1px solid #2e2e5a", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, outline: "none", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 },
  empty: { textAlign: "center", color: "#7c83fd", padding: 60, fontSize: 16 },

  card: { background: "#13132a", borderRadius: 16, overflow: "hidden", border: "1px solid #1e1e3a", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 2px 12px #0005" },
  cardImgWrap: { position: "relative" },
  cardImg: { width: "100%", height: 160, objectFit: "cover", display: "block" },
  badge: { position: "absolute", top: 10, left: 10, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 },
  calIconBtn: { position: "absolute", top: 10, right: 10, background: "#0008", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 16, color: "#fff" },
  cardBody: { padding: "14px 16px 16px" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.3 },
  cardMeta: { fontSize: 12, color: "#8899bb", marginBottom: 4 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  freeTag: { fontSize: 12, color: "#1de9b6", fontWeight: 600 },
  priceTag: { fontSize: 12, color: "#ffd166", fontWeight: 600 },
  actionBtn: { background: "linear-gradient(90deg, #7c83fd, #a259ff)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" },

  discoverWrap: { display: "flex", justifyContent: "center", marginTop: 32 },
  discoverBtn: { background: "#13132a", border: "1px solid #2e2e5a", color: "#aab", borderRadius: 30, padding: "12px 32px", fontSize: 14, cursor: "pointer", transition: "all 0.2s" },

  footer: { background: "#0a0a18", borderTop: "1px solid #1e1e3a", padding: "32px 48px", display: "flex", gap: 48, justifyContent: "space-between" },
  footerLeft: { maxWidth: 320 },
  footerLogo: { fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 10 },
  footerDesc: { fontSize: 13, color: "#778", lineHeight: 1.6 },
  footerLinks: { display: "flex", gap: 48 },
  footerHead: { fontSize: 11, color: "#7c83fd", fontWeight: 700, letterSpacing: 1, marginBottom: 12 },
  footerLink: { display: "block", background: "none", border: "none", color: "#aab", fontSize: 13, cursor: "pointer", marginBottom: 8, textAlign: "left", padding: 0 },
  footerCopy: { textAlign: "center", padding: "14px 0", fontSize: 12, color: "#556", background: "#0a0a18", borderTop: "1px solid #1e1e3a" },

  overlay: { position: "fixed", inset: 0, background: "#000a", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#13132a", borderRadius: 20, width: 420, maxWidth: "95vw", padding: 28, position: "relative", border: "1px solid #2e2e5a", boxShadow: "0 8px 48px #0008" },
  closeBtn: { position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "#aab", fontSize: 18, cursor: "pointer" },
  modalImg: { width: "100%", borderRadius: 12, height: 180, objectFit: "cover", marginBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 },
  modalMeta: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#8899bb", marginBottom: 16 },
  modalPriceLine: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  actionBtnModal: { background: "linear-gradient(90deg, #7c83fd, #a259ff)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  successMsg: { color: "#1de9b6", fontWeight: 700, fontSize: 14 },
  addCalBtn: { width: "100%", background: "#1e1e3a", border: "1px solid #2e2e5a", color: "#ccd", borderRadius: 10, padding: "10px 0", fontSize: 13, cursor: "pointer", marginTop: 4 },
};
