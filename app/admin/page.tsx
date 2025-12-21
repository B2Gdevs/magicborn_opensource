// app/admin/page.tsx
// Redirect to content editor - Payload Admin UI has compatibility issues with current setup

import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/content-editor')
}


