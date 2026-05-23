// ─── Shared department / position list ───────────────────────────────────────
export const DEPARTMENT_GROUPS = [
  {
    group: 'University Administration',
    options: [
      'Office of the President',
      'Office of the Vice President – Academic',
      'Office of the Vice President – Research',
      'Office of the Registrar',
      'Dean of Students Office',
      'Finance & Administration',
      'Public Relations & Communications',
      'IT & Systems Department',
      'Library Services',
      'Security & Facilities',
    ],
  },
  {
    group: 'Academic Departments',
    options: [
      'Computer Science & Engineering',
      'Electrical & Computer Engineering',
      'Civil & Environmental Engineering',
      'Mechanical Engineering',
      'Chemical Engineering',
      'Architecture & Urban Planning',
      'Applied Mathematics',
      'Applied Physics',
      'Applied Chemistry',
      'Biotechnology',
      'Industrial Engineering',
      'Software Engineering',
    ],
  },
  {
    group: 'Student Organizations',
    options: [
      'Student Union',
      'GDSC AASTU (Google Developer Student Club)',
      'IEEE Student Branch',
      'ACM Student Chapter',
      'Arts & Culture Club',
      'Sports Club',
      'Debate & Public Speaking Club',
      'Entrepreneurship Club',
      'Environmental & Eco Club',
      'Photography & Media Club',
      'Music & Drama Club',
      'Community Service Club',
    ],
  },
  {
    group: 'Research & Special Units',
    options: [
      'Research & Innovation Center',
      'Industry Linkage Office',
      'Quality Assurance Office',
      'Gender & Diversity Office',
      'Health Services Center',
      'Career & Alumni Services',
    ],
  },
  {
    group: 'External / Other',
    options: [
      'External Collaborator',
      'Guest / Visitor',
      'Other',
    ],
  },
]

// Reusable React select element — import and drop in anywhere
export function DeptSelect({ value, onChange, className }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={className}>
      <option value="">— Select department / position —</option>
      {DEPARTMENT_GROUPS.map(({ group, options }) => (
        <optgroup key={group} label={group}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </optgroup>
      ))}
    </select>
  )
}
