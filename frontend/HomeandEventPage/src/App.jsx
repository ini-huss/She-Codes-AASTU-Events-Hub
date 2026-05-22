import { useCallback, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import HappeningSection from "./components/HappeningSection";
import CategoryFilter from "./components/CategoryFilter";
import RecommendedSection from "./components/RecommendedSection";
import Footer from "./components/Footer";
import EventPage from "./EventPage.jsx";
import { COLORS } from "./components/constants";

const CATEGORIES = ["All Events", "Workshops", "Seminars", "Socials", "Sports", "Art & Culture"];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [page, setPage] = useState("home");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const goToHome = useCallback(() => {
    setPage("home");
    setSelectedEvent(null);
  }, []);

  const goToEvents = useCallback(event => {
    setSelectedEvent(event || null);
    setPage("event");
  }, []);

  const pageContent = useMemo(() => {
    if (page === "event") {
      return <EventPage selectedEvent={selectedEvent} />;
    }

    return (
      <>
        <HeroBanner />
        <HappeningSection />
        <CategoryFilter active={activeCategory} setActive={setActiveCategory} categories={CATEGORIES} />
        <RecommendedSection onEventClick={goToEvents} />
      </>
    );
  }, [activeCategory, goToEvents, page, selectedEvent]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; height: 100%; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; color: ${COLORS.text}; height: 100%; margin: 0; padding: 0; }
        #root { height: 100%; width: 100%; display: flex; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.accent}; }
      `}</style>

      <div style={{ background: COLORS.bg, width: "100%", minHeight: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Navbar onViewHome={goToHome} onViewEvents={() => goToEvents()} activePage={page} />
        {pageContent}
        <Footer />
      </div>
    </>
  );
}
