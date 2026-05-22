import React, { useEffect } from 'react'

// The unified login/register page lives at the student app (port 5174).
// When the admin app has no logged-in user, redirect there.
export default function AuthPage() {
  useEffect(() => {
    window.location.href = 'http://localhost:5174/auth'
  }, [])

  // Render nothing while redirecting
  return null
}
