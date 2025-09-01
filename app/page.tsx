import { redirect } from 'next/navigation'

export default function Home() {
  // Root page redirects to login/landing page
  redirect('/login')
}
