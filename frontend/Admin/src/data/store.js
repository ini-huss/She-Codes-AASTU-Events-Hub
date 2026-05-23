// ─── Central data store ───────────────────────────────────────────────────────

export const initialEvents      = []
export const initialUsers       = []
export const initialSuggestions = []  // event suggestions from Viewers/faculty

// ── Event categories — more specific than before ──────────────────────────────
export const EVENT_CATEGORIES = [
  { value: 'Workshop',        group: 'Academic' },
  { value: 'Seminar',         group: 'Academic' },
  { value: 'Competition',     group: 'Academic' },
  { value: 'Hackathon',       group: 'Academic' },
  { value: 'Tech Talk',       group: 'Academic' },
  { value: 'Cultural Show',   group: 'Arts & Culture' },
  { value: 'Music Event',     group: 'Arts & Culture' },
  { value: 'Art Exhibition',  group: 'Arts & Culture' },
  { value: 'Drama & Theater', group: 'Arts & Culture' },
  { value: 'Sports',          group: 'Social' },
  { value: 'Community Drive', group: 'Social' },
  { value: 'Networking',      group: 'Social' },
  { value: 'Fundraiser',      group: 'Social' },
  { value: 'Other',           group: 'Other' },
]

// ── Analytics chart data (updates dynamically from real events) ───────────────
export const attendanceData = [
  { month: 'Jun', Workshop: 0, Cultural: 0, Sports: 0 },
  { month: 'Jul', Workshop: 0, Cultural: 0, Sports: 0 },
  { month: 'Aug', Workshop: 0, Cultural: 0, Sports: 0 },
  { month: 'Sep', Workshop: 0, Cultural: 0, Sports: 0 },
  { month: 'Oct', Workshop: 0, Cultural: 0, Sports: 0 },
  { month: 'Nov', Workshop: 0, Cultural: 0, Sports: 0 },
]

export const categoryData = [
  { name: 'Academic',       value: 0, color: '#9b7de0' },
  { name: 'Arts & Culture', value: 0, color: '#a855f7' },
  { name: 'Social',         value: 0, color: '#f59e0b' },
  { name: 'Other',          value: 0, color: '#6b9aaa' },
]

export const engagementLog  = []
export const notifications  = []

export const peakAlerts = [
  { id: 1, window: 'Tuesday 10:00–11:00 AM', rationale: 'Historically highest student login activity at AASTU — data will update as events are added.' },
  { id: 2, window: 'Thursday 3:00–4:00 PM',  rationale: 'Post-class engagement window — recommended for announcements once events are live.' },
]
