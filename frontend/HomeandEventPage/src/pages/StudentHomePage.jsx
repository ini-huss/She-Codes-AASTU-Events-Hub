import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../components/constants";
import HeroBanner from "../components/HeroBanner";
import HappeningSection from "../components/HappeningSection";
import CategoryFilter from "../components/CategoryFilter";
import RecommendedSection from "../components/RecommendedSection";
import api from "../api";
import { getSession } from "../App";

const CATEGORIES = [
  "All Events",
  "Workshops",
  "Seminars",
  "Socials",
  "Sports",
  "Art & Culture",
];

// Map pill label → backend category value for filtering
const CAT_MAP = {
  "All Events":  null,
  "Workshops":   "workshop",
  "Seminars":    "seminar",
  "Socials":     "social",
  "Sports":      "sports",
  "Art & Culture": "arts",
};

export default function StudentHomePage() {
  const navigate  = useNavigate();
  const session   = getSession();
  const student   = session?.user || null;

  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Events");

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter events by selected category pill
  const catValue = CAT_MAP[activeCategory];
  const filteredEvents = catValue
    ? events.filter(e => (e.category || "").toLowerCase() === catValue)
    : events;

  // When a category pill is clicked:
  // - update active pill highlight on this page
  // - navigate to /events with the category pre-selected as a query param
  function handleCategoryClick(cat) {
    setActiveCategory(cat);
    if (cat === "All Events") {
      navigate("/events");
    } else {
      const catParam = CAT_MAP[cat] || cat.toLowerCase();
      navigate(`/events?category=${catParam}`);
    }
  }

  // Skeleton loader rows
  function Skeleton() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, height: 300, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", paddingBottom: 60 }}>

      {/* 1. Welcome banner */}
      <HeroBanner studentName={student?.name} />

      {/* 2. Happening Now + Upcoming Calendar */}
      {loading ? (
        <section style={{ padding: "28px 32px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, height: 300, animation: "pulse 1.5s infinite" }} />
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, height: 300, animation: "pulse 1.5s infinite" }} />
          </div>
        </section>
      ) : (
        <HappeningSection events={events} />
      )}

      {/* 3. Browse by category pills */}
      <CategoryFilter
        active={activeCategory}
        setActive={handleCategoryClick}
        categories={CATEGORIES}
      />

      {/* 4. Recommended for You */}
      {loading ? (
        <section style={{ padding: "32px 32px 0" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.text, marginBottom: 6 }}>
            Recommended for You
          </h2>
          <Skeleton />
        </section>
      ) : (
        <RecommendedSection events={filteredEvents} />
      )}
    </div>
  );
}
