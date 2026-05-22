export const COLORS = {
  bg: "#0d1117",
  bgCard: "#161b27",
  bgCardHover: "#1c2333",
  bgNav: "#0d1117ee",
  accent: "#7c5cfc",
  accentLight: "#9b7ffe",
  accentGlow: "#7c5cfc33",
  text: "#e8eaf0",
  textMuted: "#8892a4",
  textDim: "#5a6478",
  border: "#232b3e",
  live: "#ef4444",
  free: "#22c55e",
  paid: "#f59e0b",
  calBg: "#1a2236",
};

export const NAV_LINKS = ["Home", "Events", "Profile", "About"];

export const CALENDAR_EVENTS = [
  { date: "14", day: "MON", title: "Robotics Workshop", time: "02:00 PM", location: "Block C-2" },
  { date: "16", day: "WED", title: "Jazz Night Gala", time: "06:30 PM", location: "Student Center" },
  { date: "19", day: "SAT", title: "Startup Pitch Day", time: "10:00 AM", location: "Auditorium A" },
];

export const EVENTS = [
  {
    id: 1,
    tag: "Tech",
    tagColor: "#3b82f6",
    title: "Tech Fest",
    price: "FREE",
    priceColor: COLORS.free,
    time: "May 6, 1:00 PM",
    location: "OGH",
    attendees: 120,
    img: "photo_2026-05-19_20-03-08.jpg",
  },
  {
    id: 2,
    tag: "Charity",
    tagColor: "#a855f7",
    title: "Grand Fundraising",
    price: "50 ETB",
    priceColor: COLORS.paid,
    time: "May 19 • 1:00 PM",
    location: "OGH",
    attendees: 45,
    img: "photo_2026-05-19_20-04-26.jpg",
  },
  {
    id: 3,
    tag: "Sport",
    tagColor: "#f97316",
    title: "Football game",
    price: "FREE",
    priceColor: COLORS.free,
    time: "Saturday • 4:30 PM",
    location: "AASTU stadium",
    attendees: 100,
    img: "photo_2026-05-19_20-05-14.jpg",
  },
];
