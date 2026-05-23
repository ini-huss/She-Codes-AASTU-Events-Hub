// ─── Role Hierarchy & Permissions ────────────────────────────────────────────
// Higher number = more power
export const ROLE_LEVEL = {
  'Super Admin': 4,
  'Admin':       3,
  'Organizer':   2,
  'Viewer':      1,
}

// What each role can do
export const PERMISSIONS = {
  'Super Admin': {
    canApproveEvents:  false,  // Super Admin does NOT manage events
    canRejectEvents:   false,
    canDeleteEvents:   false,
    canEditEvents:     false,
    canCreateEvents:   false,
    canManageUsers:    true,   // ONLY job: appoint and remove Admins
    canPromoteUsers:   true,   // can promote to any role including Admin
    canViewAnalytics:  true,
    canViewSettings:   true,
    canChangeSettings: true,
  },
  'Admin': {
    canApproveEvents:  true,   // Admin controls all event operations
    canRejectEvents:   true,
    canDeleteEvents:   true,
    canEditEvents:     true,
    canCreateEvents:   true,
    canManageUsers:    true,   // manages Organizers and Viewers
    canPromoteUsers:   false,  // cannot promote to Admin — only Super Admin does that
    canViewAnalytics:  true,
    canViewSettings:   true,
    canChangeSettings: false,
  },
  'Organizer': {
    canApproveEvents:  false,
    canRejectEvents:   false,
    canDeleteEvents:   false,
    canEditEvents:     true,
    canCreateEvents:   true,
    canManageUsers:    false,
    canPromoteUsers:   false,
    canViewAnalytics:  true,
    canViewSettings:   true,
    canChangeSettings: false,
  },
  'Viewer': {
    canApproveEvents:  false,
    canRejectEvents:   false,
    canDeleteEvents:   false,
    canEditEvents:     false,
    canCreateEvents:   false,
    canManageUsers:    false,
    canPromoteUsers:   false,
    canViewAnalytics:  true,
    canViewSettings:   true,
    canChangeSettings: false,
  },
}

export function can(user, permission) {
  if (!user) return false
  return PERMISSIONS[user.role]?.[permission] ?? false
}

// Roles a given user is allowed to assign to others
export function assignableRoles(user) {
  if (!user) return []
  if (user.role === 'Super Admin') return ['Admin']              // Super Admin only appoints Admins
  if (user.role === 'Admin')       return ['Organizer', 'Viewer'] // Admin manages Organizers and Viewers
  return []
}

// Nav items — ALL roles see all items, permissions control what they can DO inside each page
export function visibleNav(user) {
  return ['dashboard', 'events', 'analytics', 'users', 'suggestions', 'audit', 'settings']
}
