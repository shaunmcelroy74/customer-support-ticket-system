'use client'

import { supabase } from '../../supabaseClient'

export default function Home() {
  const testConnection = async () => {
    const { data, error } = await supabase.from('your_table').select('*').limit(1)
    if (error) console.error('Supabase error:', error)
    else console.log('Connected:', data)
  }

  // Call testConnection on mount or button click
  // ...

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Customer Support Ticket System</h1>
      <button onClick={testConnection}>Test Supabase</button>
    </main>
  )
}