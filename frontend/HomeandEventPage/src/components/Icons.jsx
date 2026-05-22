export const Icon = ({ d, size = 16, color = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const BellIcon = () => <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={18} />;
export const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />;
export const ClockIcon = () => <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v5l3 3" size={13} />;
export const PinIcon = () => <Icon d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" size={13} fill="currentColor" />;
export const BookmarkIcon = () => <Icon d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" size={16} />;
export const PlusIcon = () => <Icon d="M12 5v14M5 12h14" size={16} color="#fff" strokeWidth={2.5} />;
export const CalendarIcon = () => <Icon d="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" size={16} />;
export const ChevronLeft = () => <Icon d="M15 18l-6-6 6-6" size={14} strokeWidth={2} />;
export const ChevronRight = () => <Icon d="M9 18l6-6-6-6" size={14} strokeWidth={2} />;
export const WifiIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="#ef4444" />
  </svg>
);
